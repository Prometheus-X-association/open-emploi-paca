import {
  GraphQLTypeDefinition,
  generateConnectionArgs,
  I18nError, FragmentDefinition,
} from "@mnemotix/synaptix.js";
import { computeSuggestedOccupationsMatchingForPerson } from "./ia/computeSuggestedOccupationsMatchingForPerson";
import { computeSuggestedOccupationsMatchingForSkills } from "./ia/computeSuggestedOccupationsMatchingForSkills";
import OccupationDefinition from "./OccupationDefinition";

export class OccupationGraphQLDefinition extends GraphQLTypeDefinition {
  /**
   * @return {string}
   */
  static getExtraGraphQLCode() {
    return `
"""
Occupation matching representation
"""
type OccupationMatching{
  score: Float
  occupationId: String
  occupationPrefLabel: String
  subOccupations: [Occupation]
}    

extend type Query {
  """
   This service returns a list of occupations matching scores for a person.
   
   Parameters :
     - personId: [OPTIONAL] Person ID. Default to logged user person ID
     - thresholdScore [OPTIONAL] Tweak the threshold score (default: 0.15)
  """
  suggestedOccupationMatchingsForPerson(
    personId: ID
    thresholdScore: Float! = 0.15
    ${generateConnectionArgs()}
  ): [OccupationMatching]

  """
   This service returns a list of occupations matching scores given a list of skill ids.
   
   Parameters :
     - skillIds: [OPTIONAL] Skills IDs.
     - thresholdScore [OPTIONAL] Tweak the threshold score (default: 0.15)
  """
  suggestedOccupationMatchingsForSkills(
    skillIds: [ID!]!
    thresholdScore: Float! = 0.15
    ${generateConnectionArgs()}
  ): [OccupationMatching]  
  
  """
   This service returns an occupation matching scores for a logged user.
   
   Parameters :
     - occupationId: Occupation ID
     - personId: [OPTIONAL] Person ID. Default to logged user person ID
     - light: [OPTIONAL] Restrict data on occupation categories, discard suboccupations.
     - thresholdScore [OPTIONAL] Tweak the threshold score (default: 0.15)
  """
  occupationMatching(
    occupationId: ID!
    personId: ID
    light: Boolean 
    thresholdScore: Float! = 0.15
    ${generateConnectionArgs()}
  ): OccupationMatching
  
   """
   @deprecated : Use suggestedOccupationMatchingsForPerson or suggestedOccupationMatchingsForSkills instead with a real
   GraphQL output type
   
   This service returns a list of occupations matching scores for a given personId.
   
   Parameters :
     - me: [OPTIONAL] Get for logged user.
     - personId: [OPTIONAL] Person id. If not entered, get logged user.
     - occupationIds: [OPTIONAL] Restrict on occupation ids
     - light: [OPTIONAL] Restrict data on occupation categories, discard suboccupations.
  """
  occupationsMatching(
    personId:ID 
    me:Boolean 
    light: Boolean 
    occupationIds:[ID!] 
    thresholdScore: Float! = 0.15
    ${generateConnectionArgs()}
  ): String
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
         * @param {string} [personId]
         * @param {number} [thresholdScore=0.15]
         * @param {SynaptixDatastoreSession} synaptixSession
         * @param {object} info
         */
        suggestedOccupationMatchingsForPerson: async (
          _,
          { personId, thresholdScore },
          synaptixSession
        ) => {
          if (!personId) {
            personId = (await synaptixSession.getLoggedPerson())?.id;
          }

          if (!personId) {
            throw new I18nError("Person not found.");
          }

          return computeSuggestedOccupationsMatchingForPerson({
            synaptixSession,
            personId,
            thresholdScore,
          });
        },
        /**
         * @param _
         * @param {[string]} [skillIds]
         * @param {number} [thresholdScore=0.15]
         * @param {SynaptixDatastoreSession} synaptixSession
         * @param {object} info
         */
        suggestedOccupationMatchingsForSkills: async (
          _,
          { skillIds, thresholdScore },
          synaptixSession
        ) => {
          return computeSuggestedOccupationsMatchingForSkills({
            synaptixSession,
            skillIds,
            thresholdScore,
          });
        },
        /**
         * @param _
         * @param {string}  personId
         * @param {string}  occupationId
         * @param {boolean} [light]
         * @param {SynaptixDatastoreSession} synaptixSession
         * @param {object} info
         */
        occupationMatching: async (
          _,
          { personId, occupationId, light, thresholdScore },
          synaptixSession
        ) => {
          if (!personId) {
            personId = (await synaptixSession.getLoggedPerson())?.id;
          }

          if (personId) {
            const matchings = await computeSuggestedOccupationsMatchingForPerson(
              {
                synaptixSession,
                forcedOccupationIds: [occupationId],
                personId,
                thresholdScore: 0,
              }
            );

            return matchings[0];
          }
        },
        /**
         * @deprecated : Use suggestedOccupationMatchingsForPerson or suggestedOccupationMatchingsForSkills instead with a typed output object
         * instead of a JSONinfied string
         *
         * @param _
         * @param {string} personId
         * @param {string[]} [occupationIds]
         * @param {boolean} [light]
         * @param {number} [thresholdScore=0.15]
         * @param {SynaptixDatastoreSession} synaptixSession
         * @param {object} info
         */
        occupationsMatching: async (
          _,
          { personId, occupationIds, light, thresholdScore },
          synaptixSession,
          info
        ) => {
          if (!personId) {
            personId = (await synaptixSession.getLoggedUserPerson())?.id;
          }

          const matchings = await computeSuggestedOccupationsMatchingForPerson({
            synaptixSession,
            forcedOccupationIds: occupationIds,
            personId,
            light,
            thresholdScore,
          });

          let reducedMatchings = [];
          for(const {score, occupationPrefLabel, occupationId} of Object.values(matchings) ){
            const subOccupations = await synaptixSession.getObjects({
              modelDefinition: OccupationDefinition,
              args: {
                filters: [`${OccupationDefinition.getLink("hasRelatedOccupation").getGraphQLPropertyName()} : ${occupationId}`],
                sortings: [{sortBy: "prefLabel"}]
              },
              fragmentDefinitions: [
                new FragmentDefinition({
                  modelDefinition: OccupationDefinition,
                  properties: [
                    OccupationDefinition.getProperty("prefLabel")
                  ]
                }),
              ]
            });

            reducedMatchings.push({
              categoryId: occupationId,
              categoryName: occupationPrefLabel,
              score,
              subOccupations: await Promise.all(subOccupations.map(async (subOccupation) => ({
                id: subOccupation.id,
                prefLabel: await synaptixSession.getLocalizedLabelFor({
                  object: subOccupation,
                  labelDefinition: OccupationDefinition.getLabel("prefLabel"),
                  lang: synaptixSession.getContext().getLang(),
                  returnFirstOneIfNotExistForLang: true,
                }),
                score
              })))
            });
          }
          return JSON.stringify(reducedMatchings);
        },
      },
    };
  }
}
