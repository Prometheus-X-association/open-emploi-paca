import React, {useEffect, useState} from "react";
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import {useQuery} from "@apollo/client";
import {Checkbox, List, ListItem, ListItemIcon, ListItemText, ListSubheader, Divider} from "@material-ui/core";

import {gqlMyProfile} from "../../Profile/gql/MyProfile.gql";
import {Colors} from "./Colors";

const useStyles = makeStyles(theme => ({
  root: {
    width: "100%"
  },
  subheader: {
    lineHeight: "initial",
    fontSize: theme.typography.fontSize * 0.9,
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(1)
  },
  jobArea: {
    padding: 0
  },
  jobAreaText: {
    "& > span": {
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
      overflow: "hidden",
      fontSize: theme.typography.fontSize * 0.9,
      margin: 0
    }
  },
  checkbox: {
    minWidth: 0
  }
}));

/**
 *
 */
export function JobAreasToggler({className, onSelectJobAreaIds = () => []} = {}) {
  const classes = useStyles();
  const {t} = useTranslation();
  const [selectedJobAreaIds, setSelectedJobAreaIds] = useState([]);
  const [jobAreaIds, setJobAreaIds] = useState([]);

  const {data: {me} = {}} = useQuery(gqlMyProfile);

  useEffect(() => {
    if (me && selectedJobAreaIds.length === 0) {
      let jobAreaIds = me.wishedJobAreas.edges.map(({node: jobArea}) => jobArea.id);
      if(me?.jobArea?.id){
        jobAreaIds.unshift(me?.jobArea?.id);
      }
      selectJobAreaIds(jobAreaIds);
      setJobAreaIds(jobAreaIds);
    }
  }, [me]);

  return (
    <List dense className={classes.root}>
      <If condition={me?.jobArea}>
        <ListSubheader className={classes.subheader}>{t("PROFILE.JOB_AREA")}</ListSubheader>
        {renderJobAreaItem({jobArea: me.jobArea, index: 0})}
      </If>
      <If condition={(me?.wishedJobAreas?.edges || []).length > 0}>
        <ListSubheader className={classes.subheader}>{t("PROJECT.WISHED_JOB_AREA.TITLE")}</ListSubheader>
        {me.wishedJobAreas.edges.map(({node: jobArea}, index) =>
          renderJobAreaItem({jobArea, index: index + 1})
        )}
      </If>
    </List>
  );

  function renderJobAreaItem({jobArea, index}) {
    return (
      <ListItem key={jobArea.id} className={classes.jobArea}>
        <ListItemIcon className={classes.checkbox}>
          <Checkbox
            size={"small"}
            edge="start"
            checked={selectedJobAreaIds.includes(jobArea.id)}
            onChange={() => handleSelectJobArea({jobArea, index})}
          />
        </ListItemIcon>
        <ListItemText
          primary={jobArea.title}
          className={classes.jobAreaText}
          style={{color: Colors[index]}}
        />
      </ListItem>
    );
  }

  function handleSelectJobArea({index, jobArea}) {
    const indexOf = selectedJobAreaIds.indexOf(jobArea.id);

    if (indexOf >= 0) {
      selectedJobAreaIds.splice(indexOf, 1);
    } else {
      selectedJobAreaIds.splice(index, 0, jobArea.id);
    }

    selectJobAreaIds([...selectedJobAreaIds]);
  }

  function selectJobAreaIds(selectedJobAreaIds) {
    setSelectedJobAreaIds(selectedJobAreaIds);
    onSelectJobAreaIds(selectedJobAreaIds, jobAreaIds);
  }
}
