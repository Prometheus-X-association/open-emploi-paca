import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import { Route, Switch, useHistory } from "react-router-dom";
import { Dialog, IconButton, Tooltip } from "@material-ui/core";
import loadable from "@loadable/component";
import { ROUTES } from "../../../routes";
import LogoMM from "../../../assets/logo-mm.png";
import { Cancel as CloseIcon } from "@material-ui/icons";

const EditExperience = loadable(() => import("./Experience/EditExperience"));
const EditAptitudes = loadable(() => import("./Aptitudes/EditAptitudes"));
const Cartography = loadable(() => import("./Cartography/Cartography"));
const OccupationsMatching = loadable(() =>
  import("./OccupationsMatching/OccupationsMatching")
);
const ExtractAptitudesFromCV = loadable(() =>
  import("./Aptitudes/ExtractAptitudesFromCV")
);
const PrintProfile = loadable(() => import("./Export/PrintProfile"));

const useStyles = makeStyles((theme) => ({
  root: {
    position: "relative",
    maxWidth: 1200,
    margin: "auto",
    background: "white",
  },
  logoInsert: {
    position: "absolute",
    top: theme.spacing(2),
    right: theme.spacing(12),
    width: theme.spacing(16),
  },
  close: {
    position: "absolute",
    top: theme.spacing(2),
    right: theme.spacing(2),
  },
}));

/**
 *
 */
export function CartonetModal({} = {}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const history = useHistory();

  return (
    <Route path={`${ROUTES.PROFILE}/cartonet`}>
      <Dialog
        open={true}
        maxWidth={"lg"}
        scroll={"paper"}
        fullWidth
        disableBackdropClick
        disableEscapeKeyDown
        className={classes.root}
      >
        <Tooltip title={t("ACTIONS.CLOSE")}>
          <IconButton className={classes.close} onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Tooltip>

        <img src={LogoMM} alt={"Logo MM"} className={classes.logoInsert} />

        <Switch>
          <Route
            path={`${ROUTES.PROFILE}${ROUTES.CARTONET_EDIT_EXPERIENCE}`}
            component={EditExperience}
          />
          <Route
            path={`${ROUTES.PROFILE}${ROUTES.CARTONET_EDIT_TRAINING}`}
            render={() => <EditExperience experienceType={"training"} />}
          />
          <Route
            path={`${ROUTES.PROFILE}${ROUTES.CARTONET_EDIT_HOBBY}`}
            render={() => <EditExperience experienceType={"hobby"} />}
          />
          <Route
            path={`${ROUTES.PROFILE}${ROUTES.CARTONET_EDIT_APTITUDES}`}
            render={() => <EditAptitudes onClose={handleClose} />}
          />
          <Route
            path={`${ROUTES.PROFILE}${ROUTES.CARTONET_SHOW_PROFILE}`}
            render={() => <Cartography />}
          />
          <Route
            path={`${ROUTES.PROFILE}${ROUTES.CARTONET_SHOW_JOBS}`}
            render={() => <OccupationsMatching />}
          />
          <Route
            path={`${ROUTES.PROFILE}${ROUTES.CARTONET_EXTRACT_SKILLS_FROM_CV}`}
            render={() => <ExtractAptitudesFromCV />}
          />
          <Route
            path={`${ROUTES.PROFILE}${ROUTES.CARTONET_PRINT_PROFILE}`}
            render={() => <PrintProfile />}
          />
        </Switch>
      </Dialog>
    </Route>
  );

  function handleClose() {
    if (window.confirm(t("CARTONET.CONFIRM_CLOSE"))) {
      history.push(ROUTES.PROFILE);
    }
  }
}
