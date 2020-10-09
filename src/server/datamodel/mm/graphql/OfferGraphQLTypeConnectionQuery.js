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

const esDateFormat = "dd/MM/YY";
const dayjsDateFormat = "DD/MM/YY";


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
        async (_, { jobAreaId, occupationIds, ...args }, synaptixSession, info) => {
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
                value:  dayjs().subtract(3, "month"),
                isGt: true
              })
            ],
            limit: 0,
            getExtraQuery: () => {
              return {
                aggs: Object.entries(occupationIds).reduce((acc, [index, occupationId]) => {
                  acc[occupationId] = {
                    filter: { term: { "occupation": occupationId } },
                    aggs: {
                      results : {
                        date_histogram: {
                          field: "dateCreation",
                          calendar_interval: "month",
                          format: esDateFormat,
                          extended_bounds: {
                            "min": dayjs().subtract(3, "month").format(dayjsDateFormat),
                            "max": dayjs().format(dayjsDateFormat)
                          }
                        }
                      }
                    }
                  };

                  return acc;
                }, {})
              };
            },
            rawResult: true
          });

          const aggs = Object.entries(result.aggregations).reduce((acc, [occupationId, {results}]) => {
            for(const bucket of results.buckets){
              if (!acc[bucket.key_as_string]){
                acc[bucket.key_as_string] = {
                  label: bucket.key_as_string
                };
              }

              acc[bucket.key_as_string][occupationId] =  bucket.doc_count;
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
        async (_, { jobAreaIds, occupationId, ...args }, synaptixSession, info) => {
          const result = await synaptixSession.getIndexService().getNodes({
            modelDefinition: OfferDefinition,
            propertyFilters: [
              new PropertyFilter({
                propertyDefinition: OfferDefinition.getProperty("creationDate"),
                value:  dayjs().subtract(3, "year"),
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
                  acc[jobAreaId] = {
                    filter: { term: { "zoneEmploi": jobAreaId } },
                    aggs: {
                      results : {
                        date_histogram: {
                          field: "dateCreation",
                          calendar_interval: "month",
                          format: esDateFormat,
                          extended_bounds: {
                            "min": dayjs().subtract(3, "month").format(dayjsDateFormat),
                            "max": dayjs().format(dayjsDateFormat)
                          }
                        }
                      }
                    }
                  };

                  return acc;
                }, {})
              };
            },
            rawResult: true
          });

          const aggs = Object.entries(result.aggregations).reduce((acc, [jobAreaId, {results}]) => {
            for(const bucket of results.buckets){
              if (!acc[bucket.key_as_string]){
                acc[bucket.key_as_string] = {
                  label: bucket.key_as_string
                };
              }

              acc[bucket.key_as_string][jobAreaId] =  bucket.doc_count;
            }

            return acc;
          }, {});

          return JSON.stringify(Object.values(aggs));
        }
    });
  }
}


