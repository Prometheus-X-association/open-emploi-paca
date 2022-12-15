import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import {useQuery} from "@apollo/client";
import {gqlMyProfile} from "../Profile/gql/MyProfile.gql";
import {Grid, ListItemText, Typography} from "@material-ui/core";
import {createLink} from "../../../utilities/router/createLink";
import {ROUTES} from "../../../routes";
import {BlockContainer} from "../../widgets/BlockContainer";
import {IncomesByOccupationWidget} from "./Widget/IncomesByOccupationWidget";
import {IncomesByJobAreaWidget} from "./Widget/IncomesByJobAreaWidget";

const useStyles = makeStyles(theme => ({
  empty: {
    color: theme.palette.text.emptyHint
  }
}));

/**
 *
 */
export default function Incomes({} = {}) {
  const classes = useStyles();
  const {t} = useTranslation();
  const {data: {me} = {}} = useQuery(gqlMyProfile);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant={"h2"}>{t("INCOMES.TITLE")}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant={"subtitle1"}>{t("INCOMES.TIP_AGGS_OCCUPATIONS")}</Typography>
      </Grid>
      <Grid item container xs={12} spacing={3}>
        <Choose>
          <When condition={me?.wishedJobAreas?.edges?.length > 0}>
            <If condition={me?.jobArea}>
              <Grid item xs={6}>
                <BlockContainer title={me.jobArea.title} expandable>
                  <IncomesByOccupationWidget jobArea={me.jobArea} />
                </BlockContainer>
              </Grid>
            </If>

            {me.wishedJobAreas.edges.map(({node: jobArea}) => (
              <Grid key={jobArea.id} item xs={6}>
                <BlockContainer title={jobArea.title} expandable>
                  <IncomesByOccupationWidget jobArea={jobArea} />
                </BlockContainer>
              </Grid>
            ))}
          </When>
          <Otherwise>
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
          </Otherwise>
        </Choose>
      </Grid>
      <Grid item xs={12}>
        <Typography variant={"subtitle1"}>{t("INCOMES.TIP_AGGS_JOB_AREAS")}</Typography>
      </Grid>
      <Grid item xs={12} container spacing={3}>
        <Choose>
          <When condition={me?.wishedOccupations?.edges?.length > 0}>
            {me.wishedOccupations.edges.map(({node: occupation}) => (
              <Grid key={occupation.id} item xs={6}>
                <BlockContainer title={occupation.prefLabel} expandable>
                  <IncomesByJobAreaWidget occupation={occupation} />
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
                  text: t("PROJECT.EDIT")
                })}
              />
            </BlockContainer>
          </Otherwise>
        </Choose>
      </Grid>
    </Grid>
  );
}
