import {generateDatastoreAdapater} from "../../../middlewares/generateDatastoreAdapter";
import got from 'got/source';
import url from 'url';
import yargs from 'yargs';
import {confirm} from 'async-prompt';
import ora from 'ora';
import dotenv from 'dotenv';
import {GraphQLContext, I18nError, SSOApiClient} from "@mnemotix/synaptix.js";
import {isRepositoryExists} from "../helpers/isRepositoryExists";
import {removeRepository} from "../helpers/removeRepository";
import {createRepository} from "../helpers/createRepository";
import {waitForRepositoryLoaded} from "../helpers/waitForRepositoryLoaded";
import {loadDataFileInRepository} from "../helpers/loadDataFileInRepository";

require('util').inspect.defaultOptions.depth = null;

dotenv.config();

/**
 * @type {DatastoreSession}
 */
let datastoreSession;
/**
 * @type {SSOApiClient}
 */
let ssoApiClient;

/**
 * @param {string} ssoApiEndpointUrl
 * @param {string} ssoApiLogin
 * @param {string} ssoApiPassword
 * @param {string} ssoApiTokenEndpointUrl
 * @param {object[]} users
 * @param spinner
 * @return {Promise<void>}
 */
let createUsers = async ({ssoApiEndpointUrl, ssoApiLogin, ssoApiPassword, ssoApiTokenEndpointUrl, users, spinner}) => {
  spinner.info(`Initing SSO users`);

  if (!ssoApiClient && !datastoreSession) {
    ssoApiClient = new SSOApiClient({
      apiEndpointUrl: ssoApiEndpointUrl,
      apiLogin: ssoApiLogin,
      apiPassword: ssoApiPassword,
      apiTokenEndpointUrl: ssoApiTokenEndpointUrl
    });

    let {datastoreAdapter} = await generateDatastoreAdapater({ssoApiClient});

    datastoreSession = datastoreAdapter.getSession({
      context: new GraphQLContext({anonymous: true})
    });
  }

  for (let user of users) {
    let {uri, email, password, nickName, relatedPersonUri, relatedGroupUris} = user;

    spinner.info(`Creating test user ${nickName} (${email} : ${password.replace(/./g, '*')})... `);

    try {
      let user = await ssoApiClient.getUserByUsername(email);
      spinner.info(`User ${email} is already registered, recreating it...`);
      await ssoApiClient.removeUser(user.getId());
      spinner.succeed(`User removed.`);
    } catch (e) {
      if (e instanceof I18nError && e.i18nKey === "USER_NOT_IN_SSO") {
        spinner.info(`User "${email}" is not already registered. Creating it...`);
      } else {
        throw e;
      }
    }

    try {
      let user = await datastoreSession.getSSOControllerService().registerUserAccount({
        email,
        password,
        nickName,
        userAttributes: {
          personId: relatedPersonUri.replace(process.env.NODES_NAMESPACE_URI, `${process.env.NODES_PREFIX}:`),
          userAccountId: uri.replace(process.env.NODES_NAMESPACE_URI, `${process.env.NODES_PREFIX}:`),
          userGroupIds: JSON.stringify((relatedGroupUris || []).map(uri => uri.replace(process.env.NODES_NAMESPACE_URI, `${process.env.NODES_PREFIX}:`)))
        },
      });

      spinner.succeed(`User created with ID ${user.getId()}`);
    } catch (e) {
      console.log(e);
      process.exit(1);
    }
  }

};

export let loadDataFromManifestFile = async () => {
  let spinner = ora().start();
  spinner.spinner = "clock";

  let {manifestURI, endpointURI, repoName, removeRepo, ssoApiEndpointUrl, ssoApiLogin, ssoApiPassword, ssoApiTokenEndpointUrl} = yargs
    .usage("yarn data:load [options] -m [Manifest file URI]")
    .example("yarn data:load -e http://localhost:7200 -r ddf -m https://gitlab.com/mnemotix/dicofr/raw/master/ddf-repository/manifest.json")

    .option('e', {
      alias: 'endpointURI',
      default: process.env.RDFSTORE_ROOT_EXTERNAL_URI,
      describe: 'RDF store REST endpoint',
      nargs: 1
    })
    .option('r', {
      alias: 'repoName',
      default: process.env.RDFSTORE_REPOSITORY_NAME,
      describe: 'RDF repository name',
      nargs: 1
    })
    .option('m', {
      alias: 'manifestURI',
      default: process.env.RDFSTORE_DATA_MANIFEST,
      demandOption: true,
      describe: 'Manifest file URI',
      nargs: 1
    })
    .option('R', {
      alias: 'removeRepo',
      type: "boolean",
      describe: 'Force removal of the repository if exists',
      default: false
    })
    .option('T', {
      alias: 'ssoApiTokenEndpointUrl',
      describe: 'SSO API token endpoint URL',
      default: process.env.OAUTH_ADMIN_TOKEN_URL,
      nargs: 1
    })
    .option('A', {
      alias: 'ssoApiEndpointUrl',
      describe: 'SSO API endpoint URL',
      default: process.env.OAUTH_ADMIN_API_URL,
      nargs: 1
    })
    .option('U', {
      alias: 'ssoApiLogin',
      describe: 'SSO API user login',
      default: process.env.OAUTH_ADMIN_USERNAME,
      nargs: 1
    })
    .option('P', {
      alias: 'ssoApiPassword',
      describe: 'SSO API user login',
      default: process.env.OAUTH_ADMIN_PASSWORD,
      nargs: 1
    })
    .help('h')
    .alias('h', 'help')
    .epilog('Copyright Mnemotix 2019')
    .help()
    .argv;

  spinner.info(`Process endpoint ${endpointURI}, repo name ${repoName}`);
  spinner.info(`Process manifest file located at ${manifestURI}`);

  let {body: manifest} = await got(manifestURI, {
    json: true
  });

  if (manifest.configFileURI) {
    let {configFileURI, data, users} = manifest;
    let totalCount = 0;

    configFileURI = url.resolve(manifestURI, configFileURI);

    spinner.info(`Config file : ${configFileURI}`);

    let repoExists = await isRepositoryExists({endpointURI, repoName});

    if (repoExists) {
      if (!removeRepo) {
        spinner.warn(`Caution, repository "${repoName}" exists on ${endpointURI}. If you decide not to remove it, only data flagged "clearOnLoad" in the manifest will be loaded.`);

        spinner.stop();
        removeRepo = await confirm("Do you want to remove it ? [y|N] : ");
        spinner.start();
      }
    }

    if (removeRepo) {
      spinner.start(`Removing repository ${repoName}...`);
      await removeRepository({endpointURI, repoName});
      repoExists = false;
      spinner.succeed(`Repository removed.`);
    }

    if (!repoExists) {
      spinner.start(`Creating repository ${repoName}...`);
      await createRepository({endpointURI, repoName, configFileURI});
      spinner.succeed(`Repository created.`);

      await createUsers({users, ssoApiEndpointUrl, ssoApiLogin, ssoApiPassword, ssoApiTokenEndpointUrl, spinner})
    }

    for (let {name, files, context, clearOnLoad, loadIfEnvIs, loadIfEnvIsNot} of data) {
      if (repoExists && !clearOnLoad) {
        spinner.info(`Data related to "${name}" not loaded. No flag "clearOnLoad" found.`);
      } else {
        if (!!loadIfEnvIs && !loadIfEnvIs.includes(process.env.NODE_ENV)) {
          spinner.info(`Data related to "${name}" not loaded, because required NODE_ENV to be set to "${loadIfEnvIs}"`);
        } else if (!!loadIfEnvIsNot && loadIfEnvIsNot.includes(process.env.NODE_ENV)) {
          spinner.info(`Data related to "${name}" not loaded, because required NODE_ENV NOT to be set to "${loadIfEnvIsNot}"`);
        } else {
          files = files.map(file => url.resolve(manifestURI, file));
          spinner.info(`Data  related to "${name}" files : \n  - ${files.join("\n  - ")}\n`);
          for (let file of files) {
            try {
              await loadDataFileInRepository({repoName, endpointURI, context, file});
            } catch (e) {
              spinner.fail(`Fail to load ${file}. Cause : ${e}`)
            }
          }

          totalCount += files.length;
        }
      }
    }

    await waitForRepositoryLoaded({endpointURI, repoName, totalCount, spinner: spinner.start(`Loading data...`)});
  }

  spinner.succeed(`Data imported with success.`);
  process.exit(0);
};
