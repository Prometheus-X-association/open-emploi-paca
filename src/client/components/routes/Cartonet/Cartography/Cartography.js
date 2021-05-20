import {useState} from "react";
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Chip,
  Typography,
  CircularProgress
} from "@material-ui/core";
import {Rating} from "@material-ui/lab";
import clsx from "clsx";
import {useHistory} from "react-router";
import {useQuery} from "@apollo/client";
import {ROUTES} from "../../../../routes";

import {gqlMyAptitudes} from "../Aptitudes/gql/MyAptitudes.gql";
import Experiences from "./Experiences";

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
  },
  top5Chip: {
    height: theme.spacing(2),
    fontSize: 10,
    "& > span": {
      padding: theme.spacing(0, 0.5)
    }
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

  const {data: {me: myAptitudes} = {}, loading: loadingAptitudes} = useQuery(gqlMyAptitudes, {
    fetchPolicy: "no-cache",
    variables: {
      sortings: [
        {
          sortBy: "ratingValue",
          isSortDescending: true
        },
        {
          sortBy: "isTop5"
        }
      ]
    }
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

            <Experiences
              selectedAptitude={selectedAptitude}
              onAptitudeMouseEnter={setSelectedAptitude}
              onAptitudeMouseLeave={() => setSelectedAptitude(null)}
            />
          </Grid>
          <Grid item md={5}>
            <Typography variant={"subtitle1"} display="block" className={classes.categoryTitle}>
              {t("CARTONET.CARTOGRAPHY.APTITUDES")}
            </Typography>

            <Choose>
              <When condition={loadingAptitudes}>
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
                      [classes.faded]: selectedAptitude && selectedAptitude?.id !== aptitude.id
                    })}>
                    <Grid item md={1}>
                      <If condition={aptitude.isTop5}>
                        <Chip
                          className={classes.top5Chip}
                          label={"Top5"}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      </If>
                    </Grid>
                    <Grid item md={7}>
                      {aptitude.skillLabel || aptitude.skill?.prefLabel}
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
}
