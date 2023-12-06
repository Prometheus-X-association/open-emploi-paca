import {
  generateConnectionArgs,
  getObjectsCountResolver,
  getObjectsResolver,
  GraphQLTypeDefinition,
  LinkFilter,
  PropertyFilter,
} from "@mnemotix/synaptix.js";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import advancedFormat from "dayjs/plugin/advancedFormat";
import TrainingDefinition from "./TrainingDefinition";

dayjs.extend(weekOfYear);
dayjs.extend(advancedFormat);

const esDateFormat = "MM/YY";

export class TrainingGraphQLDefinition extends GraphQLTypeDefinition {
  /**
   * @return {string}
   */
  static getExtraGraphQLCode() {
    return `
extend type Query{    
  """
   This service returns a list of trainings filtered by a jobAreaId
   
   Parameters :
     - jobAreaId: [REQUIRED] Job area id.
  """
  trainings(jobAreaId:ID! blabla:Int ${generateConnectionArgs()}): TrainingConnection
  
  """
   This service returns a count of trainings filtered by a jobAreaId
   
   Parameters :
     - jobAreaId: [REQUIRED] Job area id.
  """
  trainingsCount(jobAreaId:ID!): Int
  
  """
   This service returns a list of trainings aggregations filtered by a jobAreaId splitted into occupations spread over time 
   
   Parameters :
     - jobAreaId: [REQUIRED] Job area id.
     - occupationIds: [REQUIRED] Occupation ids
  """
  trainingsByOccupationAggs(jobAreaId:ID! occupationIds:[ID!]!): String
  
  """
   This service returns a list of trainings aggregations filtered by an occupationId splitted into jobAreas spread over time
   
   Parameters :
     - jobAreaIds: [REQUIRED] Job area ids.
     - occupationId: [REQUIRED] Occupation id
  """
  trainingsByJobAreaAggs(jobAreaIds:[ID!]! occupationId:ID!): String
  
  
  """
   This service returns a list of top 10 aggregated trainings aggregations filtered by a list of occupationIds
   
   Parameters :
     - occupationId: [REQUIRED] Occupation id
     - jobAreaId:    [REQUIRED] Job area id
  """
  trainingsTopOrganizationsAggs(occupationId: ID! jobAreaId: ID!): String
  
  """
    This service  analyzes trainings and returns a color result.
   
   Parameters :
     - jobAreaIds: [REQUIRED] Job area ids.
     - occupationId: [REQUIRED] Occupation id
  """
  analyzeTrainings(jobAreaIds:[ID!]! occupationIds:[ID!]!): String      
}
`;
  }

  /**
   * @inheritDoc
   */
  static getExtraResolvers() {
    return {
      Query: {
        /**
         * @param _
         * @param {string} geonamesId
         * @param {string} jobAreaId
         * @param {SynaptixDatastoreSession} synaptixSession
         * @param {object} info
         */
        trainings: async (_, { jobAreaId, ...args }, synaptixSession, info) => {
          args.filters = [].concat(args.filters || [], [
            `hasJobArea:${jobAreaId}`,
          ]);

          return getObjectsResolver(
            TrainingDefinition,
            _,
            args,
            synaptixSession,
            info
          );
        },
        /**
         * @param _
         * @param {string} geonamesId
         * @param {string} jobAreaId
         * @param {SynaptixDatastoreSession} synaptixSession
         * @param {object} info
         */
        trainingsCount: async (
          _,
          { jobAreaId, ...args },
          synaptixSession,
          info
        ) => {
          args.filters = [].concat(args.filters || [], [
            `hasJobArea:${jobAreaId}`,
          ]);

          return getObjectsCountResolver(
            TrainingDefinition,
            _,
            args,
            synaptixSession
          );
        },
        /**
         * @param _
         * @param {string} jobAreaId
         * @param {string[]} occupationIds
         * @param {SynaptixDatastoreSession} synaptixSession
         * @param {object} info
         */
        trainingsByOccupationAggs: async (
          _,
          { jobAreaId, occupationIds },
          synaptixSession,
          info
        ) => {
          jobAreaId = synaptixSession.normalizeId(jobAreaId);
          occupationIds = occupationIds.map((occupationId) =>
            synaptixSession.normalizeId(occupationId)
          );

          const result = await synaptixSession.getIndexService().getNodes({
            modelDefinition: TrainingDefinition,
            propertyFilters: [
              new PropertyFilter({
                propertyDefinition: TrainingDefinition.getProperty("startDate"),
                value: getTrainingsLowerBoundDate(),
                isGt: true,
              }),
              new PropertyFilter({
                propertyDefinition: TrainingDefinition.getProperty("startDate"),
                value: getTrainingsUpperBoundDate(),
                isLt: true,
              }),
            ],
            linkFilters: [
              new LinkFilter({
                linkDefinition: TrainingDefinition.getLink("hasJobArea"),
                id: jobAreaId,
              }),
              new LinkFilter({
                linkDefinition: TrainingDefinition.getLink("hasMainOccupation"),
                id: occupationIds,
              }),
            ],
            limit: 0,
            aggs: Object.entries(occupationIds).reduce(
              (acc, [index, occupationId]) => {
                acc[occupationId] = generateTrainingsCountDateHistogram({
                  filter: {
                    term: {
                      [TrainingDefinition.getLink(
                        "hasMainOccupation"
                      ).getPathInIndex()]: occupationId,
                    },
                  },
                });

                return acc;
              },
              {}
            ),
            rawResult: true,
          });

          const aggs = Object.entries(result.aggregations).reduce(
            (acc, [occupationId, { trainingsCountHistogram }]) => {
              for (const bucket of trainingsCountHistogram.buckets) {
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
        /**
         * @param _
         * @param {string[]} jobAreaIds
         * @param {string[]} occupationIds
         * @param {SynaptixDatastoreSession} synaptixSession
         * @param {object} info
         */
        trainingsByJobAreaAggs: async (
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
            modelDefinition: TrainingDefinition,
            propertyFilters: [
              new PropertyFilter({
                propertyDefinition: TrainingDefinition.getProperty("startDate"),
                value: getTrainingsLowerBoundDate(),
                isGt: true,
              }),
              new PropertyFilter({
                propertyDefinition: TrainingDefinition.getProperty("startDate"),
                value: getTrainingsUpperBoundDate(),
                isLt: true,
              }),
            ],
            linkFilters: [
              new LinkFilter({
                linkDefinition: TrainingDefinition.getLink("hasMainOccupation"),
                id: occupationId,
              }),
              new LinkFilter({
                linkDefinition: TrainingDefinition.getLink("hasJobArea"),
                id: jobAreaIds,
              }),
            ],
            limit: 0,
            aggs: Object.entries(jobAreaIds).reduce(
              (acc, [index, jobAreaId]) => {
                acc[jobAreaId] = generateTrainingsCountDateHistogram({
                  filter: {
                    term: {
                      [TrainingDefinition.getLink(
                        "hasJobArea"
                      ).getPathInIndex()]: jobAreaId,
                    },
                  },
                });

                return acc;
              },
              {}
            ),
            rawResult: true,
          });

          const aggs = Object.entries(result.aggregations).reduce(
            (acc, [jobAreaId, { trainingsCountHistogram }]) => {
              for (const bucket of trainingsCountHistogram.buckets) {
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
        trainingsTopOrganizationsAggs: async (
          _,
          { jobAreaId, occupationId } = {},
          synaptixSession,
          info
        ) => {
          occupationId = synaptixSession.normalizeId(occupationId);
          jobAreaId = synaptixSession.normalizeId(jobAreaId);

          const result = await synaptixSession.getIndexService().getNodes({
            modelDefinition: TrainingDefinition,
            linkFilters: [
              new LinkFilter({
                linkDefinition: TrainingDefinition.getLink("hasMainOccupation"),
                id: occupationId,
              }),
              new LinkFilter({
                linkDefinition: TrainingDefinition.getLink("hasJobArea"),
                id: jobAreaId,
              }),
            ],
            limit: 0,
            aggs: {
              organizations: {
                terms: {
                  field: "organizationName.keyword",
                },
              },
            },
            rawResult: true,
          });

          return JSON.stringify(result.aggregations.organizations.buckets);
        },
        /**
         * @param _
         * @param {string[]} jobAreaIds
         * @param {string[]} occupationIds
         * @param {SynaptixDatastoreSession} synaptixSession
         * @param {object} info
         */
        analyzeTrainings: async (
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
              .publish("ami.analyze.training.count.month", {
                formationIndex: [
                  `${env
                    .get("INDEX_PREFIX_TYPES_WITH")
                    .asString()}${TrainingDefinition.getIndexType()}`,
                ],
                zoneEmploiUri: jobAreaIds,
                occupationUri: occupationIds,
                dategte: getTrainingsLowerBoundDate().toISOString(),
                datelte: getTrainingsUpperBoundDate().toISOString(),
              });

            return result?.color;
          } catch (e) {
            return "VERT";
          }
        },
      },
    };
  }
}

function generateTrainingsCountDateHistogram({ filter }) {
  return {
    filter,
    aggs: {
      trainingsCountHistogram: {
        date_histogram: {
          field: "startDate",
          calendar_interval: "month",
          format: esDateFormat,
          extended_bounds: {
            min: "now-1y",
            max: "now+6M",
          },
        },
      },
    },
  };
}

export function getTrainingsLowerBoundDate() {
  return dayjs().subtract(1, "year");
}

export function getTrainingsUpperBoundDate() {
  return dayjs().add(6, "month");
}
