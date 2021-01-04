import {StoreObject} from "@apollo/client";
import omitBy from "lodash/omitBy";

/**
 * @param {StoreObject} [entity] - entity object that must contain an "id" field. Leave it null if creation
 * @param {object} values - object representing mutating values (can be straight formik form result values)
 * @param {string[]} [inputNames] - restrict field input names. Default to all simple field (not link) foundable in "values"
 * @param {GraphQLLinkDefinition[]} links - list of links to mutate.
 * @param {boolean} [optimistic=true] - is mutation optimistic ?
 * @param {boolean} [preserveId=false] - Is Id preserved ?
 * @return {object}
 */
export function normalizeMutationInput({entity, values, links, inputNames = [], optimistic = true, preserveId = false}){
  return Object.entries(values).reduce((objectInput, [name, value]) => {
    if(name === "__typename"){
      return objectInput;
    }

    if(name === "id" && !preserveId){
      return objectInput;
    }

    if (!!value?.toISOString) {
      objectInput[name] = value.toISOString();
    } else if ((typeof value !== "object" && (inputNames.length === 0 || inputNames.includes(name)))){
      objectInput[name] = value;
    } else {
      const link = links.find((link) => name === link.name);

      if(link) {
        if(link.isPlural){
          objectInput = Object.assign(objectInput, normalizePluralLinkInput({link, entity, targetConnection: value}))
        } else {
          objectInput = Object.assign(objectInput, normalizeSingleLinkInput({link, targetEntity: value}))
        }
      }
    }
    return objectInput;
  }, {});
}

/**
 * @param {GraphQLLinkDefinition} link
 * @param {StoreObject} targetEntity
 */
function normalizeSingleLinkInput({link, targetEntity}){
  let objectInput = {};

  if(typeof link.modifyValue === "function"){
    targetEntity = link.modifyValue(targetEntity);
  }

  if(targetEntity){
    if(link.nestedLinks?.length > 0){
      targetEntity = normalizeMutationInput({values: targetEntity, links: link.nestedLinks, preserveId: true});
    }

    // If target entity has an ID, we have the choice to :
    //  - just record the link,
    //  - record the link AND update the target object.
    if (targetEntity.id){
      if (link.forceUpdateTarget){
        objectInput[link.inputName] = omitBy(targetEntity, (value) => value === "__typename" || typeof value === "object");
      } else {
        objectInput[link.inputName] = {
          id: targetEntity.id
        };
      }
    } else {
      objectInput[link.inputName] = targetEntity;
    }
  }

  return objectInput;
}

/**
 * @param {StoreObject} [entity]
 * @param {GraphQLLinkDefinition} link
 * @param {StoreObject[]} targetConnection
 */
function normalizePluralLinkInput({link, entity, targetConnection}){
  let objectInput = {};

  if(!Array.isArray(targetConnection?.edges)){
    throw new Error(`Link ${link.name} has been declared as plural, targetEntityConnection must be GraphQL connection`)
  }

  const existingEdges =  entity?.[link.name]?.edges || [];
  const mutatingEdges =  targetConnection?.edges || [];

  let edgesToDelete = [];
  let edgesToCreate = [];

  for (let mutatingEdge of mutatingEdges) {
    if (!existingEdges.find(existingEdge => existingEdge.node.id === mutatingEdge.node.id)) {
      edgesToCreate.push(mutatingEdge);
    }
  }

  for (let existingEdge  of existingEdges) {
    if (!mutatingEdges.find(targetEdge => targetEdge.node?.id === existingEdge.node.id)) {
      edgesToDelete.push(existingEdge);
    }
  }

  if (edgesToCreate.length > 0) {
    objectInput[link.inputName] = edgesToCreate.map(edge => normalizeSingleLinkInput({link, targetEntity: edge.node})[link.inputName]);
  }

  if (edgesToDelete.length > 0) {
    objectInput[link.deleteInputName || `${link.inputName}ToDelete`] = edgesToDelete.map(edge => edge.node.id);
  }

  return objectInput;
}