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
  LiteralDefinition,
  MnxOntologies,
  ModelDefinitionAbstract
} from "@mnemotix/synaptix.js";
import AptitudeRatingDefinition from "../mm/AptitudeRatingDefinition";
import SkillDefinition from "../mm/SkillDefinition";
import ExpectationDefinition from "../mm/ExpectationDefinition";
import ExperienceDefinition from "../mm/ExperienceDefinition";

export default class AptitudeDefinition extends ModelDefinitionAbstract {
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
    return "mm:Aptitude";
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
    return "aptitude";
  }

  /**
   * @inheritDoc
   */
  static getLinks() {
    return [
      ...super.getLinks(),
      new LinkDefinition({
        linkName: "hasRating",
        rdfObjectProperty: "mm:hasRating",
        relatedModelDefinition: AptitudeRatingDefinition,
        isCascadingRemoved: true,
        isPlural: false,
        graphQLInputName: "ratingInput"
      }),
      new LinkDefinition({
        linkName: "hasSkill",
        rdfObjectProperty: "mm:hasSkill",
        relatedModelDefinition: SkillDefinition,
        graphQLInputName: "skillInput"
      }),
      new LinkDefinition({
        linkName: "isAptitudeOf",
        rdfObjectProperty: "mm:isAptitudeOf",
        relatedModelDefinition: ExpectationDefinition,
        isCascadingUpdated: true,
        isCascadingRemoved: true,
        isPlural: true,
        graphQLInputName: "isAptitudeOfInputs"
      }),
      new LinkDefinition({
        linkName: "relatedExperience",
        rdfObjectProperty: "mm:relatedExperience",
        relatedModelDefinition: ExperienceDefinition,
        isCascadingUpdated: true,
        isCascadingRemoved: true,
        isPlural: true,
        graphQLInputName: "relatedExperienceInputs"
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
        literalName: "isMandatory",
        rdfDataProperty: "mm:isMandatory",
        rdfDataType: "http://www.w3.org/2001/XMLSchema#boolean"
      })
    ];
  }
}
