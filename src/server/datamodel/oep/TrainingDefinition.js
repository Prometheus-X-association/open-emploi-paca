/*
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
 *
 */

import {
  ModelDefinitionAbstract,
  LiteralDefinition,
  LabelDefinition,
  LinkDefinition,
  GraphQLTypeDefinition,
  MnxOntologies
} from "@mnemotix/synaptix.js";
import OccupationDefinition from "../mm/OccupationDefinition";

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
    return "oep:Training";
  }

  /**
   * @inheritDoc
   */
  static getGraphQLDefinition() {
    return GraphQLTypeDefinition;
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
    return [
      ...super.getLinks(),
      new LinkDefinition({
        linkName: "isProvidedBy",
        pathInIndex: "isProvidedBy",
        rdfObjectProperty: "mnx:isProvidedBy",
        relatedModelDefinition:
          MnxOntologies.mnxAgent.ModelDefinitions.OrganizationDefinition,
        isCascadingUpdated: true,
        isCascadingRemoved: true,
        isPlural: true,
        graphQLInputName: "isProvidedByInputs"
      }),
      new LinkDefinition({
        linkName: "hasOccupation",
        pathInIndex: "hasOccupation",
        rdfObjectProperty: "mm:hasOccupation",
        relatedModelDefinition: OccupationDefinition,
        isCascadingUpdated: true,
        isCascadingRemoved: true,
        isPlural: true,
        graphQLInputName: "hasOccupationInputs"
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
        rdfDataProperty: "oep:objective"
      }),
      new LabelDefinition({
        labelName: "title",
        rdfDataProperty: "dct:title"
      }),
      new LabelDefinition({
        labelName: "description",
        rdfDataProperty: "dct:description"
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
        rdfDataProperty: "oep:classroomHour",
        rdfDataType: "http://www.w3.org/2001/XMLSchema#integer"
      }),
      new LiteralDefinition({
        literalName: "companyHour",
        rdfDataProperty: "oep:companyHour",
        rdfDataType: "http://www.w3.org/2001/XMLSchema#integer"
      }),
      new LiteralDefinition({
        literalName: "disableAccessibility",
        rdfDataProperty: "oep:disableAccessibility",
        rdfDataType: "http://www.w3.org/2001/XMLSchema#boolean"
      }),
      new LiteralDefinition({
        literalName: "isCpfEligible",
        rdfDataProperty: "oep:isCpfEligible",
        rdfDataType: "http://www.w3.org/2001/XMLSchema#boolean"
      }),
      new LiteralDefinition({
        literalName: "totalHour",
        rdfDataProperty: "oep:totalHour",
        rdfDataType: "http://www.w3.org/2001/XMLSchema#integer"
      })
    ];
  }
}
