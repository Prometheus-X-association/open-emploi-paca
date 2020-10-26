import {
  GraphQLTypeConnectionQuery,
  LinkFilter,
  QueryFilter,
  SynaptixDatastoreSession,
  mergeResolvers, generateConnectionArgs
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
        async (_, { personId, occupationIds, args }, synaptixSession, info) => {
          if (occupationIds) {
            occupationIds = occupationIds.map(occupationId =>
              synaptixSession.normalizeAbsoluteUri({ uri: occupationId })
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

          let skillsIds = [];

          for(let aptitude of aptitudes){
            const rating = aptitude[AptitudeDefinition.getProperty("ratingValue").getPropertyName()] || 0;
            const skill  = aptitude[AptitudeDefinition.getLink("hasSkill").getLinkName()];

            if (rating > 0){
              [...Array(rating)].map(() => {
                skillsIds.push(skill.id);
              })
            }
          }

          const result = await synaptixSession.getIndexService().getNodes({
            modelDefinition: OccupationDefinition,
            queryFilters: [
              new QueryFilter({
                filterDefinition: OccupationDefinition.getFilter(
                  "moreLikeThisPersonSkillsFilter"
                ),
                filterGenerateParams: { skillsIds }
              })
            ],
            linkFilters: [
              new LinkFilter({
                linkDefinition: OccupationDefinition.getLink("hasSkill"),
                any: true
              })
            ],
            rawResult: true,
            limit: 1000,
            ...args,
            getRootQueryWrapper: ({ query }) => ({
              "script_score": {
                "query": query,
                "script": {
                  "source": "_score / (10 + _score)"
                }
              },

            }),
            getExtraQuery: () => {
              return {
                "_source": {"includes": ["relatedOccupationName", "prefLabel"]},
                "sort" : ["_score", "prefLabel.keyword"]
              };
            },
          });

          /**
           * After a bit of testing it
           * @type {number}
           */
          const matching = result.hits.reduce((acc, { _id, _score, _source }) => {
            if (!acc[_source.relatedOccupationName]){
              acc[_source.relatedOccupationName] = {
                categoryName: _source.relatedOccupationName,
                score: _score,
                subOccupations: []
              }
            }

            acc[_source.relatedOccupationName].subOccupations.push({
              id: _id,
              score: _score,
              prefLabel : Array.isArray( _source.prefLabel) ?  _source.prefLabel[0] : _source.prefLabel
            });

            return acc;
          }, {});

          return JSON.stringify(Object.values(matching));
        }
    });

    return mergeResolvers(baseResolver, extraResolver);
  }
}
