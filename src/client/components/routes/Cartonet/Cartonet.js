import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import {Route, Switch} from "react-router";
import loadable from "@loadable/component";
import {ROUTES} from "../../../routes";
import LogoMM from "../../../assets/logo-mm.png";

const EditExperience = loadable(() => import(/* webpackChunkName: "EditExperience" */ "./Experience/EditExperience"));
const EditAptitudes = loadable(() => import(/* webpackChunkName: "EditAptitudes" */ "./Aptitudes/EditAptitudes"));
const Cartography = loadable(() => import(/* webpackChunkName: "Cartography" */ "./Cartography/Cartography"));
const OccupationsMatching = loadable(() => import(/* webpackChunkName: "EditAptitudes" */ "./Recommendation/OccupationsMatching"));

const useStyles = makeStyles(theme => ({
  logoInsert: {
    position: "absolute",
    top: theme.spacing(2),
    right:theme.spacing(2),
    width: theme.spacing(20)
  }
}));

export default function Cartonet({} = {}) {
  const classes = useStyles();
  const {t} = useTranslation();

  return (
    <div>
      <img src={LogoMM} alt={"Logo MM"} className={classes.logoInsert}/>

      <Switch>
        <Route exact path={ROUTES.CARTONET_EDIT_EXPERIENCE} render={() => <EditExperience fullscreen />}/>
        <Route exact path={ROUTES.CARTONET_EDIT_TRAINING}   render={() => <EditExperience fullscreen experienceType={"training"}/>}/>
        <Route exact path={ROUTES.CARTONET_EDIT_HOBBY}      render={() => <EditExperience fullscreen experienceType={"hobby"}/>}/>
        <Route exact path={ROUTES.CARTONET_EDIT_APTITUDES}  component={EditAptitudes}/>
        <Route exact path={ROUTES.CARTONET_SHOW_PROFILE}    component={Cartography}/>
        <Route exact path={ROUTES.CARTONET_SHOW_JOBS} component={OccupationsMatching} />
      </Switch>
    </div>
  );
}
