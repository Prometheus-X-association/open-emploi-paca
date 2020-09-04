import get from "lodash/get";
import set from "lodash/set";

/**
 * This method is usefull to update the local cache after a node removal in connection.
 *
 * @param {object} cache - Apollo cache also called "DataProxy"
 * @param {object} GraphQL Query
 * @param {object} variables
 * @param {object} data
 * @param {string} connectionPathInData
 * @param {string} countPathInData
 * @param {string[]} deletedNodeIds
 */
export function removeNodesInApolloCache({cache, query, variables, data, connectionPathInData, countPathInData, deletedNodeIds}) {
  let connectionData = get(data, connectionPathInData);
  let mutatedEdges = connectionData.edges.reduce((mutatedEdges, edge) => {
    if (!deletedNodeIds.includes(edge.node.id)) {
      mutatedEdges.push(edge);
    }
    return mutatedEdges;
  }, []);

  let mutatedData = Object.assign({}, data);
  mutatedData = set(mutatedData, connectionPathInData, {
    __typename: connectionData.__typename,
    edges: mutatedEdges,
    pageInfo: Object.assign({}, connectionData.pageInfo)
  });

  if (countPathInData) {
    set(mutatedData, countPathInData, get(data, countPathInData) - 1);
  }

  cache.writeQuery({
    query,
    variables,
    data: mutatedData
  });
}