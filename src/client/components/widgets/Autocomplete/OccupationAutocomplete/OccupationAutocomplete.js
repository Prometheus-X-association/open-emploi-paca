import React from "react";
import {useTranslation} from "react-i18next";
import {gqlOccupations} from "./gql/Occupations.gql";
import {ConceptAutocomplete} from "../ConceptAutocomplete/ConceptAutocomplete";
import {getGqlFiltersForQs} from "../ConceptAutocomplete/gql/Concepts.gql";

/**
 * @param {function} onSelectConcepts
 * @param {array} selectedConcepts
 * @param {string} placeholder
 * @param {object} AutocompleteProps
 *  @param {object} TextFieldProps
 * @param {string} [vocabularyId = "*"] - Filter on vocabulary ID (default to *)
 * @param {boolean} [excludeTopConcepts] - Exclude top concepts
 * @param {boolean} [multiple] - Select multiple concepts
 * @return {*}
 * @constructor
 */
export function OccupationAutocomplete({
  onSelectConcepts,
  selectedConcepts,
  placeholder,
  excludeTopConcepts,
  multiple,
  AutocompleteProps,
  TextFieldProps
} = {}) {
  const {t} = useTranslation();


  return (
    <ConceptAutocomplete
      multiple={multiple}
      placeholder={placeholder}
      gqlQuery={gqlOccupations}
      gqlEntitiesConnectionPath={"occupations"}
      getGqlVariables={({qs}) => getGqlFiltersForQs({qs, excludeTopConcepts, vocabularyId: null})}
      onSelectConcepts={onSelectConcepts}
      selectedConcepts={selectedConcepts}
      AutocompleteProps={AutocompleteProps}
      TextFieldProps={TextFieldProps}
    />
  );
}
