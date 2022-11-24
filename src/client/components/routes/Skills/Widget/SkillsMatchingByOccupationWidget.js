import { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import { useLazyQuery, useQuery } from "@apollo/client";
import { gqlMyProfile } from "../../Profile/gql/MyProfile.gql";
import { LoadingSplashScreen } from "../../../widgets/LoadingSplashScreen";
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListSubheader,
} from "@material-ui/core";
import { Gauge } from "../../../widgets/Gauge";
import { gqlSkillsMatchingByOccupation } from "./gql/SkillsMatchingByOccupation";

const useStyles = makeStyles((theme) => ({
  list: {
    paddingTop: 0,
    position: "relative",
    maxHeight: theme.spacing(50),
    overflow: "auto",
    background: "white",
  },
}));

/**
 *
 */
export function SkillsMatchingByOccupationWidget({ occupationId } = {}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const { data: { me } = {} } = useQuery(gqlMyProfile);
  const [
    getSkillsMatching,
    { data: { skillsMatchingByOccupation } = {}, loading },
  ] = useLazyQuery(gqlSkillsMatchingByOccupation, { fetchPolicy: "no-cache" });

  useEffect(() => {
    if (me?.id && occupationId) {
      getSkillsMatching({
        variables: {
          personId: me?.id,
          occupationId,
        },
      });
    }
  }, [me]);

  const [mySkillMatchings, otherSkillMatchings] = (
    skillsMatchingByOccupation || []
  ).reduce(
    ([mySkillMatchings, otherSkillMatchings], skillMatching) => {
      if (skillMatching.score > 0) {
        mySkillMatchings.push(skillMatching);
      } else {
        otherSkillMatchings.push(skillMatching);
      }
      return [mySkillMatchings, otherSkillMatchings];
    },
    [[], []]
  );

  return (
    <Choose>
      <When condition={loading}>
        <LoadingSplashScreen />
      </When>
      <Otherwise>
        <List dense className={classes.list}>
          <If condition={mySkillMatchings.length > 0}>
            <ListSubheader>{t("SKILLS.MY_SKILLS")}</ListSubheader>
            {renderSkillMatching(mySkillMatchings)}
          </If>
          <If condition={otherSkillMatchings.length > 0}>
            <ListSubheader>{t("SKILLS.OTHER_SKILLS")}</ListSubheader>
            {renderSkillMatching(otherSkillMatchings)}
          </If>
        </List>
      </Otherwise>
    </Choose>
  );

  function renderSkillMatching(skillsMatching) {
    return skillsMatching.map((skill) => (
      <ListItem key={skill.id}>
        <ListItemIcon>
          <Gauge value={skill.score * 100} />
        </ListItemIcon>
        <ListItemText primary={skill.prefLabel} />
      </ListItem>
    ));
  }
}
