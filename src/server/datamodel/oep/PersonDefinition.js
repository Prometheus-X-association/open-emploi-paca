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

  static getLinks(){
    return [
      ...super.getLinks(),
      new LinkDefinition({
        linkName: "hasOccupation",
        rdfObjectProperty: "oep:hasOccupation",
        relatedModelDefinition: OccupationDefinition,
        isPlural: true,
        graphQLPropertyName: "occupations",
        graphQLInputName: "occupationInputs"
      })
    ]
  }

  static getLabels(){
    return [
      ...super.getLabels()
    ]
  }

  static getLiterals(){
    return [
      ...super.getLiterals(),
      new LiteralDefinition({
        literalName: "income",
        description: "Salaire actuel",
        rdfDataProperty: "oep:income"
      })
    ]
  }
}
