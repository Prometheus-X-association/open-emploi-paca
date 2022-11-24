import { useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import { useFormikContext } from "formik";

import { OccupationAutocomplete } from "../../../widgets/Autocomplete/OccupationAutocomplete/OccupationAutocomplete";
import { WishedOccupation } from "./WishedOccupation";

const useStyles = makeStyles((theme) => ({
  occupationAutocomplete: {
    width: "100%",
    marginTop: theme.spacing(2),
  },
}));

export function WishedOccupations({
  name = "wishedOccupations",
  personId,
  includeLeafOccupations,
} = {}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const formikContext = useFormikContext();
  const existingOccupationEdges = [
    ...(formikContext.getFieldProps(name).value?.edges || []),
  ];
  const inputEl = useRef();

  let disabledOccupations = existingOccupationEdges.map(({ node }) => node);

  return (
    <div>
      {existingOccupationEdges.map(({ node: occupation }) => (
        <WishedOccupation
          key={occupation.id}
          occupation={occupation}
          personId={personId}
          onClickRemove={handleRemoveOccupation}
        />
      ))}

      <OccupationAutocomplete
        className={classes.occupationAutocomplete}
        selectedConcepts={null}
        disabledConcepts={disabledOccupations}
        placeholder={t("PROJECT.WISHED_OCCUPATION.ADD")}
        multiple={false}
        onSelectConcepts={handleAddOccupation}
        includeLeafOccupations={includeLeafOccupations}
        AutocompleteProps={{
          size: "small",
          clearOnBlur: true,
        }}
        TextFieldProps={{
          variant: "outlined",
          inputRef: inputEl,
        }}
      />
    </div>
  );

  function handleAddOccupation(occupation) {
    const newOccupationEdge = {
      node: occupation,
    };

    persitSelectOccupations([...existingOccupationEdges, newOccupationEdge]);
    inputEl?.current?.blur();
  }

  function handleRemoveOccupation(occupation) {
    const indexOf = existingOccupationEdges.findIndex(
      ({ node }) => node.id === occupation.id
    );
    existingOccupationEdges.splice(indexOf, 1);
    persitSelectOccupations([...existingOccupationEdges]);
  }

  function persitSelectOccupations(occupations) {
    formikContext.setFieldValue(name, {
      edges: occupations,
    });
  }
}
