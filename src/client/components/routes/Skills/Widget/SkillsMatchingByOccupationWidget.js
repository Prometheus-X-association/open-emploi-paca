import React, {useEffect, useState} from "react";
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import {useLazyQuery, useQuery} from "@apollo/client";
import {gqlOccupationsMatching} from "../../Cartonet/Recommendation/gql/OccupationsMatching.gql";
import {gqlMyProfile} from "../../Profile/gql/MyProfile.gql";
import {LoadingSplashScreen} from "../../../widgets/LoadingSplashScreen";
import {List, ListItem, ListItemText, ListItemIcon, Typography} from "@material-ui/core";
import {Gauge} from "../../../widgets/Gauge";
import {gqlSkillsMatchingByOccupation} from "./gql/SkillsMatchingByOccupation";

const useStyles = makeStyles(theme => ({
  list: {
    maxHeight: theme.spacing(50),
    overflow: "auto"
  }
}));

/**
 *
 */
export function SkillsMatchingByOccupationWidget({occupationId} = {}) {
  const classes = useStyles();
  const {t} = useTranslation();
  const {data: {me} = {}} = useQuery(gqlMyProfile);
  const [getSkillsMatching, {data, loading}] = useLazyQuery(gqlSkillsMatchingByOccupation, {fetchPolicy: "no-cache"});

  useEffect(() => {
    if (me?.id && occupationId) {
      getSkillsMatching({
        variables: {
          personId: me?.id,
          occupationId
        }
      });
    }
  }, [me]);

  let skillsMatching = JSON.parse(data?.skillsMatchingByOccupation || "[]");

  return (
    <Choose>
      <When condition={loading}>
        <LoadingSplashScreen />
      </When>
      <Otherwise>
        <List dense className={classes.list}>
          {skillsMatching.map(skill => (
            <ListItem key={skill.id}>
              <ListItemIcon>
                <Gauge value={skill.score * 100} />
              </ListItemIcon>
              <ListItemText primary={skill.prefLabel} />
            </ListItem>
          ))}
        </List>
      </Otherwise>
    </Choose>
  );
}
