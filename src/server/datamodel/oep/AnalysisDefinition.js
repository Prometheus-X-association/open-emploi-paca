import { ModelDefinitionAbstract} from "@mnemotix/synaptix.js";
import {AnalysisGraphQLDefinition} from "./graphql/AnalysisGraphQLDefinition";

export class AnalysisDefinition extends ModelDefinitionAbstract {
  /**
   * @inheritDoc
   */
  static getNodeType() {
    return "Analysis";
  }

  /**
   * @inheritDoc
   */
  static getGraphQLDefinition() {
    return AnalysisGraphQLDefinition;
  }
}
