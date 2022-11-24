import { Fragment, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import { useLazyQuery, useQuery } from "@apollo/client";
import { gqlExhaustiveExperiences } from "../Experience/gql/Experiences.gql";
import { gqlExhautiveAptitudes } from "../Aptitudes/gql/Aptitudes.gql";
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
  Typography,
} from "@material-ui/core";
import HobbyIcon from "@material-ui/icons/BeachAccess";
import TrainingIcon from "@material-ui/icons/School";
import ExperienceIcon from "@material-ui/icons/Work";
import dayjs from "dayjs";
import ArrowIcon from "@material-ui/icons/ArrowRightAlt";
import { Rating } from "@material-ui/lab";
import { gqlMyProfile } from "../../Profile/gql/MyProfile.gql";
import OccupationsMatching from "../OccupationsMatching/OccupationsMatching";
import { useLoggedUser } from "../../../../hooks/useLoggedUser";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "21cm",
    height: "29,7cm",
    margin: "auto",
  },
  experienceAptitudes: {
    paddingLeft: theme.spacing(4),
    paddingTop: 0,
  },
  experienceAptitude: {
    margin: theme.spacing(0.5),
    maxWidth: theme.spacing(50),
    cursor: "pointer",
  },
  aptitudes: {
    marginTop: theme.spacing(2),
  },
  rating: {
    textAlign: "right",
  },
  aptitude: {
    transition: "all 0.5s",
  },
  faded: {
    opacity: 0.1,
  },
  categoryTitle: {
    marginBottom: theme.spacing(2),
  },
  noPrint: {
    "@media print": {
      display: "none",
    },
  },
  forcePrint: {
    colorAdjust: "exact",
    "-webkit-print-color-adjust": "exact",
  },
  top5Chip: {
    height: theme.spacing(2.2),
    fontSize: 12,
    "& > span": {
      padding: theme.spacing(0, 0.8),
    },
  },
}));
/**
 *
 */
export default function PrintProfile({} = {}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const { user } = useLoggedUser();

  const { data: { me: myProfile } = {}, loading: loadingProfile } = useQuery(
    gqlMyProfile
  );

  const [
    loadExperiences,
    { data: { experiences } = {}, loading: loadingExperiences },
  ] = useLazyQuery(gqlExhaustiveExperiences, {
    fetchPolicy: "no-cache",
  });

  const [
    loadAptitudes,
    { data: { aptitudes } = {}, loading: loadingAptitudes },
  ] = useLazyQuery(gqlExhautiveAptitudes, {
    fetchPolicy: "no-cache",
  });

  useEffect(() => {
    if (user) {
      loadExperiences({
        variables: {
          filters: [`hasPerson:${user.id}`],
          exhaustive: true,
        },
      });

      loadAptitudes({
        variables: {
          filters: [`hasPerson:${user.id}`],
          sortings: [
            {
              sortBy: "isTop5",
            },
            {
              sortBy: "skillLabel",
            },
          ],
        },
      });
    }
  }, [user]);

  useEffect(() => {
    if (myProfile && experiences && aptitudes) {
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
                {(experiences?.edges || []).map(({ node: experience }) => (
                  <Fragment key={experience.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <Choose>
                            <When
                              condition={experience.experienceType === "hobby"}
                            >
                              <HobbyIcon className={classes.forcePrint} />
                            </When>
                            <When
                              condition={
                                experience.experienceType === "training"
                              }
                            >
                              <TrainingIcon className={classes.forcePrint} />
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
                          <Grid
                            container
                            direction="row"
                            alignItems="flex-start"
                            spacing={1}
                          >
                            <Grid item>
                              {dayjs(experience.startDate).format("L")}
                            </Grid>
                            <If condition={experience.endDate}>
                              <Grid item>
                                <ArrowIcon fontSize={"small"} />
                              </Grid>
                              <Grid item>
                                {dayjs(experience.endDate).format("L")}
                              </Grid>
                            </If>
                          </Grid>
                        }
                      />
                    </ListItem>
                    <List disablePadding>
                      <ListItem className={classes.experienceAptitudes}>
                        <ListItemText>
                          {experience.aptitudes.edges.map(
                            ({ node: aptitude }) => (
                              <Chip
                                className={classes.experienceAptitude}
                                key={aptitude.id}
                                label={aptitude.skillLabel}
                                variant={"outlined"}
                                size="small"
                              />
                            )
                          )}
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
          <Typography
            variant="button"
            display="block"
            className={classes.categoryTitle}
          >
            {t("CARTONET.CARTOGRAPHY.APTITUDES")}
          </Typography>

          <Choose>
            <When condition={loadingExperiences}>
              <CircularProgress />
            </When>
            <Otherwise>
              <List dense>
                {(aptitudes?.edges || []).map(({ node: aptitude }) => (
                  <ListItem key={aptitude.id}>
                    <ListItemAvatar>
                      <If condition={aptitude.isTop5}>
                        <Chip
                          className={classes.top5Chip}
                          label={"Top5"}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      </If>
                    </ListItemAvatar>
                    <ListItemText>{aptitude.skillLabel}</ListItemText>
                    <ListItemSecondaryAction>
                      <Rating
                        value={aptitude.ratingValue}
                        size={"small"}
                        readOnly
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Otherwise>
          </Choose>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <Typography
          variant="button"
          display="block"
          className={classes.categoryTitle}
        >
          {t("CARTONET.CARTOGRAPHY.SUGGETIONS")}
        </Typography>

        <OccupationsMatching print={true} />
      </Grid>
    </Box>
  );
}
