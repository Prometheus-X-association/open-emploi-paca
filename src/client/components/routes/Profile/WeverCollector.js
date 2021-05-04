import WeverCollectorBase from "wever-collector";
import 'wever-collector/dist/styles/bootstrap.css';

export default function WeverCollector({diagId = 35, token, reportId} = {}) {
  return (
    <WeverCollectorBase diagId={diagId} token={token} reportId={reportId} lang="fr" locale="fr"/>
  );
}
