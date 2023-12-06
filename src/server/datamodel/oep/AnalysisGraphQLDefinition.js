import { GraphQLTypeDefinition, GraphQLProperty } from "@mnemotix/synaptix.js";
import { AnalysisGraphQLTypeQuery } from "./AnalysisGraphQLTypeQuery";
import OccupationDefinition from "../mm/OccupationDefinition";
import JobAreaDefinition from "./JobAreaDefinition";

export class AnalysisGraphQLDefinition extends GraphQLTypeDefinition {
  /**
   * @inheritDoc
   */
  static getTypeQuery() {
    return new AnalysisGraphQLTypeQuery();
  }

  /**
   * @inheritDoc
   */
  static getExtraProperties() {
    return [
      new GraphQLProperty({
        name: "incomesScore",
        description: `
          Score computed for incomes analysis (ROUGE|ORANGE|VERT)
        `,
        type: "String",
        typeResolver: ({ salaryMeanMonth }) =>
          salaryMeanMonth?.color || "ROUGE",
      }),
      new GraphQLProperty({
        name: "offersScore",
        description: `
          Score computed for incomes analysis (ROUGE|ORANGE|VERT)
        `,
        type: "String",
        typeResolver: ({ offerCountMonth }) =>
          offerCountMonth?.color || "ROUGE",
      }),
      new GraphQLProperty({
        name: "skillsScore",
        description: `
          Score computed for skills analysis (ROUGE|ORANGE|VERT)
        `,
        type: "String",
        typeResolver: ({ userSkillArea }) => userSkillArea?.color || "ROUGE",
      }),
      new GraphQLProperty({
        name: "trainingsScore",
        description: `
          Score computed for trainings analysis (ROUGE|ORANGE|VERT)
        `,
        type: "String",
        typeResolver: ({ trainingCountMonth }) =>
          trainingCountMonth?.color || "ROUGE",
      }),
      new GraphQLProperty({
        name: "occupation",
        description: `
          Winning occupation after analysis
        `,
        type: "Occupation",
        /**
         * @param occupationId
         * @param {SynaptixDatastoreSession} synaptixSession
         */
        typeResolver: ({ occupation: occupationId }, {}, synaptixSession) =>
          synaptixSession.getObject({
            modelDefinition: OccupationDefinition,
            objectId: occupationId,
          }),
      }),
      new GraphQLProperty({
        name: "jobArea",
        description: `
           Winning job area after analysis
        `,
        type: "JobArea",
        /**
         * @param occupationId
         * @param {SynaptixDatastoreSession} synaptixSession
         */
        typeResolver: ({ area: jobAreaId }, {}, synaptixSession) =>
          synaptixSession.getObject({
            modelDefinition: JobAreaDefinition,
            objectId: jobAreaId,
          }),
      }),
    ];
  }
}
