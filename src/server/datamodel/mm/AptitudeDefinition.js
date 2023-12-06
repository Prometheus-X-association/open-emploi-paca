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
  LinkDefinition,
  LinkPath,
  LiteralDefinition,
  MnxOntologies,
  ModelDefinitionAbstract,
  SortingDefinition
} from "@mnemotix/synaptix.js";
import AptitudeRatingDefinition from "../mm/AptitudeRatingDefinition";
import SkillDefinition from "../mm/SkillDefinition";
import ExpectationDefinition from "../mm/ExpectationDefinition";
import ExperienceDefinition from "../mm/ExperienceDefinition";
import PersonDefinition from "../mnx/PersonDefinition";
import OccupationDefinition from "./OccupationDefinition";

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
    const skillLinkDefinition = new LinkDefinition({
      linkName: "hasSkill",
      rdfObjectProperty: "mm:hasSkill",
      relatedModelDefinition: SkillDefinition,
      graphQLPropertyName: "skill",
      graphQLInputName: "skillInput"
    });

    return [
      ...super.getLinks(),
      new LinkDefinition({
        linkName: "hasRating",
        rdfObjectProperty: "mm:hasRating",
        relatedModelDefinition: AptitudeRatingDefinition,
        isCascadingRemoved: true,
        isPlural: false,
        graphQLPropertyName: "rating",
        graphQLInputName: "ratingInput"
      }),
      skillLinkDefinition,
      new LinkDefinition({
        linkName: "isAptitudeOf",
        rdfObjectProperty: "mm:isAptitudeOf",
        relatedModelDefinition: ExpectationDefinition,
        isCascadingUpdated: true,
        isCascadingRemoved: true,
        isPlural: true,
        graphQLPropertyName: "expectations",
        graphQLInputName: "isAptitudeOfInputs"
      }),
      new LinkDefinition({
        linkName: "hasExperience",
        rdfObjectProperty: "mm:relatedExperience",
        relatedModelDefinition: ExperienceDefinition,
        isPlural: true,
        graphQLPropertyName: "experiences",
        graphQLInputName: "relatedExperienceInputs"
      }),
      new LinkDefinition({
        linkName: "hasPerson",
        rdfObjectProperty: "mm:hasCreator",
        relatedModelDefinition: PersonDefinition,
        graphQLPropertyName: "person",
        graphQLInputName: "personInput"
      }),
      new LinkDefinition({
        linkName: "hasRelatedOccupation",
        linkPath: new LinkPath()
          .step({ linkDefinition: skillLinkDefinition })
          .step({
            linkDefinition: new LinkDefinition({
              linkName: "hasOccupation",
              rdfObjectProperty: "mm:hasOccupation",
              relatedModelDefinition: OccupationDefinition,
              isPlural: true
            })
          }),
        isPlural: true,
        relatedModelDefinition: OccupationDefinition,
        graphQLPropertyName: "relationOccupation"
      })
    ];
  }

  static getLabels() {
    return [
      ...super.getLabels(),
      new LabelDefinition({
        labelName: "skillLabel",
        linkPath: new LinkPath()
          .step({ linkDefinition: AptitudeDefinition.getLink("hasSkill") })
          .property({
            propertyDefinition: SkillDefinition.getLabel("prefLabel"),
            rdfDataPropertyAlias: "mm:skillLabel"
          })
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
        literalName: "isInCV",
        rdfDataProperty: "mm:isInCV",
        rdfDataType: "http://www.w3.org/2001/XMLSchema#boolean"
      }),
      new LiteralDefinition({
        literalName: "isTop5",
        rdfDataProperty: "mm:isTop5",
        rdfDataType: "http://www.w3.org/2001/XMLSchema#boolean"
      }),
      new LiteralDefinition({
        literalName: "isMandatory",
        rdfDataProperty: "mm:isMandatory",
        rdfDataType: "http://www.w3.org/2001/XMLSchema#boolean"
      }),
      new LiteralDefinition({
        literalName: "ratingValue",
        linkPath: new LinkPath()
          .step({ linkDefinition: AptitudeDefinition.getLink("hasRating") })
          .property({
            propertyDefinition: AptitudeRatingDefinition.getLiteral("value"),
            rdfDataPropertyAlias: "mm:ratingValue"
          }),
        rdfDataType: "http://www.w3.org/2001/XMLSchema#integer",
        defaultValue: 0
      })
    ];
  }

  static getSortings() {
    return [
      new SortingDefinition({
        sortingName: "experiencesCount",
        indexSorting: ({ direction }) => ({
          _script: {
            type: "number",
            script: {
              lang: "painless",
              source: `
                if(doc.containsKey('hasExperience')) {
                  return doc['hasExperience'].length;
                }
                return 0;
              `
            },
            order: direction || "asc"
          }
        })
      })
    ];
  }
}
