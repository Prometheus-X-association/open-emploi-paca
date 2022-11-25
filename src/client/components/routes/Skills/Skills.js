import { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import { Grid, ListItemText, Typography } from "@material-ui/core";
import { useLazyQuery, useQuery } from "@apollo/client";
import { gqlMyProfile } from "../Profile/gql/MyProfile.gql";
import { BlockContainer } from "../../widgets/BlockContainer";
import { TrainingsByJobAreaWidget } from "../Trainings/Widget/TrainingsByJobAreaWidget";
import { createLink } from "../../../utilities/createLink";
import { ROUTES } from "../../../routes";
import {
  OccupationsMatchingWidget,
  useOccupationMatchings,
} from "./Widget/OccupationsMatchingWidget";
import { SkillsMatchingByOccupationWidget } from "./Widget/SkillsMatchingByOccupationWidget";
import { gqlSuggestedOccupationsMatchings } from "../Cartonet/OccupationsMatching/gql/SuggestedOccupationsMatchings.gql";
import { useSuggestedOccupationsMatchings } from "../Cartonet/OccupationsMatching/OccupationsMatching";

const useStyles = makeStyles((theme) => ({}));

/**
 *
 */
export default function Skills({} = {}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const { data: { me } = {} } = useQuery(gqlMyProfile);
  const [occupationMatchings] = useOccupationMatchings();
  const [suggestedOccupationMatchings] = useSuggestedOccupationsMatchings();

  const filteredSuggestedOccupationMatchings = suggestedOccupationMatchings
    .filter(
      (suggestedMatching) =>
        !(occupationMatchings || []).find(
          (occupationMatching) =>
            occupationMatching.occupationId === suggestedMatching.occupationId
        )
    )
    .slice(0, 4);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant={"h2"}>{t("SKILLS.TITLE")}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant={"subtitle1"}>
          {t("SKILLS.TIP_AGGS_OCCUPATIONS")}
        </Typography>
      </Grid>
      <Choose>
        <When condition={me?.wishedOccupations?.edges?.length > 0}>
          {me.wishedOccupations.edges.map(({ node: occupation }) => (
            <Grid key={occupation.id} item xs={6}>
              <BlockContainer title={occupation.prefLabel} expandable>
                <SkillsMatchingByOccupationWidget
                  occupationId={occupation.id}
                />
              </BlockContainer>
            </Grid>
          ))}
        </When>
        <Otherwise>
          <BlockContainer emptyHint>
            <ListItemText
              className={classes.empty}
              primary={t("PROJECT.WISHED_JOB_AREA.NONE")}
              secondary={createLink({
                to: ROUTES.PROJECT,
                text: t("PROJECT.EDIT"),
              })}
            />
          </BlockContainer>
        </Otherwise>
      </Choose>
      <Grid item xs={12}>
        <Typography variant={"subtitle1"}>
          {t("SKILLS.TIP_AGGS_SUGGESTED_OCCUPATIONS")}
        </Typography>
      </Grid>
      <Choose>
        <When condition={filteredSuggestedOccupationMatchings.length > 0}>
          {filteredSuggestedOccupationMatchings.map(
            (filteredSuggestedOccupationMatching) => (
              <Grid
                key={filteredSuggestedOccupationMatching.occupationId}
                item
                xs={6}
              >
                <BlockContainer
                  title={
                    filteredSuggestedOccupationMatching.occupationPrefLabel
                  }
                  expandable
                >
                  <SkillsMatchingByOccupationWidget
                    occupationId={
                      filteredSuggestedOccupationMatching.occupationId
                    }
                  />
                </BlockContainer>
              </Grid>
            )
          )}
        </When>
        <Otherwise>
          <BlockContainer emptyHint>
            <ListItemText
              className={classes.empty}
              primary={t("SKILLS.NO_SUGGESTED_OCCUPATIONS")}
            />
          </BlockContainer>
        </Otherwise>
      </Choose>
    </Grid>
  );
}
