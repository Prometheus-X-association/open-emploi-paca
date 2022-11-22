import {
  generateConnectionArgs,
  GraphQLTypeConnectionQuery,
  LinkFilter,
  mergeResolvers,
  SynaptixDatastoreSession,
} from "@mnemotix/synaptix.js";
import textract from "textract";

import SkillDefinition from "../SkillDefinition";
import AptitudeDefinition from "../AptitudeDefinition";
import OccupationDefinition from "../OccupationDefinition";
import env from "env-var";
import OfferDefinition from "../OfferDefinition";
import dayjs from "dayjs";
import { getOffersLowerBoundDate } from "./OfferGraphQLTypeConnectionQuery";

export class SkillGraphQLTypeConnectionQuery extends GraphQLTypeConnectionQuery {
  /**
   * @inheritdoc
   */
  generateType(modelDefinition) {
    const baseType = super.generateType(modelDefinition);
    const extraType = this._wrapQueryType(`
      """
       This service returns a list of skills matching scores for a given personId and an occupationId
       
       Parameters :
         - personId: [REQUIRED] Person id
         - occupationId: [REQUIRED] Occupation id
      """
      skillsMatchingByOccupation(personId:ID! occupationId:ID!) : String
      
      
      """
       This service extract skills from a file.
       
       Parameters :
         - file: [REQUIRED] CV file
         - personId: [REQUIRED] Person id
      """
      extractSkillsFromFile(personId:ID! file: Upload ${generateConnectionArgs()}) : SkillConnection
      
       """
       This service count extract skills from a file.
       
       Parameters :
         - file: [REQUIRED] CV file
         - personId: [REQUIRED] Person id
      """
      countExtractSkillsFromFile(personId:ID! file: Upload) : Int
      
      """
        This service  analyzes incomes and returns a color result.
       
       Parameters :
         - jobAreaIds: [REQUIRED] Job area ids.
         - skillIds: [REQUIRED] Skill ids
      """
      analyzeSkills(jobAreaIds:[ID!]! skillIds:[ID!]!): String
      
    `);
    return `
      ${baseType}
      ${extraType}
    `;
  }

  /**
   * @inheritdoc
   */
  generateResolver(modelDefinition) {
    const baseResolver = super.generateResolver(modelDefinition);
    const extraResolver = this._wrapQueryResolver({
      skillsMatchingByOccupation:
        /**
         * @param _
         * @param {string} personId
         * @param {string} [occupationId]
         * @param {SynaptixDatastoreSession} synaptixSession
         */
        async (_, { personId, occupationId }, synaptixSession) => {
          personId = synaptixSession.normalizeAbsoluteUri({
            uri: synaptixSession.extractIdFromGlobalId(personId),
          });

          occupationId = synaptixSession.normalizeAbsoluteUri({
            uri: synaptixSession.extractIdFromGlobalId(occupationId),
          });

          let aptitudes = await synaptixSession.getObjects({
            modelDefinition: AptitudeDefinition,
            args: {
              linkFilters: [
                new LinkFilter({
                  linkDefinition: AptitudeDefinition.getLink("hasPerson"),
                  id: personId,
                }),
              ],
            },
          });

          let skills = aptitudes.reduce((acc, aptitude) => {
            acc[
              aptitude[AptitudeDefinition.getLink("hasSkill").getLinkName()].id
            ] =
              (aptitude[
                AptitudeDefinition.getProperty("ratingValue").getPropertyName()
              ] || 0) / 5;

            return acc;
          }, {});

          const skillLabelPath = OccupationDefinition.getProperty(
            "prefLabel"
          ).getPathInIndex();

          const result = await synaptixSession.getIndexService().getNodes({
            modelDefinition: SkillDefinition,
            linkFilters: [
              new LinkFilter({
                linkDefinition: SkillDefinition.getLink(
                  "hasOccupationCategory"
                ),
                id: occupationId,
              }),
            ],
            rawResult: true,
            limit: 1000,
            getExtraQueryParams: () => {
              return {
                _source: {
                  includes: [skillLabelPath],
                },
                sort: ["_score", `${skillLabelPath}.keyword`],
              };
            },
          });

          /**
           * After a bit of testing it
           * @type {number}
           */
          const matching = result.hits.reduce(
            (acc, { _id, _score, _source }) => {
              const score = skills[_id] || 0;

              acc[score > 0 ? "unshift" : "push"]({
                id: _id,
                score,
                prefLabel: Array.isArray(_source[skillLabelPath])
                  ? _source[skillLabelPath][0]
                  : _source[skillLabelPath],
              });

              return acc;
            },
            []
          );

          return JSON.stringify(Object.values(matching));
        },
      /**
       * @param _
       * @param {string} personId
       * @param {File} file
       * @param {object} args
       * @param {SynaptixDatastoreSession} synaptixSession
       */
      extractSkillsFromFile: async (
        _,
        { personId, file, ...args },
        synaptixSession
      ) => {
        const percolatedSkills = await percolateSkillsFromFile({
          file,
          synaptixSession,
          args,
        });

        return synaptixSession.wrapObjectsIntoGraphQLConnection(
          percolatedSkills || [],
          args
        );
      },
      /**
       * @param _
       * @param {string} personId
       * @param {File} file
       * @param {SynaptixDatastoreSession} synaptixSession
       */
      countExtractSkillsFromFile: async (
        _,
        { personId, file },
        synaptixSession
      ) => {
        return percolateSkillsFromFile({
          file,
          synaptixSession,
          justCount: true,
        });
      },
      /**
       * @param _
       * @param {string[]} jobAreaIds
       * @param {string[]} skillIds
       * @param {SynaptixDatastoreSession} synaptixSession
       * @param {object} info
       */
      analyzeSkills: async (_, { jobAreaIds, skillIds }, synaptixSession) => {
        jobAreaIds = jobAreaIds.map((jobAreaId) =>
          synaptixSession.normalizeAbsoluteUri({ uri: jobAreaId })
        );
        skillIds = skillIds.map((occupationId) =>
          synaptixSession.normalizeAbsoluteUri({ uri: occupationId })
        );

        try {
          const result = await synaptixSession
            .getDataPublisher()
            .publish("ami.analyze.user.skill.area", {
              offerIndex: OfferDefinition.getIndexType().map(
                (type) =>
                  `${env.get("INDEX_PREFIX_TYPES_WITH").asString()}${type}`
              ),
              skillIndex: [
                `${env
                  .get("INDEX_PREFIX_TYPES_WITH")
                  .asString()}${SkillDefinition.getIndexType()}`,
              ],
              skillUser: skillIds,
              zoneEmploi: jobAreaIds,
              gte: getOffersLowerBoundDate().toISOString(),
              lte: dayjs().toISOString(),
            });

          return result?.color;
        } catch (e) {
          return "VERT";
        }
      },
    });

    return mergeResolvers(baseResolver, extraResolver);
  }
}

/**
 * @param {File} file
 * @param {SynaptixDatastoreSession} synaptixSession
 * @param {boolean} [justCount]
 * @param {object} [args]
 * @return {Model[]|number}
 */
async function percolateSkillsFromFile({
  file,
  justCount,
  synaptixSession,
  args,
}) {
  const { mimetype, createReadStream } = await file;
  const fileStream = createReadStream();
  const fileChunks = [];

  for await (let chunk of fileStream) {
    fileChunks.push(chunk);
  }

  const extractedText = await new Promise((done, fail) => {
    textract.fromBufferWithMime(
      mimetype,
      Buffer.concat(fileChunks),
      (error, text) => {
        if (error) {
          return fail(error);
        }
        done(text);
      }
    );
  });

  return synaptixSession.getIndexService().percolateNodes({
    modelDefinition: SkillDefinition,
    text: extractedText,
    limit: synaptixSession.getLimitFromArgs(args),
    offset: synaptixSession.getOffsetFromArgs(args),
    justCount,
  });
}
