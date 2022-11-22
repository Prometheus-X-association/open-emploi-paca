import { GraphQLTypeDefinition } from '@mnemotix/synaptix.js';
import {SkillGraphQLTypeConnectionQuery} from "./SkillGraphQLTypeConnectionQuery";

export class SkillGraphQLDefinition extends GraphQLTypeDefinition {
  /**
   * @inheritDoc
   */
  static getTypeConnectionQuery(){
    return new SkillGraphQLTypeConnectionQuery();
  }
}
