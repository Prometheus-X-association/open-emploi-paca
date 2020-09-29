import {DocumentNode} from "@apollo/client";

/**
 * @typedef {object} GraphQLLinkDefinition
 * @property {string} name
 * @property {string} inputName
 * @property {DocumentNode} targetFragment
 * @property {boolean} [isPlural=false]
 * @property {string} [deleteInputName]
 * @property {boolean} [forceUpdateTarget=false]
 * @property {function} [modifyValue]
 * @property {GraphQLLinkDefinition[]} nestedLinks
 */

import {StoreObject} from "@apollo/client";
import invariant from "invariant";
import {generateUpdateCallback} from "./generateUpdateCallback";
import {normalizeMutationInput} from "./normalizeMutationInput";

/**
 * @param {StoreObject} [entity] - entity object that must contain an "id" field.
 * @param {object} values - object representing mutating values (can be straight formik form result values)
 * @param {string[]} [inputNames] - restrict field input names. Default to all simple field (not link) foundable in "values"
 * @param {GraphQLLinkDefinition[]} links - list of links to mutate.
 * @param {boolean} [optimistic=true] - is mutation optimistic ?
 * @return {{updateCache: updateCache, objectInput: any}}
 */
export function prepareMutation({entity, values, links = [], inputNames = [], optimistic = true} = {}) {
  return {
    objectInput: normalizeMutationInput({entity, values, links, inputNames}),
    updateCache: entity ? generateUpdateCallback({entity, values, links, optimistic}) : () => {}
  };
}

