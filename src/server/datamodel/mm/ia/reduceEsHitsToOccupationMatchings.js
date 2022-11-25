/**
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
 */
import OccupationDefinition from "../OccupationDefinition";

/**
 * @typedef {object} OccupationMatching
 * @param {String} occupationPrefLabel - Occupation category name
 * @param {String} occupationId - Occupation category name
 * @param {String} score - Matching score
 */

/**
 * Get a list of ES hists and returns a well formed OccupationMatching array.
 * @param hits
 * @param thresholdScore
 * @return {[OccupationMatching]}
 */
export function reduceEsHitsToOccupationMatchings({ hits, thresholdScore }) {
  const hasRelatedOccupationPath = OccupationDefinition.getLink(
    "hasRelatedOccupation"
  ).getPathInIndex();
  const relatedOccupationLabelPath = OccupationDefinition.getProperty(
    "relatedOccupationName"
  ).getPathInIndex();

  const occupationMatchings = hits.reduce(
    (occupationMatchings, { _id, _score, _source }) => {
      if (_score < thresholdScore) {
        return occupationMatchings;
      }

      // /!\ Caution. There is a ROME workaround here !
      //
      // In the whole project, when dealing with occupation, we take into account general occupation that gather specific occupations. We call
      // them "generic" occupations.
      //
      // Ex: "Design Industriel" ("generic" occupation)
      //           |=: related :=> Chef de produits design  ("specific" occupation)
      //           |=: related :=> Directeur de création designer ("specific" occupation)
      //           |=: related :=> ....
      //
      // The reason why is that in ROME, skills are related to a "generic" occupation  and not to a "specific" occupation.
      //
      //  Skill =: related :=> Occupation ("generic") =: related :=> Occupation ("specific")
      //
      // Ex: "Dessiner un produit" =: related :=> "Design Industriel" =: related :=> "Chef de produits design"
      //
      // The aim of this "if" condition is to only include "generic" Occupation.
      if (Array.isArray(_source[hasRelatedOccupationPath])) {
        if (!occupationMatchings[_source[relatedOccupationLabelPath]]) {
          /** @type {OccupationMatching} */
          const occupationMatching = {
            occupationPrefLabel: _source.prefLabel,
            occupationId: _id,
            score: _score,
          };

          occupationMatchings[
            _source[relatedOccupationLabelPath]
          ] = occupationMatching;
        }

        return occupationMatchings;
      }

      return occupationMatchings;
    },
    {}
  );

  return Object.values(occupationMatchings);
}
