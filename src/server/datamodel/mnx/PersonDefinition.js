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
  LinkDefinition,
  GraphQLTypeDefinition,
  MnxOntologies
} from "@mnemotix/synaptix.js";
import OccupationDefinition from "../mm/OccupationDefinition";
import JobAreaDefinition from "../oep/JobAreaDefinition";
import ExperienceDefinition from "../mm/ExperienceDefinition";
import AptitudeDefinition from "../mm/AptitudeDefinition";

export default class PersonDefinition extends ModelDefinitionAbstract {
  /**
   * @inheritDoc
   */
  static substituteModelDefinition() {
    return MnxOntologies.mnxAgent.ModelDefinitions.PersonDefinition;
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
        linkName: "hasOccupation",
        description: "Métier actuel",
        rdfObjectProperty: "oep:hasOccupation",
        relatedModelDefinition: OccupationDefinition,
        isPlural: false,
        graphQLPropertyName: "occupation",
        graphQLInputName: "occupationInput"
      }),
      new LinkDefinition({
        linkName: "hasSpouseOccupation",
        description: "Métier actuel du conjoint",
        rdfObjectProperty: "oep:hasSpouseOccupation",
        relatedModelDefinition: OccupationDefinition,
        isPlural: false,
        graphQLPropertyName: "spouseOccupation",
        graphQLInputName: "spouseOccupationInput"
      }),
      new LinkDefinition({
        linkName: "hasWishedOccupation",
        description: "Liste des métiers souhaités",
        rdfObjectProperty: "oep:hasWishedOccupation",
        relatedModelDefinition: OccupationDefinition,
        isPlural: true,
        graphQLPropertyName: "wishedOccupations",
        graphQLInputName: "wishedOccupationInputs"
      }),
      new LinkDefinition({
        linkName: "hasJobArea",
        description: "Bassin d'emploi actuel",
        rdfObjectProperty: "oep:hasJobArea",
        relatedModelDefinition: JobAreaDefinition,
        isPlural: false,
        graphQLPropertyName: "jobArea",
        graphQLInputName: "jobAreaInput"
      }),
      new LinkDefinition({
        linkName: "hasWishedJobArea",
        description: "Liste des bassins d'emploi souhaités",
        rdfObjectProperty: "oep:hasWishedJobArea",
        relatedModelDefinition: JobAreaDefinition,
        isPlural: true,
        graphQLPropertyName: "wishedJobAreas",
        graphQLInputName: "wishedJobAreaInputs"
      }),
      new LinkDefinition({
        linkName: "hasExperience",
        symmetricLinkName: "hasPerson",
        description: "Expériences",
        rdfReversedObjectProperty: "mm:hasCreator",
        relatedModelDefinition: ExperienceDefinition,
        isPlural: true,
        graphQLPropertyName: "experiences",
        graphQLInputName: "experienceInputs"
      }),
      new LinkDefinition({
        linkName: "hasAptitude",
        symmetricLinkName: "hasPerson",
        description: "Compétences",
        rdfReversedObjectProperty: "mm:hasCreator",
        relatedModelDefinition: AptitudeDefinition,
        isPlural: true,
        graphQLPropertyName: "aptitudes",
        graphQLInputName: "aptitudeInputs"
      }),
    ];
  }

  static getLabels() {
    return [...super.getLabels()];
  }

  static getLiterals() {
    return [
      ...super.getLiterals(),
      new LiteralDefinition({
        literalName: "income",
        description: "Salaire actuel en € brut mensuel",
        rdfDataProperty: "oep:income",
        rdfDataType: "http://www.w3.org/2001/XMLSchema#integer"
      }),
      new LiteralDefinition({
        literalName: "wishedMinIncome",
        description: "Salaire souhaité minimum en € brut mensuel",
        rdfDataProperty: "oep:wishedMinIncome",
        rdfDataType: "http://www.w3.org/2001/XMLSchema#integer"
      }),
      new LiteralDefinition({
        literalName: "wishedMaxIncome",
        description: "Salaire souhaité maximim en € brut mensuel",
        rdfDataProperty: "oep:wishedMaxIncome",
        rdfDataType: "http://www.w3.org/2001/XMLSchema#integer"
      })
    ];
  }
}
