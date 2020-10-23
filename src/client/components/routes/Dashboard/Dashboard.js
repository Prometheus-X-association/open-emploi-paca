import React from "react";
import {useTranslation} from "react-i18next";
import {Grid, ListItemText, Typography} from "@material-ui/core";

import {BlockContainer} from "../../widgets/BlockContainer";
import {makeStyles} from "@material-ui/core/styles";
import ProjectExcerpt from "../Project/ProjectExcerpt";
import {OffersByOccupationWidget} from "../Market/Widget/OffersByOccupationWidget";
import {OffersByJobAreaWidget} from "../Market/Widget/OffersByJobAreaWidget";
import {useQuery} from "@apollo/client";
import {gqlMyProfile} from "../Profile/gql/MyProfile.gql";
import {IncomesByOccupationWidget} from "../Incomes/Widget/IncomesByOccupationWidget";
import {TrainingsByOccupationWidget} from "../Trainings/Widget/TrainingsByOccupationWidget";
import {createLink} from "../../../utilities/createLink";
import {ROUTES} from "../../../routes";

const useStyles = makeStyles(theme => ({}));
/**
 *
 */
export default function Dashboard({children} = {}) {
  const classes = useStyles();
  const {t} = useTranslation();
  const {data: {me} = {}} = useQuery(gqlMyProfile);
  const dashboardReady = (me?.wishedOccupations?.edges || []).length > 0;

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

      <Grid item xs={12} md={6}>
        <BlockContainer title={t("DASHBOARD.MARKET")} expandable>
          <Choose>
            <When condition={dashboardReady}>
              <OffersByOccupationWidget />
            </When>
            <Otherwise>{renderFillYourProjectSuggestion()}</Otherwise>
          </Choose>
        </BlockContainer>
      </Grid>

      <Grid item xs={12} md={6}>
        <BlockContainer title={t("DASHBOARD.INCOMES")} expandable>
          <Choose>
            <When condition={dashboardReady}>
              <IncomesByOccupationWidget />
            </When>
            <Otherwise>{renderFillYourProjectSuggestion()}</Otherwise>
          </Choose>
        </BlockContainer>
      </Grid>

      <Grid item xs={12} md={6}>
        <BlockContainer title={t("DASHBOARD.TRAININGS")} expandable>
          <Choose>
            <When condition={dashboardReady}>
              <TrainingsByOccupationWidget />
            </When>
            <Otherwise>{renderFillYourProjectSuggestion()}</Otherwise>
          </Choose>
        </BlockContainer>
      </Grid>

      <Grid item xs={12} md={6}>
        <BlockContainer title={t("DASHBOARD.SKILLS")} expandable>
          ...
        </BlockContainer>
      </Grid>
    </Grid>
  );

  function renderFillYourProjectSuggestion() {
    return (
      <BlockContainer emptyHint>
        <ListItemText
          className={classes.empty}
          primary={t("PROJECT.WISHED_OCCUPATION.NONE")}
          secondary={createLink({
            to: ROUTES.PROJECT,
            text: t("PROJECT.EDIT")
          })}
        />
      </BlockContainer>
    );
  }
}
