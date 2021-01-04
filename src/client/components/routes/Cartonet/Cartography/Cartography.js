import {Fragment, useState} from "react";
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
  CircularProgress
} from "@material-ui/core";
import {Rating} from "@material-ui/lab";
import clsx from "clsx";
import dayjs from "dayjs";
import {generatePath, useHistory, matchPath} from "react-router";
import {useQuery} from "@apollo/client";
import ExperienceIcon from "@material-ui/icons/Work";
import HobbyIcon from "@material-ui/icons/BeachAccess";
import TrainingIcon from "@material-ui/icons/School";
import ArrowIcon from "@material-ui/icons/ArrowRightAlt";
import {createLink} from "../../../../utilities/createLink";
import {ROUTES} from "../../../../routes";

import {gqlMyExperiences} from "../Experience/gql/MyExperiences.gql";
import {gqlMyAptitudes} from "../Aptitudes/gql/MyAptitudes.gql";

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
    transition: "all 0.5s"
  },
  faded: {
    opacity: 0.1
  },
  categoryTitle: {
    marginBottom: theme.spacing(2)
  }
}));

const editLinkMapping = {
  hobby: ROUTES.CARTONET_EDIT_HOBBY,
  training: ROUTES.CARTONET_EDIT_TRAINING,
  experience: ROUTES.CARTONET_EDIT_EXPERIENCE
};

/**
 *
 */
export default function Cartography({} = {}) {
  const classes = useStyles();
  const {t} = useTranslation();
  const history = useHistory();
  const [selectedAptitude, setSelectedAptitude] = useState();

  const {data: {me: myExperiences} = {}, loading: loadingExperiences} = useQuery(gqlMyExperiences, {
    fetchPolicy: "no-cache"
  });
  const {data: {me: myAptitudes} = {}, loading: loadingAptitudes} = useQuery(gqlMyAptitudes, {
    fetchPolicy: "no-cache"
  });

  return (
    <>
      <DialogTitle>{t("CARTONET.CARTOGRAPHY.PAGE_TITLE")}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item md={7}>
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
                          primary={createLink({
                            to: getEditLink({experience}),
                            text: experience.title
                          })}
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
                    </Fragment>
                  ))}
                </List>
              </Otherwise>
            </Choose>
          </Grid>
          <Grid item md={5}>
            <Typography variant={"subtitle1"} variant="button" display="block" className={classes.categoryTitle}>
              {t("CARTONET.CARTOGRAPHY.APTITUDES")}
            </Typography>

            <Choose>
              <When condition={loadingExperiences}>
                <CircularProgress />
              </When>
              <Otherwise>
                {(myAptitudes?.aptitudes?.edges || []).map(({node: aptitude}) => (
                  <Grid
                    key={aptitude.id}
                    container
                    spacing={2}
                    justify={"flex-end"}
                    direction={"row"}
                    className={clsx(classes.aptitude, {
                      [classes.faded]: selectedAptitude && selectedAptitude.id !== aptitude.id
                    })}>
                    <Grid item md={8}>
                      {aptitude.skillLabel}
                    </Grid>
                    <Grid item md={4} className={classes.rating}>
                      <Rating value={aptitude.rating?.value} size={"small"} readOnly />
                    </Grid>
                  </Grid>
                ))}
              </Otherwise>
            </Choose>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => history.goBack()}>{t("ACTIONS.GO_BACK")}</Button>
      </DialogActions>
    </>
  );

  function getEditLink({experience}) {
    let route = editLinkMapping[experience.experienceType] || editLinkMapping.experience;

    if(!!matchPath(history.location.pathname, {path: ROUTES.PROFILE, exact: false, strict: false})){
      route = `${ROUTES.PROFILE}${route}`;
    }

    return generatePath(route, {
      id: experience.id
    });
  }
}
