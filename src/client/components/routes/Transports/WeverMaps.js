import WeeverDashboardBase from "wever-dashboard";

import "wever-dashboard/dist/styles/bootstrap.css";
import {useEnvironment} from "../../../hooks/useEnvironment";

export default function WeverMaps({reportId: report, token} = {}) {
  const dashboard = useEnvironment("WEVER_DASHBOARD_ID", {isInt: true}) || 4;
  console.log("Debugging Wever Dashboard props : ", {report, dashboard, token});
  return (
    <>
      <WeeverDashboardBase token={token} report={report} dashboard={dashboard} locale="fr" />
    </>
  );
}
