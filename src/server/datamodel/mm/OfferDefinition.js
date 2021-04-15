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
  GraphQLTypeDefinition,
  LabelDefinition,
  LinkDefinition,
  LiteralDefinition,
  MnxOntologies,
  ModelDefinitionAbstract
} from "@mnemotix/synaptix.js";
import ExpectationDefinition from "../mm/ExpectationDefinition";
import OccupationDefinition from "../mm/OccupationDefinition";
import ApplyDefinition from "../mm/ApplyDefinition";
import env from "env-var";
import {OfferGraphQLDefinition} from "./graphql/OfferGraphQLDefinition";
import JobAreaDefinition from "../oep/JobAreaDefinition";

export default class OfferDefinition extends ModelDefinitionAbstract {
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
    return "mm:Offer";
  }

  /**
   * @inheritDoc
   */
  static getIndexType() {
    return [
      "offer-pe",
      /*"offer-apec"*/
    ];
  }

  /**
   * @inheritDoc
   */
  static getGraphQLDefinition() {
    return OfferGraphQLDefinition;
  }

  /**
   * @inheritDoc
   */
  static getLinks() {
    return [
      ...super.getLinks(),
      new LinkDefinition({
        linkName: "expects",
        rdfObjectProperty: "mm:expects",
        relatedModelDefinition: ExpectationDefinition,
        isCascadingUpdated: true,
        isCascadingRemoved: true,
        isPlural: true,
        graphQLInputName: "expectsInputs"
      }),
      new LinkDefinition({
        linkName: "hasOccupation",
        pathInIndex: "occupation",
        rdfObjectProperty: "mm:hasOccupation",
        relatedModelDefinition: OccupationDefinition,
        isCascadingUpdated: true,
        isCascadingRemoved: true,
        isPlural: true,
        graphQLInputName: "hasOccupationInputs"
      }),
      new LinkDefinition({
        linkName: "isOfferOf",
        rdfObjectProperty: "mm:isOfferOf",
        relatedModelDefinition: ApplyDefinition,
        isCascadingUpdated: true,
        isCascadingRemoved: true,
        isPlural: true,
        graphQLInputName: "isOfferOfInputs"
      }),
      new LinkDefinition({
        linkName: "hasJobArea",
        pathInIndex: "zoneEmploi",
        rdfObjectProperty: "mm:hasJobArea",
        relatedModelDefinition: JobAreaDefinition,
        graphQLInputName: "jobAreaInput"
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
        literalName: "creationDate",
        pathInIndex: "dateCreation",
        rdfDataProperty: "mm:creationDate",
        rdfDataType: "http://www.w3.org/2001/XMLSchema#dateTime"
      }),
      new LiteralDefinition({
        literalName: "expirationDate",
        rdfDataProperty: "mm:expirationDate",
        rdfDataType: "http://www.w3.org/2001/XMLSchema#dateTime"
      }),
      new LiteralDefinition({
        literalName: "income",
        rdfDataProperty: "mm:income",
        pathInIndex: "salaire",
        rdfDataType: "http://www.w3.org/2001/XMLSchema#integer"
      }),
      new LiteralDefinition({
        literalName: "publicUrl",
        rdfDataProperty: "mm:publicUrl",
        pathInIndex: "offreURL"
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
        rdfDataProperty: "dct:title",
        pathInIndex: "intitule"
      }),
      new LabelDefinition({
        labelName: "description",
        rdfDataProperty: "dct:description"
      })
    ];
  }

  /**
   * @inheritDoc
   */
  static getFilters() {
    return [
      ...super.getFilters(),
      new FilterDefinition({
        filterName: "withinJobArea",
        indexFilter: ( jobAreaId ) => ({
          geo_shape: {
            geoloc: {
              indexed_shape: {
                index: `${env.get("INDEX_PREFIX_TYPES_WITH").asString()}${JobAreaDefinition.getIndexType()}`,
                id: jobAreaId,
                path: JobAreaDefinition.getLiteral("asWKT").getPathInIndex()
              }
            }
          }
        })
      })
    ];
  }
}
