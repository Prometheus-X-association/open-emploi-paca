import {
  GraphQLTypeDefinition,
  generateConnectionArgs,
  I18nError,
} from "@mnemotix/synaptix.js";
import { computeSuggestedOccupationsMatchingForPerson } from "./ia/computeSuggestedOccupationsMatchingForPerson";
import { computeSuggestedOccupationsMatchingForSkills } from "./ia/computeSuggestedOccupationsMatchingForSkills";

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
            personId = (await synaptixSession.getLoggedUserPerson())?.id;
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
            personId = (await synaptixSession.getLoggedUserPerson())?.id;
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
      },
    };
  }
}
