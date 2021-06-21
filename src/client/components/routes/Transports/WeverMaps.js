import WeverMapsBase from "wever-maps";
import WeeverDashboardBase from "wever-dashboard";

import "wever-maps/dist/styles/bootstrap.css";

export default function WeverMaps({...props} = {}) {
  return (
    <>
      <WeverMapsBase {...props} lang="fr" locale="fr" />
      <WeeverDashboardBase {...props} dashboard="1" />
    </>
  );
}
