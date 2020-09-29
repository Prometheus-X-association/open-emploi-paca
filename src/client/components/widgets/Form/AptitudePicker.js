import React, {useRef} from "react";
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import {useFormikContext} from "formik";
import {IconButton, List, ListItem, ListItemSecondaryAction, ListItemText} from "@material-ui/core";
import {Delete} from "@material-ui/icons";

import {SkillAutocomplete} from "../Autocomplete/SkillAutocomplete/SkillAutocomplete";

const useStyles = makeStyles(theme => ({
  skillAutocomplete: {
    width: "100%",
    marginTop: theme.spacing(2)
  }
}));

/**
 * @param name
 * @param filterByRelatedOccupationIds
 * @param {boolean} dense
 * @return {JSX.Element}
 * @constructor
 */
export function AptitudePicker({name = "aptitude", filterByRelatedOccupationIds, dense} = {}) {
  const classes = useStyles();
  const {t} = useTranslation();
  const formikContext = useFormikContext();
  const existingAptitudesEdges = [...formikContext.getFieldProps(name).value?.edges || []];
  const existingSkills = existingAptitudesEdges.map(({node: aptitude}) => aptitude.skill);
  const inputEl = useRef();

  return (
    <List dense={dense}>
      {existingSkills.map((skill) => (
        <ListItem key={skill.id}>
          <ListItemText primary={skill?.prefLabel}/>
          <ListItemSecondaryAction>
            <IconButton edge="end" aria-label="comments" onClick={() => handleRemoveSkill(skill)}>
              <Delete/>
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
      <ListItem>
        <SkillAutocomplete
          className={classes.skillAutocomplete}
          selectedSkills={null}
          disabledSkills={existingSkills}
          placeholder={t("CARTONET.SKILL.ADD")}
          multiple={false}
          onSelectSkills={handleSelectSkill}
          filterByRelatedOccupationIds={filterByRelatedOccupationIds}
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

  function handleSelectSkill(skill) {
    const newAptitudeEdge = {
      node: {skill}
    };

    persitSelectedAptitudes([...existingAptitudesEdges, newAptitudeEdge]);
    inputEl?.current?.blur();
  }

  function handleRemoveSkill(skill) {
    const indexOf = existingAptitudesEdges.findIndex(({node}) => node.skill?.id === skill.id);
    existingAptitudesEdges.splice(indexOf, 1);
    persitSelectedAptitudes([...existingAptitudesEdges]);
  }

  function persitSelectedAptitudes(aptitudes) {
    formikContext.setFieldValue(name, {
      edges: aptitudes
    });
  }
}
