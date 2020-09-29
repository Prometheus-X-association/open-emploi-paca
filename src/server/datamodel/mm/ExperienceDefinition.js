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
  LinkDefinition, LiteralDefinition,
  MnxOntologies,
  ModelDefinitionAbstract
} from "@mnemotix/synaptix.js";

import OccupationDefinition from "../mm/OccupationDefinition";
import QualificationDefinition from "../mm/QualificationDefinition";
import SkillDefinition from "./SkillDefinition";
import AptitudeDefinition from "./AptitudeDefinition";
import PersonDefinition from "../mnx/PersonDefinition";

export default class ExperienceDefinition extends ModelDefinitionAbstract {
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
    return "mm:Experience";
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
    return "experience";
  }

  /**
   * @inheritDoc
   */
  static getLinks() {
    return [
      ...super.getLinks(),
      new LinkDefinition({
        linkName: "hasPerson",
        rdfObjectProperty: "mm:isExperienceOf",
        relatedModelDefinition: PersonDefinition,
        graphQLPropertyName: "person",
        graphQLInputName: "personInput"
      }),
      new LinkDefinition({
        linkName: "hasOccupation",
        rdfObjectProperty: "mm:hasOccupation",
        relatedModelDefinition: OccupationDefinition,
        isPlural: true,
        graphQLPropertyName: "occupations",
        graphQLInputName: "occupationInputs"
      }),
      new LinkDefinition({
        linkName: "hasAptitude",
        rdfObjectProperty: "mm:isExperienceOf",
        relatedModelDefinition: AptitudeDefinition,
        isPlural: true,
        graphQLPropertyName: "aptitudes",
        graphQLInputName: "aptitudeInputs"
      }),
      new LinkDefinition({
        linkName: "hasQualification",
        rdfObjectProperty: "mm:hasQualification",
        relatedModelDefinition: QualificationDefinition,
        isPlural: true,
        graphQLPropertyName: "qualifications",
        graphQLInputName: "qualificationInputs"
      }),
      new LinkDefinition({
        linkName: "hasLocation",
        rdfObjectProperty: "mnx:hasLocation",
        relatedModelDefinition:
          MnxOntologies.mnxAgent.ModelDefinitions.AddressDefinition,
        graphQLPropertyName: "location",
        graphQLInputName: "locationInput"
      }),
      new LinkDefinition({
        linkName: "hasOrganization",
        rdfObjectProperty: "mm:hasOrg",
        relatedModelDefinition:
        MnxOntologies.mnxAgent.ModelDefinitions.OrganizationDefinition,
        graphQLPropertyName: "organization",
        graphQLInputName: "organizationInput"
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

  static getLiterals(){
    return [
      ...super.getLiterals(),
      new LiteralDefinition({
        literalName: "experienceType",
        rdfDataProperty: "mm:experienceType"
      })
    ];
  }
}
