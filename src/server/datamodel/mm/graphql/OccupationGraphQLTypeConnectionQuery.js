import {
  generateConnectionArgs,
  GraphQLTypeConnectionQuery,
  LinkFilter,
  mergeResolvers,
  QueryFilter,
  SynaptixDatastoreSession
} from "@mnemotix/synaptix.js";
import OccupationDefinition from "../OccupationDefinition";
import PersonDefinition from "../../mnx/PersonDefinition";
import AptitudeDefinition from "../AptitudeDefinition";

export class OccupationGraphQLTypeConnectionQuery extends GraphQLTypeConnectionQuery {
  /**
   * @inheritdoc
   */
  generateType(modelDefinition) {
    const baseType = super.generateType(modelDefinition);
    const extraType = this._wrapQueryType(`
      """
       This service returns a list of occupations matching scores for a given personId.
       
       Parameters :
         - personId: [REQUIRED] Person id.
         - occupationIds: [OPTIONAL] Restrict on occupation ids
      """
      occupationsMatching(personId:ID! occupationIds:[ID!] ${generateConnectionArgs()}): String
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
      occupationsMatching:
        /**
         * @param _
         * @param {string} personId
         * @param {string[]} [occupationIds]
         * @param {SynaptixDatastoreSession} synaptixSession
         * @param {object} info
         */
        async (_, {personId, occupationIds, args}, synaptixSession, info) => {
          if (occupationIds) {
            occupationIds = occupationIds.map(occupationId =>
              synaptixSession.normalizeAbsoluteUri({uri: occupationId})
            );
          }

          personId = synaptixSession.normalizeAbsoluteUri({
            uri: synaptixSession.extractIdFromGlobalId(personId)
          });

          let aptitudes = await synaptixSession.getLinkedObjectFor({
            object: {
              id: personId
            },
            linkDefinition: PersonDefinition.getLink("hasAptitude")
          });

          let skillsGroups = {};

          for(let aptitude of aptitudes){
            const rating = aptitude[AptitudeDefinition.getProperty("ratingValue").getPropertyName()] || 0;
            const isTop5  = aptitude[AptitudeDefinition.getProperty("isTop5").getPropertyName()];
            const skill  = aptitude[AptitudeDefinition.getLink("hasSkill").getLinkName()];

            // Boost is computed with this following serie :
            // Rate 0 => Boost 0.8
            //      1 =>       1
            //      ...
            //      5 =>       1.8
            //      6 =>       2  (is top 5)
            const boost = isTop5 ? 2 : (1 + 1/5 * (rating - 1))

            if (!skillsGroups[boost]) {
              skillsGroups[boost] = [];
            }

            skillsGroups[boost].push(skill.id);
          }

          const hasRelatedOccupationPath = OccupationDefinition.getLink("hasRelatedOccupation").getPathInIndex();
          const relatedOccupationLabelPath = OccupationDefinition.getProperty("relatedOccupationName").getPathInIndex();
          const occupationLabelPath = OccupationDefinition.getProperty("prefLabel").getPathInIndex();


          const result = await synaptixSession.getIndexService().getNodes({
            modelDefinition: OccupationDefinition,
            queryFilters: Object.entries(skillsGroups).map(
              ([boost, skillsIds]) =>
                new QueryFilter({
                  filterDefinition: OccupationDefinition.getFilter(
                    "moreLikeThisPersonSkillsFilter"
                  ),
                  filterGenerateParams: {skillsIds, boost},
                  isStrict: false
                })
            ),
            rawResult: true,
            limit: 1000,
            ...args,
            getRootQueryWrapper: ({query}) => ({
              script_score: {
                query: query,
                script: {
                  source: "_score / (40 + _score)"
                }
              }
            }),
            getExtraQuery: () => {
              return {
                _source: {
                  includes: [
                    hasRelatedOccupationPath,
                    relatedOccupationLabelPath,
                    occupationLabelPath,
                  ]
                },
                sort: ["_score", `${occupationLabelPath}.keyword`]
              };
            }
          });

          /**
           * After a bit of testing it
           * @type {number}
           */
          const matching = result.hits.reduce(
            (acc, {_id, _score, _source}) => {
              if(occupationIds && !occupationIds.includes(_source[hasRelatedOccupationPath])){
                return acc;
              }

              if (!acc[_source[relatedOccupationLabelPath]]) {
                acc[_source[relatedOccupationLabelPath]] = {
                  categoryName: _source[relatedOccupationLabelPath],
                  categoryId: _source[hasRelatedOccupationPath],
                  score: _score,
                  subOccupations: []
                };
              }

              acc[_source[relatedOccupationLabelPath]].subOccupations.push({
                id: _id,
                score: _score,
                prefLabel: Array.isArray(_source[occupationLabelPath])
                  ? _source[occupationLabelPath][0]
                  : _source[occupationLabelPath]
              });

              return acc;
            },
            {}
          );

          return JSON.stringify(Object.values(matching));
        }
    });

    return mergeResolvers(baseResolver, extraResolver);
  }
}
