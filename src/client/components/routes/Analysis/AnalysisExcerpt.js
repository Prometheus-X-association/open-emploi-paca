import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import {Grid, Typography} from "@material-ui/core";
import {Gauge} from "../../widgets/Gauge";

const useStyles = makeStyles(theme => ({
  tip: {
    color: theme.palette.text.emptyHint,
    textAlign: "center",
    marginTop: theme.spacing(4)
  },
  analysis: {
    marginTop: theme.spacing(1),
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  analysisTitle: {
    marginTop: theme.spacing(1),
    color: theme.palette.text.mainBlue
  }
}));

/**
 *
 */
export function AnalysisExcerpt({} = {}) {
  const classes = useStyles();
  const {t} = useTranslation();

  return (
    <>
      <Grid container spacing={2}>
        <Grid item md={2} xs={6} className={classes.analysis}>
          <Gauge value={40} big label={"MOYEN"} />
          <Typography className={classes.analysisTitle}>{t("DASHBOARD.MARKET")}</Typography>
        </Grid>
        <Grid item md={2} xs={6} className={classes.analysis}>
          <Gauge value={80} big label={"BON"} />
          <Typography className={classes.analysisTitle}>{t("DASHBOARD.INCOMES")}</Typography>
        </Grid>
        <Grid item md={2} xs={6} className={classes.analysis}>
          <Gauge value={20} big label={"FAIBLE"} />
          <Typography className={classes.analysisTitle}>{t("DASHBOARD.SKILLS")}</Typography>
        </Grid>
        <Grid item md={2} xs={6} className={classes.analysis}>
          <Gauge value={80} big label={"BON"} />
          <Typography className={classes.analysisTitle}>{t("DASHBOARD.TRAININGS")}</Typography>
        </Grid>
        <Grid item md={2} xs={6} className={classes.analysis}>
          <Gauge disabled big />
          <Typography className={classes.analysisTitle}>{t("DASHBOARD.TRANSPORTS")}</Typography>
        </Grid>
        <Grid item md={2} xs={6} className={classes.analysis}>
          <Gauge disabled big />
          <Typography className={classes.analysisTitle}>{t("DASHBOARD.LIFE")}</Typography>
        </Grid>
      </Grid>
      <Typography className={classes.tip}>{t("ANALYSIS.TIP")}</Typography>
    </>
  );
}
