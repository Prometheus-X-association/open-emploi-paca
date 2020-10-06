import React from "react";
import {useTranslation} from "react-i18next";
import {Grid, Typography} from "@material-ui/core";

import {BlockContainer} from "../../widgets/BlockContainer";
import {makeStyles} from "@material-ui/core/styles";
import ProjectExcerpt from "../Project/ProjectExcerpt";
import {OffersHistogram} from "../Market/OffersHistogram";

const useStyles = makeStyles(theme => ({}));
/**
 *
 */
export default function Dashboard({children} = {}) {
  const classes = useStyles();
  const {t} = useTranslation();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant={"h2"} className={classes.heading}>
          {t("DASHBOARD.YOUR_DASHBOARD")}
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <BlockContainer title={t("DASHBOARD.YOUR_PROJECT")}>
          <ProjectExcerpt />
        </BlockContainer>
      </Grid>

      <Grid item xs={12}>
        <BlockContainer title={t("DASHBOARD.ANALYSIS")}>...</BlockContainer>
      </Grid>

      <Grid item xs={12} md={6}>
        <BlockContainer title={t("DASHBOARD.JOBS")} expandable>
          <OffersHistogram />
        </BlockContainer>
      </Grid>

      <Grid item xs={12} md={6}>
        <BlockContainer title={t("DASHBOARD.INCOMES")} expandable>
          ...
        </BlockContainer>
      </Grid>

      <Grid item xs={12} md={6}>
        <BlockContainer title={t("DASHBOARD.SKILLS")} expandable>
          ...
        </BlockContainer>
      </Grid>

      <Grid item xs={12} md={6}>
        <BlockContainer title={t("DASHBOARD.TRAININGS")} expandable>
          ...
        </BlockContainer>
      </Grid>
    </Grid>
  );
}
