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

import merge from "lodash/merge";
/**
 * @param object
 * @param {string[]} scalarInputNames - object property names that need to be normalized
 * @return {*}
 */
export function normalizeObjectIntoFormInitialValues({object, scalarInputNames = []} = {}){
  let normalizedObject = merge({}, object);

  for (let prop of scalarInputNames) {
    const propValue = normalizedObject[prop];
    const isTranslatedProp = normalizedObject[`${prop}Translated`];

    if (propValue && isTranslatedProp === false) {
      normalizedObject[`${prop}Placeholder`] = normalizedObject[prop];
      normalizedObject[prop] = "";
    } else if (!propValue) {
      normalizedObject[prop] = "";
    }
  }

  return normalizedObject;
}