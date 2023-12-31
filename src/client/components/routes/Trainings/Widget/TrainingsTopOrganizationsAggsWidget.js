import { useEffect, useState } from "react";
import {Grid, List, ListItem, ListItemText, ListItemAvatar} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import {useLazyQuery} from "@apollo/client";
import {gqlTrainingsTopOrganizationsAggs} from "./gql/TrainingsAggs.gql";
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
export function TrainingsTopOrganizationsAggsWidget({forcedOccupation, forcedJobArea} = {}) {
  const {t} = useTranslation();
  const classes = useStyles();
  const [occupationId, setOccupationId] = useState(forcedOccupation?.id);
  const [jobAreaId, setJobAreaId] = useState(forcedJobArea?.id);
  const [getTrainingsTopOrganizations, {data: trainingsData}] = useLazyQuery(gqlTrainingsTopOrganizationsAggs);

  useEffect(() => {
    if (occupationId && jobAreaId) {
      getTrainingsTopOrganizations({
        variables: {
          occupationId,
          jobAreaId
        }
      });
    }
  }, [occupationId, jobAreaId]);

  const aggregations = JSON.parse(trainingsData?.trainingsTopOrganizationsAggs || "[]");

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
              <List>
                {aggregations.map(({key: organizationName, doc_count: count}) => (
                  <ListItem key={organizationName}>
                    <ListItemText primary={organizationName} secondary={t("TRAININGS.ORGANIZATION_TRAININGS_COUNT", {count})} />
                  </ListItem>
                ))}
              </List>
            </When>
            <Otherwise>
              <div className={classes.empty}>
                {t("TRAININGS.ORGANIZATION_TRAININGS_EMPTY")}
              </div>
            </Otherwise>
          </Choose>
        </Grid>
      </Grid>
    </>
  )
}
