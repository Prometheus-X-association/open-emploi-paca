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
  LinkDefinition,
  LinkPath,
  ModelDefinitionAbstract,
  MnxOntologies,
} from "@mnemotix/synaptix.js";
import AptitudeDefinition from "../mm/AptitudeDefinition";
import OccupationDefinition from "./OccupationDefinition";
import { SkillGraphQLDefinition } from "./SkillGraphQLDefinition";
import PersonDefinition from "../mnx/PersonDefinition";

export default class SkillDefinition extends ModelDefinitionAbstract {
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
    let parentLinks = super.getLinks();
    let indexOf = parentLinks.findIndex(
      (link) => link.getLinkName() === "hasTagging"
    );
    if (indexOf > 0) {
      parentLinks.splice(indexOf, 1);
    }

    const occupationLink = new LinkDefinition({
      linkName: "hasOccupation",
      rdfObjectProperty: "mm:hasOccupation",
      relatedModelDefinition: OccupationDefinition,
      isPlural: true,
      graphQLPropertyName: "occupations",
      graphQLInputName: "occupationInputs",
    });

    const aptitudeLink = new LinkDefinition({
      linkName: "isSkillOf",
      rdfObjectProperty: "mm:isSkillOf",
      relatedModelDefinition: AptitudeDefinition,
      isPlural: true,
      graphQLInputName: "aptitudeInputs",
    });

    return [
      ...parentLinks,
      occupationLink,
      aptitudeLink,
      new LinkDefinition({
        linkName: "hasOccupationCategory",
        linkPath: new LinkPath().step({ linkDefinition: occupationLink }).step({
          linkDefinition: OccupationDefinition.getLink("hasRelatedOccupation"),
        }),
        relatedModelDefinition: OccupationDefinition,
        isPlural: true,
        inIndexOnly: true,
      }),
      new LinkDefinition({
        linkName: "hasPerson",
        linkPath: new LinkPath()
          .step({ linkDefinition: aptitudeLink })
          .step({ linkDefinition: AptitudeDefinition.getLink("hasPerson") }),
        relatedModelDefinition: PersonDefinition,
        isPlural: true,
        inIndexOnly: true,
      }),
    ];
  }
}
