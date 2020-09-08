import React, {useEffect, useState} from "react";
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import {IconButton, List, ListItem, ListItemSecondaryAction, ListItemText} from "@material-ui/core";
import {Delete} from "@material-ui/icons";
import {useFormikContext} from "formik";

import {OccupationAutocomplete} from "../../widgets/Autocomplete/OccupationAutocomplete/OccupationAutocomplete";

const useStyles = makeStyles(theme => ({
  occupationAutocomplete: {
    width: "100%",
    marginTop: theme.spacing(2)
  }
}));

export function WishedOccupations({
  currentOccupation,
  inputName = "wishedOccupationInputs",
  deleteInputName = "wishedOccupationInputsToDelete"
} = {}) {
  const classes = useStyles();
  const {t} = useTranslation();
  const formikContext = useFormikContext();
  const existingOccupations = (formikContext.getFieldProps("wishedOccupations").value?.edges || []).map(
    ({node: occupation}) => occupation
  );
  const [selectedOccupations, setSelectedOccupations] = useState([]);

  useEffect(() => {
    // That handlet if used on init and form resetting.
    if (!formikContext.values[inputName] && !formikContext.values[deleteInputName]) {
      setSelectedOccupations([...existingOccupations]);
    }
  }, [formikContext.values]);

  useEffect(() => {
    console.log("submit");
  }, [formikContext.submitForm]);

  return (
    <List>
      <ListItem>
        <ListItemText primary={currentOccupation} secondary={t("PROFILE.OCCUPATION")} />
      </ListItem>

      {selectedOccupations.map(occupation => (
        <ListItem key={occupation.id}>
          <ListItemText primary={occupation?.prefLabel} />
          <ListItemSecondaryAction>
            <IconButton edge="end" aria-label="comments" onClick={() => handleRemoveOccupation(occupation)}>
              <Delete />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
      <ListItem>
        <OccupationAutocomplete
          className={classes.occupationAutocomplete}
          selectedConcepts={null}
          disabledConcepts={selectedOccupations}
          placeholder={t("PROJECT.WISHED_OCCUPATION.ADD")}
          multiple={false}
          onSelectConcepts={handleSelectOccupation}
          AutocompleteProps={{
            size: "small",
            clearOnBlur: true
          }}
          TextFieldProps={{variant: "outlined"}}
        />
      </ListItem>
    </List>
  );

  function handleSelectOccupation(occupation) {
    persitSelectOccupations([...selectedOccupations, occupation]);
  }

  function handleRemoveOccupation(occupation) {
    const indexOf = selectedOccupations.find(({id}) => id === occupation.id);
    selectedOccupations.splice(indexOf, 1);
    persitSelectOccupations([...selectedOccupations]);
  }

  function persitSelectOccupations(occupations) {
    setSelectedOccupations(occupations);

    let occupationsToDelete = [];
    let occupationsToCreate = [];

    for (let occupation of occupations) {
      if (!existingOccupations.find(existingOccupation => existingOccupation.id === occupation.id)) {
        occupationsToCreate.push({
          id: occupation.id
        });
      }
    }

    for (let existingOccupation of existingOccupations) {
      if (!occupations.find(occupation => occupation?.id === existingOccupation.id)) {
        occupationsToDelete.push(existingOccupation.id);
      }
    }

    console.log(existingOccupations, occupationsToCreate, occupationsToDelete);
    if (occupationsToCreate.length > 0) {
      formikContext.setFieldValue(inputName, occupationsToCreate);
    }

    if (occupationsToDelete.length > 0) {
      formikContext.setFieldValue(deleteInputName, occupationsToDelete);
    }
  }
}
