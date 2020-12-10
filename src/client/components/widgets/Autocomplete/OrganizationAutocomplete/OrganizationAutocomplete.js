import {GenericAutocomplete} from "../GenericAutocomplete";
import {useTranslation} from "react-i18next";
import {gqlOrganizations} from "./gql/Organizations.gql";

/**
 * @param {object} gqlQuery
 * @param {string} gqlEntitiesConnectionPath
 * @param {function} getGqlVariables
 * @param {function} onSelectOrganizations
 * @param {array} selectedOrganizations
 * @param {array} disabledOrganizations
 * @param {string} placeholder
 * @param {object} AutocompleteProps
 * @param {object} TextFieldProps
 * @param {boolean} [multiple] - Select multiple concepts
 * @param {boolean} [creatable] - Creatable
 * @param className
 * @return {*}
 * @constructor
 */
export function OrganizationAutocomplete({
  gqlQuery = gqlOrganizations,
  gqlEntitiesConnectionPath = "organizations",
  getGqlVariables,
  onSelectOrganizations,
  selectedOrganizations,
  disabledOrganizations,
  placeholder,
  multiple,
  AutocompleteProps,
  TextFieldProps,
  className,
  creatable
} = {}) {
  const {t} = useTranslation();

  return (
    <GenericAutocomplete
      className={className}
      multiple={multiple}
      placeholder={placeholder || t("ORGANIZATION.AUTOCOMPLETE.PLACEHOLDER")}
      gqlEntitiesQuery={gqlQuery}
      gqlEntitiesConnectionPath={gqlEntitiesConnectionPath}
      gqlEntityLabelPath={"name"}
      gqlVariables={getGqlVariables}
      onSelect={onSelectOrganizations}
      entities={selectedOrganizations}
      disableEntities={disabledOrganizations}
      creatable={creatable}
      AutocompleteProps={{
        size: "medium",
        noOptionsText: t("ORGANIZATION.AUTOCOMPLETE.NO_RESULT"),
        ...AutocompleteProps
      }}
      TextFieldProps={{
        variant: "standard",
        ...TextFieldProps
      }}
    />
  );
}
