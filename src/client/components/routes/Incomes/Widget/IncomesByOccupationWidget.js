import { useEffect, useState } from "react";
import {CircularProgress, Grid} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import {useLazyQuery, useQuery} from "@apollo/client";
import {gqlIncomesByOccupationAggs} from "./gql/IncomesAggs.gql";
import {ReferenceLine} from "recharts";
import {JobAreaSelect} from "../../Dashboard/Widget/JobAreaSelect";
import {OccupationsToggler} from "../../Dashboard/Widget/OccupationsToggler";
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
export function IncomesByOccupationWidget({jobArea: forcedJobArea} = {}) {
  const {t} = useTranslation();
  const [jobAreaId, setJobAreaId] = useState(forcedJobArea?.id);
  const [[occupationIds, selectedOccupationIds], setOccupationsIds] = useState([[], []]);
  const [getIncomesAggs, {data: incomesData}] = useLazyQuery(gqlIncomesByOccupationAggs);
  const {data: {me} = {}} = useQuery(gqlMyProfile);

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
            <JobAreaSelect onSelectJobAreaId={setJobAreaId} />
          </Grid>
        </If>
        <Grid item xs={4}>
          <OccupationsToggler onSelectOccupationIds={setOccupationsIds} />
        </Grid>
        <Grid item xs={8}>
          <Choose>
            <When condition={incomesData}>
              <ChartWidget
                data={JSON.parse(incomesData?.incomesByOccupationAggs || "[]")}
                yAxisKeys={occupationIds}
                yAxisVisibleKeys={selectedOccupationIds}>
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
