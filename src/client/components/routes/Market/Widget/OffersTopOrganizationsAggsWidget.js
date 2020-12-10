import { useEffect, useState } from "react";
import {Grid, List, ListItem, ListItemText, ListItemAvatar} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import {useLazyQuery} from "@apollo/client";
import {gqlOffersTopOrganizationsAggs} from "./gql/OffersAggs.gql";
import {JobAreaSelect} from "../../Dashboard/Widget/JobAreaSelect";
import {OccupationSelect} from "../../Dashboard/Widget/OccupationSelect";

const useStyles = makeStyles(theme => ({
  empty: {
    color: theme.palette.text.emptyHint,
    padding: theme.spacing(10, 0),
    textAlign: "center"
  }
}));

/**
 *
 */
export function OffersTopOrganizationsAggsWidget({forcedOccupation, forcedJobArea} = {}) {
  const {t} = useTranslation();
  const classes = useStyles();
  const [occupationId, setOccupationId] = useState(forcedOccupation?.id);
  const [jobAreaId, setJobAreaId] = useState(forcedJobArea?.id);
  const [getOffersTopOrganizations, {data: offersData}] = useLazyQuery(gqlOffersTopOrganizationsAggs);

  useEffect(() => {
    if (occupationId && jobAreaId) {
      getOffersTopOrganizations({
        variables: {
          occupationId,
          jobAreaId
        }
      });
    }
  }, [occupationId, jobAreaId]);

  const aggregations = JSON.parse(offersData?.offersTopOrganizationsAggs || "[]");

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <OccupationSelect onSelectOccupationId={setOccupationId}/>
        </Grid>
        <Grid item xs={6}>
          <JobAreaSelect onSelectJobAreaId={setJobAreaId}/>
        </Grid>
        <Grid item xs={12}>
          <Choose>
            <When condition={aggregations.length > 0}>
              <List dense>
                {aggregations.map(({key: organizationName, doc_count: count}) => (
                  <ListItem key={organizationName}>
                    <ListItemText primary={organizationName} secondary={t("MARKET.ORGANIZATION_OFFERS_COUNT", {count})} />
                  </ListItem>
                ))}
              </List>
            </When>
            <Otherwise>
              <div className={classes.empty}>
                {t("MARKET.ORGANIZATION_OFFERS_EMPTY")}
              </div>
            </Otherwise>
          </Choose>
        </Grid>
      </Grid>
    </>
  )
}
