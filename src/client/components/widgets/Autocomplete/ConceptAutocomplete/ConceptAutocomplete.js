/*
 * Copyright (C) 2013-2018 MNEMOTIX <http://www.mnemotix.com/> and/or its affiliates
 * and other contributors as indicated by the @author tags.
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

import {GenericAutocomplete} from "../GenericAutocomplete";
import {useTranslation} from "react-i18next";
import {getGqlFiltersForQs, gqlConcepts} from "./gql/Concepts.gql";

/**
 * @param {object} gqlQuery
 * @param {string} gqlEntitiesConnectionPath
 * @param {function} getGqlVariables
 * @param {function} onSelectConcepts
 * @param {array} selectedConcepts
 * @param {array} disabledConcepts
 * @param {string} placeholder
 * @param {object} AutocompleteProps
 * @param {object} TextFieldProps
 * @param {string} [vocabularyId = "*"] - Filter on vocabulary ID (default to *)
 * @param {boolean} [excludeTopConcepts] - Exclude top concepts
 * @param {boolean} [multiple] - Select multiple concepts
 * @param className
 * @return {*}
 * @constructor
 */
export function ConceptAutocomplete({
  gqlQuery = gqlConcepts,
  gqlEntitiesConnectionPath = "concepts",
  getGqlVariables,
  onSelectConcepts,
  selectedConcepts,
  disabledConcepts,
  placeholder,
  excludeTopConcepts,
  vocabularyId,
  multiple,
  AutocompleteProps,
  TextFieldProps,
  className
} = {}) {
  const {t} = useTranslation();

  return (
    <GenericAutocomplete
      className={className}
      multiple={multiple}
      placeholder={placeholder || t("CONCEPT.AUTOCOMPLETE.PLACEHOLDER")}
      gqlEntitiesQuery={gqlQuery}
      gqlEntitiesConnectionPath={gqlEntitiesConnectionPath}
      gqlEntityLabelPath={"prefLabel"}
      gqlVariables={getGqlVariables || (({qs}) => getGqlFiltersForQs({qs, excludeTopConcepts, vocabularyId}))}
      onSelect={onSelectConcepts}
      entities={selectedConcepts}
      disableEntities={disabledConcepts}
      AutocompleteProps={{
        size: "medium",
        noOptionsText: t("CONCEPT.AUTOCOMPLETE.NO_RESULT"),
        ...AutocompleteProps
      }}
      TextFieldProps={{
        variant: "standard",
        ...TextFieldProps
      }}
    />
  );
}
