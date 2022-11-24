import { useTranslation } from "react-i18next";
import { gqlOccupations } from "./gql/Occupations.gql";
import { ConceptAutocomplete } from "../ConceptAutocomplete/ConceptAutocomplete";
import { getGqlFiltersForQs } from "../ConceptAutocomplete/gql/Concepts.gql";

/**
 * @param {function} onSelectConcepts
 * @param {array} selectedConcepts
 * @param {array} disabledConcepts
 * @param {string} placeholder
 * @param {object} AutocompleteProps
 * @param {object} TextFieldProps
 * @param {string} [vocabularyId = "*"] - Filter on vocabulary ID (default to *)
 * @param {boolean} [excludeTopConcepts] - Exclude top concepts
 * @param {boolean} [multiple] - Select multiple concepts
 * @param {string} [className]
 * @return {*}
 */
export function OccupationAutocomplete({
  onSelectConcepts,
  selectedConcepts,
  disabledConcepts,
  placeholder,
  excludeTopConcepts,
  multiple,
  AutocompleteProps,
  TextFieldProps,
  className,
  includeLeafOccupations = false,
} = {}) {
  const { t } = useTranslation();

  return (
    <ConceptAutocomplete
      className={className}
      multiple={multiple}
      placeholder={placeholder}
      gqlQuery={gqlOccupations}
      gqlEntitiesConnectionPath={"occupations"}
      getGqlVariables={({ qs }) => {
        let variables = getGqlFiltersForQs({
          qs,
          excludeTopConcepts,
          vocabularyId: null,
        });

        variables.filters = [...variables.filters, "hasSkill:*"];

        if (!includeLeafOccupations) {
          variables.filters.push(
            "inScheme:http://ontology.datasud.fr/openemploi/data/scheme/1"
          );
        }

        variables.size = 50;

        return variables;
      }}
      onSelectConcepts={onSelectConcepts}
      selectedConcepts={selectedConcepts}
      disabledConcepts={disabledConcepts}
      AutocompleteProps={AutocompleteProps}
      TextFieldProps={TextFieldProps}
    />
  );
}
