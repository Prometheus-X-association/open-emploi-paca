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
  FilterDefinition,
  LabelDefinition,
  LinkDefinition,
  LinkPath,
  MnxOntologies,
  ModelDefinitionAbstract,
} from "@mnemotix/synaptix.js";
import AwardDefinition from "../mm/AwardDefinition";
import SkillDefinition from "./SkillDefinition";
import { OccupationGraphQLDefinition } from "./graphql/OccupationGraphQLDefinition";
import env from "env-var";
import JobAreaDefinition from "../oep/JobAreaDefinition";
import PersonDefinition from "../mnx/PersonDefinition";

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

  static getRdfInstanceBaseUri() {
    return "http://openemploi.datasud.fr/ontology/data/occupation";
  }

  /**
   * @inheritDoc
   */
  static getGraphQLDefinition() {
    return OccupationGraphQLDefinition;
  }

  static getIndexType() {
    return "occupation";
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
        linkName: "hasAward",
        rdfObjectProperty: "mm:isOccupationOf",
        relatedModelDefinition: AwardDefinition,
        isCascadingUpdated: true,
        isCascadingRemoved: true,
        isPlural: true,
        graphQLInputName: "isOccupationOfInputs",
      }),
      new LinkDefinition({
        linkName: "hasSkill",
        rdfObjectProperty: "mm:isOccupationOf",
        relatedModelDefinition: SkillDefinition,
        isPlural: true,
        graphQLInputName: "skillInputs",
        graphQLPropertyName: "skills",
      }),
      new LinkDefinition({
        linkName: "hasRelatedOccupation",
        rdfObjectProperty: "skos:related",
        relatedModelDefinition: OccupationDefinition,
        isPlural: true,
        graphQLInputName: "relatedOccupationInputs",
      }),
    ];
  }

  static getLabels() {
    const superLabels = super.getLabels();
    const prefLabel = superLabels.find(
      (label) => label.getLabelName() === "prefLabel"
    );
    const notation = superLabels.find(
      (label) => label.getLabelName() === "notation"
    );
    return [
      ...superLabels,
      new LabelDefinition({
        labelName: "relatedOccupationName",
        inIndexOnly: true,
        linkPath: new LinkPath()
          .step({ linkDefinition: this.getLink("hasRelatedOccupation") })
          .property({
            propertyDefinition: prefLabel,
            rdfDataPropertyAlias: "skos:prefLabel",
          }),
      }),
    ];
  }
  /**
   * @inheritDoc
   */
  static getFilters() {
    return [
      ...super.getFilters(),
      new FilterDefinition({
        filterName: "moreLikeThisPersonSkillsFilter",
        indexFilter: ({ skillsIds, boost }) => ({
          more_like_this: {
            fields: [this.getLink("hasSkill").getPathInIndex()],
            like: [
              {
                doc: {
                  [this.getLink("hasSkill").getPathInIndex()]: skillsIds,
                },
              },
            ],
            min_term_freq: 1,
            max_query_terms: 500,
            boost: boost,
          },
        }),
      }),
    ];
  }
}
