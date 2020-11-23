import React, {useEffect} from "react";
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import {Grid, Typography} from "@material-ui/core";
import {Gauge} from "../../widgets/Gauge";
import {useLazyQuery, useQuery} from "@apollo/client";
import {gqlAnalysis} from "./gql/Analysis.gql";
import {gqlMyProfile} from "../Profile/gql/MyProfile.gql";
import {gqlMyAptitudes} from "../Cartonet/Aptitudes/gql/MyAptitudes.gql";

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
  const {data: {me: myProfile} = {}, loading: loadingProfile} = useQuery(gqlMyProfile);
  const {data: {me: myAptitudes} = {}, loading: loadingAptitudes} = useQuery(gqlMyAptitudes, {variables: {first: 30}});

  const [
    analyzeProfile,
    {data: {analyzeOffers, analyzeIncomes, analyzeTrainings, analyzeSkills} = {}, loading: loadingAnalysis}
  ] = useLazyQuery(gqlAnalysis, {
    fetchPolicy: "no-cache"
  });

  const loading = loadingProfile || loadingAptitudes || loadingAnalysis;

  useEffect(() => {
    if (myProfile && myAptitudes) {
      analyzeProfile({
        variables: {
          jobAreaIds: myProfile.wishedJobAreas.edges.map(({node: {id}}) => id),
          occupationIds: myProfile.wishedOccupations.edges.map(({node: {id}}) => id),
          skillIds: myAptitudes.aptitudes.edges.map(({node: {id}}) => id)
        }
      });
    }
  }, [myProfile, myAptitudes]);

  return (
    <>
      <Grid container spacing={2}>
        <Grid item md={2} xs={6} className={classes.analysis}>
          <Gauge disabled={loading} value={mapAnalysisResultToScore(analyzeOffers)} big label={t(`ANALYSIS.LABEL.${analyzeOffers || "LOADING"}`)} />
          <Typography className={classes.analysisTitle}>{t("DASHBOARD.MARKET")}</Typography>
        </Grid>
        <Grid item md={2} xs={6} className={classes.analysis}>
          <Gauge disabled={loading} value={mapAnalysisResultToScore(analyzeIncomes)} big label={t(`ANALYSIS.LABEL.${analyzeIncomes || "LOADING"}`)} />
          <Typography className={classes.analysisTitle}>{t("DASHBOARD.INCOMES")}</Typography>
        </Grid>
        <Grid item md={2} xs={6} className={classes.analysis}>
          <Gauge disabled={loading} value={mapAnalysisResultToScore(analyzeSkills)} big label={t(`ANALYSIS.LABEL.${analyzeSkills || "LOADING"}`)} />
          <Typography className={classes.analysisTitle}>{t("DASHBOARD.SKILLS")}</Typography>
        </Grid>
        <Grid item md={2} xs={6} className={classes.analysis}>
          <Gauge disabled={loading} value={mapAnalysisResultToScore(analyzeTrainings)} big label={t(`ANALYSIS.LABEL.${analyzeTrainings || "LOADING"}`)} />
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

  function mapAnalysisResultToScore(result){
    return ({
      "ROUGE": 20,
      "ORANGE": 40,
      "VERT": 80
    })[result] || 0;
  }
}
