import WeverCollectorBase from "wever-collector";
import 'wever-collector/dist/styles/bootstrap.css';
import {useEnvironment} from "../../../hooks/useEnvironment";

export default function WeverCollector({token, reportId} = {}) {
  const diagId = useEnvironment("WEVER_DIAG_ID", {isInt: true}) || 35;
  console.log("Debugging Wever props : ", {token, reportId, diagId})
  return (
    <WeverCollectorBase diagId={diagId} token={token} reportId={reportId} lang="fr" locale="fr"/>
  );
}
