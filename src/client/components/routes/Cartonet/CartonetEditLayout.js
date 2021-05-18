import {makeStyles} from "@material-ui/core/styles";
import {ChevronRight as ChevronRightIcon} from "@material-ui/icons";
import {useTranslation} from "react-i18next";
import {DialogActions, DialogContent, DialogTitle, Grid, Paper, Typography} from "@material-ui/core";
import {createLink} from "../../../utilities/createLink";
import {ROUTES} from "../../../routes";
import {generatePath, matchPath, useHistory} from "react-router";
import {generateCartonetPath} from "./utils/generateCartonetPath";
import clsx from "clsx";

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
    marginTop: theme.spacing(4),
    height: "50vh",
    overflow: "auto"
  },
  stepActive: {
    textDecoration: "underline"
  },
  title: {
    padding: theme.spacing(2)
  }
}));

/**
 *
 */
export function CartonetEditLayout({title, description, children, actions} = {}) {
  const classes = useStyles();
  const {t} = useTranslation();
  const history = useHistory();

  const extractSkillsPath = generateCartonetPath({history, route: ROUTES.CARTONET_EXTRACT_SKILLS_FROM_CV});
  const editExperiencePath = generateCartonetPath({history, route: ROUTES.CARTONET_EDIT_EXPERIENCE});
  const editAptitudePath = generateCartonetPath({history, route: ROUTES.CARTONET_EDIT_APTITUDES});

  return (
    <>
      <DialogTitle>{t("CARTONET.EDIT_TITLE")}</DialogTitle>
      <DialogContent>
        <Grid container className={classes.navigation} alignItems={"center"} wrap={"nowrap"}>
          <Grid item className={classes.step}>
            {createLink({
              to: extractSkillsPath,
              text: t("CARTONET.ACTIONS.EXTRACT_SKILLS_FROM_CV"),
              className: clsx({[classes.stepActive]: matchPath(history.location.pathname, {path: extractSkillsPath})})
            })}
          </Grid>
          <Grid item>
            <ChevronRightIcon className={classes.chevron} />
          </Grid>
          <Grid item className={classes.step}>
            {createLink({
              to: editExperiencePath,
              text: t("CARTONET.ACTIONS.ADD_EXPERIENCE"),
              className: clsx({[classes.stepActive]: matchPath(history.location.pathname, {path: editExperiencePath})})
            })}
          </Grid>
          <Grid item>
            <ChevronRightIcon className={classes.chevron} />
          </Grid>
          <Grid item className={classes.step}>
            {createLink({
              to: editAptitudePath,
              text: t("CARTONET.ACTIONS.EDIT_APTITUDES"),
              className: clsx({[classes.stepActive]: matchPath(history.location.pathname, {path: editAptitudePath})})
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
          <Grid container wrap={"nowrap"} direction={"column"} style={{height: "100%"}}>
            <If condition={title}>
              <Grid item className={classes.title}>
                <Typography variant={"h5"}>{title}</Typography>
              </Grid>
            </If>
            <Grid xs item>
              {children}
            </Grid>
          </Grid>
        </Paper>
      </DialogContent>

      <If condition={actions}>
        <DialogActions>{actions}</DialogActions>
      </If>
    </>
  );
}
