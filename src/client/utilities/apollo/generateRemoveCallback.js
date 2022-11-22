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

import get from "lodash/get";
import set from "lodash/set";

/**
 * This method is usefull to update the local cache after a node removal in connection.
 *
 * @param {DataProxy} cache - Apollo DataProxy
 * @param {object} GraphQL Query
 * @param {object} variables
 * @param {object} data
 * @param {string} connectionPathInData
 * @param {string} deletedNodeId
 */
export function generateRemoveCallback({cache, query, variables, data, connectionPathInData, deletedNodeId}){
  let connectionData = get(data, connectionPathInData);
  let mutatedEdges = [...connectionData.edges];
  let deletedIndex = mutatedEdges.findIndex(({node:{id}}) => id === deletedNodeId);

  mutatedEdges.splice(deletedIndex, 1);

  let mutatedData = Object.assign({}, data);
  mutatedData = set(mutatedData, connectionPathInData, {
    __typename: connectionData.__typename,
    edges: [...mutatedEdges],
    pageInfo : Object.assign({}, connectionData.pageInfo)
  });

  cache.writeQuery({
    query,
    variables,
    data: mutatedData
  });
}