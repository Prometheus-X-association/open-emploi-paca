import React, {useEffect, useState} from "react";
import {CircularProgress, Select, MenuItem, Grid} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import {useLazyQuery, useQuery} from "@apollo/client";
import { gqlOffersByJobAreaAggs} from "./gql/OffersAggs.gql";
import {LineChart, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip} from "recharts";
import {JobAreasToggler} from "../../Dashboard/Widget/JobAreasToggler";
import {Colors} from "../../Dashboard/Widget/Colors";
import {JobAreaSelect} from "../../Dashboard/Widget/JobAreaSelect";
import {OccupationSelect} from "../../Dashboard/Widget/OccupationSelect";

const useStyles = makeStyles(theme => ({
  jobAreaSelector: {
    width: "100%",
    margin: theme.spacing(2, 0)
  }
}));

/**
 *
 */
export function OffersByJobAreaWidget({occupation: forcedOccupation} = {}) {
  const {t} = useTranslation();
  const [occupationId, setOccupationId] = useState(forcedOccupation?.id);
  const [jobAreaIds, setJobAreasIds] = useState([]);
  const [getOffersAggs, {data: offersData}] = useLazyQuery(gqlOffersByJobAreaAggs);

  useEffect(() => {
    if (occupationId && jobAreaIds.length > 0) {

      getOffersAggs({
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
            <OccupationSelect onSelectOccupationId={setOccupationId}/>
          </Grid>
        </If>
        <Grid item xs={4}>
          <JobAreasToggler onSelectJobAreaIds={setJobAreasIds}/>
        </Grid>
        <Grid item xs={8}>
          <Choose>
            <When condition={offersData}>
              <ResponsiveContainer height={300}>
                <LineChart data={JSON.parse(offersData?.offersByJobAreaAggs || '[]')}>
                  {jobAreaIds.map((jobAreaId, index)=> (
                    <Line key={jobAreaId} dot={false} type="linear" dataKey={jobAreaId} stroke={Colors[index]} />
                  ))}
                  <CartesianGrid stroke="#ccc" />
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
