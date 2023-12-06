import { ModelDefinitionAbstract } from "@mnemotix/synaptix.js";
import { AnalysisGraphQLDefinition } from "./AnalysisGraphQLDefinition";

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
  static getRdfType() {
    return "oep:Analysis";
  }

  /**
   * @inheritDoc
   */
  static getGraphQLDefinition() {
    return AnalysisGraphQLDefinition;
  }
}
