import {makeStyles} from "@material-ui/core/styles";
import {ChevronRight as ChevronRightIcon} from "@material-ui/icons";
import {useTranslation} from "react-i18next";
import {DialogActions, DialogContent, DialogTitle, Grid, Paper} from "@material-ui/core";
import {createLink} from "../../../utilities/createLink";
import {ROUTES} from "../../../routes";
import {generatePath, matchPath, useHistory} from "react-router";

const useStyles = makeStyles((theme) => ({
  step: {
    fontSize: theme.typography.fontSize * 1.8,
    lineHeight: "initial",
    width: 160
  },
  chevron: {
    fontSize: theme.typography.fontSize * 7
  },
  content: {
    marginTop: theme.spacing(4)
  }
}));

/**
 *
 */
export function CartonetEditLayout({title, description, children, actions} = {}) {
  const classes = useStyles();
  const {t} = useTranslation();
  const history = useHistory();

  return (
    <>
      <DialogTitle>{t("CARTONET.EDIT_TITLE")}</DialogTitle>
      <DialogContent>
        <Grid container className={classes.navigation} alignItems={"center"} wrap={"nowrap"}>
          <Grid item className={classes.step}>
            {createLink({
              to: "",
              text: t("CARTONET.ACTIONS.EXTRACT_SKILLS_FROM_CV")
            })}
          </Grid>
          <Grid item>
            <ChevronRightIcon className={classes.chevron} />
          </Grid>
          <Grid item className={classes.step}>
            {createLink({
              to: "",
              text: t("CARTONET.ACTIONS.ADD_EXPERIENCE")
            })}
          </Grid>
          <Grid item>
            <ChevronRightIcon className={classes.chevron} />
          </Grid>
          <Grid item className={classes.step}>
            {createLink({
              to: "",
              text: t("CARTONET.ACTIONS.EDIT_APTITUDES")
            })}
          </Grid>
        </Grid>

        <div>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor
          sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar sic tempor. Sociis natoque penatibus
          et magnis dis parturient montes, nascetur ridiculus mus. Nam fermentum, nulla luctus pharetra vulputate, felis
          tellus mollis orci, sed rhoncus pronin sapien nunc accuan eget.
        </div>

        <Paper variant={"outlined"} className={classes.content}>
          {children}
        </Paper>
      </DialogContent>

      <If condition={actions}>
        <DialogActions>{actions}</DialogActions>
      </If>
    </>
  );

  function getEditLink() {
    const location = history.location.pathname.replace(ROUTES.PROFILE, "");

    let route = ROUTES.CARTONET_EDIT_EXPERIENCE;

    if (!!matchPath(location, {path: ROUTES.CARTONET_EDIT_TRAINING, exact: false, strict: false})) {
      route = ROUTES.CARTONET_EDIT_TRAINING;
    } else if (!!matchPath(location, {path: ROUTES.CARTONET_EDIT_HOBBY, exact: false, strict: false})) {
      route = ROUTES.CARTONET_EDIT_HOBBY;
    }

    // This is a hack to guess if we are in cartonet standalone mode or in openemploi.
    if (!!matchPath(history.location.pathname, {path: ROUTES.PROFILE, exact: false, strict: false})) {
      route = `${ROUTES.PROFILE}${route}`;
    }

    return generatePath(route);
  }
}
