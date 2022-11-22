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

import {InMemoryCache, StoreObject} from "@apollo/client";
import isEqual from "lodash/isEqual";
import merge from "lodash/merge";
import {getObjectFromFragment} from "./helpers/getObjectFromFragment";
import {getLinkInputDefinitionForTargetObject} from "./helpers/getLinkInputDefinitionForTargetObject";

/**
 * @param {StoreObject} initialObject - initialObject object that must contain an "id" field.
 * @param {object} mutatedObject - object representing mutating mutatedObject (can be straight formik form result mutatedObject)
 * @param {string[]} [scalarInputNames] - restrict field input names. Default to all simple field (not link) foundable in "mutatedObject"
 * @param {LinkInputDefinition[]} linkInputDefinitions - list of linkInputDefinitions to mutate.
 * @param {boolean} [optimistic=true] - is mutation optimistic ?
 * @return {function(*=): void}
 */
export function generateUpdateCallback({
  initialObject,
  mutatedObject,
  linkInputDefinitions = [],
  scalarInputNames,
  optimistic = true
}) {
  /**
   * @param {InMemoryCache} cache
   */
  return cache => {
    const fields = Object.entries(mutatedObject).reduce(
      (fields, [name, value]) => {
        // Case of simple input (not link)
        if (typeof value !== "object" || !!value?.toISOString) {
          // toISOString refers to a dayjs object
          if (value !== initialObject?.[name]) {
            fields[name] = () => value;
          }
          // Case of linkInputDefinitions
        } else {
          const linkInputDefinition = (linkInputDefinitions || []).find(
            link => name === link.name
          );

          if (linkInputDefinition) {
            // Case of simple linkInputDefinition, just replace
            if (!linkInputDefinition.isPlural) {
              fields = Object.assign(
                fields,
                generateSimpleLinkFields({
                  linkInputDefinition,
                  cache,
                  initialTargetObject: initialObject?.[name],
                  targetObject: value
                })
              );
              // Case of plural linkInputDefinition, add reference IF it does not exist
            } else {
              fields = Object.assign(
                fields,
                generatePluralLinkFields({
                  linkInputDefinition,
                  cache,
                  initialTargetObject: initialObject?.[name],
                  targetConnection: value,
                  initialObject
                })
              );
            }
          }
        }

        return fields;
      },
      {}
    );

    const objectRef = cache.identify(initialObject);

    if (objectRef) {
      cache.modify({
        id: objectRef,
        optimistic,
        fields
      });
    }
  };
}

/**
 * @param {InMemoryCache} cache
 * @param {LinkInputDefinition} linkInputDefinition
 * @param {StoreObject} initialTargetObject
 * @param {StoreObject} targetObject
 * @return {object}
 */
function generateSimpleLinkFields({
  linkInputDefinition,
  cache,
  initialTargetObject,
  targetObject
}) {
  let fields = {};

  if (!isEqual(initialTargetObject, targetObject)) {
    linkInputDefinition = getLinkInputDefinitionForTargetObject({
      linkInputDefinition,
      targetObject
    });
    
    try {
      const targetEntityRef = targetObject
        ? cache.writeFragment({
            data: normalizeObject({
              initialTargetObject,
              targetObject,
              linkInputDefinition
            }),
            fragment: linkInputDefinition.targetObjectFragment,
            fragmentName: linkInputDefinition.targetObjectFragmentName
          })
        : null;

      fields[linkInputDefinition.name] = (_, { DELETE }) =>
        targetEntityRef || DELETE;
    } catch (e) {
      console.warn(e);
    }
  }

  return fields;
}

/**
 * @param {InMemoryCache} cache
 * @param {LinkInputDefinition} linkInputDefinition
 * @param {StoreObject} targetConnection
 * @return {object}
 */
function generatePluralLinkFields({ linkInputDefinition, cache, targetConnection, initialObject}) {
  let fields = {};
  fields[linkInputDefinition.name] = (existingConnection = [], { readField }) => {
    const existingEdges = readField("edges", existingConnection);
    const mutatingEdges = targetConnection.edges;

    // Conserve existant ones.
    const resultingEdges = existingEdges.filter(existingEdge => {
      return mutatingEdges.some(mutatingEdge => {
        return (
          mutatingEdge.node?.id ===
          readField("id", readField("node", existingEdge))
        ); //
      });
    });

    // Add new ones
    mutatingEdges.map(mutatingEdge => {
      const existingEdgeIndex = existingEdges.findIndex(
        existingEdge =>
          readField("id", readField("node", existingEdge)) ===
          mutatingEdge.node.id
      );

      linkInputDefinition = getLinkInputDefinitionForTargetObject({
        linkInputDefinition,
        targetObject: mutatingEdge.node
      });

      const fragmentDefinition = getFragmentDefinition({ linkInputDefinition });
      const mutatingNode = {
        __typename: fragmentDefinition?.typeCondition?.name?.value, // This is the way to access Fragment type
        ...mutatingEdge?.node
      };

      try {
        const data = normalizeObject({
          targetObject: mutatingNode,
          linkInputDefinition
        });
        const newNode = cache.writeFragment({
          data: data,
          fragment: linkInputDefinition.targetObjectFragment,
          fragmentName: linkInputDefinition.targetObjectFragmentName
        });

        if (mutatingNode) {
          if (existingEdgeIndex >= 0) {
            resultingEdges.splice(existingEdgeIndex, 1, { node: newNode });
          } else {
            resultingEdges.push({ node: newNode });
          }
        }
      } catch (e) {
        console.warn(e);
      }
    });

    return {
      edges: resultingEdges
    };
  };

  fields[`${linkInputDefinition.name}Count`] = (existingCount = 0, {readField, ...rest}) => {
    const mutatingCount = targetConnection?.edges?.length || 0;
    const initialCount  = initialObject[`${linkInputDefinition.name}`]?.edges?.length || 0;

    if(initialCount !== mutatingCount){
      const diffCount = initialCount - mutatingCount;
      const resultingCount = existingCount - diffCount
      return resultingCount ;
    }
  };

  return fields;
}

/**
 * @param {LinkInputDefinition} [linkInputDefinition]
 * @param {object} [fragment]
 * @param {string} [fragmentName]
 */
function getFragmentDefinition({ linkInputDefinition, fragment, fragmentName }) {
  let fragmentDefinition;

  if (linkInputDefinition) {
    fragment = linkInputDefinition.targetObjectFragment;
    fragmentName = linkInputDefinition.targetObjectFragmentName;
  }

  if (fragmentName) {
    fragmentDefinition = fragment?.definitions.find(
      definition => definition.name.value === fragmentName
    );
  } else {
    fragmentDefinition = fragment?.definitions?.[0];
  }

  return fragmentDefinition;
}

/**
 * @param {LinkInputDefinition} linkInputDefinition
 * @param {object} targetObject
 * @param {object} [initialObject]
 * @return {*}
 */
function normalizeObject({ initialObject, targetObject, linkInputDefinition }) {
  return merge(
    mockObject({ linkInputDefinition }),
    // To avoid an "Could not identify object" Apollo error for new created nodes,
    // ensures that id is filled.
    {
      id: targetObject.__localId
    },
    initialObject || {},
    targetObject || {}
  );
}

/**
 * @param {LinkInputDefinition} [linkInputDefinition]
 * @return {object}
 */
export function mockObject({ linkInputDefinition }) {
  return getObjectFromFragment({
    fragment: linkInputDefinition.targetObjectFragment,
    fragmentName: linkInputDefinition.targetObjectFragmentName
  });
}