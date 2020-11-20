import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import {Route, Switch} from "react-router";
import {Dialog} from "@material-ui/core";
import loadable from "@loadable/component";
import {ROUTES} from "../../../routes";
import LogoMM from "../../../assets/logo-mm.png";


const EditExperience = loadable(() => import(/* webpackChunkName: "EditExperience" */ "./Experience/EditExperience"));
const EditAptitudes = loadable(() => import(/* webpackChunkName: "EditAptitudes" */ "./Aptitudes/EditAptitudes"));
const Cartography = loadable(() => import(/* webpackChunkName: "Cartography" */ "./Cartography/Cartography"));
const OccupationsMatching = loadable(() => import(/* webpackChunkName: "OccupationsMatching" */ "./Recommendation/OccupationsMatching"));
const ExtractAptitudesFromCV = loadable(() => import(/* webpackChunkName: "ExtractAptitudesFromCV" */ "./Aptitudes/ExtractAptitudesFromCV"));
const PrintProfile = loadable(() => import(/* webpackChunkName: "PrintProfile" */ "./Export/PrintProfile"));

const useStyles = makeStyles(theme => ({
  logoInsert: {
    position: "absolute",
    top: theme.spacing(2),
    right:theme.spacing(2),
    width: theme.spacing(12)
  }
}));

/**
 *
 */
export function CartonetModal({} = {}) {
  const classes = useStyles();
  const {t} = useTranslation();

  return (
    <Route path={`${ROUTES.PROFILE}/cartonet`}>
      <Dialog open={true} maxWidth={"lg"} scroll={"paper"}  fullWidth disableBackdropClick disableEscapeKeyDown>
        <img src={LogoMM} alt={"Logo MM"} className={classes.logoInsert}/>

        <Switch>
          <Route path={`${ROUTES.PROFILE}${ROUTES.CARTONET_EDIT_EXPERIENCE}`} component={EditExperience} />
          <Route path={`${ROUTES.PROFILE}${ROUTES.CARTONET_EDIT_TRAINING}`} render={() => <EditExperience experienceType={"training"}/>} />
          <Route path={`${ROUTES.PROFILE}${ROUTES.CARTONET_EDIT_HOBBY}`} render={() => <EditExperience experienceType={"hobby"}/>} />
          <Route path={`${ROUTES.PROFILE}${ROUTES.CARTONET_EDIT_APTITUDES}`} render={() => <EditAptitudes />} />
          <Route path={`${ROUTES.PROFILE}${ROUTES.CARTONET_SHOW_PROFILE}`} render={() => <Cartography />} />
          <Route path={`${ROUTES.PROFILE}${ROUTES.CARTONET_SHOW_JOBS}`} render={() => <OccupationsMatching />} />
          <Route path={`${ROUTES.PROFILE}${ROUTES.CARTONET_EXTRACT_SKILLS_FROM_CV}`} render={() => <ExtractAptitudesFromCV />} />
          <Route path={`${ROUTES.PROFILE}${ROUTES.CARTONET_PRINT_PROFILE}`} render={() => <PrintProfile />} />
        </Switch>
      </Dialog>
    </Route>
  );
}
