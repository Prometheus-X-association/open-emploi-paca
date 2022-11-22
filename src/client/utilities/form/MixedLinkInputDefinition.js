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

import {LinkInputDefinition} from "./LinkInputDefinition";

/**
 * MixedLinkInputDefinition enables the composition of several LinkInputDefinition which share a common input name.
 *
 * @example
 * The common use case is the Agent interface which can be inheritated into "Person" and "Organization" types.
 * Suppose a mutation of a Project instance that has author link (authors refering to an Agent).
 * The GraphQL query would look like that :
 *
 * ```graphql
 * query {
 *   project(id: ""){
 *     author{
 *       __typename
 *       ...PersonFragment
 *       ...OrganizationFragment
 *     }
 *   }
 * }
 * ```
 *
 * The mutation (update|creation) of a projet to add a Person as an author would look like:
 *
 * ```json
 * {
 *   authorInput: {
 *     inheritedTypename: "Person",
 *     firstName: "..."
 *     lastName: "..."
 *   }
 * }
 * ```
 *
 * That class enables that composition :
 *
 * ```js
 * const projectAuthorLinkInputDefinition = new MixedLinkInputDefinition({
 *   name: "author",
 *   inputName: "authorInput",
 *   mixedLinks: [
 *     new LinkInputDefinition({
 *       targetObjectFormDefinition: "personFormDefinition",
 *       inheritedTypename: "Person"
 *     }),
 *     new LinkInputDefinition({
 *       targetObjectFormDefinition: "organizationFormDefinition",
 *       inheritedTypename: "Organization"
 *     })
 *   ]
 * })
 * ```
 *
 * In the internal process of mutation preparation, the right LinkInputDefinition will be choosen given the `__typename` of target object representing the author.
 *
 * **Note** that the property `__typename` of target object must be set. Otherwise an exception is thrown.
 *
 */
export class MixedLinkInputDefinition extends LinkInputDefinition{
  /**
   * @typedef {object} LinkInputDefinition
   * @property {string} name
   * @property {string} inputName
   * @property {boolean} [isPlural=false]
   * @property {string} [deleteInputName=`${inputName}ToDelete`]
   * @property {LinkInputDefinition[]} [mixedLinks]
   */
  constructor({
    name,
    isPlural = false,
    inputName,
    deleteInputName,
    mixedLinks,
  }) {
    super({
      name,
      isPlural,
      inputName,
      deleteInputName,
    });

    this._mixedLinkInputDefinitions = [];

    for(const linkInputDefinition of mixedLinks){
      if (!linkInputDefinition.inputInheritedTypename){
        throw new Error(`MixedLinkInputDefinition.mixedLinkInputDefinitions parameter must be an array of LinkInputDefinition with an "inputInheritedTypename" parameter defined for each of them. Checkout this one : ${JSON.stringify(linkInputDefinition)}`);
      }

      linkInputDefinition.name = name;
      linkInputDefinition.inputName = inputName;
      linkInputDefinition.deleteInputName = deleteInputName;

      this._mixedLinkInputDefinitions.push(linkInputDefinition);
    }
  }

  getLinkDefinitionForTypename(typename){
    return this._mixedLinkInputDefinitions.find(linkInputDefinition => linkInputDefinition.inputInheritedTypename === typename);
  }
}
