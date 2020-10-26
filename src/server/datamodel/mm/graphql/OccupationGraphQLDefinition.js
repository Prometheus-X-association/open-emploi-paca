import { GraphQLTypeDefinition } from '@mnemotix/synaptix.js';
import {OccupationGraphQLTypeConnectionQuery} from "./OccupationGraphQLTypeConnectionQuery";

export class OccupationGraphQLDefinition extends GraphQLTypeDefinition {
  /**
   * @inheritDoc
   */
  static getTypeConnectionQuery(){
    return new OccupationGraphQLTypeConnectionQuery();
  }
}
