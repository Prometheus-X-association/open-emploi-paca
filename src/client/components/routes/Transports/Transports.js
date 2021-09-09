import loadable from "@loadable/component";
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import {Grid, InputAdornment, List, ListItem, Typography, ListSubheader, Divider} from "@material-ui/core";
import {useMutation, useQuery} from "@apollo/client";
import {gqlMyProfile} from "../Profile/gql/MyProfile.gql";
import ErrorBoundary from "../../widgets/ErrorBoundary";
import {gqlWeverProfile} from "./gql/WeverProfile.gql";
const WeverMaps = loadable(() => import("./WeverMaps"));

const useStyles = makeStyles((theme) => ({}));

/**
 *
 */
export default function Transports({} = {}) {
  const classes = useStyles();
  const {t} = useTranslation();
  const {data: {me} = {}, loading} = useQuery(gqlWeverProfile, {
    fetchPolicy: "network-only"
  });

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant={"h2"}>{t("TRANSPORTS.TITLE")}</Typography>
      </Grid>
      <If condition={!loading}>
        <ErrorBoundary>
          <WeverMaps {...me?.weverUser} />
        </ErrorBoundary>
      </If>
    </Grid>
  );
}
