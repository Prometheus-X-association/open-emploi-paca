import { useEffect, useState } from "react";
import {CircularProgress, Select, MenuItem, Grid} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import {useLazyQuery, useQuery} from "@apollo/client";
import {gqlTrainingsByOccupationAggs} from "./gql/TrainingsAggs.gql";
import {LineChart, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip} from "recharts";
import {JobAreaSelect} from "../../Dashboard/Widget/JobAreaSelect";
import {OccupationsToggler} from "../../Dashboard/Widget/OccupationsToggler";
import {Colors} from "../../Dashboard/Widget/Colors";
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
export function TrainingsByOccupationWidget({jobArea: forcedJobArea} = {}) {
  const {t} = useTranslation();
  const [jobAreaId, setJobAreaId] = useState(forcedJobArea?.id);
  const [[occupationIds, selectedOccupationIds], setOccupationsIds] = useState([[], []]);
  const [getTrainingsAggs, {data: trainingsData}] = useLazyQuery(gqlTrainingsByOccupationAggs);

  useEffect(() => {
    if (jobAreaId && occupationIds.length > 0) {
      getTrainingsAggs({
        variables: {
          jobAreaId: jobAreaId,
          occupationIds: occupationIds
        }
      });
    }
  }, [jobAreaId, occupationIds]);

  return (
    <>
      <Grid container>
        <If condition={!forcedJobArea}>
          <Grid item xs={12}>
            <JobAreaSelect onSelectJobAreaId={setJobAreaId}/>
          </Grid>
        </If>
        <Grid item xs={4}>
          <OccupationsToggler onSelectOccupationIds={setOccupationsIds}/>
        </Grid>
        <Grid item xs={8}>
          <Choose>
            <When condition={trainingsData}>
              <ChartWidget
                data={JSON.parse(trainingsData?.trainingsByOccupationAggs || "[]")}
                yAxisKeys={occupationIds}
                yAxisVisibleKeys={selectedOccupationIds}
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
  )
}
