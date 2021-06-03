import {useCallback, useRef, useState} from "react";
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import {Button, Grid, Chip, Typography, CircularProgress} from "@material-ui/core";
import {Rating} from "@material-ui/lab";
import clsx from "clsx";
import {useHistory} from "react-router";
import {useQuery} from "@apollo/client";
import {ROUTES} from "../../../../routes";

import {gqlMyAptitudes} from "../Aptitudes/gql/MyAptitudes.gql";
import Experiences from "./Experiences";
import {CartonetExploreLayout} from "../CartonetExploreLayout";
import {Link} from "react-router-dom";
import {generateCartonetPath} from "../utils/generateCartonetPath";
import {useReactToPrint} from "react-to-print";
import {Print as PrintIcon} from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  root: {
    position: "relative"
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
    transition: "all 0.5s",
    marginBottom: theme.spacing(0.5),
    width: "100%",
    breakInside: "avoid"
  },
  aptitudeLabel: {
    breakInside: "avoid",
    paddingLeft: theme.spacing(1)
  },
  faded: {
    opacity: 0.1
  },
  top5Chip: {
    height: theme.spacing(2),
    fontSize: 10,
    "& > span": {
      padding: theme.spacing(0, 0.5)
    }
  },
  column: {
    padding: theme.spacing(2, 2, 0, 2),
    "&:first-of-type": {
      borderRight: `1px solid ${theme.palette.grey[200]}`
    }
  },
  overflowScrollable: {
    overflow: "auto",
    height: "100%"
  },
  overflowHidden: {
    overflow: "hidden",
    height: "100%"
  },
  printButton: {
    position: "absolute",
    top: theme.spacing(2),
    right: theme.spacing(2),
    zIndex: 100
  },
  "@media print": {
    cartography: {
      margin: "auto",
      padding: theme.spacing(2)
    },
    overflowHidden: {
      height: "auto",
      overflow: "visible"
    },
    overflowScrollable: {
      overflow: "visible"
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

  const componentRef = useRef(null);

  const reactToPrintContent = useCallback(() => {
    return componentRef.current;
  }, [componentRef.current]);

  const handlePrint = useReactToPrint({
    content: reactToPrintContent,
    documentTitle: t("CARTONET.OCCUPATION_MATCHING.PAGE_TITLE"),
    onBeforeGetContent: () => {},
    onBeforePrint: () => {},
    onAfterPrint: () => {},
    removeAfterPrint: true
  });

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
    <CartonetExploreLayout
      actions={
        <Button
          variant={"contained"}
          component={Link}
          to={generateCartonetPath({history, route: ROUTES.CARTONET_EDIT_EXPERIENCE})}>
          {t("ACTIONS.UPDATE")}
        </Button>
      }>
      <div className={clsx(classes.root, classes.overflowHidden)}>
        <Button
          className={classes.printButton}
          onClick={handlePrint}
          endIcon={<PrintIcon />}
          disabled={loadingAptitudes}>
          {t("CARTONET.ACTIONS.PRINT")}
        </Button>
        <Grid
          container
          className={clsx(classes.cartography, classes.overflowHidden)}
          ref={componentRef}
          direction={"column"}
          wrap={"nowrap"}>
          <Grid container item style={{flexBasis: 0}}>
            <Grid item xs={5} className={classes.column}>
              <Typography variant={"h6"} display="block" className={classes.categoryTitle}>
                {t("CARTONET.CARTOGRAPHY.EXPERIENCES")}
              </Typography>
            </Grid>

            <Grid item xs={7} className={classes.column}>
              <Typography variant={"h6"} display="block" className={classes.categoryTitle}>
                {t("CARTONET.CARTOGRAPHY.APTITUDES")}
              </Typography>
            </Grid>
          </Grid>
          <Grid container item xs className={classes.overflowHidden}>
            <Grid item xs={5} className={clsx(classes.column, classes.overflowScrollable)}>
              <Experiences
                selectedAptitude={selectedAptitude}
                onAptitudeMouseEnter={setSelectedAptitude}
                onAptitudeMouseLeave={() => setSelectedAptitude(null)}
              />
            </Grid>
            <Grid item xs={7} className={clsx(classes.column, classes.overflowScrollable)}>
              <Choose>
                <When condition={loadingAptitudes}>
                  <CircularProgress />
                </When>
                <Otherwise>
                  {(myAptitudes?.aptitudes?.edges || []).map(({node: aptitude}) => (
                    <Grid
                      key={aptitude.id}
                      container
                      direction={"row"}
                      className={clsx(classes.aptitude, {
                        [classes.faded]: selectedAptitude && selectedAptitude?.id !== aptitude.id
                      })}
                      wrap={"nowrap"}>
                      <Grid item xs={1}>
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
                      <Grid item xs={6} className={classes.aptitudeLabel}>
                        {aptitude.skillLabel || aptitude.skill?.prefLabel}
                      </Grid>
                      <Grid item xs={5} className={classes.rating} container justify={"flex-end"}>
                        <Rating value={aptitude.rating?.value} size={"small"} readOnly />
                      </Grid>
                    </Grid>
                  ))}
                </Otherwise>
              </Choose>
            </Grid>
          </Grid>
        </Grid>
      </div>
    </CartonetExploreLayout>
  );
}
