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
  LiteralDefinition,
  MnxOntologies,
  ModelDefinitionAbstract
} from "@mnemotix/synaptix.js";

export default class AptitudeRatingDefinition extends ModelDefinitionAbstract {
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
    return "mm:AptitudeRating";
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
    return "aptitude-rating";
  }

  /**
   * @inheritDoc
   */
  static getLiterals() {
    return [
      ...super.getLiterals(),
      new LiteralDefinition({
        literalName: "range",
        rdfDataProperty: "mm:range",
        rdfDataType: "http://www.w3.org/2001/XMLSchema#integer"
      }),
      new LiteralDefinition({
        literalName: "value",
        rdfDataProperty: "mm:rating",
        rdfDataType: "http://www.w3.org/2001/XMLSchema#integer"
      })
    ];
  }
}
