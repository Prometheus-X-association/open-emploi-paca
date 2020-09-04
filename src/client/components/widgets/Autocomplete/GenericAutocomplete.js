import React, {useState} from "react";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import {useQuery} from "@apollo/react-hooks";
import throttle from "lodash/throttle";
import get from "lodash/get";
import invariant from "invariant";
import {useTranslation} from "react-i18next";
import ErrorBoundary from "../ErrorBoundary";

/**
 * @param {DocumentNode|gql} gqlEntitiesQuery
 * @param {string} gqlEntitiesConnectionPath
 * @param {string} gqlEntityLabelPath
 * @param {function} onSelect
 * @param {object} [gqlVariables]
 * @param {object} [AutocompleteProps]
 * @param {string} [placeholder]
 * @param {object} [entity]
 */
export function GenericAutocomplete(props) {
  return (
    <ErrorBoundary>
      <GenericAutocompleteCode {...props} />
    </ErrorBoundary>
  );
}

function GenericAutocompleteCode({
  gqlEntitiesQuery,
  gqlEntitiesConnectionPath,
  gqlEntityLabelPath,
  gqlVariables,
  placeholder,
  onSelect,
  AutocompleteProps,
  entity,
  entities,
  multiple,
  variant = "outlined",
  size = "small"
} = {}) {
  invariant(gqlEntitiesQuery, "gqlEntitiesQuery must be passed");
  invariant(gqlEntitiesConnectionPath, "gqlEntitiesConnectionPath must be passed");
  invariant(gqlEntityLabelPath, "gqlEntityLabelPath must be passed");
  invariant(onSelect, "onSelect must be passed");

  const {t} = useTranslation();
  const [qs, setQs] = useState("");
  let variables = {
    qs
  };

  if (typeof gqlVariables === "object") {
    Object.assign(variables, gqlVariables);
  } else if (typeof gqlVariables === "function") {
    Object.assign(variables, gqlVariables({qs}));
  }

  const {data, loading} = useQuery(gqlEntitiesQuery, {variables});

  const throttledOnChange = throttle(
    event => {
      setQs(event.target.value);
    },
    250,
    {leading: false, trailing: true}
  );

  return (
    <Autocomplete
      size={size}
      noOptionsText={t("AUTOCOMPLETE.NO_RESULT")}
      options={get(data, `${gqlEntitiesConnectionPath}.edges`, []).map(({node: entity}) => entity)}
      getOptionLabel={entity => {
        return entity[gqlEntityLabelPath];
      }}
      getOptionSelected={(option, value) => option?.id === value?.id}
      loading={loading}
      onChange={(e, value) => onSelect(value)}
      value={entity || entities}
      multiple={multiple}
      renderInput={params => (
        <TextField
          {...params}
          variant={variant}
          label={placeholder}
          onChange={event => {
            event.persist();
            throttledOnChange(event);
          }}
        />
      )}
      {...AutocompleteProps}
    />
  );
}
