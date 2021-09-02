import WeverCollectorBase from "wever-collector";
import "wever-collector/dist/styles/bootstrap.css";
import {useEnvironment} from "../../../hooks/useEnvironment";

export default function WeverCollector({email} = {}) {
  const diagId = useEnvironment("WEVER_DIAG_ID", {isInt: true}) || 285;
  console.log("Debugging Wever Collector props : ", {diagId, email});
  return <WeverCollectorBase diagId={diagId} locale="fr" email={email} />;
}
