import {and, or} from "graphql-shield";
import {isAdminRule, isAuthenticatedRule, isInUserGroupRule} from "@mnemotix/synaptix.js";
import env from "env-var";

/**
 * @return {Rule}
 */
export let isContributorRule = () => and(isAuthenticatedRule(), or(isInUserGroupRule({
  userGroupId: () => env.get("OPERATOR_USER_GROUP_ID").required().asString()
}), isAdminRule()));