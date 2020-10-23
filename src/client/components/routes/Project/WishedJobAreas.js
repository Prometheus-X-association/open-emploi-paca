import React, {useEffect, useRef, useState} from "react";
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import {IconButton, List, ListItem, ListItemSecondaryAction, ListItemText} from "@material-ui/core";
import {Delete} from "@material-ui/icons";
import {useFormikContext} from "formik";

import {JobAreaAutocomplete} from "../../widgets/Autocomplete/JobAreaAutocomplete/JobAreaAutocomplete";

const useStyles = makeStyles(theme => ({
  jobAreaAutocomplete: {
    width: "100%",
    marginTop: theme.spacing(2)
  }
}));

export function WishedJobAreas({currentJobArea, name = "wishedJobAreas", dense = false} = {}) {
  const classes = useStyles();
  const {t} = useTranslation();
  const formikContext = useFormikContext();
  const existingJobAreaEdges = [...(formikContext.getFieldProps(name).value?.edges || [])];
  const inputEl = useRef();

  let disabledJobAreas = existingJobAreaEdges.map(({node}) => node);

  if (currentJobArea) {
    disabledJobAreas.push(currentJobArea);
  }

  return (
    <List dense={dense}>
      <If condition={currentJobArea}>
        <ListItem>
          <ListItemText primary={currentJobArea?.title} secondary={t("PROFILE.JOB_AREA")} />
        </ListItem>
      </If>

      {existingJobAreaEdges.map(({node: jobArea}) => (
        <ListItem key={jobArea.id}>
          <ListItemText primary={jobArea?.title} />
          <ListItemSecondaryAction>
            <IconButton edge="end" aria-label="comments" onClick={() => handleRemoveJobArea(jobArea)}>
              <Delete />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
      <ListItem>
        <JobAreaAutocomplete
          className={classes.jobAreaAutocomplete}
          selectedJobAreas={null}
          disabledJobAreas={disabledJobAreas}
          placeholder={t("PROJECT.WISHED_JOB_AREA.ADD")}
          multiple={false}
          onSelectJobAreas={handleSelectJobArea}
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

  function handleSelectJobArea(jobArea) {
    const newJobAreaEdge = {
      node: jobArea
    };

    persitSelectJobAreas([...existingJobAreaEdges, newJobAreaEdge]);
    inputEl?.current?.blur();
  }

  function handleRemoveJobArea(jobArea) {
    const indexOf = existingJobAreaEdges.findIndex(({node}) => node.id === jobArea.id);
    existingJobAreaEdges.splice(indexOf, 1);
    persitSelectJobAreas([...existingJobAreaEdges]);
  }

  function persitSelectJobAreas(jobAreas) {
    formikContext.setFieldValue(name, {
      edges: jobAreas
    });
  }
}
