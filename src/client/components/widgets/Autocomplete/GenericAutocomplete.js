import {useEffect, useState} from "react";
import TextField from "@material-ui/core/TextField";
import Autocomplete, {createFilterOptions} from "@material-ui/lab/Autocomplete";
import {useLazyQuery, useQuery} from "@apollo/client";
import throttle from "lodash/throttle";
import get from "lodash/get";
import invariant from "invariant";
import {useTranslation} from "react-i18next";

const strictOptionsFilter = createFilterOptions();

/**
 * @param {gql} gqlEntitiesQuery
 * @param {string} gqlEntitiesConnectionPath
 * @param {string} gqlEntityLabelPath
 * @param {function} onSelect
 * @param {object} [gqlVariables]
 * @param {object} [AutocompleteProps]
 * @param {object} [TextFieldProps]
 * @param {string} [placeholder]
 * @param {object} [entity]
 * @param {object[]} entities
 * @param {object[]} [disableEntities]
 * @param {boolean} [multiple]
 * @param {string} [className]
 * @param {boolean} [creatable]
 * @param {boolean} [strictMode]
 * @param {boolean} [required]
 */
export function GenericAutocomplete({
  gqlEntitiesQuery,
  gqlEntitiesConnectionPath,
  gqlEntityLabelPath,
  gqlVariables,
  placeholder,
  onSelect,
  AutocompleteProps,
  TextFieldProps,
  entity,
  entities,
  multiple,
  className,
  disableEntities = [],
  creatable,
  strictMode = false,
  required = false,
  getOptionLabel
} = {}) {
  invariant(gqlEntitiesQuery, "gqlEntitiesQuery must be passed");
  invariant(gqlEntitiesConnectionPath, "gqlEntitiesConnectionPath must be passed");
  invariant(gqlEntityLabelPath, "gqlEntityLabelPath must be passed");
  invariant(onSelect, "onSelect must be passed");

  const {t} = useTranslation();
  const [qs, setQs] = useState();
  let variables = {
    qs,
    first: 10
  };

  if (typeof gqlVariables === "object") {
    Object.assign(variables, gqlVariables);
  } else if (typeof gqlVariables === "function") {
    Object.assign(variables, gqlVariables({qs}));
  }

  const [loadEntities, {data, loading}] = useLazyQuery(gqlEntitiesQuery);

  const throttledOnChange = throttle(
    (event) => {
      setQs(event.target.value);
    },
    250,
    {leading: false, trailing: true}
  );

  useEffect(() => {
    if (typeof qs === "string") {
      loadEntities({variables});
    }
  }, [qs]);

  const options = get(data, `${gqlEntitiesConnectionPath}.edges`, []).map(({node: entity}) => entity);

  if(!getOptionLabel){
    getOptionLabel = (entity) => {
      return entity?.[gqlEntityLabelPath] || "";
    }
  }
  return (
    <Autocomplete
      className={className}
      noOptionsText={t("AUTOCOMPLETE.NO_RESULT")}
      options={options}
      getOptionLabel={(entity) => getOptionLabel(entity, {qs})}
      getOptionSelected={(option, value) => option?.id === value?.id}
      getOptionDisabled={(option) => !!disableEntities.find(({id}) => id === option.id)}
      loading={loading}
      onChange={(e, value) => onSelect(value)}
      value={entity || entities}
      multiple={multiple}
      renderInput={(params) => (
        <TextField
          {...params}
          required={required}
          variant={"outlined"}
          label={placeholder}
          onChange={(event) => {
            event.persist();
            throttledOnChange(event);
          }}
          onFocus={() => {
            setQs("");
          }}
          {...TextFieldProps}
        />
      )}
      filterOptions={(options, params) => {
        if (strictMode || creatable) {
          options = strictOptionsFilter(options, params);
        }

        // Suggest the creation of a new value
        if (
          creatable &&
          params.inputValue !== "" &&
          (options.length === 0 || !!options.find((option) => option[gqlEntityLabelPath] !== params.inputValue))
        ) {
          options.unshift({
            inputValue: params.inputValue,
            [gqlEntityLabelPath]: t("AUTOCOMPLETE.ADD", {value: params.inputValue}),
            isCreation: true
          });
        }

        return options;
      }}
      {...AutocompleteProps}
    />
  );
}
