import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import WeverMaps from "wever-maps";
import {Grid, InputAdornment, List, ListItem, Typography, ListSubheader, Divider} from "@material-ui/core";
import {useMutation, useQuery} from "@apollo/client";
import {gqlMyProfile} from "../Profile/gql/MyProfile.gql";

const useStyles = makeStyles(theme => ({}));

/**
 *
 */
export default function Transports({} = {}) {
  const classes = useStyles();
  const {t} = useTranslation();
  const {data: {me} = {}, loading} = useQuery(gqlMyProfile);

  console.log(me?.weverUser);
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant={"h2"}>{t("TRANSPORTS.TITLE")}</Typography>
      </Grid>
      <If condition={!loading}>
        <WeverMaps {...me?.weverUser} />
      </If>
    </Grid>
  );
}