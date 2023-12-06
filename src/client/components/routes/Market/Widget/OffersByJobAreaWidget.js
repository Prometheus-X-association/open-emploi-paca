import { useEffect, useState } from "react";
import {CircularProgress, Select, MenuItem, Grid} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import {useLazyQuery, useQuery} from "@apollo/client";
import { gqlOffersByJobAreaAggs} from "./gql/OffersAggs.gql";
import {Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip} from "recharts";
import {JobAreasToggler} from "../../Dashboard/Widget/JobAreasToggler";
import {Colors} from "../../Dashboard/Widget/Colors";
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
export function OffersByJobAreaWidget({occupation: forcedOccupation} = {}) {
  const {t} = useTranslation();
  const [occupationId, setOccupationId] = useState(forcedOccupation?.id);
  const [[jobAreaIds, selectedJobAreaIds], setJobAreasIds] = useState([[], []]);
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
              <ChartWidget
                data={JSON.parse(offersData?.offersByJobAreaAggs || '[]')}
                yAxisKeys={jobAreaIds}
                yAxisVisibleKeys={selectedJobAreaIds}
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
