import {
  isAdminRule,
  isAuthenticatedRule,
  isCreatorRule,
  replaceFieldValueIfRuleFailsMiddleware,
} from "@mnemotix/synaptix.js";
import {and, or, rule} from "graphql-shield";

/**
 * @return {Rule}
 */
export let isCreatorOrAdminRule = () => and(isAuthenticatedRule(), or(isCreatorRule(), isAdminRule()));


/**
 * This middleware is used to set "false" value to a target type field if a shield rule fails.
 */
export let falsifyFieldIfRuleFailsMiddleware = replaceFieldValueIfRuleFailsMiddleware({
  rule: isCreatorOrAdminRule(),
  replaceValue: false
});

/**
 * This middleware definition list apply the field falsification in order to be used in UI.
 */
export let aclShieldMiddlewares = {
  EntityInterface: {
    canUpdate: falsifyFieldIfRuleFailsMiddleware
  }
};

/**
 * This shield middleware definition works alongside DdfContribAclMiddlewares and assert mutations securization.
 */
export let shieldRules = {
  Query: {},
  Mutation: {
    createUserGroup: isAdminRule(),
    updateUserGroup: isAdminRule(),
  },
  // A non admin user can only query person nicknames. Nothing more.
  UserAccount: {
    '*': or(isAdminRule(), rule()(
      /**
       * @param {Model} userAccount
       * @param args
       * @param {SynaptixDatastoreRdfSession} synaptixSession
       * @param info
       */
      async (userAccount, args, synaptixSession, info) => {
        let loggedUserAccount = await synaptixSession.getLoggedUserAccount();

        return loggedUserAccount && loggedUserAccount?.id === userAccount.id;
      }
    ))
  },
};