import {
  GraphQLTypeConnectionQuery,
  SynaptixDatastoreSession,
  getObjectsResolver,
  getObjectsCountResolver,
  generateConnectionArgs,
  QueryFilter, PropertyFilter
} from "@mnemotix/synaptix.js";
import OfferDefinition from "../OfferDefinition";
import dayjs from "dayjs";

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
       This service returns a list of offers aggregations filtered by a jobAreaId
       
       Parameters :
         - jobAreaId: [REQUIRED] Job area id.
         - occupationIds: [REQUIRED] Occupation ids
      """
      offersAggs(jobAreaId:ID! occupationIds:[ID!]!): String
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
      offersAggs:
        /**
         * @param _
         * @param {string} geonamesId
         * @param {string} jobAreaId
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
                value:  dayjs().subtract(3, "year"),
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
                      "histogram" : {
                        date_histogram: {
                          field: "dateCreation",
                          calendar_interval: "month",
                          format: "MM/YYYY"
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

          const aggs = Object.entries(result.aggregations).reduce((acc, [occupationId, {histogram}]) => {
            for(const bucket of histogram.buckets){
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
        }
    });
  }
}


