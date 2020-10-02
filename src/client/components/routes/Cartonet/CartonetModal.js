import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import {Route, Switch} from "react-router";
import {Dialog} from "@material-ui/core";
import loadable from "@loadable/component";
import {ROUTES} from "../../../routes";

const EditExperience = loadable(() => import(/* webpackChunkName: "EditExperience" */ "./Experience/EditExperience"));
const EditAptitudes = loadable(() => import(/* webpackChunkName: "EditAptitudes" */ "./Aptitudes/EditAptitudes"));
const Cartography = loadable(() => import(/* webpackChunkName: "Cartography" */ "./Cartography/Cartography"));
const OccupationsMatching = loadable(() => import(/* webpackChunkName: "EditAptitudes" */ "./Recommendation/OccupationsMatching"));


const useStyles = makeStyles(theme => ({}));

/**
 *
 */
export function CartonetModal({} = {}) {
  const classes = useStyles();
  const {t} = useTranslation();

  return (
    <Route path={`${ROUTES.PROFILE}/cartonet`}>
      <Dialog open={true} maxWidth={"lg"} scroll={"paper"}  fullWidth disableBackdropClick disableEscapeKeyDown>
        <Switch>
          <Route path={`${ROUTES.PROFILE}${ROUTES.CARTONET_EDIT_EXPERIENCE}`} component={EditExperience} />
          <Route path={`${ROUTES.PROFILE}${ROUTES.CARTONET_EDIT_TRAINING}`} render={() => <EditExperience experienceType={"training"}/>} />
          <Route path={`${ROUTES.PROFILE}${ROUTES.CARTONET_EDIT_HOBBY}`} render={() => <EditExperience experienceType={"hobby"}/>} />
          <Route path={`${ROUTES.PROFILE}${ROUTES.CARTONET_EDIT_APTITUDES}`} render={() => <EditAptitudes />} />
          <Route path={`${ROUTES.PROFILE}${ROUTES.CARTONET_SHOW_PROFILE}`} render={() => <Cartography />} />
          <Route path={`${ROUTES.PROFILE}${ROUTES.CARTONET_SHOW_JOBS}`} render={() => <OccupationsMatching />} />
        </Switch>
      </Dialog>
    </Route>
  );
}
