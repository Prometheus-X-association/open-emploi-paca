import {useEffect, useRef, useState} from "react";
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
  Portal,
  Paper
} from "@material-ui/core";
import {Delete, Add} from "@material-ui/icons";

import {gqlSkills} from "./gql/Skills.gql";
import TextField from "@material-ui/core/TextField";
import throttle from "lodash/throttle";
import {useLoggedUser} from "../../../../hooks/useLoggedUser";
import {LoadingSplashScreen} from "../../../widgets/LoadingSplashScreen";
import {gqlMyAptitudes} from "./gql/MyAptitudes.gql";

const useStyles = makeStyles((theme) => ({
  textField: {
    width: "100%",
    marginTop: theme.spacing(2)
  },
  addButton: {
    padding: theme.spacing(0.1)
  },
  skillsContainer: {
    height: theme.spacing(40),
    overflow: "auto"
  },
  skillsSubHeader: {
    background: "white"
  },
  empty: {
    height: theme.spacing(30),
    textAlign: "center",
    color: theme.palette.text.emptyHint,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: theme.spacing(2)
  }
}));

const SKILLS_WINDOW = 100;
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
  const [qsSkills, setQsSkills] = useState();
  const [qsMyAptitudes, setQsMyAptitudes] = useState();

  const [
    loadSkills,
    {loading: loadingOtherSkills, data: {skills: otherSkills, skillsCount: otherSkillsCount} = {}}
  ] = useLazyQuery(gqlSkills);

  const [
    loadMyAptitudes,
    {loading: loadingMyAptitudes, data: {me: {aptitudes: myAptitudes, aptitudesCount: myAptitudesCount} = {}} = {}}
  ] = useLazyQuery(gqlMyAptitudes);

  const throttledQsSkillsOnChange = throttle(
    (event) => {
      setQsSkills(event.target.value);
    },
    250,
    {leading: false, trailing: true}
  );

  const throttledQsMyAptitudesOnChange = throttle(
    (event) => {
      setQsMyAptitudes(event.target.value);
    },
    250,
    {leading: false, trailing: true}
  );

  useEffect(() => {
    setQsSkills("");
    setQsMyAptitudes("");
  }, []);

  useEffect(() => {
    if (filterByRelatedOccupationIds?.length > 0 && typeof qsSkills === "string") {
      const skillsFilters = [`hasOccupationCategory: ${JSON.stringify(filterByRelatedOccupationIds)}`];

      loadSkills({
        variables: {
          qs: qsSkills,
          first: SKILLS_WINDOW,
          sortings: !!qsSkills ? [] : [{sortBy: "prefLabel"}],
          filters: skillsFilters
        }
      });

      loadMyAptitudes({
        variables: {
          qs: qsMyAptitudes,
          first: SKILLS_WINDOW,
          sortings: !!qsMyAptitudes ? [] : [{sortBy: "prefLabel"}],
          filters: [`hasPerson: ${user.uri}`]
        }
      });
    }
  }, [qsSkills, qsMyAptitudes, filterByRelatedOccupationIds]);

  const formikContext = useFormikContext();
  const existingAptitudesEdges = [...(formikContext.getFieldProps(name).value?.edges || [])];
  const existingSkills = existingAptitudesEdges.map(({node: aptitude}) => aptitude.skill);
  const existingSkillsIds = existingSkills.map(({id}) => id);

  const inputEl = useRef();

  return (
    <>
      <Portal container={selectedAptitudeRefContainer.current}>
        <List dense={true}>{renderExistingSkills()}</List>
      </Portal>

      <ListSubheader className={classes.skillsSubHeader}>{t("CARTONET.SKILL.YOURS")}</ListSubheader>

      <List dense={true}>
        <Choose>
          <When condition={filterByRelatedOccupationIds?.length > 0}>
            <If condition={loadingMyAptitudes}>
              <LoadingSplashScreen />
            </If>
            <div className={classes.skillsContainer}>
              <If condition={(myAptitudes?.edges || []).length > 0}>
                {myAptitudes?.edges.map(({node: aptitude}) =>
                  renderSkill({
                    skill: {
                      prefLabel: aptitude.skillLabel,
                      aptitudeId: aptitude.id,
                      id: aptitude.skill?.id
                    }
                  })
                )}
                <If condition={myAptitudesCount > SKILLS_WINDOW}>
                  <ListItem disabled>
                    <ListItemText>
                      {t("CARTONET.SKILL.MORE_OTHER", {count: myAptitudesCount - SKILLS_WINDOW})}
                    </ListItemText>
                  </ListItem>
                </If>
              </If>
            </div>
            <ListItem>
              <TextField
                className={classes.textField}
                size={"small"}
                variant={"outlined"}
                label={t("CARTONET.SKILL.ADD")}
                onChange={(event) => {
                  event.persist();
                  throttledQsMyAptitudesOnChange(event);
                }}
                onFocus={() => {
                  setQsMyAptitudes("");
                }}
              />
            </ListItem>

            <If condition={otherSkillsCount === 0 && myAptitudesCount === 0}>
              <Paper variant="outlined" className={classes.empty}>
                {t("CARTONET.SKILL.SEARCH_NONE")}
              </Paper>
            </If>
          </When>
          <Otherwise>
            <Paper variant="outlined" className={classes.empty}>
              {t("CARTONET.EXPERIENCE.PLEASE_SELECT_OCCUPATIONS")}
            </Paper>
          </Otherwise>
        </Choose>
      </List>

      <ListSubheader className={classes.skillsSubHeader}>{t("CARTONET.SKILL.OTHERS")}</ListSubheader>

      <List dense={true}>
        <Choose>
          <When condition={filterByRelatedOccupationIds?.length > 0}>
            <If condition={loadingOtherSkills}>
              <LoadingSplashScreen />
            </If>
            <div className={classes.skillsContainer}>
              {(otherSkills?.edges || []).map(({node: skill}) => renderSkill({skill}))}

              <If condition={otherSkillsCount > SKILLS_WINDOW}>
                <ListItem disabled>
                  <ListItemText>
                    {t("CARTONET.SKILL.MORE_OTHER", {count: otherSkillsCount - SKILLS_WINDOW})}
                  </ListItemText>
                </ListItem>
              </If>
            </div>
            <If condition={otherSkillsCount === 0 && myAptitudesCount === 0}>
              <Paper variant="outlined" className={classes.empty}>
                {t("CARTONET.SKILL.SEARCH_NONE")}
              </Paper>
            </If>
            <ListItem>
              <TextField
                className={classes.textField}
                size={"small"}
                variant={"outlined"}
                label={t("CARTONET.SKILL.ADD")}
                onChange={(event) => {
                  event.persist();
                  throttledQsSkillsOnChange(event);
                }}
                onFocus={() => {
                  setQsSkills("");
                }}
              />
            </ListItem>
          </When>
          <Otherwise>
            <Paper variant="outlined" className={classes.empty}>
              {t("CARTONET.EXPERIENCE.PLEASE_SELECT_OCCUPATIONS")}
            </Paper>
          </Otherwise>
        </Choose>
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
      existingSkills.map((skill) => (
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
      <Paper variant="outlined" className={classes.empty}>
        {t("CARTONET.SKILL.NONE")}
      </Paper>
    );
  }

  function handleSelectSkill(skill) {
    const newAptitudeEdge = {
      node: {
        id: skill.aptitudeId,
        skill
      }
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
