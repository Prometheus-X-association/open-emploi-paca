import {GraphQLTypeDefinition, LinkDefinition, MnxOntologies, ModelDefinitionAbstract} from "@mnemotix/synaptix.js";
import JobAreaDefinition from "../oep/JobAreaDefinition";

export default class AddressDefinition extends ModelDefinitionAbstract {
  /**
   * @inheritDoc
   */
  static substituteModelDefinition() {
    return MnxOntologies.mnxAgent.ModelDefinitions.AddressDefinition;
  }

  /**
   * @inheritDoc
   */
  static getGraphQLDefinition() {
    return GraphQLTypeDefinition;
  }

  static getLinks() {
    return [
      ...super.getLinks(),
      new LinkDefinition({
        linkName: "hasJobArea",
        description: "Bassin d'emploi",
        rdfObjectProperty: "oep:hasZoneEmploi",
        relatedModelDefinition: JobAreaDefinition,
        graphQLPropertyName: "jobArea",
        graphQLInputName: "jobAreaInput"
      })
    ];
  }
}
