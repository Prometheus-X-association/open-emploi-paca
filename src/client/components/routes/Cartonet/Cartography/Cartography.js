import React, {useState} from "react";
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Grid,
  Chip,
  Typography,
} from "@material-ui/core";
import {Rating} from "@material-ui/lab";

import ExperienceIcon from "@material-ui/icons/Work";
import HobbyIcon from "@material-ui/icons/BeachAccess";
import TrainingIcon from "@material-ui/icons/School";
import ArrowIcon from "@material-ui/icons/ArrowRightAlt";

import {useHistory} from "react-router";
import {useQuery} from "@apollo/client";
import {gqlMyExperiences} from "../Experience/gql/MyExperiences.gql";
import dayjs from "dayjs";
import {gqlMyAptitudes} from "../Aptitudes/gql/MyAptitudes.gql";
import clsx from "clsx";

const useStyles = makeStyles(theme => ({
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
    transition: "all 0.5s",
  },
  faded:{
    opacity: 0.1
  },
  categoryTitle:{
    marginBottom: theme.spacing(2)
  }
}));

/**
 *
 */
export default function Cartography({} = {}) {
  const classes = useStyles();
  const {t} = useTranslation();
  const history = useHistory();
  const [selectedAptitude, setSelectedAptitude] = useState();

  const {data: {me: myExperiences} = {}} = useQuery(gqlMyExperiences);
  const {data: {me: myAptitudes} = {}} = useQuery(gqlMyAptitudes);

  return (
    <>
      <DialogTitle>{t("CARTONET.CARTOGRAPHY.PAGE_TITLE")}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item md={7}>
            <Typography variant="button" display="block" gutterBottom>{t("CARTONET.CARTOGRAPHY.EXPERIENCES")}</Typography>
            <List dense>
              {(myExperiences?.experiences?.edges || []).map(({node: experience}) => (
                <React.Fragment key={experience.id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <Choose>
                          <When condition={experience.experienceType === "hobby"}>
                            <HobbyIcon />
                          </When>
                          <When condition={experience.experienceType === "training"}>
                            <TrainingIcon />
                          </When>
                          <Otherwise>
                            <ExperienceIcon />
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
                            variant={selectedAptitude?.id === aptitude.id ? "default" : "outlined"}
                            size="small"
                            onMouseEnter={() => setSelectedAptitude(aptitude)}
                            onMouseLeave={() => setSelectedAptitude(null)}
                          />
                        ))}
                      </ListItemText>
                    </ListItem>
                  </List>
                </React.Fragment>
              ))}
            </List>
          </Grid>
          <Grid item md={5}>
            <Typography variant={"subtitle1"} variant="button" display="block" className={classes.categoryTitle}>
              {t("CARTONET.CARTOGRAPHY.APTITUDES")}
            </Typography>

            {(myAptitudes?.aptitudes?.edges || []).map(({node: aptitude}) => (
              <Grid key={aptitude.id} container spacing={2} justify={"flex-end"} direction={"row"} className={clsx(classes.aptitude, {[classes.faded]: selectedAptitude && selectedAptitude.id !== aptitude.id})}>
                <Grid item md={8}>
                  {aptitude.skillLabel}
                </Grid>
                <Grid item md={4} className={classes.rating}>
                  <Rating value={aptitude.rating?.value} size={"small"} readOnly />
                </Grid>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => history.goBack()}>{t("ACTIONS.GO_BACK")}</Button>
      </DialogActions>
    </>
  );
}
