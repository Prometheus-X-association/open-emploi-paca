/**
 * @param id
 * @param {ModelDefinitionAbstract} modelDefinition
 * @param {SynaptixDatastoreRdfSession} synaptixSession
 */
export function dseIdToURI({ id, modelDefinition, synaptixSession }) {
  let idValue = id.replace(/\w+\:(\d+)\:(\d+)/, "$1$2");
  let uri = synaptixSession.generateUriForModelDefinition({
    modelDefinition,
    idValue
  });
  return uri.replace(
    synaptixSession.getNodesNamespaceURI(),
    `${synaptixSession.getNodesPrefix()}:`
  );
}
