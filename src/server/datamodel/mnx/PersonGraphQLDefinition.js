import {
  GraphQLTypeDefinition,
  GraphQLProperty,
  updateObjectResolver,
} from "@mnemotix/synaptix.js";

export class PersonGraphQLDefinition extends GraphQLTypeDefinition {
  /**
   * @return {string}
   */
  static getExtraGraphQLCode() {
    return `
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
          const person = await synaptixSession.getLoggedPerson();
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
