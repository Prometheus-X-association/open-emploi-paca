import React, {useEffect, useRef, useState} from "react";
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

export function WishedOccupations({currentOccupation, name = "wishedOccupations", dense } = {}) {
  const classes = useStyles();
  const {t} = useTranslation();
  const formikContext = useFormikContext();
  const existingOccupationEdges = [...formikContext.getFieldProps(name).value?.edges || []];
  const inputEl = useRef();

  let disabledOccupations = existingOccupationEdges.map(({node}) => node);

  if(currentOccupation){
    disabledOccupations.push(currentOccupation);
  }

  return (
    <List dense={dense}>
      <If condition={currentOccupation}>
        <ListItem>
          <ListItemText primary={currentOccupation?.prefLabel} secondary={t("PROFILE.OCCUPATION")} />
        </ListItem>
      </If>

      {existingOccupationEdges.map(({node : occupation}) => (
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
          disabledConcepts={disabledOccupations}
          placeholder={t("PROJECT.WISHED_OCCUPATION.ADD")}
          multiple={false}
          onSelectConcepts={handleSelectOccupation}
          AutocompleteProps={{
            size: "small",
            clearOnBlur: true
          }}
          TextFieldProps={{
            variant: "outlined",
            inputRef: inputEl
          }}
        />
      </ListItem>
    </List>
  );

  function handleSelectOccupation(occupation) {
    const newOccupationEdge = {
      node: occupation
    };

    persitSelectOccupations([...existingOccupationEdges, newOccupationEdge]);
    inputEl?.current?.blur();
  }

  function handleRemoveOccupation(occupation) {
    const indexOf = existingOccupationEdges.findIndex(({node}) => node.id === occupation.id);
    existingOccupationEdges.splice(indexOf, 1);
    persitSelectOccupations([...existingOccupationEdges]);
  }

  function persitSelectOccupations(occupations) {
    formikContext.setFieldValue(name, {
      edges: occupations
    });
  }
}
