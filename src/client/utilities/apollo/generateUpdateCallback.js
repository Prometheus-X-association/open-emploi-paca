import {StoreObject, InMemoryCache} from "@apollo/client";

/**
 * @param {StoreObject} entity - entity object that must contain an "id" field.
 * @param {object} values - object representing mutating values (can be straight formik form result values)
 * @param {string[]} [inputNames] - restrict field input names. Default to all simple field (not link) foundable in "values"
 * @param {GraphQLLinkDefinition[]} links - list of links to mutate.
 * @param {boolean} [optimistic=true] - is mutation optimistic ?
 * @return {function(*=): void}
 */
export function generateUpdateCallback({entity, values, links, inputNames, optimistic}) {
  /**
   * @param {InMemoryCache} cache
   */
  return (cache) => {
    const fields = Object.entries(values).reduce((fields, [name, value]) => {
      // Case of simple input (not link)
      if (typeof value !== "object") {
        // We assume that inputName is same value than property name. It's an opiniated concept of synaptix GraphQL API
        fields[name] = () => value;
     // Case of links
      } else {
        const link = links.find((link) => name === link.name);

        if (link) {
          // Case of simple link, just replace
          if (!link.isPlural) {
            fields = Object.assign(fields, generateSimpleLinkFields({link, cache, targetEntity: value}));
            // Case of plural link, add reference IF it does not exist
          } else {
            fields = Object.assign(fields, generatePluralLinkFields({link, cache, targetConnection: value}));
          }
        }
      }

      return fields;
    }, {});

    if (cache.identify(entity)) {
      cache.modify({
        id: cache.identify(entity),
        optimistic: false,
        fields
      })
    }
  }
}

/**
 * @param {InMemoryCache} cache
 * @param {GraphQLLinkDefinition} link
 * @param {StoreObject} targetEntity
 * @return {object}
 */
function generateSimpleLinkFields({link, cache, targetEntity}){
  let fields = {};

  let targetEntityRef = targetEntity ? cache.writeFragment({
    data: targetEntity,
    fragment: link.targetFragment
  }) : null;

  fields[link.name] = (_, {DELETE}) => targetEntityRef || DELETE;

  return fields;
}

/**
 * @param {InMemoryCache} cache
 * @param {GraphQLLinkDefinition} link
 * @param {StoreObject} targetConnection
 * @return {object}
 */
function generatePluralLinkFields({link, cache, targetConnection}){
  let fields = {};

  fields[link.name] = (existingConnection = [], {readField}) => {
    const existingEdges = readField('edges', existingConnection);
    const mutatingEdges = targetConnection.edges;

    // Conserve existant ones.
    const resultingEdges = existingEdges.filter(existingEdge => {
      return mutatingEdges.some((mutatingEdge) => {
        return mutatingEdge.node?.id === readField("id", readField("node", existingEdge)); //
      })
    });


    // Add new ones
    mutatingEdges.map(mutatingEdge => {
      if (!existingEdges.some(existingEdge => readField("id", readField("node", existingEdge)) === mutatingEdge.node.id))   {
        const mutatingNode = {
          __typename: link.targetFragment?.definitions?.[0]?.typeCondition?.name?.value, // This is the way to access Fragment type
          ...mutatingEdge?.node
        };

        const newNode = cache.writeFragment({
          data: mutatingNode,
          fragment: link.targetFragment
        });

        if(newNode){
          resultingEdges.push({node: newNode})
        }
      }
    });

    return {
      edges: resultingEdges
    }
  }

  return fields;
}