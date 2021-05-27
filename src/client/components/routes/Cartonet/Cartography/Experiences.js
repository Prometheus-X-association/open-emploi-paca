import {Fragment} from "react";
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import {List, ListItem, ListItemAvatar, Avatar, ListItemText, Grid, Chip, CircularProgress} from "@material-ui/core";
import dayjs from "dayjs";
import {generatePath, useHistory, matchPath} from "react-router";
import {useQuery} from "@apollo/client";
import ExperienceIcon from "@material-ui/icons/Work";
import HobbyIcon from "@material-ui/icons/BeachAccess";
import TrainingIcon from "@material-ui/icons/School";
import ArrowIcon from "@material-ui/icons/ArrowRightAlt";
import {createLink} from "../../../../utilities/createLink";

import {gqlMyExperiences} from "../Experience/gql/MyExperiences.gql";
import {generateCartonetEditExperiencePath} from "../utils/generateCartonetPath";

const useStyles = makeStyles(theme => ({
  experience: {
    breakInside: "avoid"
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
  top5Chip: {
    height: theme.spacing(2),
    fontSize: 10,
    "& > span": {
      padding: theme.spacing(0, 0.5)
    }
  }
}));

export function ExperienceItem({
  experience,
  onAptitudeMouseEnter = () => {},
  onAptitudeMouseLeave = () => {},
  selectedAptitude,
  aptitudesDisabled = false
}) {
  const classes = useStyles();
  const history = useHistory();

  return (
    <Fragment key={experience.id}>
      <ListItem className={classes.experience}>
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
            to: generateCartonetEditExperiencePath({history, experience}),
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
      <If condition={!aptitudesDisabled}>
        <List disablePadding>
          <ListItem className={classes.experienceAptitudes}>
            <ListItemText>
              {experience.aptitudes.edges.map(({node: aptitude}) => (
                <Chip
                  className={classes.experienceAptitude}
                  key={aptitude.id}
                  label={aptitude.skillLabel || aptitude.skill?.prefLabel}
                  variant={selectedAptitude && selectedAptitude?.id === aptitude.id ? "default" : "outlined"}
                  size="small"
                  onMouseEnter={() => onAptitudeMouseEnter(aptitude)}
                  onMouseLeave={() => onAptitudeMouseLeave(null)}
                />
              ))}
            </ListItemText>
          </ListItem>
        </List>
      </If>
    </Fragment>
  );
}

/**
 *
 */
export default function Experiences({
  aptitudesDisabled,
  selectedAptitude,
  onAptitudeMouseEnter,
  onAptitudeMouseLeave,
  experienceType
} = {}) {
  const {t} = useTranslation();

  const {data: {me: myExperiences} = {}, loading: loadingExperiences} = useQuery(gqlMyExperiences, {
    variables: {
      filters: experienceType ? [`experienceType:${experienceType}`] : null
    }
  });

  return (
    <Choose>
      <When condition={loadingExperiences}>
        <CircularProgress />
      </When>
      <Otherwise>
        <List dense>
          {(myExperiences?.experiences?.edges || []).map(({node: experience}) => (
            <ExperienceItem
              key={experience.id}
              experience={experience}
              aptitudesDisabled={aptitudesDisabled}
              selectedAptitude={selectedAptitude}
              onAptitudeMouseEnter={onAptitudeMouseEnter}
              onAptitudeMouseLeave={onAptitudeMouseLeave}
            />
          ))}
          <If condition={(myExperiences?.experiences?.edges || []).length === 0}>
            <ListItem disabled>
              <ListItemText
                primary={t("CARTONET.CARTOGRAPHY.NO_EXPERIENCE")}
                secondary={t("CARTONET.CARTOGRAPHY.NO_EXPERIENCE_ADVISE")}
              />
            </ListItem>
          </If>
        </List>
      </Otherwise>
    </Choose>
  );
}
