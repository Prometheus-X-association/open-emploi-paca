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
import OfferDefinition from "../mm/OfferDefinition";

export default class ApplyDefinition extends ModelDefinitionAbstract {
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
    return "mm:Apply";
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
    return "apply";
  }

  /**
   * @inheritDoc
   */
  static getLinks() {
    return [
      ...super.getLinks(),
      new LinkDefinition({
        linkName: "hasOffer",
        rdfObjectProperty: "mm:hasOffer",
        relatedModelDefinition: OfferDefinition,
        isCascadingUpdated: true,
        isCascadingRemoved: true,
        isPlural: true,
        graphQLInputName: "hasOfferInputs"
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
        literalName: "isAccepted",
        rdfDataProperty: "mm:isAccepted",
        rdfDataType: "http://www.w3.org/2001/XMLSchema#boolean"
      }),
      new LiteralDefinition({
        literalName: "isComplete",
        rdfDataProperty: "mm:isComplete",
        rdfDataType: "http://www.w3.org/2001/XMLSchema#boolean"
      }),
      new LiteralDefinition({
        literalName: "isSelected",
        rdfDataProperty: "mm:isSelected",
        rdfDataType: "http://www.w3.org/2001/XMLSchema#boolean"
      }),
      new LiteralDefinition({
        literalName: "score",
        rdfDataProperty: "mm:score",
        rdfDataType: "http://www.w3.org/2001/XMLSchema#float"
      })
    ];
  }
}
