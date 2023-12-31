import { useState } from "react";
import {makeStyles} from "@material-ui/core/styles";
import {Avatar, CardHeader, Grid, Menu, MenuItem} from "@material-ui/core";
import {useTranslation} from "react-i18next";
import {useLoggedUser} from "../../utilities/auth/useLoggedUser";
import {useQuery} from "@apollo/client";
import {gqlMyProfile} from "../routes/Profile/gql/MyProfile.gql";

const useStyles = makeStyles(theme => ({
  profileButton: {
    flexDirection: "row-reverse",
    cursor: "pointer"
  },
  profileButtonAvatar: {
    marginRight: 0,
    marginLeft: theme.spacing(2)
  },
  profileButtonContent: {
    textAlign: "right"
  }
}));

/**
 *
 */
export function AppBar({} = {}) {
  const {t} = useTranslation();
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState(null);
  const {user, useLogout} = useLoggedUser();
  const {logout} = useLogout();
  const classes = useStyles();
  const {data: {me} = {}, loading} = useQuery(gqlMyProfile);

  return (
    <div className={classes.root}>
      <Grid container justify={"flex-end"}>
        <Grid item>
          <CardHeader
            classes={{
              root: classes.profileButton,
              avatar: classes.profileButtonAvatar,
              subheader: classes.profileButtonContent
            }}
            avatar={
              <Avatar src={user?.avatar}>
                {user?.firstName[0]}
                {user?.lastName[0]}
              </Avatar>
            }
            title={`${user?.firstName} ${user?.lastName}`}
            subheader={me?.occupation?.prefLabel}
            onClick={e => setProfileMenuAnchorEl(e.currentTarget)}
          />
          <Menu
            open={!!profileMenuAnchorEl}
            anchorEl={profileMenuAnchorEl}
            onClose={() => setProfileMenuAnchorEl(null)}
            getContentAnchorEl={null}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center"
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "center"
            }}>
            <MenuItem onClick={() => location.assign("/greco")}>Accéder à GRECO</MenuItem>
            <MenuItem onClick={() => logout()}>{t("APP_BAR.MENU.SIGN_OUT")}</MenuItem>
          </Menu>
        </Grid>
      </Grid>
    </div>
  );
}
