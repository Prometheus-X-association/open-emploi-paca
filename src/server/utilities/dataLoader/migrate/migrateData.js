import { generateDatastoreAdapater } from "../../../middlewares/generateDatastoreAdapter";
import yargs from "yargs";
import ora from "ora";
import dotenv from "dotenv";
import {
  GraphQLContext,
  initEnvironment,
  logDebug,
  logWarning,
  MnxOntologies
} from "@mnemotix/synaptix.js";
import dse, { ExecutionProfile } from "dse-driver";
import camelCase from "lodash/camelCase";
import {
  migrationMappers as defaultMappers,
  transformTimestampToDate
} from "./migrationMappers";
import { dseIdToURI } from "./helpers/dseIdToURI";
import path from "path";
import { generateDataModel } from "../../../datamodel/generateDataModel";
import fs from "fs";
import merge from "lodash/merge";

require("util").inspect.defaultOptions.depth = null;

dotenv.config();

process.env.UUID = "migrate-data";
process.env.RABBITMQ_RPC_TIMEOUT = "360000";

export let migrateData = async () => {
  let spinner = ora().start();
  spinner.spinner = "clock";

  let {
    mappers,
    dseEndpoints,
    dseGraphName,
    allTypes,
    includedTypes,
    excludedTypes,
    startAt,
    dry,
    debug,
    discardActions,
    dataModelPath,
    environmentPath
  } = yargs
    .usage("yarn data:migrate [options] -dse [DSE endpoints]")
    .option("defaultMappers", {
      alias: "defaultMappers",
      describe: "Migration defaultMappers"
    })
    .option("datamodel", {
      alias: "dataModelPath",
      describe: "Datamodel file location",
      default: "src/server/datamodel/dataModel.js"
    })
    .option("env", {
      alias: "environmentPath",
      describe: "Environment file location",
      default: "src/server/config/environment.js"
    })
    .option("dse_e", {
      alias: "dseEndpoints",
      default: ["163.172.103.48", "163.172.103.49", "163.172.103.50"],
      describe: "DSE endpoints where old data lives",
      nargs: 1
    })
    .option("dse_g", {
      alias: "dseGraphName",
      default: "prod_demo",
      describe: "DSE graph name where old data lives",
      nargs: 1
    })
    .option("a", {
      alias: "allTypes",
      describe: "Migrate all types defined in defaultMappers",
      default: false,
      nargs: 0,
      type: "boolean"
    })
    .option("v", {
      alias: "debug",
      describe: "Log outputs",
      default: false,
      nargs: 0,
      type: "boolean"
    })
    .option("d", {
      alias: "dry",
      describe: "Dry migration (nothing is persisted)",
      default: false,
      nargs: 0,
      type: "boolean"
    })
    .option("da", {
      alias: "discardActions",
      describe: "Discard actions",
      default: false,
      nargs: 0,
      type: "boolean"
    })
    .option("i", {
      alias: "includedTypes",
      default: [],
      describe: "List types to migrate",
      type: "array"
    })
    .option("x", {
      alias: "excludedTypes",
      default: [],
      describe: "List types to exclude from migration",
      type: "array"
    })
    .option("s", {
      alias: "startAt",
      default: 0,
      describe: "Start at offset",
      type: "array"
    })
    .help("h")
    .alias("h", "help")
    .epilog("Copyright Mnemotix 2019")
    .help().argv;

  const environmentDefinition = require(path.resolve(
    process.cwd(),
    environmentPath
  )).default;

  let extraDataModels;
  let dataModelAbsolutePath = path.resolve(process.cwd(), dataModelPath);

  if (fs.existsSync(dataModelAbsolutePath)) {
    extraDataModels = [
      require(path.resolve(process.cwd(), dataModelAbsolutePath)).dataModel
    ];
  } else {
    spinner.warn(
      "Caution specific dataModel not found. Using default one from weever-core"
    );
  }

  initEnvironment(environmentDefinition);

  const dataModel = generateDataModel({
    extraDataModels,
    environmentDefinition
  });

  /** @type {SynaptixDatastoreRdfAdapter} */
  let { datastoreAdapter } = await generateDatastoreAdapater({
    graphMiddlewares: [],
    dataModel
  });

  /** @type {SynaptixDatastoreRdfSession} */
  let synaptixSession = datastoreAdapter.getSession({
    context: new GraphQLContext({
      anonymous: true
    })
  });

  if (dry) {
    spinner.info("Dry mode activated, nothing is persited in DB");
  }

  if (debug) {
    spinner.info("Debug mode activated");
  }

  spinner.info(`Connection to DSE ${dseEndpoints}, repo name ${dseGraphName}`);

  const client = new dse.Client({
    contactPoints: dseEndpoints,
    localDataCenter: "datacenter1",
    credentials: {
      username: "cassandra",
      password: "cassandra"
    },
    profiles: [
      new ExecutionProfile("default", {
        graphOptions: { name: dseGraphName }
      })
    ]
  });
  spinner.succeed(`Connected`);

  mappers = merge(defaultMappers, mappers || {});

  for (let [type, config] of Object.entries(mappers)) {
    if (
      (!allTypes && !includedTypes.includes(type)) ||
      excludedTypes.includes(type)
    ) {
      continue;
    }

    let count = await countType({ client, type });
    let modelDefinition;

    try {
      modelDefinition = synaptixSession
        .getModelDefinitionsRegister()
        .getModelDefinitionForNodeType(config?.type || type);
    } catch (e) {
      spinner.fail(`Model definition not found for DSE ${type} typename`);
      continue;
    }

    spinner.info(`Found ${count} "${type}" instances.`);
    spinner.start(`Processing ${count} "${type}" instances...`);

    for (let index = startAt; index < count; index++) {
      let vertex = await getDseVertexAtIndex({ client, type, index });
      let vertexId = getVertexId(vertex);
      let uri;

      if (mappers[type]?.generateURI) {
        uri = mappers[type]?.generateURI({
          vertexId,
          modelDefinition,
          synaptixSession,
          dseIdToURI
        });
      } else {
        uri = dseIdToURI({ id: vertexId, modelDefinition, synaptixSession });
      }

      let seeAlso = {
        legacyId: vertexId
      };

      if (mappers[type]?.generateLegacyURL) {
        seeAlso.legacyURL = mappers[type]?.generateLegacyURL(vertexId);
      }

      let {
        _enabled,
        creationDate,
        lastUpdate,
        ...objectInput
      } = mapDseVertexPropertiesToObjectInput({
        vertex,
        mapper: mappers[type]?.mapping
      });

      let labels = await getLocalizedLabelsForVertex({
        client,
        vertex,
        mapper: mappers[type]?.mapping
      });

      let objectLinksInput = {};
      if (mappers[type]?.links) {
        let { links, corruptedLinks } = await getLinksForVertex({
          client,
          vertex,
          type,
          linksMapper: mappers[type]?.links
        });

        if (corruptedLinks.length > 0) {
          logDebug(
            `Vertex ${vertexId} (${uri}) seems to be corrupted (${corruptedLinks.join(
              ", "
            )})`
          );
          continue;
        }

        for (let [linkName, targetIds] of Object.entries(links)) {
          let link = Object.values(mappers[type]?.links).find(
            link => link.linkName === linkName
          );
          let linkDefinition = modelDefinition.getLink(linkName);
          let isPlural = linkDefinition.isPlural();
          let inputName = linkDefinition.getRelatedInputName();
          let targetModelDefinition = linkDefinition.getRelatedModelDefinition();

          let targetInputs = targetIds.reduce(
            (targetInputs, { targetId, generateInput }) => {
              if (link.forceTargetModelDefinition) {
                targetModelDefinition = link.forceTargetModelDefinition({
                  targetId
                });
              } else if (!targetModelDefinition.isInstantiable()) {
                logWarning(
                  `linkDefinition ${modelDefinition.name} / ${linkName} reference a non instantiable model definition. No "forceTargetModelDefinition" method is set in link mapper, deducted URI might be wrong`
                );
              }

              if (generateInput) {
                let input = generateInput({
                  sourceId: uri,
                  targetId,
                  targetModelDefinition,
                  dseIdToURI,
                  synaptixSession,
                  objectInput
                });
                if (input) {
                  targetInputs.push(input);
                }
              } else {
                let targetUri = dseIdToURI({
                  id: targetId,
                  modelDefinition: targetModelDefinition,
                  synaptixSession
                });

                targetInputs.push({ id: targetUri });
              }

              return targetInputs;
            },
            []
          );

          if (targetInputs.length > 0) {
            if (!inputName) {
              logWarning(
                `No graphQLInputName defined for linkDefinition ${modelDefinition.name} / ${linkName}`
              );
            } else {
              objectLinksInput[inputName] = isPlural
                ? targetInputs
                : targetInputs[0];
            }
          }
        }
      }

      let transformToLabelPropEntries = Object.entries(
        mappers[type]?.mapping || {}
      ).filter(([propName, options]) => options?.tranformToLabel);

      for (let [
        propName,
        { tranformToLabel: lang, transformName }
      ] of transformToLabelPropEntries || []) {
        if (objectInput[transformName || propName]) {
          labels[lang][transformName || propName] =
            objectInput[transformName || propName];
          delete objectInput[transformName || propName];
        }
      }

      objectInput = {
        ...objectInput,
        seeAlso: JSON.stringify(seeAlso),
        ...labels.fr,
        ...objectLinksInput
      };

      spinner.text = `Processing ${index}/${count} - ${uri}`;

      if (
        mappers[type]?.migrateIf?.({ objectInput, objectLinksInput }) === false
      ) {
        console.log("\n");
        logDebug(`${vertexId} (${uri}) discarded`);
        console.log("\n");
        continue;
      }

      const createInput = {
        modelDefinition,
        objectInput,
        uri,
        lang: "fr"
      };

      if (dry) {
        logDebug(JSON.stringify(createInput));
      } else if (!discardActions) {
        let { id } = await synaptixSession.createObject(createInput);

        if (Object.values(labels.en).length > 0) {
          await synaptixSession.updateObject({
            modelDefinition,
            objectId: id,
            updatingProps: labels.en,
            lang: "en"
          });
        }

        let creationUri = dseIdToURI({
          id: getVertexId(vertex),
          modelDefinition:
            MnxOntologies.mnxContribution.ModelDefinitions.CreationDefinition,
          synaptixSession
        });
        let lastUpdateUri = dseIdToURI({
          id: getVertexId(vertex),
          modelDefinition:
            MnxOntologies.mnxContribution.ModelDefinitions.UpdateDefinition,
          synaptixSession
        });

        let creator = await getCreatorVertexForVertex({
          client,
          vertex,
          type,
          linksMapper: mappers[type]?.links
        });
        let creatorUri;

        if (creator) {
          creatorUri = dseIdToURI({
            id: getVertexId(creator),
            modelDefinition:
              MnxOntologies.mnxAgent.ModelDefinitions.UserAccountDefinition,
            synaptixSession
          });
        } else {
          creatorUri =
            "https://data.lafayetteanticipations.com/resource/user-account/955371520407";
        }

        let { id: createId } = await synaptixSession.createObject({
          modelDefinition:
            MnxOntologies.mnxContribution.ModelDefinitions.CreationDefinition,
          objectInput: {
            startedAtTime: transformTimestampToDate(creationDate),
            entityInput: {
              id: uri
            },
            ...(creatorUri ? { userAccountInput: { id: creatorUri } } : {})
          },
          uri: creationUri
        });

        let { id: lastUpdateId } = await synaptixSession.createObject({
          modelDefinition:
            MnxOntologies.mnxContribution.ModelDefinitions.UpdateDefinition,
          objectInput: {
            startedAtTime: transformTimestampToDate(lastUpdate),
            entityInput: {
              id: uri
            },
            ...(creatorUri ? { userAccountInput: { id: creatorUri } } : {})
          },
          uri: lastUpdateUri
        });
      }

      await wait();
    }
  }

  spinner.succeed(`Data imported with success.`);
  process.exit(0);
};

export let enabledFilter = `has("_enabled", true)`;
//export  let enabledFilter = `has("_enabled", true).has("lastUpdate", gt(${Date.parse("2020-05-13T14:17:02.941Z")}))`;

let countType = async ({ client, type }) => {
  return (
    await client.executeGraph(
      `g.V().hasLabel("${type}").${enabledFilter}.count()`
    )
  ).first();
};

let getDseVertexAtIndex = async ({ client, type, index }) => {
  return (
    await client.executeGraph(
      `g.V().hasLabel("${type}").range(${index}, ${index + 1})${enabledFilter}`
    )
  ).first();
};

let getVertexId = vertex => Object.values(vertex.id).join(":");

let mapDseVertexPropertiesToObjectInput = ({ vertex, mapper }) => {
  return Object.entries(vertex.properties).reduce(
    (acc, [propName, propValues]) => {
      let propValue = propValues[0].value;

      if (mapper?.[propName]) {
        let { transformName, transformValue } = mapper?.[propName] || {};

        if (transformName) {
          propName = transformName;
        }

        if (transformValue && typeof transformValue === "function") {
          propValue = transformValue(propValue);
        }
      }

      acc[propName] = propValue;

      return acc;
    },
    {}
  );
};

let getLocalizedLabelsForVertex = async ({ client, vertex, mapper }) => {
  let labels = {
    fr: {},
    en: {}
  };

  let id = getVertexId(vertex);

  let { vertices, edges } = (
    await client.executeGraph(
      `g.V("${id}").outE().where(inV().hasLabel("LocalizedLabel", "HTMLContent").${enabledFilter}).subgraph('sg').inV().cap('sg').next()`
    )
  ).first();

  if (edges.length > 0) {
    for (let edge of edges) {
      let labelId = getVertexId({
        id: ["LocalizedLabel", "HTMLContent"].includes(edge.inVLabel)
          ? edge.inV
          : edge.outV
      });
      let label = camelCase(edge.label.toLowerCase());
      let labelVertex = vertices.find(
        vertex => getVertexId(vertex) === labelId
      );

      if (labelVertex) {
        let { lang, value } = mapDseVertexPropertiesToObjectInput({
          vertex: labelVertex
        });

        if (mapper?.[label]) {
          let { transformName, transformValue } = mapper?.[label] || {};

          if (transformName) {
            label = transformName;
          }

          if (transformValue && typeof transformValue === "function") {
            value = transformValue(value);
          }
        }

        labels[lang][label] = value;
      }
    }
  }

  return labels;
};

let getLinksForVertex = async ({ client, vertex, type, linksMapper }) => {
  let links = {};
  let corruptedLinks = [];

  let id = getVertexId(vertex);

  let extraDseSubGraphs = Object.values(linksMapper)
    .map(({ extraDseSubgraph }) => extraDseSubgraph)
    .filter(Boolean);
  let dseRequest = `g.V("${id}").bothE(${Object.keys(linksMapper)
    .map(edgeName => `"${edgeName}"`)
    .join(
      ","
    )}).limit(2000).where(inV().${enabledFilter}).subgraph('sg').otherV()${
    extraDseSubGraphs.length > 0 ? `.${extraDseSubGraphs.join(".")}` : ""
  }.cap('sg').next()`;

  let { vertices, edges } = (await client.executeGraph(dseRequest)).first();

  if (edges.length > 0) {
    for (let edge of edges) {
      let targetId = getVertexId({
        id:
          edge.inVLabel === type && !linksMapper[edge.label].isInV
            ? edge.outV
            : edge.inV
      });
      let link =
        linksMapper[edge.label] ||
        Object.values(linksMapper).find(
          ({ filterOnEdgeLabel }) => filterOnEdgeLabel === edge.label
        );

      if (link) {
        let linkName = link.linkName;
        let mustExist = link.mustExist;

        if (!links[linkName]) {
          links[linkName] = [];
        }

        if (targetId) {
          links[linkName].push({
            targetId,
            generateInput: link.generateInput
          });
        } else if (mustExist) {
          corruptedLinks.push(linkName);
        }
      }
    }
  }

  return { links, corruptedLinks };
};

let getCreatorVertexForVertex = async ({
  client,
  vertex,
  type,
  linksMapper
}) => {
  let links = {};

  let id = getVertexId(vertex);

  return (
    await client.executeGraph(`g.V("${id}").out("CREATOR").out("HAS_ACCOUNT")`)
  ).first();
};

let wait = async (time = 100) => {
  return new Promise(done => setTimeout(done, time));
};
