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
  GraphQLInterfaceDefinition,
  MnxOntologies
} from "@mnemotix/synaptix.js";
import PrerequisiteDefinition from "../oep/PrerequisiteDefinition";

export default class KnowledgeDefinition extends ModelDefinitionAbstract {
  /**
   * @inheritDoc
   */
  static isInstantiable() {
    return false;
  }

  /**
   * @inheritDoc
   */
  static getParentDefinitions() {
    return [MnxOntologies.mnxSkos.ModelDefinitions.ConceptDefinition];
  }

  /**
   * @inheritDoc
   */
  static getRdfType() {
    return "http://ontology.datasud.fr/openemploi/Knowledge";
  }

  /**
   * @inheritDoc
   */
  static getGraphQLDefinition() {
    return GraphQLInterfaceDefinition;
  }

  /**
   * @inheritDoc
   */
  static getLinks() {
    return [
      ...super.getLinks(),
      new LinkDefinition({
        linkName: "hasPrereq",
        pathInIndex: "hasPrereq",
        rdfObjectProperty: "http://ontology.datasud.fr/openemploi/hasPrereq",
        relatedModelDefinition: PrerequisiteDefinition,
        isCascadingUpdated: true,
        isCascadingRemoved: true,
        isPlural: true,
        graphQLInputName: "hasPrereqInputs"
      })
    ];
  }
}
