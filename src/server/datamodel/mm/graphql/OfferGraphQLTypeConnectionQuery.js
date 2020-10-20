import {
  GraphQLTypeConnectionQuery,
  SynaptixDatastoreSession,
  getObjectsResolver,
  getObjectsCountResolver,
  generateConnectionArgs,
  QueryFilter, PropertyFilter, LinkFilter
} from "@mnemotix/synaptix.js";
import OfferDefinition from "../OfferDefinition";
import dayjs from "dayjs";
import weekOfYear from 'dayjs/plugin/weekOfYear';
import advancedFormat from 'dayjs/plugin/advancedFormat';
dayjs.extend(weekOfYear);
dayjs.extend(advancedFormat)

const esDateFormat = "ww - MM/YY";
const dayjsDateFormat = "ww - MM/YY";


export class OfferGraphQLTypeConnectionQuery extends GraphQLTypeConnectionQuery {
  /**
   * @inheritdoc
   */
  generateType(modelDefinition) {
    const graphQLType = modelDefinition.getGraphQLType();
    return this._wrapQueryType(`
      """
       This service returns a list of offers filtered by a jobAreaId
       
       Parameters :
         - jobAreaId: [REQUIRED] Job area id.
      """
      offers(jobAreaId:ID! ${generateConnectionArgs()}): ${graphQLType}Connection
      
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
    `);
  }

  /**
   * @inheritdoc
   */
  generateResolver(modelDefinition) {
    return this._wrapQueryResolver({
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
            `withinJobArea:${jobAreaId}`
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
            `withinJobArea:${jobAreaId}`
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
          jobAreaId =  synaptixSession.normalizeAbsoluteUri({uri: jobAreaId})
          occupationIds = occupationIds.map(occupationId =>  synaptixSession.normalizeAbsoluteUri({uri: occupationId}) );

          const result = await synaptixSession.getIndexService().getNodes({
            modelDefinition: OfferDefinition,
            queryFilters: [
              new QueryFilter({
                filterDefinition: OfferDefinition.getFilter("withinJobArea"),
                filterGenerateParams: jobAreaId
              })
            ],
            propertyFilters: [
              new PropertyFilter({
                propertyDefinition: OfferDefinition.getProperty("creationDate"),
                value:  getOffersLowerBoundDate(),
                isGt: true
              })
            ],
            limit: 0,
            getExtraQuery: () => {
              return {
                aggs: Object.entries(occupationIds).reduce((acc, [index, occupationId]) => {
                  acc[occupationId] = generateOffersCountDateHistogram({
                    filter: { term: { "occupation": occupationId } }
                  });

                  return acc;
                }, {})
              };
            },
            rawResult: true
          });

          const aggs = Object.entries(result.aggregations).reduce((acc, [occupationId, {offersCountHistogram}]) => {
            for(const bucket of offersCountHistogram.buckets){
              if (!acc[bucket.key_as_string]){
                acc[bucket.key_as_string] = {
                  label: bucket.key_as_string
                };
              }

              acc[bucket.key_as_string][synaptixSession.normalizePrefixedUri({uri: occupationId})] =  bucket.doc_count;
            }

            return acc;
          }, {});

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
          jobAreaIds = jobAreaIds.map(jobAreaId =>  synaptixSession.normalizeAbsoluteUri({uri: jobAreaId}) );
          occupationId =  synaptixSession.normalizeAbsoluteUri({uri: occupationId})

          const result = await synaptixSession.getIndexService().getNodes({
            modelDefinition: OfferDefinition,
            propertyFilters: [
              new PropertyFilter({
                propertyDefinition: OfferDefinition.getProperty("creationDate"),
                value:  getOffersLowerBoundDate(),
                isGt: true
              }),
            ],
            linkFilters: [
              new LinkFilter({
                linkDefinition: OfferDefinition.getLink("hasOccupation"),
                id: occupationId
              })
            ],
            limit: 0,
            getExtraQuery: () => {
              return {
                aggs: Object.entries(jobAreaIds).reduce((acc, [index, jobAreaId]) => {
                  acc[jobAreaId] = generateOffersCountDateHistogram({
                    filter: { term: { "zoneEmploi": jobAreaId } },
                  });

                  return acc;
                }, {})
              };
            },
            rawResult: true
          });

          const aggs = Object.entries(result.aggregations).reduce((acc, [jobAreaId, {offersCountHistogram}]) => {
            for(const bucket of offersCountHistogram.buckets){
              if (!acc[bucket.key_as_string]){
                acc[bucket.key_as_string] = {
                  label: bucket.key_as_string
                };
              }

              acc[bucket.key_as_string][synaptixSession.normalizePrefixedUri({uri: jobAreaId})] =  bucket.doc_count;
            }

            return acc;
          }, {});

          return JSON.stringify(Object.values(aggs));
        },
      offersTopOrganizationsAggs: /**
       * @param _
       * @param {string} occupationsId
       * @param {string} jobAreaId
       * @param {SynaptixDatastoreSession} synaptixSession
       * @param {object} info
       */
      async (_, { jobAreaId, occupationId } = {}, synaptixSession, info) => {
        const result = await synaptixSession.getIndexService().getNodes({
          modelDefinition: OfferDefinition,
          queryFilters: [
            new QueryFilter({
              filterDefinition: OfferDefinition.getFilter("withinJobArea"),
              filterGenerateParams: synaptixSession.normalizeAbsoluteUri({uri: jobAreaId})
            })
          ],
          linkFilters: [
            new LinkFilter({
              linkDefinition: OfferDefinition.getLink("hasOccupation"),
              id:  synaptixSession.normalizeAbsoluteUri({uri: occupationId})
            })
          ],
          limit: 0,
          getExtraQuery: () => {
            return {
              aggs: {
                organizations: {
                  terms: {
                    field: "entreprise.nom.keyword"
                  }
                }
              }
            };
          },
          rawResult: true
        });

        return JSON.stringify(result.aggregations.organizations.buckets);
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
          jobAreaId =  synaptixSession.normalizeAbsoluteUri({uri: jobAreaId})
          occupationIds = occupationIds.map(occupationId =>  synaptixSession.normalizeAbsoluteUri({uri: occupationId}) );

          const result = await synaptixSession.getIndexService().getNodes({
            modelDefinition: OfferDefinition,
            queryFilters: [
              new QueryFilter({
                filterDefinition: OfferDefinition.getFilter("withinJobArea"),
                filterGenerateParams: jobAreaId
              })
            ],
            propertyFilters: [
              new PropertyFilter({
                propertyDefinition: OfferDefinition.getProperty("creationDate"),
                value:  getOffersLowerBoundDate(),
                isGt: true
              })
            ],
            limit: 0,
            getExtraQuery: () => {
              return {
                aggs: Object.entries(occupationIds).reduce((acc, [index, occupationId]) => {
                  acc[occupationId] = generateIncomesAvgHistogram({
                    filter: { term: { "occupation": occupationId } }
                  });

                  return acc;
                }, {})
              };
            },
            rawResult: true
          });

          const aggs = Object.entries(result.aggregations).reduce((acc, [occupationId, {incomesHistogram}]) => {
            for(const bucket of incomesHistogram.buckets){
              if (!acc[bucket.key_as_string]){
                acc[bucket.key_as_string] = {
                  label: bucket.key_as_string
                };
              }

              acc[bucket.key_as_string][synaptixSession.normalizePrefixedUri({uri: occupationId})] =  bucket.avgIncome.value || 0;
            }

            return acc;
          }, {});

          return JSON.stringify(Object.values(aggs));
        },
      incomesByJobAreaAggs:
        /**
         * @param _
         * @param {string[]} jobAreaIds
         * @param {string[]} occupationIds
         * @param {SynaptixDatastoreSession} synaptixSession
         * @param {object} info
         */
        async (_, { jobAreaIds, occupationId }, synaptixSession, info) => {
          jobAreaIds = jobAreaIds.map(jobAreaId =>  synaptixSession.normalizeAbsoluteUri({uri: jobAreaId}) );
          occupationId =  synaptixSession.normalizeAbsoluteUri({uri: occupationId})

          const result = await synaptixSession.getIndexService().getNodes({
            modelDefinition: OfferDefinition,
            propertyFilters: [
              new PropertyFilter({
                propertyDefinition: OfferDefinition.getProperty("creationDate"),
                value:  getOffersLowerBoundDate(),
                isGt: true
              }),
            ],
            linkFilters: [
              new LinkFilter({
                linkDefinition: OfferDefinition.getLink("hasOccupation"),
                id: occupationId
              })
            ],
            limit: 0,
            getExtraQuery: () => {
              return {
                aggs: Object.entries(jobAreaIds).reduce((acc, [index, jobAreaId]) => {
                  acc[jobAreaId] = generateIncomesAvgHistogram({
                    filter: { term: { "zoneEmploi": jobAreaId } },
                  });

                  return acc;
                }, {})
              };
            },
            rawResult: true
          });

          const aggs = Object.entries(result.aggregations).reduce((acc, [jobAreaId, {incomesHistogram}]) => {
            for(const bucket of incomesHistogram.buckets){
              if (!acc[bucket.key_as_string]){
                acc[bucket.key_as_string] = {
                  label: bucket.key_as_string
                };
              }

              acc[bucket.key_as_string][synaptixSession.normalizePrefixedUri({uri: jobAreaId})] =  bucket.avgIncome.value || 0;
            }

            return acc;
          }, {});

          return JSON.stringify(Object.values(aggs));
        },
    });
  }
}

function generateOffersCountDateHistogram({filter}){
  return {
    filter,
    aggs: {
      offersCountHistogram : {
        date_histogram: {
          field: "dateCreation",
          calendar_interval: "week",
          format: esDateFormat,
          extended_bounds: {
            "min": getOffersLowerBoundDate().format(dayjsDateFormat),
            "max": dayjs().format(dayjsDateFormat)
          }
        }
      }
    }
  }
}


function generateIncomesAvgHistogram({filter}){
  return {
    filter,
    aggs: {
      incomesHistogram : {
        date_histogram: {
          field: "dateCreation",
          calendar_interval: "week",
          format: esDateFormat,
          extended_bounds: {
            "min": getOffersLowerBoundDate().format(dayjsDateFormat),
            "max": dayjs().format(dayjsDateFormat)
          }
        },
        aggs: {
          avgIncome: {
            avg: {
              field: "salaire",
              missing: 0
          }
          }
        }
      }
    }
  }
}

function getOffersLowerBoundDate(){
  return dayjs().subtract(5, "month");
}