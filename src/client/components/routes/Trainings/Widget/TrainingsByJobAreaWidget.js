import React, {useEffect, useState} from "react";
import {CircularProgress, Select, MenuItem, Grid} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import {useLazyQuery, useQuery} from "@apollo/client";
import {gqlTrainingsByJobAreaAggs} from "./gql/TrainingsAggs.gql";
import {LineChart, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip} from "recharts";
import {JobAreasToggler} from "../../Dashboard/Widget/JobAreasToggler";
import {Colors} from "../../Dashboard/Widget/Colors";
import {JobAreaSelect} from "../../Dashboard/Widget/JobAreaSelect";
import {OccupationSelect} from "../../Dashboard/Widget/OccupationSelect";
import {ChartWidget} from "../../Dashboard/Widget/ChartWidget";

const useStyles = makeStyles(theme => ({
  jobAreaSelector: {
    width: "100%",
    margin: theme.spacing(2, 0)
  }
}));

/**
 *
 */
export function TrainingsByJobAreaWidget({occupation: forcedOccupation} = {}) {
  const {t} = useTranslation();
  const [occupationId, setOccupationId] = useState(forcedOccupation?.id);
  const [[jobAreaIds, selectedJobAreaIds], setJobAreasIds] = useState([[], []]);
  const [getTrainingsAggs, {data: trainingsData}] = useLazyQuery(gqlTrainingsByJobAreaAggs);

  useEffect(() => {
    if (occupationId && jobAreaIds.length > 0) {
      getTrainingsAggs({
        variables: {
          jobAreaIds,
          occupationId
        }
      });
    }
  }, [jobAreaIds]);

  return (
    <>
      <Grid container>
        <If condition={!forcedOccupation}>
          <Grid item xs={12}>
            <OccupationSelect onSelectOccupationId={setOccupationId} />
          </Grid>
        </If>
        <Grid item xs={4}>
          <JobAreasToggler onSelectJobAreaIds={setJobAreasIds} />
        </Grid>
        <Grid item xs={8}>
          <Choose>
            <When condition={trainingsData}>
              <ChartWidget
                data={JSON.parse(trainingsData?.trainingsByJobAreaAggs || "[]")}
                yAxisKeys={jobAreaIds}
                yAxisVisibleKeys={selectedJobAreaIds}
                type={"bar"}
              />
            </When>
            <Otherwise>
              <CircularProgress />
            </Otherwise>
          </Choose>
        </Grid>
      </Grid>
    </>
  );
}
