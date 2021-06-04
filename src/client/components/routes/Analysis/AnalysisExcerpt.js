import {useEffect} from "react";
import clsx from "clsx";
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation, Trans} from "react-i18next";
import {Grid, Typography} from "@material-ui/core";
import {Gauge} from "../../widgets/Gauge";
import {useLazyQuery, useQuery} from "@apollo/client";
import {gqlAnalysis} from "./gql/Analysis.gql";
import {gqlMyProfile} from "../Profile/gql/MyProfile.gql";
import {gqlMyAptitudes} from "../Cartonet/Aptitudes/gql/MyAptitudes.gql";
import {LoadingSplashScreen} from "../../widgets/LoadingSplashScreen";

const useStyles = makeStyles((theme) => ({
  analysisContainer: {
    margin: theme.spacing(2, 0, 3, 0)
  },
  tip: {
    color: theme.palette.text.emptyHint,
    textAlign: "center"
  },
  smallText: {
    fontSize: theme.typography.pxToRem(12)
  },
  analysis: {
    marginTop: theme.spacing(2),
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

  const [analyzeProfile, {data: {analysis} = {}, loading: loadingAnalysis}] = useLazyQuery(gqlAnalysis, {
    fetchPolicy: "no-cache"
  });

  const loading = loadingProfile || loadingAptitudes || loadingAnalysis;

  useEffect(() => {
    if (myProfile && myAptitudes) {
      let jobAreaIds = myProfile.wishedJobAreas.edges.map(({node: {id}}) => id);
      let occupationIds = myProfile.wishedOccupations.edges.map(({node: {id}}) => id);

      if (myProfile.jobArea) {
        jobAreaIds.unshift(myProfile.jobArea.id);
      }

      if (myProfile.occupation) {
        occupationIds.unshift(myProfile.occupation.id);
      }

      analyzeProfile({
        variables: {
          jobAreaIds: jobAreaIds,
          occupationIds: occupationIds,
          skillIds: myAptitudes.aptitudes.edges.map(({node: {id}}) => id)
        }
      });
    }
  }, [myProfile, myAptitudes]);

  const bestAnalysis = analysis?.[0];
  const secondBestAnalysis = analysis?.[1];

  return (
    <Choose>
      <When condition={loading}>
        <LoadingSplashScreen />
      </When>
      <When condition={bestAnalysis}>
        {renderAnalysis({
          analysis: bestAnalysis,
          tip: (
            <Trans
              i18nKey={"ANALYSIS.TIP_BEST"}
              values={{
                jobArea: bestAnalysis?.jobArea.title,
                occupation: bestAnalysis?.occupation.prefLabel
              }}
              components={{
                b: <strong />
              }}
            />
          )
        })}

        <If condition={secondBestAnalysis}>
          {renderAnalysis({
            analysis: secondBestAnalysis,
            tip: (
              <Trans
                i18nKey={"ANALYSIS.TIP_SECOND_BEST"}
                values={{
                  jobArea: secondBestAnalysis?.jobArea.title,
                  occupation: secondBestAnalysis?.occupation.prefLabel
                }}
                components={{
                  b: <strong />
                }}
              />
            ),
            smallGauge: true
          })}
        </If>
      </When>
    </Choose>
  );

  function renderAnalysis({analysis, smallGauge, tip}) {
    const {incomesScore, offersScore, skillsScore, trainingsScore, jobArea, occupation} = analysis || {};

    return (
      <Grid container spacing={2} className={classes.analysisContainer}>
        <Grid item xs={12}>
          <Typography className={clsx(classes.tip)}>{tip}</Typography>
        </Grid>

        <Grid item md={2} xs={6} className={classes.analysis}>
          <Gauge
            disabled={loading}
            value={mapAnalysisResultToScore(offersScore)}
            big={!smallGauge}
            label={t(`ANALYSIS.LABEL.${offersScore || "LOADING"}`)}
          />
          <Typography className={clsx(classes.analysisTitle, {[classes.smallText]: smallGauge})}>
            {t("DASHBOARD.MARKET")}
          </Typography>
        </Grid>
        <Grid item md={2} xs={6} className={classes.analysis}>
          <Gauge
            disabled={loading}
            value={mapAnalysisResultToScore(incomesScore)}
            big={!smallGauge}
            label={t(`ANALYSIS.LABEL.${incomesScore || "LOADING"}`)}
          />
          <Typography className={clsx(classes.analysisTitle, {[classes.smallText]: smallGauge})}>
            {t("DASHBOARD.INCOMES")}
          </Typography>
        </Grid>
        <Grid item md={2} xs={6} className={classes.analysis}>
          <Gauge
            disabled={loading}
            value={mapAnalysisResultToScore(skillsScore)}
            big={!smallGauge}
            label={t(`ANALYSIS.LABEL.${skillsScore || "LOADING"}`)}
          />
          <Typography className={clsx(classes.analysisTitle, {[classes.smallText]: smallGauge})}>
            {t("DASHBOARD.SKILLS")}
          </Typography>
        </Grid>
        <Grid item md={2} xs={6} className={classes.analysis}>
          <Gauge
            disabled={loading}
            value={mapAnalysisResultToScore(trainingsScore)}
            big={!smallGauge}
            label={t(`ANALYSIS.LABEL.${trainingsScore || "LOADING"}`)}
          />
          <Typography className={clsx(classes.analysisTitle, {[classes.smallText]: smallGauge})}>
            {t("DASHBOARD.TRAININGS")}
          </Typography>
        </Grid>
        <Grid item md={2} xs={6} className={classes.analysis}>
          <Gauge disabled big={!smallGauge} value={0} />
          <Typography className={clsx(classes.analysisTitle, {[classes.smallText]: smallGauge})}>
            {t("DASHBOARD.TRANSPORTS")}
          </Typography>
        </Grid>
        <Grid item md={2} xs={6} className={classes.analysis}>
          <Gauge disabled big={!smallGauge} value={0} />
          <Typography className={clsx(classes.analysisTitle, {[classes.smallText]: smallGauge})}>
            {t("DASHBOARD.LIFE")}
          </Typography>
        </Grid>
      </Grid>
    );
  }

  function mapAnalysisResultToScore(result) {
    return (
      {
        ROUGE: 20,
        ORANGE: 40,
        VERT: 80
      }[result] || 0
    );
  }
}
