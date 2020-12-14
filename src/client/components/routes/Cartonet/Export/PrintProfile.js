import { Fragment, useEffect, useState } from "react";
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import {useQuery} from "@apollo/client";
import {gqlMyExperiences} from "../Experience/gql/MyExperiences.gql";
import {gqlMyAptitudes} from "../Aptitudes/gql/MyAptitudes.gql";
import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Typography
} from "@material-ui/core";
import HobbyIcon from "@material-ui/icons/BeachAccess";
import TrainingIcon from "@material-ui/icons/School";
import ExperienceIcon from "@material-ui/icons/Work";
import dayjs from "dayjs";
import ArrowIcon from "@material-ui/icons/ArrowRightAlt";
import {Rating} from "@material-ui/lab";
import {gqlMyProfile} from "../../Profile/gql/MyProfile.gql";
import OccupationsMatching from "../Recommendation/OccupationsMatching";

const useStyles = makeStyles(theme => ({
  root: {
    width: "21cm",
    height: "29,7cm",
    margin: "auto"
  },
  experienceAptitudes: {
    paddingLeft: theme.spacing(4),
    paddingTop: 0
  },
  experienceAptitude: {
    margin: theme.spacing(0.5),
    maxWidth: theme.spacing(50),
    cursor: "pointer"
  },
  aptitudes: {
    marginTop: theme.spacing(2)
  },
  rating: {
    textAlign: "right"
  },
  aptitude: {
    transition: "all 0.5s"
  },
  faded: {
    opacity: 0.1
  },
  categoryTitle: {
    marginBottom: theme.spacing(2)
  },
  noPrint: {
    "@media print": {
      display: "none"
    }
  },
  forcePrint: {
    colorAdjust: "exact",
    "-webkit-print-color-adjust": "exact"
  }
}));
/**
 *
 */
export default function PrintProfile({} = {}) {
  const classes = useStyles();
  const {t} = useTranslation();

  const {data: {me: myProfile} = {}, loading: loadingProfile} = useQuery(gqlMyProfile);

  const {data: {me: myExperiences} = {}, loading: loadingExperiences} = useQuery(gqlMyExperiences, {
    fetchPolicy: "no-cache"
  });
  const {data: {me: myAptitudes} = {}, loading: loadingAptitudes} = useQuery(gqlMyAptitudes, {
    fetchPolicy: "no-cache"
  });

  useEffect(() => {
    if(myProfile && myExperiences && myAptitudes){
      setTimeout(() => {
        window.print();
      }, 400);
    }
  }, [loadingProfile, loadingExperiences, loadingAptitudes]);

  return (
    <Box className={classes.root}>
      <Typography variant="h4" gutterBottom>
        {myProfile?.firstName} {myProfile?.lastName}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="button" display="block" gutterBottom>
            {t("CARTONET.CARTOGRAPHY.EXPERIENCES")}
          </Typography>

          <Choose>
            <When condition={loadingExperiences}>
              <CircularProgress />
            </When>
            <Otherwise>
              <List dense>
                {(myExperiences?.experiences?.edges || []).map(({node: experience}) => (
                  <Fragment key={experience.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <Choose>
                            <When condition={experience.experienceType === "hobby"}>
                              <HobbyIcon className={classes.forcePrint}/>
                            </When>
                            <When condition={experience.experienceType === "training"}>
                              <TrainingIcon className={classes.forcePrint}/>
                            </When>
                            <Otherwise>
                              <ExperienceIcon className={classes.forcePrint} />
                            </Otherwise>
                          </Choose>
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={experience.title}
                        secondary={
                          <Grid container direction="row" alignItems="flex-start" spacing={1}>
                            <Grid item>{dayjs(experience.startDate).format("L")}</Grid>
                            <If condition={experience.endDate}>
                              <Grid item>
                                <ArrowIcon fontSize={"small"} />
                              </Grid>
                              <Grid item>{dayjs(experience.endDate).format("L")}</Grid>
                            </If>
                          </Grid>
                        }
                      />
                    </ListItem>
                    <List disablePadding>
                      <ListItem className={classes.experienceAptitudes}>
                        <ListItemText>
                          {experience.aptitudes.edges.map(({node: aptitude}) => (
                            <Chip
                              className={classes.experienceAptitude}
                              key={aptitude.id}
                              label={aptitude.skillLabel}
                              variant={"outlined"}
                              size="small"
                            />
                          ))}
                        </ListItemText>
                      </ListItem>
                    </List>
                  </Fragment>
                ))}
              </List>
            </Otherwise>
          </Choose>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="button" display="block" className={classes.categoryTitle}>
            {t("CARTONET.CARTOGRAPHY.APTITUDES")}
          </Typography>

          <Choose>
            <When condition={loadingExperiences}>
              <CircularProgress />
            </When>
            <Otherwise>
              <List dense>
                {(myAptitudes?.aptitudes?.edges || []).map(({node: aptitude}) => (
                  <ListItem key={aptitude.id}>
                    <ListItemText>{aptitude.skillLabel}</ListItemText>
                    <ListItemSecondaryAction>
                      <Rating value={aptitude.rating?.value} size={"small"} readOnly />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Otherwise>
          </Choose>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="button" display="block" className={classes.categoryTitle}>
          {t("CARTONET.CARTOGRAPHY.SUGGETIONS")}
        </Typography>

        <OccupationsMatching print={true} />
      </Grid>
    </Box>
  );
}
