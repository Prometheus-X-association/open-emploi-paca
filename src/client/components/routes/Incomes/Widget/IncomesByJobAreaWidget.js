import React, {useEffect, useState} from "react";
import {CircularProgress, Grid} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import {useLazyQuery, useQuery} from "@apollo/client";
import {gqlIncomesByJobAreaAggs} from "./gql/IncomesAggs.gql";
import {ReferenceLine} from "recharts";
import {JobAreasToggler} from "../../Dashboard/Widget/JobAreasToggler";
import {OccupationSelect} from "../../Dashboard/Widget/OccupationSelect";
import {ChartWidget} from "../../Dashboard/Widget/ChartWidget";
import {gqlMyProfile} from "../../Profile/gql/MyProfile.gql";

const useStyles = makeStyles(theme => ({
  jobAreaSelector: {
    width: "100%",
    margin: theme.spacing(2, 0)
  }
}));

/**
 *
 */
export function IncomesByJobAreaWidget({occupation: forcedOccupation} = {}) {
  const {t} = useTranslation();
  const [occupationId, setOccupationId] = useState(forcedOccupation?.id);
  const [[jobAreaIds, selectedJobAreaIds], setJobAreasIds] = useState([[], []]);
  const [getIncomesAggs, {data: incomesData}] = useLazyQuery(gqlIncomesByJobAreaAggs);
  const {data: {me} = {}} = useQuery(gqlMyProfile);

  useEffect(() => {
    if (occupationId && jobAreaIds.length > 0) {
      getIncomesAggs({
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
            <When condition={incomesData}>
              <ChartWidget
                data={JSON.parse(incomesData?.incomesByJobAreaAggs || "[]")}
                yAxisKeys={jobAreaIds}
                yAxisVisibleKeys={selectedJobAreaIds}>
                <If condition={me?.wishedMaxIncome}>
                  <ReferenceLine
                    alwaysShow
                    y={me.wishedMaxIncome}
                    stroke="green"
                    strokeDasharray="2 2"
                    label={{value: t("PROJECT.WISHED_MAX_INCOME"), fill: "grey", fontSize: 11}}
                  />
                </If>
                <If condition={me?.wishedMinIncome}>
                  <ReferenceLine
                    alwaysShow
                    y={me.wishedMinIncome}
                    stroke="red"
                    strokeDasharray="2 2"
                    label={{value: t("PROJECT.WISHED_MIN_INCOME"), fill: "grey", fontSize: 11}}
                  />
                </If>
              </ChartWidget>
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
