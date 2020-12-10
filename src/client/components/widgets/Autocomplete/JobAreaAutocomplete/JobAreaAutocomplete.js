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
import {getGqlFiltersForQs, gqlJobAreas} from "./gql/JobAreas.gql";

/**
 * @param {object} gqlQuery
 * @param {string} gqlEntitiesConnectionPath
 * @param {function} getGqlVariables
 * @param {function} onSelectJobAreas
 * @param {array} selectedJobAreas
 * @param {array} disabledJobAreas
 * @param {string} placeholder
 * @param {object} AutocompleteProps
 * @param {object} TextFieldProps
 * @param {boolean} [multiple] - Select multiple concepts
 * @param className
 * @return {*}
 * @constructor
 */
export function JobAreaAutocomplete({
  gqlQuery = gqlJobAreas,
  gqlEntitiesConnectionPath = "jobAreas",
  getGqlVariables,
  onSelectJobAreas,
  selectedJobAreas,
  disabledJobAreas,
  placeholder,
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
      placeholder={placeholder || t("JOB_AREA.AUTOCOMPLETE.PLACEHOLDER")}
      gqlEntitiesQuery={gqlQuery}
      gqlEntitiesConnectionPath={gqlEntitiesConnectionPath}
      gqlEntityLabelPath={"title"}
      gqlVariables={getGqlVariables || (({qs}) => getGqlFiltersForQs({qs}))}
      onSelect={onSelectJobAreas}
      entities={selectedJobAreas}
      disableEntities={disabledJobAreas}
      AutocompleteProps={{
        size: "medium",
        noOptionsText: t("JOB_AREA.AUTOCOMPLETE.NO_RESULT"),
        ...AutocompleteProps
      }}
      TextFieldProps={{
        variant: "standard",
        ...TextFieldProps
      }}
    />
  );
}
