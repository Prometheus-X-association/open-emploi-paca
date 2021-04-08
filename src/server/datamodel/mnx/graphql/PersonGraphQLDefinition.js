import { GraphQLTypeDefinition, GraphQLProperty } from '@mnemotix/synaptix.js';
import {weverClient} from "../../../service/wever/WeverClient";

export class PersonGraphQLDefinition extends GraphQLTypeDefinition {
  /**
   * @inheritDoc
   */
  static getExtraProperties() {
    return [
      new GraphQLProperty({
        name: "weverUser",
        description: `
          Wever user
        `,
        type: "WeverUserInfos",
        /**
         * @param {SynaptixDatastoreSession} synaptixSession
         */
        typeResolver: async ({} = {}, {} = {}, synaptixSession) => {
          const email = await synaptixSession.getLoggedUsername();
          return weverClient.getUserInfos({email});
        }
      })
    ]
  }

  static getExtraGraphQLCode(){
    return `
type WeverUserInfos{
  """ User token """
  token: String
  
  """ Report ID """
  reportId: Int
  
  """ Map ID """
  mapId: Int
}
`
  }
}
