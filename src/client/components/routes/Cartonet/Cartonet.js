import {makeStyles} from "@material-ui/core/styles";
import {Cancel as CloseIcon} from "@material-ui/icons";
import {IconButton, Tooltip} from "@material-ui/core";
import {useTranslation} from "react-i18next";
import {Route, Switch, MemoryRouter, useHistory} from "react-router";
import loadable from "@loadable/component";
import {ROUTES} from "../../../routes";
import LogoMM from "../../../assets/logo-mm.png";

const EditExperience = loadable(() => import("./Experience/EditExperience"));
const EditAptitudes = loadable(() => import("./Aptitudes/EditAptitudes"));
const Cartography = loadable(() => import("./Cartography/Cartography"));
const OccupationsMatching = loadable(() => import("./Recommendation/OccupationsMatching"));
const ExtractAptitudesFromCV = loadable(() => import("./Aptitudes/ExtractAptitudesFromCV"));
const PrintProfile = loadable(() => import("./Export/PrintProfile"));

const useStyles = makeStyles((theme) => ({
  root: {
    position: "relative",
    maxWidth: 1200,
    margin: "auto",
    background: "white"
  },
  logoInsert: {
    position: "absolute",
    top: theme.spacing(2),
    right: theme.spacing(12),
    width: theme.spacing(16)
  },
  close: {
    position: "absolute",
    top: theme.spacing(2),
    right: theme.spacing(2)
  }
}));

export default function Cartonet({} = {}) {
  const classes = useStyles();
  const {t} = useTranslation();
  const history = useHistory();

  return (
    <div className={classes.root}>
      <img src={LogoMM} alt={"Logo MM"} className={classes.logoInsert} />
      <Tooltip title={t("ACTIONS.CLOSE")}>
        <IconButton className={classes.close} onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Tooltip>
      <MemoryRouter initialEntries={[history.location]} initialIndex={0}>
        <Switch>
          <Route exact path={ROUTES.CARTONET_EDIT_EXPERIENCE} render={() => <EditExperience fullscreen />} />
          <Route
            exact
            path={ROUTES.CARTONET_EDIT_TRAINING}
            render={() => <EditExperience fullscreen experienceType={"training"} />}
          />
          <Route
            exact
            path={ROUTES.CARTONET_EDIT_HOBBY}
            render={() => <EditExperience fullscreen experienceType={"hobby"} />}
          />
          <Route exact path={ROUTES.CARTONET_EDIT_APTITUDES} render={() => <EditAptitudes onClose={handleClose} />} />
          <Route exact path={ROUTES.CARTONET_SHOW_PROFILE} component={Cartography} />
          <Route exact path={ROUTES.CARTONET_SHOW_JOBS} component={OccupationsMatching} />
          <Route exact path={ROUTES.CARTONET_EXTRACT_SKILLS_FROM_CV} render={() => <ExtractAptitudesFromCV />} />
          <Route exact path={ROUTES.CARTONET_PRINT_PROFILE} render={() => <PrintProfile />} />
        </Switch>
      </MemoryRouter>
    </div>
  );

  function handleClose() {
    if (window.confirm(t("CARTONET.CONFIRM_CLOSE"))) {
      window.close();
    }
  }
}
