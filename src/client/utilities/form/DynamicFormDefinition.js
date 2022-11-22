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
import { normalizeObjectIntoFormInitialValues } from "./normalizeObjectToFormInitialValues";
import { MutationConfig } from "../apollo";

/**
 * That class gathers the needed information to handle a Formik form flow.
 *
 *  - Form initial values processing.
 *  - Form inputs validation
 *  - Mutation handling after form submit
 *    - GraphQL object input formatting.
 *    - Apollo cache updating.
 *
 * ```js
 * const personFormDefinition = new DynamicFormDefinition({
 *   mutationConfig: [personMutationConfig]          // @see MutationConfig class description. Example implementation available in it.
 *   validationSchema: yup.object().shape({ ... })  // The Yup validation schema to process form validation.
 *   postProcessInitialValues: (personInitialValues) => {
 *     // By default, Formik initialValues object is automatically generated following that rule :
 *     //    - keys are transposed from mutationConfig.scalarInputNames.
 *     //    - values are empty strings "".
 *     //
 *     // Some times empty strings must be tweaked (case of DatePicker for example).
 *     //
 *     // Hook the content of personInitialValues here to add/remove/modify some needed values.
 *     // to handle the Formik.
 *     // For example, change a "" into a null to avoid DatePicker warning.
 *     if(personInitialValues.birthday === ""){
 *       personInitialValues = null;
 *     }
 *     return personInitialValues;
 *   }
 * })
 * ```
 */
export class DynamicFormDefinition {
  /**
   * @param {MutationConfig} mutationConfig
   * @param {object|function} validationSchema
   * @param {function} postProcessInitialValues
   */
  constructor({ mutationConfig, validationSchema, postProcessInitialValues }) {
    this._mutationConfig = mutationConfig;
    this._validationSchema = validationSchema;
    this._postProcessInitialValues = postProcessInitialValues;
  }

  /**
   * @return {MutationConfig}
   */
  get mutationConfig() {
    return this._mutationConfig;
  }

  get postProcessInitialValues() {
    return this._postProcessInitialValues || ((object) => object);
  }

  /**
   * @param {object} props
   * @return {Object|*}
   */
  getValidationSchema({ ...props }) {
    if (typeof this._validationSchema === "function") {
      return this._validationSchema({ ...props });
    }

    return this._validationSchema;
  }

  /**
   * @param {object} object
   * @return {*}
   */
  getInitialValues({ object = {} } = {}) {
    return this.postProcessInitialValues(
      normalizeObjectIntoFormInitialValues({
        object,
        scalarInputNames: this.mutationConfig.scalarInputNames,
      })
    );
  }

  /**
   * @return {object}
   */
  getGqlFragment() {
    return this._mutationConfig.gqlFragment;
  }

  /**
   * @return {string}
   */
  getGqlFragmentName() {
    return this._mutationConfig.gqlFragmentName;
  }

  /**
   * @return {string[]}
   */
  getScalarInputNames() {
    return this._mutationConfig.scalarInputNames;
  }

  /**
   * @return {LinkInputDefinition[]}
   */
  getLinkInputDefinitions() {
    return this._mutationConfig.linkInputDefinitions;
  }

  set validationSchema(value) {
    this._validationSchema = value;
  }
}
