import React, {useEffect, useRef, useState} from "react";
import {makeStyles} from "@material-ui/core/styles";
import {useLazyQuery} from "@apollo/client";
import {useTranslation} from "react-i18next";
import {useFormikContext} from "formik";
import {
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  ListSubheader,
  ListItemIcon,
  Portal
} from "@material-ui/core";
import {Delete, Add} from "@material-ui/icons";

import {gqlSkills} from "./gql/Aptitude.gql";
import {gqlMyAptitudes} from "./gql/MyAptitudes.gql";
import TextField from "@material-ui/core/TextField";
import throttle from "lodash/throttle";
import {useLoggedUser} from "../../../../hooks/useLoggedUser";

const useStyles = makeStyles(theme => ({
  textField: {
    width: "100%",
    marginTop: theme.spacing(2)
  },
  addButton: {
    padding: theme.spacing(0.1)
  },
  skillsContainer: {
    height: theme.spacing(50),
    overflow: "auto"
  },
  skillsSubHeader: {
    background: "white"
  }
}));

/**
 * @param name
 * @param filterByRelatedOccupationIds
 * @param {boolean} dense
 * @param selectedAptitudeRefContainer
 * @return {JSX.Element}
 * @constructor
 */
export function AptitudePicker({
  name = "aptitude",
  filterByRelatedOccupationIds,
  dense,
  selectedAptitudeRefContainer
} = {}) {
  const classes = useStyles();
  const {t} = useTranslation();
  const {user} = useLoggedUser();
  const [qs, setQs] = useState();
  const [loadSkills, {data: {mySkills, otherSkills} = {}}] = useLazyQuery(gqlSkills);

  const throttledOnChange = throttle(
    event => {
      setQs(event.target.value);
    },
    250,
    {leading: false, trailing: true}
  );

  useEffect(() => {
    setQs("");
  }, []);

  useEffect(() => {
    if (typeof qs === "string") {
      const skillsFilters = [`hasOccupationCategory: ${JSON.stringify(filterByRelatedOccupationIds)}`];

      loadSkills({
        variables: {
          qs,
          first: 20,
          sortings: !!qs ? [] : [{sortBy: "prefLabel"}],
          otherSkillsFilters: skillsFilters,
          mySkillsFilters: [...skillsFilters, `hasPerson: ${user.uri}`]
        }
      });
    }
  }, [qs]);

  const formikContext = useFormikContext();
  const existingAptitudesEdges = [...(formikContext.getFieldProps(name).value?.edges || [])];
  const existingSkills = existingAptitudesEdges.map(({node: aptitude}) => aptitude.skill);
  const existingSkillsIds = existingSkills.map(({id}) => id);

  const inputEl = useRef();

  console.log(mySkills, otherSkills);

  return (
    <>
      <Portal container={selectedAptitudeRefContainer.current}>
        <List dense={true}>{renderExistingSkills()}</List>
      </Portal>

      <List dense={true}>
        <div className={classes.skillsContainer}>
          <If condition={(mySkills?.edges || []).length > 0}>
            <ListSubheader className={classes.skillsSubHeader}>{t("CARTONET.SKILL.YOURS")}</ListSubheader>

            {mySkills?.edges.map(({node: skill}) => renderSkill({skill}))}

            <ListSubheader className={classes.skillsSubHeader}>{t("CARTONET.SKILL.OTHERS")}</ListSubheader>
          </If>

          {(otherSkills?.edges || []).map(({node: skill}) => renderSkill({skill}))}
        </div>
        <ListItem>
          <TextField
            className={classes.textField}
            size={"small"}
            variant={"outlined"}
            label={t("CARTONET.SKILL.ADD")}
            onChange={event => {
              event.persist();
              throttledOnChange(event);
            }}
            onFocus={() => {
              setQs("");
            }}
          />
        </ListItem>
      </List>
    </>
  );

  function renderSkill({skill}) {
    const skillExists = existingSkillsIds.includes(skill.id);

    return (
      <ListItem key={skill.id} disabled={skillExists}>
        <ListItemIcon>
          <IconButton disabled={skillExists} className={classes.addButton} onClick={() => handleSelectSkill(skill)}>
            <Add />
          </IconButton>
        </ListItemIcon>
        <ListItemText primary={skill?.prefLabel} />
      </ListItem>
    );
  }

  function renderExistingSkills() {
    return existingSkills.length > 0 ? (
      existingSkills.map(skill => (
        <ListItem key={skill.id}>
          <ListItemText primary={skill?.prefLabel} />
          <ListItemSecondaryAction>
            <IconButton edge="end" aria-label="comments" onClick={() => handleRemoveSkill(skill)}>
              <Delete />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))
    ) : (
      <ListItem disabled>
        <ListItemText>{t("CARTONET.SKILL.NONE")}</ListItemText>
      </ListItem>
    );
  }

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
