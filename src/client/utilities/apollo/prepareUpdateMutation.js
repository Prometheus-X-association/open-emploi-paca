import {DocumentNode} from "@apollo/client";

/**
 * @typedef {object} GraphQLLinkDefinition
 * @property {string} name
 * @property {string} inputName
 * @property {DocumentNode} targetFragment
 * @property {boolean} [isPlural=false]
 * @property {string} [deleteInputName]
 * @property {boolean} [forceUpdateTarget=false]
 */

import {StoreObject} from "@apollo/client";
import invariant from "invariant";
import {generateUpdateCallback} from "./generateUpdateCallback";
import {normalizeUpdateInput} from "./normalizeUpdateInput";

/**
 * @param {StoreObject} entity - entity object that must contain an "id" field.
 * @param {object} values - object representing mutating values (can be straight formik form result values)
 * @param {string[]} [inputNames] - restrict field input names. Default to all simple field (not link) foundable in "values"
 * @param {GraphQLLinkDefinition[]} links - list of links to mutate.
 * @param {boolean} [optimistic=true] - is mutation optimistic ?
 * @return {{updateCache: updateCache, objectInput: any}}
 */
export function prepareUpdateMutation({entity, values, links = [], inputNames = [], optimistic = true} = {}) {
  invariant(entity && entity.id, "entity must be passed with id field in order to be identified by apollo cache.");

  return {
    objectInput: normalizeUpdateInput({entity, values, links, inputNames}),
    updateCache: generateUpdateCallback({entity, values, links, optimistic})
  };
}

