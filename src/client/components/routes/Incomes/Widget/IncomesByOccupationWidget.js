import React, {useEffect, useState} from "react";
import {CircularProgress, Select, MenuItem, Grid} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import {useLazyQuery, useQuery} from "@apollo/client";
import {gqlIncomesByOccupationAggs} from "./gql/IncomesAggs.gql";
import {LineChart, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip} from "recharts";
import {JobAreaSelect} from "../../Dashboard/Widget/JobAreaSelect";
import {OccupationsToggler} from "../../Dashboard/Widget/OccupationsToggler";
import {Colors} from "../../Dashboard/Widget/Colors";

const useStyles = makeStyles(theme => ({
  jobAreaSelector: {
    width: "100%",
    margin: theme.spacing(2, 0)
  }
}));

/**
 *
 */
export function IncomesByOccupationWidget({jobArea: forcedJobArea} = {}) {
  const {t} = useTranslation();
  const [jobAreaId, setJobAreaId] = useState(forcedJobArea?.id);
  const [occupationIds, setOccupationsIds] = useState([]);
  const [getIncomesAggs, {data: incomesData}] = useLazyQuery(gqlIncomesByOccupationAggs);

  useEffect(() => {
    if (jobAreaId && occupationIds.length > 0) {
      getIncomesAggs({
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
            <When condition={incomesData}>
              <ResponsiveContainer height={300}>
                <LineChart data={JSON.parse(incomesData?.incomesByOccupationAggs || "[]")}>
                  {occupationIds.map((occupationId, index)=> (
                    <Line key={occupationId} dot={false} type="monotone" dataKey={occupationId} stroke={Colors[index]} />
                  ))}
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                </LineChart>
              </ResponsiveContainer>
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
