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
  GraphQLTypeDefinition,
  LabelDefinition,
  LinkDefinition,
  LiteralDefinition,
  MnxOntologies,
  ModelDefinitionAbstract
} from "@mnemotix/synaptix.js";
import QualificationDefinition from "../mm/QualificationDefinition";

export default class AwardDefinition extends ModelDefinitionAbstract {
  /**
   * @inheritDoc
   */
  static getParentDefinitions() {
    return [MnxOntologies.mnxCommon.ModelDefinitions.EntityDefinition];
  }

  /**
   * @inheritDoc
   */
  static getRdfType() {
    return "mm:Award";
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
    return "award";
  }

  /**
   * @inheritDoc
   */
  static getLinks() {
    return [
      ...super.getLinks(),
      new LinkDefinition({
        linkName: "awardedBy",
        rdfObjectProperty: "mnx:awardedBy",
        relatedModelDefinition:
          MnxOntologies.mnxAgent.ModelDefinitions.OrganizationDefinition,
        isCascadingUpdated: true,
        isCascadingRemoved: true,
        isPlural: true,
        graphQLInputName: "awardedByInputs"
      }),
      new LinkDefinition({
        linkName: "awardedTo",
        rdfObjectProperty: "mnx:awardedTo",
        relatedModelDefinition:
          MnxOntologies.mnxAgent.ModelDefinitions.PersonDefinition,
        isCascadingUpdated: true,
        isCascadingRemoved: true,
        isPlural: true,
        graphQLInputName: "awardedToInputs"
      }),
      new LinkDefinition({
        linkName: "hasQualification",
        rdfObjectProperty: "mm:hasQualification",
        relatedModelDefinition: QualificationDefinition,
        isCascadingUpdated: true,
        isCascadingRemoved: true,
        isPlural: true,
        graphQLInputName: "hasQualificationInputs"
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
        literalName: "obtentionDate",
        rdfDataProperty: "mm:obtentionDate",
        rdfDataType: "http://www.w3.org/2001/XMLSchema#dateTime"
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
        labelName: "title",
        rdfDataProperty: "dct:title"
      }),
      new LabelDefinition({
        labelName: "description",
        rdfDataProperty: "dct:description"
      })
    ];
  }
}
