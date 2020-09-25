import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import {Route, Switch, useHistory} from "react-router";
import {Dialog, DialogActions, DialogContent, Button} from "@material-ui/core";
import {ROUTES} from "../../../routes";
import EditExperience from "./Experience/EditExperience";

const useStyles = makeStyles(theme => ({}));

/**
 *
 */
export function CartonetModal({} = {}) {
  const classes = useStyles();
  const {t} = useTranslation();

  return (
    <Route path={`${ROUTES.PROFILE}/cartonet`}>
      <Dialog open={true} maxWidth={"lg"} fullWidth disableBackdropClick disableEscapeKeyDown>
        <Switch>
          <Route path={`${ROUTES.PROFILE}${ROUTES.CARTONET_EDIT_EXPERIENCE}`} component={EditExperience} />
          <Route path={`${ROUTES.PROFILE}${ROUTES.CARTONET_EDIT_TRAINING}`} render={() => <EditExperience experienceType={"training"}/>} />
          <Route path={`${ROUTES.PROFILE}${ROUTES.CARTONET_EDIT_HOBBY}`} render={() => <EditExperience experienceType={"hobby"}/>} />
        </Switch>
      </Dialog>
    </Route>
  );
}
