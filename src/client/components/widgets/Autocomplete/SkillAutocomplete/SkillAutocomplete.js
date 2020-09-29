import React from "react";
import {useTranslation} from "react-i18next";
import {gqlSkills} from "./gql/Skills.gql";
import {ConceptAutocomplete} from "../ConceptAutocomplete/ConceptAutocomplete";
import {getGqlFiltersForQs} from "../ConceptAutocomplete/gql/Concepts.gql";

/**
 * @param {function} onSelectSkills
 * @param {array} selectedSkills
 * @param {array} disabledSkills
 * @param {string} placeholder
 * @param {object} AutocompleteProps
 * @param {object} TextFieldProps
 * @param {string} [vocabularyId = "*"] - Filter on vocabulary ID (default to *)
 * @param {boolean} [multiple] - Select multiple concepts
 * @param {string} [className]
 * @param {array} [filterByRelatedOccupationIds]
 * @return {*}
 * @constructor
 */
export function SkillAutocomplete({
  onSelectSkills,
  selectedSkills,
  disabledSkills,
  placeholder,
  multiple,
  AutocompleteProps,
  TextFieldProps,
  className,
  filterByRelatedOccupationIds
} = {}) {
  const {t} = useTranslation();

  return (
    <ConceptAutocomplete
      className={className}
      multiple={multiple}
      placeholder={placeholder}
      gqlQuery={gqlSkills}
      gqlEntitiesConnectionPath={"skills"}
      getGqlVariables={({qs}) => {
        let filters = [],
          sortings = [];

        if (!qs || qs === "") {
          sortings.push({
            sortBy: "prefLabel"
          });
        }

        if(filterByRelatedOccupationIds?.length > 0) {
          filters.push(`hasOccupation: ${JSON.stringify(filterByRelatedOccupationIds)}`)
        }

        return {
          first: 10,
          filters,
          sortings
        };
      }}
      onSelectConcepts={onSelectSkills}
      selectedConcepts={selectedSkills}
      disabledConcepts={disabledSkills}
      AutocompleteProps={AutocompleteProps}
      TextFieldProps={TextFieldProps}
    />
  );
}
