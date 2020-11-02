import React, {useEffect, useState} from "react";
import {Grid, List, ListItem, ListItemText} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import {useLazyQuery} from "@apollo/client";
import {gqlOffersTopOccupationsAggs} from "./gql/OffersAggs.gql";
import {JobAreaSelect} from "../../Dashboard/Widget/JobAreaSelect";
import {LoadingSplashScreen} from "../../../widgets/LoadingSplashScreen";

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
export function OffersTopOccupationsAggsWidget({forcedJobArea} = {}) {
  const {t} = useTranslation();
  const classes = useStyles();
  const [jobAreaId, setJobAreaId] = useState(forcedJobArea?.id);
  const [getOffersTopOccupations, {data: offersData, loading}] = useLazyQuery(gqlOffersTopOccupationsAggs);

  useEffect(() => {
    if (jobAreaId) {
      getOffersTopOccupations({
        variables: {
          jobAreaId
        }
      });
    }
  }, [jobAreaId]);

  const aggregations = JSON.parse(offersData?.offersTopOccupationsAggs || "[]");

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <JobAreaSelect onSelectJobAreaId={setJobAreaId}/>
        </Grid>
        <Grid item xs={12}>
          <Choose>
            <When condition={loading}>
              <LoadingSplashScreen />
            </When>
            <When condition={aggregations.length > 0}>
              <List dense>
                {aggregations.map(({key, prefLabel, doc_count: count}) => (
                  <ListItem key={key}>
                    <ListItemText primary={prefLabel} secondary={t("MARKET.OCCUPATIONS_COUNT", {count})} />
                  </ListItem>
                ))}
              </List>
            </When>
            <Otherwise>
              <div className={classes.empty}>
                {t("MARKET.OCCUPATIONS_EMPTY")}
              </div>
            </Otherwise>
          </Choose>
        </Grid>
      </Grid>
    </>
  )
}
