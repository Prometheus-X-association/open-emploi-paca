import WeverCollectorBase from "wever-collector";
import 'wever-collector/dist/styles/bootstrap.css';

export default function WeverCollector({...props} = {}) {
  return (
    <WeverCollectorBase {...props} lang="fr" locale="fr"/>
  );
}