import {makeStyles} from "@material-ui/core/styles";
import {ChevronRight as ChevronRightIcon} from "@material-ui/icons";
import {useTranslation} from "react-i18next";
import {DialogActions, DialogContent, DialogTitle, Grid, Paper, Tab, Tabs, Typography} from "@material-ui/core";
import {createLink} from "../../../utilities/createLink";
import {ROUTES} from "../../../routes";
import {generatePath, matchPath, useHistory} from "react-router";
import {generateCartonetPath} from "./utils/generateCartonetPath";
import clsx from "clsx";
import {useEffect, useState} from "react";

const useStyles = makeStyles((theme) => ({
  step: {
    fontSize: theme.typography.fontSize * 1.8,
    lineHeight: "initial",
    width: 160
  },
  chevron: {
    fontSize: theme.typography.fontSize * 7
  },
  content: {
    marginTop: theme.spacing(4),
    height: "60vh",
    overflow: "hidden"
  },
  stepActive: {
    textDecoration: "underline"
  },
  title: {
    padding: theme.spacing(2)
  },
  dialogContent: {
    position: "relative"
  },
  tabs: {
    marginBottom: theme.spacing(-4)
  },
  "@media print": {
    content: {
      overflow: "auto"
    }
  }
}));

/**
 *
 */
export function CartonetExploreLayout({title, children, actions} = {}) {
  const classes = useStyles();
  const {t} = useTranslation();
  const history = useHistory();
  const [tabValue, setTabValue] = useState("show_profile");

  const showProfilePath = generateCartonetPath({history, route: ROUTES.CARTONET_SHOW_PROFILE});
  const showJobsPath = generateCartonetPath({history, route: ROUTES.CARTONET_SHOW_JOBS});

  useEffect(() => {
    setTabValue(matchPath(history.location.pathname, showJobsPath) ? "show_jobs" : "show_profile");
  }, [history.location]);

  return (
    <>
      <DialogTitle>{t("CARTONET.EXPLORE_TITLE")}</DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <div>
          <p>La cartographie de compétences vous permet d’avoir une vue globale de votre profil de compétences.</p>
          <p>
            Les métiers qui vous sont suggérés sont ceux qui sont le plus en adéquation avec les compétences que vous
            avez sélectionnées au travers de vos expériences et valorisées. A cet effet, la valorisation de vos
            compétences (1 à 5 étoiles) ainsi que la sélection de votre Top 5 ont un impact direct sur les métiers qui
            vous sont suggérés.
          </p>
        </div>

        <Tabs value={tabValue} className={classes.tabs} onChange={(e, tabValue) => handleNavigateTo(tabValue)}>
          <Tab value={"show_profile"} label={t(`CARTONET.CARTOGRAPHY.PAGE_TITLE`)} />
          <Tab value={"show_jobs"} label={t(`CARTONET.OCCUPATION_MATCHING.PAGE_TITLE`)} />
        </Tabs>

        <Paper variant={"outlined"} className={classes.content}>
          <Grid container wrap={"nowrap"} direction={"column"} style={{height: "100%", overflow: "hidden"}}>
            <If condition={title}>
              <Grid item className={classes.title}>
                <Typography variant={"h5"}>{title}</Typography>
              </Grid>
            </If>
            <Grid xs item style={{overflow: "hidden"}}>
              {children}
            </Grid>
          </Grid>
        </Paper>
      </DialogContent>
      <If condition={actions}>
        <DialogActions>{actions}</DialogActions>
      </If>
    </>
  );

  function handleNavigateTo(tabValue) {
    history.push(
      generateCartonetPath({
        history,
        route: ROUTES[`CARTONET_${tabValue.toUpperCase()}`]
      })
    );
    // setTabValue(tabValue);
  }
}
