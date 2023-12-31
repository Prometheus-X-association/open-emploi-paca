/*
 * Copyright (C) 2013-2018 MNEMOTIX <http://www.mnemotix.com/> and/or its affiliates
 * and other contributors as indicated by the @author tags.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import yargs from "yargs";
import ora from "ora";
import dotenv from "dotenv";
import {
  GraphQLContext,
  initEnvironment,
  LabelDefinition,
  LinkStep,
  MnxOntologies,
  PropertyStep,
  EntityDefinition,
  generateDefaultDatastoreAdapter
} from "@mnemotix/synaptix.js";
import env from "env-var";

import {
  commonEntityFilter,
  commonFields,
  commonMapping,
} from "./connectors/commonFields";
import { Client } from "@elastic/elasticsearch";
import path from "path";
import { generateDataModel } from "../../datamodel/generateDataModel";
import fs from "fs";
import SkillDefinition from "../../datamodel/mm/SkillDefinition";

dotenv.config();

process.env.UUID = "index-data";
process.env.RABBITMQ_RPC_TIMEOUT = "360000";
process.env.LOG_LEVEL = "VERBOSE";

const connectorsKnowMapping = {
  "xsd:date": "date",
  "xsd:dateTime": "date",
  "xsd:int": "integer",
  "xsd:long": "long",
  "xsd:float": "float",
  "xsd:double": "double",
  "xsd:boolean": "boolean",
};

const typeMapping = {
  ...connectorsKnowMapping,
  "xsd:dateTimeStamp": "date",
  "http://www.opengis.net/ont/geosparql#wktLiteral": "geo_shape",
};

export let indexData = async () => {
  let {
    includedTypes,
    excludedTypes,
    allIndices,
    createPercolators,
    deleteOnly,
    dataModelPath,
    environmentPath,
  } = yargs
    .usage("yarn data:index -dm ./src/server/datamodel/dataModel.js")
    .example("yarn data:index -i aptitude")
    .option("a", {
      alias: "allIndices",
      describe: "(Re-)index all indices",
      default: false,
      nargs: 0,
      type: "boolean",
    })
    .option("i", {
      alias: "includedTypes",
      default: [],
      describe: "List types to include to (re-)index ",
      type: "array",
    })
    .option("x", {
      alias: "excludedTypes",
      default: [],
      describe: "List types to exclude to (re-)index ",
      type: "array",
    })
    .option("d", {
      alias: "deleteOnly",
      describe: "Delete indices without reindexing them",
      default: false,
      nargs: 0,
      type: "boolean",
    })
    .option("m", {
      alias: "dataModelPath",
      describe: "Datamodel file location",
      default: "src/server/datamodel/dataModel.js",
    })
    .option("e", {
      alias: "environmentPath",
      describe: "Environment file location",
      default: "src/server/config/environment.js",
    })
    .option("p", {
      alias: "createPercolators",
      describe: "Create percolators ",
      default: false,
      nargs: 0,
      type: "boolean",
    })
    .help("h")
    .alias("h", "help")
    .epilog("Copyright Mnemotix 2022")
    .help().argv;

  const environmentDefinition = require(path.resolve(
    process.cwd(),
    environmentPath
  )).default;
  let extraDataModels;
  let dataModelAbsolutePath = path.resolve(process.cwd(), dataModelPath);

  if (fs.existsSync(dataModelAbsolutePath)) {
    extraDataModels = [
      require(path.resolve(process.cwd(), dataModelAbsolutePath)).dataModel,
    ];
  }

  initEnvironment(environmentDefinition);

  const dataModel = generateDataModel({
    extraDataModels,
    environmentDefinition,
  });

  const elasticsearchExternalUri = env
    .get("INDEX_MASTER_URI")
    .required()
    .asString();
  const elasticsearchNode = elasticsearchExternalUri;
  const elasticsearchBasicAuthUser = env.get("INDEX_CLUSTER_USER").asString();
  const elasticsearchBasicAuthPassword = env
    .get("INDEX_CLUSTER_PWD")
    .asString();
  const indexPrefix = env.get("INDEX_PREFIX_TYPES_WITH").required().asString();

  const esClient = new Client({
    node: elasticsearchExternalUri,
    auth: {
      username: elasticsearchBasicAuthUser,
      password: elasticsearchBasicAuthPassword,
    },
    maxRetries: 2,
    requestTimeout: 60000,
    sniffOnStart: false,
  });

  const datastoreAdapter = generateDefaultDatastoreAdapter({
    dataModel
  });

  const synaptixSession = datastoreAdapter.getSession({
    context: new GraphQLContext({
      anonymous: true,
    }),
  });

  let spinner = ora().start();
  spinner.spinner = "clock";

  let connectors = [];

  for (let modelDefinition of dataModel.getModelDefinitions()) {
    let included = includedTypes.includes(modelDefinition.getIndexType());
    let excluded = excludedTypes.includes(modelDefinition.getIndexType());

    if (
      modelDefinition.isIndexed() &&
      (allIndices || (included && !excluded))
    ) {
      let connector = connectors.find(
        ({ name }) => name === `${indexPrefix}${modelDefinition.getIndexType()}`
      );

      if (!connector) {
        connector = {
          name: `${indexPrefix}${modelDefinition.getIndexType()}`,
          fields: [
            {
              fieldName: "types",
              propertyChain: [
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              ],
              analyzed: false,
              multivalued: true,
            },
          ],
          mappings: {
            types: {
              type: "keyword",
            },
            ...commonMapping,
          },
          types: [],
          elasticsearchNode,
          elasticsearchBasicAuthUser,
          elasticsearchBasicAuthPassword,
          elasticsearchClusterSniff: false,
          bulkUpdateBatchSize: 500,
          indexCreateSettings: {
            "index.blocks.read_only_allow_delete": null,
          },
          manageMapping: false,
          manageIndex: false,
        };

        if (modelDefinition.isEqualOrDescendantOf(EntityDefinition)) {
          connector.fields = [].concat(connector.fields, commonFields);
          if (env.get("RDFSTORE_VERSION").default(10).asFloat() > 9) {
            connector.documentFilter = commonEntityFilter;
          } else {
            connector.entityFilter = commonEntityFilter;
          }
        }

        connectors.push(connector);
      }

      connector.types.push(
        synaptixSession.normalizeId(modelDefinition.getRdfType())
      );

      for (let property of modelDefinition.getProperties()) {
        let multivalued =
          property instanceof LabelDefinition || property.isPlural?.();
        let fieldName = property.getPathInIndex();
        let dataProperty = property.getRdfDataProperty();
        let dataType = property
          .getRdfDataType()
          .replace("http://www.w3.org/2001/XMLSchema#", "xsd:")
          .replace("integer", "int")
          .replace("dateTimeStamp", "dateTime");

        let propertyChain = [];

        if (property.getRdfDataProperty()) {
          propertyChain.push(
            synaptixSession.normalizeId(dataProperty)
          );
        } else if (property.getLinkPath()) {
          propertyChain = linkPathToPropertyChain({
            linkPath: property.getLinkPath(),
            synaptixSession,
          });
        }

        if (propertyChain.length > 0) {
          if (typeof fieldName === "string") {
            connector.fields.push({
              fieldName: fieldName,
              propertyChain,
              analyzed:
                property instanceof LabelDefinition || property.isSearchable(),
              multivalued: multivalued,
              datatype: Object.keys(connectorsKnowMapping).includes(dataType)
                ? dataType
                : null,
            });

            if (
              property instanceof LabelDefinition ||
              property.isSearchable()
            ) {
              connector.mappings[fieldName] = {
                type: "text",
                analyzer: "autocomplete",
                search_analyzer: "autocomplete",
                fields: {
                  keyword: typeMapping[dataType]
                    ? {
                        type: typeMapping[dataType],
                      }
                    : {
                        type: "keyword",
                        ignore_above: 256,
                        normalizer: "lowercase_no_accent",
                      },
                },
              };
            } else {
              connector.mappings[fieldName] = typeMapping[dataType]
                ? {
                    type: typeMapping[dataType],
                  }
                : {
                    type: "keyword",
                    ignore_above: 256,
                    normalizer: "lowercase_no_accent",
                  };
            }
          }

          if (property instanceof LabelDefinition) {
            connector.fields.push({
              fieldName: `${fieldName}_locales`,
              propertyChain: [...propertyChain, "lang()"],
              analyzed: false,
              multivalued: multivalued,
            });

            connector.mappings[`${fieldName}_locales`] = {
              type: "keyword",
            };
          }
        }
      }

      for (let link of modelDefinition.getLinks()) {
        let fieldName = link.getPathInIndex();

        if (typeof fieldName === "string") {
          let objectProperty =
            link.getRdfObjectProperty() ||
            link.getSymmetricLinkDefinition()?.getRdfReversedObjectProperty();
          let linkPath = link.getLinkPath();
          let propertyChain = [];

          if (objectProperty) {
            propertyChain.push(
              synaptixSession.normalizeId(objectProperty)
            );
          } else if (linkPath) {
            propertyChain = linkPathToPropertyChain({
              linkPath,
              synaptixSession,
            });
          } else {
            // logWarning(`Model definition link ${modelDefinition.name} -> ${fieldName} can't be indexed while GraphDB only support straight property chains. Try to change "rdfReversedObjectProperty" (${link.getRdfReversedObjectProperty()}) of link "${fieldName}" by it's owl:inverseOf in "rdfObjectProperty"`);
          }

          if (propertyChain.length > 0) {
            connector.fields.push({
              fieldName: fieldName,
              propertyChain: propertyChain,
              analyzed: false,
              multivalued: link.isPlural(),
            });

            connector.mappings[fieldName] = {
              type: "keyword",
            };
          }
        }
      }
    }
  }

  for (let connector of connectors) {
    let name = connector.name;
    let mappings = connector.mappings;
    delete connector.name;
    delete connector.mappings;

    spinner.info(`Switching to index: "${name}"`);

    let [fields] = connector.fields.reduce(
      ([fields, fieldNames], field) => {
        let fieldName = field.fieldName;
        if (!fieldNames.includes(fieldName)) {
          fields.push(field);
          fieldNames.push(fieldName);
        }
        return [fields, fieldNames];
      },
      [[], []]
    );

    connector.fields = fields;

    spinner.info(`Removing existing connector is exists.`);

    // Connector first.
    try {
      await synaptixSession
        .getGraphControllerService()
        .getGraphControllerPublisher()
        .insertTriples({
          query: `PREFIX :<http://www.ontotext.com/connectors/elasticsearch#>
PREFIX inst:<http://www.ontotext.com/connectors/elasticsearch/instance#>
INSERT DATA {
  inst:${name} :dropConnector "" .
}
`,
        });
    } catch (e) {}

    // Ensure index is deleted as well
    try {
      await esClient.indices.delete({
        index: name,
      });
    } catch (e) {}

    if (!deleteOnly) {
      try {
        spinner.info(`Creating index "${name}".`);

        await esClient.indices.create({
          index: name,
          body: {
            settings: {
              "index.max_result_window": 100000,
              analysis: {
                filter: {
                  autocomplete_filter: {
                    type: "edge_ngram",
                    min_gram: 3,
                    max_gram: 60,
                  },
                },
                analyzer: {
                  autocomplete: {
                    type: "custom",
                    tokenizer: "standard",
                    filter: ["lowercase", "autocomplete_filter"],
                  },
                  french: {
                    type: "standard",
                    stopwords: "_french_",
                  },
                },
                normalizer: {
                  lowercase_no_accent: {
                    type: "custom",
                    filter: ["lowercase", "asciifolding"],
                  },
                },
              },
            },
            mappings: {
              properties: mappings,
            },
          },
        });
      } catch (e) {
        console.log(e);
        spinner.fail(e.message);
      }

      try {
        spinner.info(`Creating connector "${name}".`);
        await synaptixSession
          .getGraphControllerService()
          .getGraphControllerPublisher()
          .insertTriples({
            query: `PREFIX :<http://www.ontotext.com/connectors/elasticsearch#>
PREFIX inst:<http://www.ontotext.com/connectors/elasticsearch/instance#>
INSERT DATA {
  inst:${name} :createConnector '''
  ${JSON.stringify(connector, null, " ")}
'''.
}
`,
          });
      } catch (e) {
        spinner.fail(e.message);
      }
    }
  }

  if (createPercolators) {
    const sourceIndex = `${indexPrefix}${SkillDefinition.getIndexType()}`;

    try {
      spinner.info(`Ensuring skills connectors is disabled.`);
      await synaptixSession
        .getGraphControllerService()
        .getGraphControllerPublisher()
        .insertTriples({
          query: `PREFIX :<http://www.ontotext.com/connectors/elasticsearch#>
PREFIX inst:<http://www.ontotext.com/connectors/elasticsearch/instance#>
INSERT DATA {
  inst:${sourceIndex} :dropConnector "" .
}
`,
        });
    } catch (e) {}

    spinner.info(`Creating percolators on ${sourceIndex}`);

    let {
      body: { count },
    } = await esClient.count({
      index: sourceIndex,
      body: { query: {  match_all : {}} },
    });
    spinner.info(`Found ${count} concepts`);
    spinner.start(`Processing concepts...`);

    for (let i = 0; i <= count; i++) {
      const response = await esClient.search({
        index: sourceIndex,
        from: i - 1,
        size: 1,
        body: {
          query: {  match_all : {}}
        },
        _source: {includes: ["prefLabel"]}
      });
      const { _id: id, _source: concept } = response.body.hits.hits[0];
      try {
        let prefLabels = concept.prefLabel

        if(!!prefLabels || prefLabels?.length > 0){
          if(!Array.isArray(prefLabels)){
            prefLabels = [prefLabels]
          }

          let percoLabels = [];

          for(const prefLabel of prefLabels){
            const {body: {tokens}} = await esClient.indices.analyze({
              index: sourceIndex,
              body: {
                "tokenizer": "standard",
                "filter": [ "lowercase","asciifolding", {"type": "stop", "stopwords": ["_french_", "_english_"]}],
                "text": prefLabel
              }
            });

            if(tokens.length < 5){
              percoLabels.push(tokens.map(({token}) => token).join(" "))
            }
          }

          if(percoLabels.length > 0){
            const percoLabel = percoLabels.length === 1 ? percoLabels[0] : percoLabels.map(percoLabel => `( ${percoLabel} )`).join(" OR ");

            spinner.text = `${Math.floor(i/count*100)}% - Processing concept percolation ${i}/${count} - ${percoLabel}`;

            await esClient.update({
              id: id,
              index: sourceIndex,
              body: {
                doc: {
                  query: {
                    match: {
                      percoLabel
                    }
                  }
                }
              }
            });
          }
        }
      } catch (e) {
        console.log(e)
        spinner.fail(e?.meta?.body?.error || e.message);
      }
    }
    spinner.succeed();
  }

  process.exit(0);
};

function linkPathToPropertyChain({ linkPath, synaptixSession }) {
  return linkPath.getSteps().reduce((propertyChain, step) => {
    if (step instanceof LinkStep) {
      let objectProperty =
        step.getLinkDefinition().getRdfObjectProperty() ||
        step
          .getLinkDefinition()
          .getSymmetricLinkDefinition()
          ?.getRdfReversedObjectProperty();

      if (objectProperty) {
        propertyChain.push(
          synaptixSession.normalizeId(objectProperty)
        );
      } else {
        // logWarning(`Model definition link ${modelDefinition.name} -> ${fieldName} can't be indexed while GraphDB only support straight property chains. Try to change "rdfReversedObjectProperty" (${step.getLinkDefinition().getRdfReversedObjectProperty()}) of step link "${step.getLinkDefinition().getLinkName()}" by it's owl:inverseOf in "rdfObjectProperty"`);
      }
    } else if (step instanceof PropertyStep) {
      propertyChain.push(
        synaptixSession.normalizeId(step.getPropertyDefinition().getRdfDataProperty())
      );
    }

    return propertyChain;
  }, []);
}
