import {
  generateConnectionArgs,
  getObjectsCountResolver,
  getObjectsResolver,
  GraphQLTypeDefinition,
  LinkFilter,
  PropertyFilter,
  QueryFilter,
} from "@mnemotix/synaptix.js";
import OfferDefinition from "./OfferDefinition";
import OccupationDefinition from "./OccupationDefinition";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import advancedFormat from "dayjs/plugin/advancedFormat";

dayjs.extend(weekOfYear);
dayjs.extend(advancedFormat);

const offersESDateFormat = "MM/YY";
const incomesESDateFormat = "MM/YY";

export class OfferGraphQLDefinition extends GraphQLTypeDefinition {
  /**
   * @return {string}
   */
  static getExtraGraphQLCode() {
    return `
extend type Query{    
  """
   This service returns a list of offers filtered by a jobAreaId
   
   Parameters :
     - jobAreaId: [REQUIRED] Job area id.
  """
  offers(jobAreaId:ID! ${generateConnectionArgs()}): OfferConnection
  
  """
   This service returns a count of offers filtered by a jobAreaId
   
   Parameters :
     - jobAreaId: [REQUIRED] Job area id.
  """
  offersCount(jobAreaId:ID!): Int
  
  """
   This service returns a list of offers aggregations filtered by a jobAreaId splitted into occupations spread over time 
   
   Parameters :
     - jobAreaId: [REQUIRED] Job area id.
     - occupationIds: [REQUIRED] Occupation ids
  """
  offersByOccupationAggs(jobAreaId:ID! occupationIds:[ID!]!): String
  
  """
   This service returns a list of offers aggregations filtered by an occupationId splitted into jobAreas spread over time
   
   Parameters :
     - jobAreaIds: [REQUIRED] Job area ids.
     - occupationId: [REQUIRED] Occupation id
  """
  offersByJobAreaAggs(jobAreaIds:[ID!]! occupationId:ID!): String
  
  
  """
   This service returns a list of top 10 aggregated offers aggregations filtered by a list of occupationIds
   
   Parameters :
     - occupationId: [REQUIRED] Occupation id
     - jobAreaId:    [REQUIRED] Job area id
  """
  offersTopOrganizationsAggs(occupationId: ID! jobAreaId: ID!): String
  
  """
   This service returns a list of top 10 aggregated occupations aggregations filtered by a job area id
   
   Parameters :
     - jobAreaId:    [REQUIRED] Job area id
  """
  offersTopOccupationsAggs(jobAreaId: ID!): String
  
  """
   This service returns a list of incomes aggregations filtered by a jobAreaId splitted into occupations spread over time 
   
   Parameters :
     - jobAreaId: [REQUIRED] Job area id.
     - occupationIds: [REQUIRED] Occupation ids
  """
  incomesByOccupationAggs(jobAreaId:ID! occupationIds:[ID!]!): String
  
  """
   This service returns a list of incomes aggregations filtered by an occupationId splitted into jobAreas spread over time
   
   Parameters :
     - jobAreaIds: [REQUIRED] Job area ids.
     - occupationId: [REQUIRED] Occupation id
  """
  incomesByJobAreaAggs(jobAreaIds:[ID!]! occupationId:ID!): String
  
  """
   This service  analyzes offers and returns a color result.
   
   Parameters :
     - jobAreaIds: [REQUIRED] Job area ids.
     - occupationId: [REQUIRED] Occupation id
  """
  analyzeOffers(jobAreaIds:[ID!]! occupationIds:[ID!]!): String
  
  """
    This service  analyzes incomes and returns a color result.
   
   Parameters :
     - jobAreaIds: [REQUIRED] Job area ids.
     - occupationId: [REQUIRED] Occupation id
  """
  analyzeIncomes(jobAreaIds:[ID!]! occupationIds:[ID!]!): String     
}
`;
  }

  /**
   * @inheritDoc
   */
  static getExtraResolvers() {
    return {
      Query: {
        offers:
          /**
           * @param _
           * @param {string} geonamesId
           * @param {string} jobAreaId
           * @param {SynaptixDatastoreSession} synaptixSession
           * @param {object} info
           */
          async (_, { jobAreaId, ...args }, synaptixSession, info) => {
            args.filters = [].concat(args.filters || [], [
              `withinJobArea:${jobAreaId}`,
            ]);

            return getObjectsResolver(
              OfferDefinition,
              _,
              args,
              synaptixSession,
              info
            );
          },
        offersCount:
          /**
           * @param _
           * @param {string} geonamesId
           * @param {string} jobAreaId
           * @param {SynaptixDatastoreSession} synaptixSession
           * @param {object} info
           */
          async (_, { jobAreaId, ...args }, synaptixSession, info) => {
            args.filters = [].concat(args.filters || [], [
              `withinJobArea:${jobAreaId}`,
            ]);

            return getObjectsCountResolver(
              OfferDefinition,
              _,
              args,
              synaptixSession
            );
          },
        offersByOccupationAggs:
          /**
           * @param _
           * @param {string} jobAreaId
           * @param {string[]} occupationIds
           * @param {SynaptixDatastoreSession} synaptixSession
           * @param {object} info
           */
          async (_, { jobAreaId, occupationIds }, synaptixSession, info) => {
            jobAreaId = synaptixSession.normalizeId(jobAreaId);
            occupationIds = occupationIds.map((occupationId) =>
              synaptixSession.normalizeId(occupationId)
            );

            const result = await synaptixSession.getIndexService().getNodes({
              modelDefinition: OfferDefinition,
              queryFilters: [
                new QueryFilter({
                  filterDefinition: OfferDefinition.getFilter("withinJobArea"),
                  filterGenerateParams: jobAreaId,
                }),
              ],
              propertyFilters: [
                new PropertyFilter({
                  propertyDefinition: OfferDefinition.getProperty(
                    "creationDate"
                  ),
                  value: getOffersLowerBoundDate(),
                  isGt: true,
                }),
              ],
              limit: 0,
              aggs: Object.entries(occupationIds).reduce(
                (acc, [index, occupationId]) => {
                  acc[occupationId] = generateOffersCountDateHistogram({
                    filter: { term: { occupation: occupationId } },
                  });

                  return acc;
                },
                {}
              ),
              rawResult: true,
            });

            const aggs = Object.entries(result.aggregations).reduce(
              (acc, [occupationId, { offersCountHistogram }]) => {
                for (const bucket of offersCountHistogram.buckets) {
                  if (!acc[bucket.key_as_string]) {
                    acc[bucket.key_as_string] = {
                      label: bucket.key_as_string,
                    };
                  }

                  acc[bucket.key_as_string][
                    synaptixSession.normalizePrefixedUri({ uri: occupationId })
                  ] = bucket.doc_count;
                }

                return acc;
              },
              {}
            );

            return JSON.stringify(Object.values(aggs));
          },
        offersByJobAreaAggs:
          /**
           * @param _
           * @param {string[]} jobAreaIds
           * @param {string[]} occupationIds
           * @param {SynaptixDatastoreSession} synaptixSession
           * @param {object} info
           */
          async (_, { jobAreaIds, occupationId }, synaptixSession, info) => {
            jobAreaIds = jobAreaIds.map((jobAreaId) =>
              synaptixSession.normalizeId(jobAreaId)
            );
            occupationId = synaptixSession.normalizeId(occupationId);

            const result = await synaptixSession.getIndexService().getNodes({
              modelDefinition: OfferDefinition,
              propertyFilters: [
                new PropertyFilter({
                  propertyDefinition: OfferDefinition.getProperty(
                    "creationDate"
                  ),
                  value: getOffersLowerBoundDate(),
                  isGt: true,
                }),
              ],
              linkFilters: [
                new LinkFilter({
                  linkDefinition: OfferDefinition.getLink("hasOccupation"),
                  id: occupationId,
                }),
              ],
              limit: 0,
              aggs: Object.entries(jobAreaIds).reduce(
                (acc, [index, jobAreaId]) => {
                  acc[jobAreaId] = generateOffersCountDateHistogram({
                    filter: { term: { zoneEmploi: jobAreaId } },
                  });

                  return acc;
                },
                {}
              ),
              rawResult: true,
            });

            const aggs = Object.entries(result.aggregations).reduce(
              (acc, [jobAreaId, { offersCountHistogram }]) => {
                for (const bucket of offersCountHistogram.buckets) {
                  if (!acc[bucket.key_as_string]) {
                    acc[bucket.key_as_string] = {
                      label: bucket.key_as_string,
                    };
                  }

                  acc[bucket.key_as_string][
                    synaptixSession.normalizePrefixedUri({ uri: jobAreaId })
                  ] = bucket.doc_count;
                }

                return acc;
              },
              {}
            );

            return JSON.stringify(Object.values(aggs));
          },
        /**
         * @param _
         * @param {string} occupationsId
         * @param {string} jobAreaId
         * @param {SynaptixDatastoreSession} synaptixSession
         * @param {object} info
         */
        offersTopOrganizationsAggs: async (
          _,
          { jobAreaId, occupationId } = {},
          synaptixSession,
          info
        ) => {
          jobAreaId = synaptixSession.normalizeId(jobAreaId);
          occupationId = synaptixSession.normalizeId(occupationId);

          const result = await synaptixSession.getIndexService().getNodes({
            modelDefinition: OfferDefinition,
            queryFilters: [
              new QueryFilter({
                filterDefinition: OfferDefinition.getFilter("withinJobArea"),
                filterGenerateParams: synaptixSession.normalizeId(jobAreaId),
              }),
            ],
            linkFilters: [
              new LinkFilter({
                linkDefinition: OfferDefinition.getLink("hasOccupation"),
                id: synaptixSession.normalizeId(occupationId),
              }),
            ],
            limit: 0,
            aggs: {
              organizations: {
                terms: {
                  field: "entreprise.nom.keyword",
                },
              },
            },
            rawResult: true,
          });

          return JSON.stringify(result.aggregations.organizations.buckets);
        },

        /**
         * @param _
         * @param {string} jobAreaId
         * @param {SynaptixDatastoreSession} synaptixSession
         * @param {object} info
         */
        offersTopOccupationsAggs: async (
          _,
          { jobAreaId } = {},
          synaptixSession,
          info
        ) => {
          jobAreaId = synaptixSession.normalizeId(jobAreaId);

          const result = await synaptixSession.getIndexService().getNodes({
            modelDefinition: OfferDefinition,
            queryFilters: [
              new QueryFilter({
                filterDefinition: OfferDefinition.getFilter("withinJobArea"),
                filterGenerateParams: synaptixSession.normalizeId(jobAreaId),
              }),
            ],
            limit: 0,
            aggs: {
              occupations: {
                terms: {
                  field: OfferDefinition.getLink(
                    "hasOccupation"
                  ).getPathInIndex(),
                },
              },
            },
            rawResult: true,
          });

          const occupationIds = (
            result?.aggregations?.occupations?.buckets || []
          )
            .slice(0, 9)
            .map(({ key }) => key);

          const occupations = await synaptixSession.getIndexService().getNodes({
            modelDefinition: OccupationDefinition,
            idsFilters: occupationIds,
          });

          let buckets = [];

          for (let bucket of result?.aggregations?.occupations?.buckets || []) {
            const occupation = occupations.find(
              (occupation) => occupation.id === bucket.key
            );
            if (occupation) {
              bucket.prefLabel = await synaptixSession.getLocalizedLabelFor({
                object: occupation,
                labelDefinition: OccupationDefinition.getLabel("prefLabel"),
              });
              buckets.push(bucket);
            }
          }

          return JSON.stringify(buckets);
        },

        incomesByOccupationAggs:
          /**
           * @param _
           * @param {string} jobAreaId
           * @param {string[]} occupationIds
           * @param {SynaptixDatastoreSession} synaptixSession
           * @param {object} info
           */
          async (_, { jobAreaId, occupationIds }, synaptixSession, info) => {
            jobAreaId = synaptixSession.normalizeId(jobAreaId);
            occupationIds = occupationIds.map((occupationId) =>
              synaptixSession.normalizeId(occupationId)
            );

            const result = await synaptixSession.getIndexService().getNodes({
              modelDefinition: OfferDefinition,
              queryFilters: [
                new QueryFilter({
                  filterDefinition: OfferDefinition.getFilter("withinJobArea"),
                  filterGenerateParams: jobAreaId,
                }),
              ],
              propertyFilters: [
                new PropertyFilter({
                  propertyDefinition: OfferDefinition.getProperty(
                    "creationDate"
                  ),
                  value: getOffersLowerBoundDate(),
                  isGt: true,
                }),
              ],
              limit: 0,
              aggs: Object.entries(occupationIds).reduce(
                (acc, [index, occupationId]) => {
                  acc[occupationId] = generateIncomesAvgHistogram({
                    filter: { term: { occupation: occupationId } },
                  });

                  return acc;
                },
                {}
              ),
              rawResult: true,
            });

            const aggs = Object.entries(result.aggregations).reduce(
              (acc, [occupationId, { incomesHistogram }]) => {
                for (const bucket of incomesHistogram.buckets) {
                  if (!acc[bucket.key_as_string]) {
                    acc[bucket.key_as_string] = {
                      label: bucket.key_as_string,
                    };
                  }

                  acc[bucket.key_as_string][
                    synaptixSession.normalizePrefixedUri({ uri: occupationId })
                  ] = (bucket.avgIncome.value || 0) / 12;
                }

                return acc;
              },
              {}
            );

            return JSON.stringify(Object.values(aggs));
          },
        /**
         * @param _
         * @param {string[]} jobAreaIds
         * @param {string} occupationId
         * @param {SynaptixDatastoreSession} synaptixSession
         * @param {object} info
         */
        incomesByJobAreaAggs: async (
          _,
          { jobAreaIds, occupationId },
          synaptixSession,
          info
        ) => {
          jobAreaIds = jobAreaIds.map((jobAreaId) =>
            synaptixSession.normalizeId(jobAreaId)
          );
          occupationId = synaptixSession.normalizeId(occupationId);

          const result = await synaptixSession.getIndexService().getNodes({
            modelDefinition: OfferDefinition,
            propertyFilters: [
              new PropertyFilter({
                propertyDefinition: OfferDefinition.getProperty("creationDate"),
                value: getOffersLowerBoundDate(),
                isGt: true,
              }),
            ],
            linkFilters: [
              new LinkFilter({
                linkDefinition: OfferDefinition.getLink("hasOccupation"),
                id: occupationId,
              }),
            ],
            limit: 0,
            aggs: Object.entries(jobAreaIds).reduce(
              (acc, [index, jobAreaId]) => {
                acc[jobAreaId] = generateIncomesAvgHistogram({
                  filter: { term: { zoneEmploi: jobAreaId } },
                });

                return acc;
              },
              {}
            ),
            rawResult: true,
          });

          const aggs = Object.entries(result.aggregations).reduce(
            (acc, [jobAreaId, { incomesHistogram }]) => {
              for (const bucket of incomesHistogram.buckets) {
                if (!acc[bucket.key_as_string]) {
                  acc[bucket.key_as_string] = {
                    label: bucket.key_as_string,
                  };
                }

                acc[bucket.key_as_string][
                  synaptixSession.normalizePrefixedUri({ uri: jobAreaId })
                ] = (bucket.avgIncome.value || 0) / 12;
              }

              return acc;
            },
            {}
          );

          return JSON.stringify(Object.values(aggs));
        },
        /**
         * @param _
         * @param {string[]} jobAreaIds
         * @param {string[]} occupationIds
         * @param {SynaptixDatastoreSession} synaptixSession
         * @param {object} info
         */
        analyzeOffers: async (
          _,
          { jobAreaIds, occupationIds },
          synaptixSession
        ) => {
          jobAreaIds = jobAreaIds.map((jobAreaId) =>
            synaptixSession.normalizeId(jobAreaId)
          );
          occupationIds = occupationIds.map((occupationId) =>
            synaptixSession.normalizeId(occupationId)
          );

          try {
            const result = await synaptixSession
              .getDataPublisher()
              .publish("ami.analyze.offer.count.month", {
                offerIndex: OfferDefinition.getIndexType().map(
                  (type) =>
                    `${env.get("INDEX_PREFIX_TYPES_WITH").asString()}${type}`
                ),
                zoneEmploiUri: jobAreaIds,
                occupationUri: occupationIds,
                dategte: getOffersLowerBoundDate().toISOString(),
                datelte: dayjs().toISOString(),
              });

            return result?.color;
          } catch (e) {
            return "ROUGE";
          }
        },
        /**
         * @param _
         * @param {string[]} jobAreaIds
         * @param {string[]} occupationIds
         * @param {SynaptixDatastoreSession} synaptixSession
         * @param {object} info
         */
        analyzeIncomes: async (
          _,
          { jobAreaIds, occupationIds },
          synaptixSession,
          info
        ) => {
          jobAreaIds = jobAreaIds.map((jobAreaId) =>
            synaptixSession.normalizeId(jobAreaId)
          );
          occupationIds = occupationIds.map((occupationId) =>
            synaptixSession.normalizeId(occupationId)
          );

          try {
            const result = await synaptixSession
              .getDataPublisher()
              .publish("ami.analyze.offer.salary.mean.month", {
                offerIndex: OfferDefinition.getIndexType().map(
                  (type) =>
                    `${env.get("INDEX_PREFIX_TYPES_WITH").asString()}${type}`
                ),
                zoneEmploiUri: jobAreaIds,
                occupationUri: occupationIds,
                dategte: getOffersLowerBoundDate().toISOString(),
                datelte: dayjs().toISOString(),
              });

            return result?.color;
          } catch (e) {
            return "ORANGE";
          }
        },
      },
    };
  }
}

function generateOffersCountDateHistogram({ filter }) {
  return {
    filter,
    aggs: {
      offersCountHistogram: {
        date_histogram: {
          field: "dateCreation",
          calendar_interval: "month",
          format: offersESDateFormat,
          extended_bounds: {
            min: "now-5M",
            max: "now",
          },
        },
      },
    },
  };
}

function generateIncomesAvgHistogram({ filter }) {
  return {
    filter,
    aggs: {
      incomesHistogram: {
        date_histogram: {
          field: "dateCreation",
          calendar_interval: "month",
          format: incomesESDateFormat,
          extended_bounds: {
            min: "now-5M",
            max: "now",
          },
        },
        aggs: {
          avgIncome: {
            avg: {
              field: "salaire",
              missing: 0,
            },
          },
        },
      },
    },
  };
}

export function getOffersLowerBoundDate() {
  return dayjs().subtract(5, "month");
}
