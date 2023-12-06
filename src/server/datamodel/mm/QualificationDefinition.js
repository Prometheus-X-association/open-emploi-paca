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
  ModelDefinitionAbstract,
} from "@mnemotix/synaptix.js";
import OccupationDefinition from "../mm/OccupationDefinition";
import AwardDefinition from "../mm/AwardDefinition";

export default class QualificationDefinition extends ModelDefinitionAbstract {
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
    return "mm:Qualification";
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
  static getLinks() {
    let parentLinks = super.getLinks();
    let indexOf = parentLinks.findIndex(
      (link) => link.getLinkName() === "hasTagging"
    );
    if (indexOf > 0) {
      parentLinks.splice(indexOf, 1);
    }

    return [
      ...parentLinks,
      new LinkDefinition({
        linkName: "hasOccupation",
        rdfObjectProperty: "mm:hasOccupation",
        relatedModelDefinition: OccupationDefinition,
        isCascadingUpdated: true,
        isCascadingRemoved: true,
        isPlural: true,
        graphQLInputName: "hasOccupationInputs",
      }),
      new LinkDefinition({
        linkName: "isQualificationOf",
        rdfObjectProperty: "mm:isQualificationOf",
        relatedModelDefinition: AwardDefinition,
        isCascadingUpdated: true,
        isCascadingRemoved: true,
        isPlural: true,
        graphQLInputName: "isQualificationOfInputs",
      }),
    ];
  }
}
