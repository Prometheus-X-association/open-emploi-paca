import { GraphQLTypeQuery } from "@mnemotix/synaptix.js";
import env from "env-var";

import TrainingDefinition from "./TrainingDefinition";
import OfferDefinition from "../mm/OfferDefinition";
import SkillDefinition from "../mm/SkillDefinition";
import {
  getTrainingsLowerBoundDate,
  getTrainingsUpperBoundDate,
} from "./TrainingGraphQLDefinition";

export class AnalysisGraphQLTypeQuery extends GraphQLTypeQuery {
  /**
   * @inheritdoc
   */
  generateType(modelDefinition) {
    const graphQLType = modelDefinition.getGraphQLType();
    return this._wrapQueryType(`
      """
       This service returns the bests jobArea/occupation matchings within a list of condidates after the analyze of :
       
        - Current indexed jobs market
        - Current indexed trainings market
       
       Parameters :
         - occupationIds: [REQUIRED] A list of candidate occupations
         - jobAreaIds:    [REQUIRED] A list of candidate jobAreas
         - skillIds:      [REQUIRED] A list of skills
      """
      ${this.generateFieldName(modelDefinition)}(
        occupationIds: [ID!]!
        jobAreaIds: [ID!]!
        skillIds: [ID!]!
      ): [${graphQLType}]
    `);
  }

  /**
   * @inheritdoc
   */
  generateResolver(modelDefinition) {
    return this._wrapQueryResolver({
      /**
       * @param _
       * @param {string[]} jobAreaIds
       * @param {string[]} occupationIds
       * @param {string[]} skillIds
       * @param {SynaptixDatastoreSession} synaptixSession
       * @param {object} info
       */
      [this.generateFieldName(modelDefinition)]: async (
        _,
        { occupationIds, jobAreaIds, skillIds },
        synaptixSession
      ) => {
        jobAreaIds = jobAreaIds.map((jobAreaId) =>
          synaptixSession.normalizeAbsoluteUri({ uri: jobAreaId })
        );
        occupationIds = occupationIds.map((occupationId) =>
          synaptixSession.normalizeAbsoluteUri({ uri: occupationId })
        );
        skillIds = skillIds.map((skillId) =>
          synaptixSession.normalizeAbsoluteUri({ uri: skillId })
        );

        // Disconnected.
        // try {
        //   const result = await synaptixSession
        //     .getDataPublisher()
        //     .publish("ami.analyze.global", {
        //       offerIndex: [
        //         `${env
        //           .get("INDEX_PREFIX_TYPES_WITH")
        //           .asString()}${OfferDefinition.getIndexType()}`,
        //       ],
        //       formationIndex: [
        //         `${env
        //           .get("INDEX_PREFIX_TYPES_WITH")
        //           .asString()}${TrainingDefinition.getIndexType()}`,
        //       ],
        //       skillIndex: [
        //         `${env
        //           .get("INDEX_PREFIX_TYPES_WITH")
        //           .asString()}${SkillDefinition.getIndexType()}`,
        //       ],
        //       zoneEmploiUri: jobAreaIds,
        //       occupationUri: occupationIds,
        //       skillUser: skillIds,
        //       dategte: getTrainingsLowerBoundDate().toISOString(),
        //       datelte: getTrainingsUpperBoundDate().toISOString(),
        //     });
        //
        //   return result;
        // } catch (e) {
        //   return [];
        // }

        return [];
      },
    });
  }
}
