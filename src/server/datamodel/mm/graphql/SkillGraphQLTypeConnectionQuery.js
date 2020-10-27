import {
  generateConnectionArgs,
  GraphQLTypeConnectionQuery,
  LinkFilter,
  mergeResolvers,
  QueryFilter,
  SynaptixDatastoreSession
} from "@mnemotix/synaptix.js";
import SkillDefinition from "../SkillDefinition";
import PersonDefinition from "../../mnx/PersonDefinition";
import AptitudeDefinition from "../AptitudeDefinition";
import OccupationDefinition from "../OccupationDefinition";

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
        async (_, {personId, occupationId}, synaptixSession) => {
          personId = synaptixSession.normalizeAbsoluteUri({
            uri: synaptixSession.extractIdFromGlobalId(personId)
          });

          occupationId = synaptixSession.normalizeAbsoluteUri({
            uri: synaptixSession.extractIdFromGlobalId(occupationId)
          });

          let aptitudes = await synaptixSession.getObjects({
            modelDefinition: AptitudeDefinition,
            args: {
              linkFilters: [
                new LinkFilter({
                  linkDefinition: AptitudeDefinition.getLink("hasPerson"),
                  id: personId
                }),
              ]
            }
          });

          let skills = aptitudes.reduce((acc, aptitude) => {
            acc[aptitude[AptitudeDefinition.getLink("hasSkill").getLinkName()].id] = (aptitude[AptitudeDefinition.getProperty("ratingValue").getPropertyName()] || 0) / 5;

            return acc;
          }, {})

          const skillLabelPath = OccupationDefinition.getProperty("prefLabel").getPathInIndex();


          const result = await synaptixSession.getIndexService().getNodes({
            modelDefinition: SkillDefinition,
            linkFilters: [
              new LinkFilter({
                linkDefinition: SkillDefinition.getLink("hasOccupationCategory"),
                id: occupationId
              })
            ],
            rawResult: true,
            limit: 1000,
            getExtraQuery: () => {
              return {
                _source: {
                  includes: [
                    skillLabelPath
                  ]
                },
                sort: ["_score", `${skillLabelPath}.keyword`]
              };
            },
          });

          /**
           * After a bit of testing it
           * @type {number}
           */
          const matching = result.hits.reduce(
            (acc, {_id, _score, _source}) => {
              const score = skills[_id] || 0;

              acc[score > 0 ? "unshift": "push"]({
                id: _id,
                score,
                prefLabel: Array.isArray(_source[skillLabelPath])
                  ? _source[skillLabelPath][0]
                  : _source[skillLabelPath]
              });

              return acc;
            },
            []
          );

          return JSON.stringify(Object.values(matching));
        }
    });

    return mergeResolvers(baseResolver, extraResolver);
  }
}
