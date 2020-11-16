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
  LinkDefinition, LinkPath,
  ModelDefinitionAbstract
} from "@mnemotix/synaptix.js";
import AptitudeDefinition from "../mm/AptitudeDefinition";
import KnowledgeDefinition from "../oep/KnowledgeDefinition";
import SkillGroupDefinition from "../oep/SkillGroupDefinition";
import OccupationDefinition from "./OccupationDefinition";
import {SkillGraphQLDefinition} from "./graphql/SkillGraphQLDefinition";
import PersonDefinition from "../mnx/PersonDefinition";

export default class SkillDefinition extends ModelDefinitionAbstract {
  /**
   * @inheritDoc
   */
  static getParentDefinitions() {
    return [KnowledgeDefinition];
  }

  /**
   * @inheritDoc
   */
  static getRdfType() {
    return "mm:Skill";
  }

  /**
   * @inheritDoc
   */
  static getGraphQLDefinition() {
    return SkillGraphQLDefinition;
  }

  static getIndexType() {
    return "skill";
  }

  /**
   * @inheritDoc
   */
  static getLinks() {
    const occupationLink =  new LinkDefinition({
      linkName: "hasOccupation",
      rdfObjectProperty: "mm:hasOccupation",
      relatedModelDefinition: OccupationDefinition,
      isPlural: true,
      graphQLInputName: "occupationInputs"
    });

    const aptitudeLink = new LinkDefinition({
      linkName: "isSkillOf",
      rdfObjectProperty: "mm:isSkillOf",
      relatedModelDefinition: AptitudeDefinition,
      isPlural: true,
      graphQLInputName: "aptitudeInputs"
    });

    return [
      ...super.getLinks(),
      occupationLink,
      aptitudeLink,
      new LinkDefinition({
        linkName: "isMemberOf",
        rdfObjectProperty: "ami:memberOf",
        relatedModelDefinition: SkillGroupDefinition,
        isPlural: true,
        graphQLInputName: "skillGroupInputs"
      }),
      new LinkDefinition({
        linkName: "hasOccupationCategory",
        linkPath:  new LinkPath()
          .step({linkDefinition: occupationLink})
          .step({linkDefinition: OccupationDefinition.getLink("hasRelatedOccupation")}),
        relatedModelDefinition: OccupationDefinition,
        isPlural: true,
        inIndexOnly: true
      }),
      new LinkDefinition({
        linkName: "hasPerson",
        linkPath:  new LinkPath()
          .step({linkDefinition: aptitudeLink})
          .step({linkDefinition: AptitudeDefinition.getLink("hasPerson")}),
        relatedModelDefinition: PersonDefinition,
        isPlural: true,
        inIndexOnly: true
      }),
    ];
  }
}
