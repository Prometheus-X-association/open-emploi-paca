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

import set from "lodash/set";
import merge from "lodash/merge";

const DEFAULT_VALUE = null;

let tempId = 0;

function generateTempId(prefix){
  return `__temp${tempId++}`;
}

function convertSelectionsToObject({
  selections,
  definitions,
  defaultValue,
  finalObject = {},
  namespace
}){
  if (!Array.isArray(selections)) {
    return finalObject;
  }

  selections.forEach(selection => {


    if (selection.kind === "InlineFragment") {
      const subFragmentObject = convertSelectionsToObject({
        selections: selection.selectionSet?.selections,
        definitions,
        defaultValue,
      });
      finalObject = merge(finalObject, subFragmentObject)
    } else {
      const fieldName = selection?.name?.value;
      if (!fieldName) {
        return false;
      }

      if(selection.kind === "Field") {
        const completeFieldName = namespace ? `${namespace}.${fieldName}` : fieldName;

        // Spacial cases for connection Relay connection edges. Stop at this point. No need to go further.
        if(fieldName === "edges"){
          set(finalObject, completeFieldName, []);
        } else {
          const selections = selection.selectionSet?.selections;
          set(finalObject, completeFieldName, defaultValue);
          if (!!selections) {
            return convertSelectionsToObject({
              selections,
              defaultValue,
              finalObject,
              namespace: completeFieldName,
              definitions
            });
          }
        }
      }

      if (selection.kind === "FragmentSpread") {
        const subFragmentName = selection.name.value;
        const subSelections = getFragmentSelectionsByFragmentName(
          subFragmentName,
          definitions
        );
        const subFragmentObject = convertSelectionsToObject({
          selections: subSelections,
          definitions,
          defaultValue,
        });

        if (namespace){
          if(typeof finalObject?.[namespace] === "object"){
            set(finalObject, namespace, merge(finalObject[namespace], subFragmentObject));
          } else {
            set(finalObject, namespace, subFragmentObject);
          }
        } else {
          finalObject = merge(finalObject, subFragmentObject)
        }
      }
    }
  });

  if(!finalObject.id){
    finalObject.id = generateTempId();
  }

  return finalObject;
}

function getFragmentSelectionsByFragmentName(name, definitions) {
  return getFragmentSelections(getFragmentByName(name, definitions));
}

function getFragmentByName(name, definitions) {
  if (name) {
    return definitions.find(definition => definition?.name?.value === name);
  } else {
    return definitions[0];
  }
}

function getFragmentSelections(fragment) {
  return fragment?.selectionSet?.selections;
}

/**
 *
 * @param fragmentName
 * @param definitions
 * @param defaultValue
 * @return {null|*}
 */
export function getObjectFromFragment({
  fragmentName,
  fragment,
  defaultValue = DEFAULT_VALUE
}) {
  const definitions = fragment.definitions;

  if (!Array.isArray(definitions)) {
    return null;
  }

  const selections = getFragmentSelectionsByFragmentName(
    fragmentName,
    definitions
  );

  if (!selections) {
    return null;
  }

  return convertSelectionsToObject({ selections, defaultValue, definitions });
}
