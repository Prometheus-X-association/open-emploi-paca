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
  LinkDefinition,
  MnxOntologies,
  ModelDefinitionAbstract
} from "@mnemotix/synaptix.js";
import AwardDefinition from "../mm/AwardDefinition";
import SkillDefinition from "./SkillDefinition";

export default class OccupationDefinition extends ModelDefinitionAbstract {
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
    return "mm:Occupation";
  }

  static getRdfInstanceBaseUri(){
    return "http://openemploi.datasud.fr/ontology/data/occupation";
  }

  /**
   * @inheritDoc
   */
  static getGraphQLDefinition() {
    return GraphQLTypeDefinition;
  }

  /**
   * @note skills are indexed in concept indexed, so we need filter them by type.
   */
  static getIndexFilters() {
    return [
      {
        term: {
          types: "https://ontologies.mindmatcher.org/carto/Occupation"
        }
      }
    ];
  }

  /**
   * @inheritDoc
   */
  static getLinks() {
    return [
      ...super.getLinks(),
      new LinkDefinition({
        linkName: "isOccupationOf",
        rdfObjectProperty: "mm:isOccupationOf",
        relatedModelDefinition: AwardDefinition,
        isCascadingUpdated: true,
        isCascadingRemoved: true,
        isPlural: true,
        graphQLInputName: "isOccupationOfInputs"
      }),
      new LinkDefinition({
        linkName: "hasSkill",
        rdfObjectProperty: "skos:related",
        relatedModelDefinition: SkillDefinition,
        isPlural: true,
        graphQLInputName: "skillInputs"
      })
    ];
  }
}
