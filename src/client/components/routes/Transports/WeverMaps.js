import WeverMapsBase from "wever-maps";
import 'wever-maps/dist/styles/bootstrap.css';

export default function WeverMaps({...props} = {}){
  return <WeverMapsBase {...props} lang="fr" locale="fr"/>;
}