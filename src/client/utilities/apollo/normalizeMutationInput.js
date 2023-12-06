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

import { StoreObject } from "@apollo/client";
import isEqual from "lodash/isEqual";
import { getObjectsDiff } from "./helpers/getObjectsDiff";
import {getLinkInputDefinitionForTargetObject} from "./helpers/getLinkInputDefinitionForTargetObject";

/**
 * @param {StoreObject} [initialObject] - initialObject object that must contain an "id" field. Leave it null if creation
 * @param {object} mutatedObject - object representing mutating mutatedObject (can be straight formik form result mutatedObject)
 * @param {string[]} [scalarInputNames] - restrict field input names. Default to all simple field (not link) foundable in "mutatedObject"
 * @param {LinkInputDefinition[]} linkInputDefinitions - list of linkInputDefinitions to mutate.
 * @param {boolean} [optimistic=true] - is mutation optimistic ?
 * @param {boolean} [preserveId=false] - Is Id preserved ? Used internally in case of nested links
 * @param {boolean} [preserveObjectValues=false] - Are values preserved if it's an object ? Used internally in case of nested links.
 * @return {object}
 */
export function normalizeMutationInput({
  initialObject = {},
  mutatedObject,
  linkInputDefinitions = [],
  scalarInputNames = [],
  optimistic,
  preserveId = false,
  preserveObjectValues = false
}) {
  return Object.entries(mutatedObject).reduce((objectInput, [name, value]) => {
    if (name.match(/^__.*|\w+Translated$/)) {
      // __typename, __localId and other technical fields such as [label]Translated.
      return objectInput;
    }

    if (name === "id" && !preserveId) {
      return objectInput;
    }

    // First check if value refers to a linkInputDefinition.
    const linkInputDefinition = linkInputDefinitions.find(linkInputDefinition => {
      // @see LinkInputDefinition "inputInheritedTypename" param signature to have more explaination.
      if (linkInputDefinition.inputInheritedTypename && !linkInputDefinition.isPlural){
        return name === linkInputDefinition.name && linkInputDefinition.inputInheritedTypename === mutatedObject?.[linkInputDefinition.name]?.__typename;
      } else {
        return name === linkInputDefinition.name;
      }
    });

    if (linkInputDefinition) {
      if (linkInputDefinition.isPlural) {
        objectInput = Object.assign(
          objectInput,
          normalizePluralLinkInput({
            linkInputDefinition,
            initialObject,
            targetConnection: value
          })
        );
      } else {
        objectInput = Object.assign(
          objectInput,
          normalizeSingleLinkInput({
            linkInputDefinition,
            initialTargetObject: initialObject?.[name],
            targetObject: value
          })
        );
      }

      return objectInput;
    }

    // If the value is a dayjs date, convert it to an ISO string
    if (!!value?.toISOString) {
      value = value.toISOString();
    }

    // Otherwise process it as a basic prop only if:
    // - it's not an object (unless explicitly required with preserveObjectValues parameter)
    // - it's whitelisted in scalarInputNames
    if ((scalarInputNames.length > 0 && !["id", ...scalarInputNames].includes(name))) {
      return objectInput;
    }

    if((typeof value === "object" && !Array.isArray(value)  && !preserveObjectValues)){
      return  objectInput;
    }

    // Case of [...]Translations fields
    if(Array.isArray(value) && value.every(translation => !!translation.value && !!translation.lang)){
      value = value.map(({value, lang}) => ({value, lang}));
    }

    // Replace target value "" by null to delete data in the DB.
    if(value === ""){
      value = null;
    }

    let initialValue = initialObject?.[name];

    // Replace initial value "" by null to circumvent Formik (and more precisly React input control state) initial value that
    // must be an empty string and not a null or undefined value.
    if(initialValue === ""){
      initialValue = null;
    }

    // Alter object input only if value changed.
    // noinspection EqualityComparisonWithCoercionJS
    if (initialValue != value) { // and not !== to take into account "null != undefined" statement.
      objectInput[name] = value;
    }

    return objectInput;
  }, {});
}

/**
 * @param {LinkInputDefinition} linkInputDefinition
 * @param {StoreObject} targetObject
 * @param {StoreObject} [initialTargetObject]
 */
function normalizeSingleLinkInput({
  linkInputDefinition,
  targetObject,
  initialTargetObject
}) {
  let objectInput = {};

  linkInputDefinition = getLinkInputDefinitionForTargetObject({
    linkInputDefinition,
    targetObject
  });

  if (typeof linkInputDefinition.modifyValue === "function") {
    targetObject = linkInputDefinition.modifyValue(targetObject);
  }

  if (targetObject) {
    targetObject = normalizeMutationInput({
      initialObject: initialTargetObject,
      mutatedObject: targetObject,
      linkInputDefinitions: linkInputDefinition.nestedLinks,
      scalarInputNames: linkInputDefinition.targetObjectScalarNames,
      preserveId: true
    });

    // Normalize mutated target object skipping id to see what is remaining
    const normalizedTargetObject = getObjectsDiff(
      initialTargetObject,
      targetObject
    );

    const keysCount = Object.values(normalizedTargetObject).length;

    // At this point we must handle different cases :
    // - initialObject and mutatedObject are stricty identical => do nothing.
    // - initialObject and mutatedObject differs only with their ids => record only mutated ID.
    // - initialObject and mutatedObject differs only with their ids and others props => recore mutated ID ; mutated props ONLY IF forceUpdateTarget information is found in the link..
    if (
      keysCount > 1 ||
      !initialTargetObject ||
      initialTargetObject?.id !== normalizedTargetObject?.id
    ) {
      if (!targetObject.id || linkInputDefinition.forceUpdateTarget) {
        objectInput[linkInputDefinition.inputName] = {
          ...(linkInputDefinition.inputInheritedTypename
            ? { inheritedTypename: linkInputDefinition.inputInheritedTypename }
            : {}),
          ...normalizedTargetObject
        };
      } else {
        objectInput[linkInputDefinition.inputName] = {
          id: targetObject.id
        };
      }
    }
  } else if (initialTargetObject) {
    // This usecase handles the targetObject removal persisted on API side by setting target object id to "null"
    // @see synaptix.js documentation.
    objectInput[linkInputDefinition.inputName] = {
      id: null
    };
  }

  return objectInput;
}

/**
 * @param {StoreObject} [initialObject]
 * @param {LinkInputDefinition} linkInputDefinition
 * @param {StoreObject[]} targetConnection
 */
function normalizePluralLinkInput({
  linkInputDefinition,
  initialObject,
  targetConnection
}) {
  let objectInput = {};

  if (!Array.isArray(targetConnection?.edges)) {
    throw new Error(
      `Link ${linkInputDefinition.name} has been declared as plural, targetEntityConnection must be GraphQL connection`
    );
  }

  const existingEdges = initialObject?.[linkInputDefinition.name]?.edges || [];
  const mutatingEdges = targetConnection?.edges || [];

  let objectInputsToDelete = [];
  let objectInputsToUpdate = [];

  for (let mutatingEdge of mutatingEdges) {
    const existingEdge = existingEdges.find(
      existingEdge => existingEdge.node.id === mutatingEdge.node.id
    );

    if (!existingEdge || !isEqual(existingEdge.node, mutatingEdge.node)) {
      objectInputsToUpdate.push(
        normalizeSingleLinkInput({
          linkInputDefinition,
          targetObject: mutatingEdge.node,
          initialTargetObject: existingEdge?.node
        })[linkInputDefinition.inputName]
      );
    }
  }

  for (let existingEdge of existingEdges) {
    if (
      !mutatingEdges.find(
        targetEdge => targetEdge.node?.id === existingEdge.node.id
      )
    ) {
      objectInputsToDelete.push(existingEdge.node.id);
    }
  }

  if (objectInputsToUpdate.length > 0 && linkInputDefinition.inputName) {
    objectInput[linkInputDefinition.inputName] = objectInputsToUpdate;
  }

  if (objectInputsToDelete.length > 0 && linkInputDefinition.deleteInputName) {
    objectInput[linkInputDefinition.deleteInputName] = objectInputsToDelete;
  }

  return objectInput;
}
