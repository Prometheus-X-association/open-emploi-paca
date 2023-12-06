import { useEffect, useState } from "react";
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
  occupation: {
    padding: 0
  },
  occupationText: {
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
export function OccupationsToggler({className, onSelectOccupationIds = () => []} = {}) {
  const classes = useStyles();
  const {t} = useTranslation();
  const [selectedOccupationIds, setSelectedOccupationIds] = useState([]);
  const [occupationIds, setOccupationIds] = useState([]);

  const {data: {me} = {}} = useQuery(gqlMyProfile);

  useEffect(() => {
    if (me && selectedOccupationIds.length === 0) {
      let occupationIds = me.wishedOccupations.edges.map(({node: occupation}) => occupation.id);
      if(me.occupation?.id){
        occupationIds.unshift(me.occupation.id);
      }

      if(me.spouseOccupation?.id) {
        occupationIds.push(me.spouseOccupation.id);
      }

      setOccupationIds(occupationIds);
    }
  }, [me]);

  useEffect(() => {
    if (me && occupationIds.length > 0) {
      let selectedOccupationIds = [...occupationIds];

      if (me.spouseOccupation?.id) {
        selectedOccupationIds.pop();
      }

      selectOccupationIds(selectedOccupationIds);
    }
  }, [occupationIds])

  return (
    <List dense className={classes.root}>
      <If condition={me?.occupation}>
        <ListSubheader disableSticky className={classes.subheader}>{t("PROFILE.OCCUPATION")}</ListSubheader>
        {renderOccupationItem({occupation: me.occupation, index: 0})}
      </If>
      <If condition={(me?.wishedOccupations?.edges || []).length > 0}>
        <ListSubheader disableSticky className={classes.subheader}>{t("PROJECT.WISHED_OCCUPATION.TITLE")}</ListSubheader>
        {me.wishedOccupations.edges.map(({node: occupation}, index) =>
          renderOccupationItem({occupation, index: index + 1})
        )}
      </If>
      <If condition={me?.spouseOccupation}>
        <ListSubheader disableSticky className={classes.subheader}>{t("PROFILE.SPOUSE_OCCUPATION")}</ListSubheader>
        {renderOccupationItem({occupation: me.spouseOccupation, index: (me?.wishedOccupations?.edges || []).length + 1})}
      </If>
    </List>
  );

  function renderOccupationItem({occupation, index}) {
    return (
      <ListItem key={occupation.id} className={classes.occupation}>
        <ListItemIcon className={classes.checkbox}>
          <Checkbox
            size={"small"}
            edge="start"
            checked={selectedOccupationIds.includes(occupation.id)}
            onChange={() => handleSelectOccupation({occupation, index})}
          />
        </ListItemIcon>
        <ListItemText
          primary={occupation.prefLabel}
          className={classes.occupationText}
          style={{color: Colors[index]}}
        />
      </ListItem>
    );
  }

  function handleSelectOccupation({index, occupation}) {
    const indexOf = selectedOccupationIds.indexOf(occupation.id);

    if (indexOf >= 0) {
      selectedOccupationIds.splice(indexOf, 1);
    } else {
      selectedOccupationIds.splice(index, 0, occupation.id);
    }

    selectOccupationIds([...selectedOccupationIds]);
  }

  function selectOccupationIds(selectedOccupationIds) {
    setSelectedOccupationIds(selectedOccupationIds);
    onSelectOccupationIds([occupationIds, selectedOccupationIds]);
  }
}
