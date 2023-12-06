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
import { OccupationGraphQLDefinition } from "./OccupationGraphQLDefinition";

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
        graphQLPropertyName: "relatedOccupations",
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
        isPlural: true,
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
      /**
       * The idea of this filter is to compare an "occupation" document (with a "hasSkill" proprerty containings all related skills ids),
       * with a fake document shaped with desired skills.
       *
       * Like so :
       *
       * {
       *   more_like_this: {
       *     fields: ["hasSkill"],
       *     like: [
       *       {
       *         doc: {
       *           hasSkill: [
       *             "http://ontology.datasud.fr/openemploi/data/skill/5f51db9cfdbcf1047bdb8496b28a12f2",
       *             "http://ontology.datasud.fr/openemploi/data/skill/931caae1a40005eff180950445ee28fb",
       *             "http://ontology.datasud.fr/openemploi/data/skill/52f25407dedf77a0e80801a742f8a3e1",
       *             "http://ontology.datasud.fr/openemploi/data/skill/7439d1c2df98acf49df773f5898a105f",
       *           ],
       *         },
       *       },
       *     ]
       *   },
       * }
       */
      new FilterDefinition({
        filterName: "moreLikeThisPersonSkillsFilter",
        indexFilter: ({ skillIds, boost = 1 }) => ({
          more_like_this: {
            fields: [this.getLink("hasSkill").getPathInIndex()],
            like: [
              {
                doc: {
                  [this.getLink("hasSkill").getPathInIndex()]: skillIds,
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
