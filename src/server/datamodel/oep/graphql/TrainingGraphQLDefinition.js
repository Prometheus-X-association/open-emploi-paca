import { GraphQLTypeDefinition } from '@mnemotix/synaptix.js';
import {TrainingGraphQLTypeConnectionQuery} from "./TrainingGraphQLTypeConnectionQuery";

export class TrainingGraphQLDefinition extends GraphQLTypeDefinition {
  /**
   * @inheritDoc
   */
  static getTypeConnectionQuery(){
    return new TrainingGraphQLTypeConnectionQuery();
  }
}
