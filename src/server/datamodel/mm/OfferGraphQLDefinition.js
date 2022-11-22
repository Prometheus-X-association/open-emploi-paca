import { GraphQLTypeDefinition } from '@mnemotix/synaptix.js';
import {OfferGraphQLTypeConnectionQuery} from "./OfferGraphQLTypeConnectionQuery";

export class OfferGraphQLDefinition extends GraphQLTypeDefinition {
  /**
   * @inheritDoc
   */
  static getTypeConnectionQuery(){
    return new OfferGraphQLTypeConnectionQuery();
  }
}
