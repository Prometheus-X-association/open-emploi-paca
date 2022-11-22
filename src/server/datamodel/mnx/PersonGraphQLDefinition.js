import {
  GraphQLTypeDefinition,
  GraphQLProperty,
  updateObjectResolver,
} from "@mnemotix/synaptix.js";
import { weverClient } from "../../service/wever/WeverClient";

export class PersonGraphQLDefinition extends GraphQLTypeDefinition {
  /**
   * @return {string}
   */
  static getExtraGraphQLCode() {
    return `
type WeverUserInfos{
  """ User token """
  token: String
  
  """ Report ID """
  reportId: Int
  
  """ Map ID """
  mapId: Int
}

extend type Mutation {
  """
  Mutation to update the person object linked to the logged user

  This mutation input is protected by the Synaptix.js. Following i18nkey errors can be sent :

  - **USER_MUST_BE_AUTHENTICATED** : If inited session is anomymous.
  """
  updateMe(input: PersonInput!) : UpdateMePayload
}

type UpdateMePayload {
  success: Boolean!
  me: Person
}
`;
  }

  /**
   * @inheritDoc
   */
  static getExtraProperties() {
    return [
      new GraphQLProperty({
        name: "weverUser",
        description: `Wever user`,
        type: "WeverUserInfos",
        /**
         * @param {SynaptixDatastoreSession} synaptixSession
         */
        typeResolver: async ({} = {}, {} = {}, synaptixSession) => {
          const email = await synaptixSession.getLoggedUsername();
          return weverClient.getUserInfos({ email });
        },
      }),
      new GraphQLProperty({
        name: "jobMatching",
        description: `Wever user`,
        type: "WeverUserInfos",
        /**
         * @param {SynaptixDatastoreSession} synaptixSession
         */
        typeResolver: async ({} = {}, {} = {}, synaptixSession) => {
          const email = await synaptixSession.getLoggedUsername();
          return weverClient.getUserInfos({ email });
        },
      }),
    ];
  }

  /**
   * @inheritDoc
   */
  static getExtraResolvers() {
    return {
      Mutation: {
        /**
         * @param {object} _
         * @param {ResolverArgs} args
         * @param {SynaptixDatastoreSession} synaptixSession
         * @param info
         */
        updateMe: async (
          _,
          { input: personInput } = {},
          synaptixSession,
          info
        ) => {
          const person = await synaptixSession.getLoggedUserPerson();
          if (person) {
            const updatePayload = await updateObjectResolver(
              synaptixSession.getLoggedUserPersonModelDefinition(),
              _,
              { input: { objectId: person.id, objectInput: personInput } },
              synaptixSession
            );

            return {
              success: true,
              ...updatePayload,
            };
          }
        },
      },
    };
  }
}
