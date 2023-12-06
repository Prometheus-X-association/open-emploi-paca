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

import { DynamicFormDefinition } from "./DynamicFormDefinition";
import { MutationConfig } from "../apollo";
import { gqlOccupationFragment } from "../../components/routes/Profile/gql/MyProfile.gql";

/**
 * LinkInputDefinition is a way to describe a mutation input between an object and a linked target object.
 *
 * @example
 * Suppose a mutation of a Person instance that has a list of phones link.
 * The GraphQL query would look like that :
 *
 * ```graphql
 * query {
 *   person(id: ""){
 *     phones{
 *      edges{
 *        node{
 *          label
 *          number
 *        }
 *      }
 *     }
 *   }
 * }
 * ```
 *
 * The update mutation of a person to add/update/delete a Phone would look like:

 * ```json
 * {
 *   phoneInputs: [
 *     {
 *       number: "06..."   // New one
 *     },
 *     {
 *       id: "phone/existing-id-1"    // Update existing one
 *       number: "04..."
 *     }
 *   ],
 *   phoneInputsToDelete: ["phone/existing-id-2"]  // Removing another one
 * }
 * ```
 *
 * That class enables that composition :
 *
 * ```js
 * const personPhoneLinkInputDefinition = new LinkInputDefinition({
 *   name: "phones",
 *   inputName: "phonesInput",
 *   deleteInputName: "phoneInputsToDelete",         // Optional if homogeneous with "inputName"
 *   isPlural: true
 *   forceUpdateTarget: true                         // Required to persist the "number" of "phone/existing-id-1". Discarded otherwise.
 *   targetObjectFormDefinition: phoneFormDefinition // Describes the Phone form (initialValues and validationSchema) @see DynamicFormDefinition
 * })
 * ```
 */
export class LinkInputDefinition {
  /**
   * @typedef {object} LinkInputDefinition
   * @property {string} name
   * @property {string} inputName
   * @property {boolean} [isPlural=false]
   * @property {string} [deleteInputName=`${inputName}ToDelete`]
   * @property {boolean} [forceUpdateTarget=true]
   * @property {function} [modifyValue]
   * @property {DynamicFormDefinition} [targetObjectFormDefinition] - Defined the target object form definition.
   * @property {Object} [targetObjectGqlFragment] - GQL fragment of target object. Discarded if targetObjectFormDefinition passed.
   * @property {string} [inputInheritedTypename] - Use this field to add a "inputInheritedTypename" key to input values. Needed when input refers to interface object (@see NOT_INSTANTIABLE_OBJECT_INPUT error in Synaptix.js in function SynaptixDatastoreRdfSession::_extractLinksFromObjectInput()).
   * /!\ Important : If that param is precised, be sure that it's value matches creating target object "__typename" value. Otherwise link will be skipped in normalization process to avoid persiting misformed data.
   * Example : Invovement.agentInput refers to an interface Agent. To take this input into account, make sure to set inputInheritedTypename to "Person" and creating person data get a __typename: "Person"
   * @property {LinkInputDefinition[]} [nestedLinks] - If nested links are defined, append them here to handle a nested recursion in mutation preparatin.
   */
  constructor({
    name,
    isPlural = false,
    inputName,
    targetObjectFormDefinition,
    targetObjectGqlFragment,
    deleteInputName,
    forceUpdateTarget = false,
    modifyValue,
    nestedLinks,
    inputInheritedTypename,
  }) {
    this._name = name;
    this._isPlural = isPlural;
    this._inputName = inputName;
    this._deleteInputName = deleteInputName || `${inputName}ToDelete`;
    this._forceUpdateTarget = forceUpdateTarget;
    this._modifyValue = modifyValue;
    this._nestedLinks = nestedLinks;
    this._targetObjectFormDefinition = targetObjectFormDefinition;
    this._inputInheritedTypename = inputInheritedTypename;

    // Use this shorcut to save code in form logic
    if (targetObjectGqlFragment && !this._targetObjectFormDefinition) {
      this._targetObjectFormDefinition = new DynamicFormDefinition({
        mutationConfig: new MutationConfig({
          gqlFragment: targetObjectGqlFragment,
        }),
      });
    }
  }

  get name() {
    return this._name;
  }

  get isPlural() {
    return this._isPlural;
  }

  get inputName() {
    return this._inputName;
  }

  get inputInheritedTypename() {
    return this._inputInheritedTypename;
  }

  get deleteInputName() {
    return this._deleteInputName;
  }

  get forceUpdateTarget() {
    return this._forceUpdateTarget;
  }

  get modifyValue() {
    return this._modifyValue;
  }

  get nestedLinks() {
    return (
      this._targetObjectFormDefinition?.getLinkInputDefinitions() ||
      this._nestedLinks
    );
  }

  get targetObjectFragment() {
    return this._targetObjectFormDefinition?.getGqlFragment();
  }

  get targetObjectFragmentName() {
    return this._targetObjectFormDefinition?.getGqlFragmentName();
  }

  get targetObjectScalarNames() {
    return this._targetObjectFormDefinition?.getScalarInputNames();
  }

  /**
   * @return {object}
   */
  getTargetObjectInitialValues({ object } = {}) {
    return (
      this._targetObjectFormDefinition?.getInitialValues?.({ object }) || {}
    );
  }

  /**
   * @return {object}
   *
   */
  getTargetObjectValidationSchema({ ...props }) {
    return (
      this._targetObjectFormDefinition?.getValidationSchema?.({ ...props }) ||
      {}
    );
  }

  set name(value) {
    this._name = value;
  }

  set isPlural(value) {
    this._isPlural = value;
  }

  set inputName(value) {
    this._inputName = value;
  }

  set targetObjectFormDefinition(value) {
    this._targetObjectFormDefinition = value;
  }

  set deleteInputName(value) {
    this._deleteInputName = value;
  }

  set forceUpdateTarget(value) {
    this._forceUpdateTarget = value;
  }

  set modifyValue(value) {
    this._modifyValue = value;
  }

  set nestedLinks(value) {
    this._nestedLinks = value;
  }

  set inputInheritedTypename(value) {
    this._inputInheritedTypename = value;
  }

  get targetObjectFormDefinition() {
    return this._targetObjectFormDefinition;
  }
}
