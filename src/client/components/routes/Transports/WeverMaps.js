import WeeverDashboardBase from "wever-dashboard";

import "wever-dashboard/dist/styles/bootstrap.css";

export default function WeverMaps({...props} = {}) {
  return (
    <>
      <WeeverDashboardBase {...props} dashboard="4" />
    </>
  );
}
