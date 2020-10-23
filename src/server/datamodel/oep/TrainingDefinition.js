import {
  ModelDefinitionAbstract,
  LiteralDefinition,
  LabelDefinition,
  LinkDefinition,
  MnxOntologies,
  LinkPath
} from "@mnemotix/synaptix.js";
import OccupationDefinition from "../mm/OccupationDefinition";
import JobAreaDefinition from "./JobAreaDefinition";
import AddressDefinition from "../mnx/AddressDefinition";
import { TrainingGraphQLDefinition } from "./graphql/TrainingGraphQLDefinition";

export default class TrainingDefinition extends ModelDefinitionAbstract {
  /**
   * @inheritDoc
   */
  static getParentDefinitions() {
    return [MnxOntologies.mnxTime.ModelDefinitions.DurationDefinition];
  }

  /**
   * @inheritDoc
   */
  static getRdfType() {
    return "oper:Training";
  }

  /**
   * @inheritDoc
   */
  static getGraphQLDefinition() {
    return TrainingGraphQLDefinition;
  }

  /**
   * @inheritDoc
   */
  static getIndexType() {
    return "training";
  }

  /**
   * @inheritDoc
   */
  static getLinks() {
    const hasOrganizationLink = new LinkDefinition({
      linkName: "hasOrganization",
      pathInIndex: "organization",
      rdfObjectProperty: "oper:isProvidedBy",
      relatedModelDefinition:
        MnxOntologies.mnxAgent.ModelDefinitions.OrganizationDefinition,
      isPlural: true,
      graphQLPropertyName: "organizations",
      graphQLInputName: "organizationInputs"
    });

    const hasOccupationLink = new LinkDefinition({
      linkName: "hasMainOccupation",
      pathInIndex: "mainOccupation",
      rdfObjectProperty: "mm:hasOccupation",
      relatedModelDefinition: OccupationDefinition,
      graphQLPropertyName: "mainOccupation",
      graphQLInputName: "mainOccupationInput"
    });

    return [
      ...super.getLinks(),
      hasOrganizationLink,
      hasOccupationLink,
      new LinkDefinition({
        linkName: "hasJobArea",
        pathInIndex: "jobArea",
        linkPath: new LinkPath()
          .step({ linkDefinition: hasOrganizationLink })
          .step({
            linkDefinition: MnxOntologies.mnxAgent.ModelDefinitions.OrganizationDefinition.getLink(
              "hasAddress"
            )
          })
          .step({ linkDefinition: AddressDefinition.getLink("hasJobArea") }),
        relatedModelDefinition: JobAreaDefinition,
        inIndexOnly: true
      }),
      new LinkDefinition({
        linkName: "hasOccupation",
        pathInIndex: "occupations",
        linkPath: new LinkPath()
          .step({ linkDefinition: hasOccupationLink })
          .step({
            linkDefinition: OccupationDefinition.getLink("hasRelatedOccupation")
          }),
        relatedModelDefinition: JobAreaDefinition,
        isPlural: true,
        inIndexOnly: true
      })
    ];
  }

  /**
   * @inheritDoc
   */
  static getLabels() {
    return [
      ...super.getLabels(),
      new LabelDefinition({
        labelName: "objective",
        pathInIndex: "objectives",
        rdfDataProperty: "oper:objective"
      }),
      new LabelDefinition({
        labelName: "title",
        rdfDataProperty: "dc:title"
      }),
      new LabelDefinition({
        labelName: "description",
        rdfDataProperty: "dc:description"
      }),
      new LabelDefinition({
        labelName: "organizationName",
        linkPath: new LinkPath()
          .step({ linkDefinition: this.getLink("hasOrganization") })
          .property({
            propertyDefinition: MnxOntologies.mnxAgent.ModelDefinitions.OrganizationDefinition.getProperty(
              "name"
            ),
            rdfDataPropertyAlias: "mnx:name"
          }),
        inIndexOnly: true
      })
    ];
  }

  /**
   * @inheritDoc
   */
  static getLiterals() {
    return [
      ...super.getLiterals(),
      new LiteralDefinition({
        literalName: "classroomHour",
        rdfDataProperty: "oper:classroomHour",
        rdfDataType: "http://www.w3.org/2001/XMLSchema#integer"
      }),
      new LiteralDefinition({
        literalName: "companyHour",
        rdfDataProperty: "oper:companyHour",
        rdfDataType: "http://www.w3.org/2001/XMLSchema#integer"
      }),
      new LiteralDefinition({
        literalName: "disableAccessibility",
        rdfDataProperty: "oper:disableAccessibility",
        rdfDataType: "http://www.w3.org/2001/XMLSchema#boolean"
      }),
      new LiteralDefinition({
        literalName: "isCpfEligible",
        rdfDataProperty: "oper:isCpfEligible",
        rdfDataType: "http://www.w3.org/2001/XMLSchema#boolean"
      }),
      new LiteralDefinition({
        literalName: "totalHour",
        rdfDataProperty: "oper:totalHour",
        rdfDataType: "http://www.w3.org/2001/XMLSchema#integer"
      }),
      new LiteralDefinition({
        literalName: "homepage",
        rdfDataProperty: "foaf:homepage"
      })
    ];
  }
}
