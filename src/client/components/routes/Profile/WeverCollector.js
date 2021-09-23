import WeverCollectorBase from "wever-collector";
import "wever-collector/dist/styles/bootstrap.css";
import {useEnvironment} from "../../../hooks/useEnvironment";
import {useQuery} from "@apollo/client";
import {gqlWeverProfile} from "../Transports/gql/WeverProfile.gql";

export default function WeverCollector({email} = {}) {
  const {data: {me: {weverUser} = {}} = {}, loading} = useQuery(gqlWeverProfile, {
    fetchPolicy: "network-only"
  });
  const diagId = useEnvironment("WEVER_DIAG_ID", {isInt: true}) || 285;
  console.log("Debugging Wever Collector props : ", {diagId, email, weverUser});
  return <WeverCollectorBase diagId={diagId} locale="fr" email={email} token={weverUser?.token} />;
}
