/**
 * Copyright (C) 2013-2018 MNEMOTIX <http://www.mnemotix.com/> and/or its affiliates
 * and other contributors as indicated by the @author tags.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * That class gathers the needed information to handle a mutation with Apollo Client.
 * It is mostly used as a parameter of DynamicFormDefinition.
 *
 * @see DynamicFormDefinition.js to have more explanation.
 *
 * @example
 *
 * Suppose a mutation of a Person instance that has a list of phones link.
 * The GraphQL query would look like that :
 *
 * ```graphql
 * query {
 *   person(id: ""){
 *     ...PersonFragment
 *   }
 * }
 *
 * fragment PersonFragment on Person {
 *   firstName
 *   lastName
 *   phones{
 *   edges{
 *     node{
 *       label
 *       number
 *     }
 *   }
 *  }
 * }
 * ```
 *
 * The update mutation of a person to add/update/delete a Phone would look like:

 * ```json
 * {
 *   firstName: "John",
 *   lastName:  "Doe"
 *   phoneInputs: [
 *     {
 *       label: "pro"
 *       number: "06..."
 *     }
 *   ],
 * }
 * ```
 *
 * To describe the mutation :
 *
 * ```js
 * const personMutationConfig = new MutationConfig({
 *   scalarInputNames: ["firstName", "lastName"],
 *   linkInputDefinitions: [personPhoneLinkInputDefinition]  // @see LinkInputDefinition class description. Example implementation available in it.
 *   gqlFragment: gqlPersonFragment      // The JS object that represents PersonFragment in GraphQL AST format.
 *   gqlFragmentName: "PersonFragment"   // Optional as there is only one fragment in this example.
 * })
 * ```
 */
export class MutationConfig{
  /**
   * @param {string[]} scalarInputNames - List of GraphQL scalar input names of the mutating object (not links)
   * @param {LinkInputDefinition[]} linkInputDefinitions - List of links definitions.
   * @param {Object} gqlFragment - GQL fragment of mutating object. Used to optimic update of the cache.
   * @param {String} gqlFragmentName - Precise fragment name if several fragments exists in "gqlFragment" parameter.
   */
  constructor({scalarInputNames, linkInputDefinitions, gqlFragment, gqlFragmentName}) {
    this._scalarInputNames = scalarInputNames;
    this._linkInputDefinitions = linkInputDefinitions;
    this._gqlFragment = gqlFragment;
    this._gqlFragmentName = gqlFragmentName;
  }

  /**
   * @return {string[]}
   */
  get scalarInputNames() {
    return this._scalarInputNames;
  }

  /**
   * @return {LinkInputDefinition[]}
   */
  get linkInputDefinitions() {
    return this._linkInputDefinitions;
  }

  /**
   * @return {Object}
   */
  get gqlFragment() {
    return this._gqlFragment;
  }

  /**
   * @return {string}
   */
  get gqlFragmentName() {
    return this._gqlFragmentName;
  }

  set scalarInputNames(value) {
    this._scalarInputNames = value;
  }

  set linkInputDefinitions(value) {
    this._linkInputDefinitions = value;
  }

  set gqlFragment(value) {
    this._gqlFragment = value;
  }

  set gqlFragmentName(value) {
    this._gqlFragmentName = value;
  }
}