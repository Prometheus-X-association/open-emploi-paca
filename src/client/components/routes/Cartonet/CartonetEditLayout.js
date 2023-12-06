import { makeStyles } from "@material-ui/core/styles";
import { ChevronRight as ChevronRightIcon } from "@material-ui/icons";
import { useTranslation } from "react-i18next";
import {
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Typography,
} from "@material-ui/core";
import { createLink } from "../../../utilities/router/createLink";
import { ROUTES } from "../../../routes";
import { generatePath, matchPath, useHistory } from "react-router-dom";
import { generateCartonetPath } from "./generateCartonetPath";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  step: {
    fontSize: theme.typography.fontSize * 1.8,
    lineHeight: "initial",
    width: 160,
  },
  chevron: {
    fontSize: theme.typography.fontSize * 7,
  },
  content: {
    marginTop: theme.spacing(4),
    // height: "50vh",
    // overflow: "auto"
  },
  stepActive: {
    textDecoration: "underline",
  },
  title: {
    padding: theme.spacing(2),
  },
  dialogContent: {
    position: "relative",
  },
  navigation: {
    height: theme.spacing(10),
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(-2),
  },
}));

/**
 *
 */
export function CartonetEditLayout({
  title,
  description,
  children,
  actions,
} = {}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const history = useHistory();

  const extractSkillsPath = generateCartonetPath({
    history,
    route: ROUTES.CARTONET_EXTRACT_SKILLS_FROM_CV,
  });
  const editExperiencePath = generateCartonetPath({
    history,
    route: ROUTES.CARTONET_EDIT_EXPERIENCE,
  });
  const editTrainingPath = generateCartonetPath({
    history,
    route: ROUTES.CARTONET_EDIT_TRAINING,
  });
  const editHobbyPath = generateCartonetPath({
    history,
    route: ROUTES.CARTONET_EDIT_HOBBY,
  });

  const editAptitudePath = generateCartonetPath({
    history,
    route: ROUTES.CARTONET_EDIT_APTITUDES,
  });

  return (
    <>
      <DialogTitle>{t("CARTONET.EDIT_TITLE")}</DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <Grid
          container
          className={classes.navigation}
          alignItems={"center"}
          wrap={"nowrap"}
        >
          <Grid item className={classes.step}>
            {createLink({
              to: extractSkillsPath,
              text: t("CARTONET.ACTIONS.EXTRACT_SKILLS_FROM_CV"),
              className: clsx({
                [classes.stepActive]: matchPath(history.location.pathname, {
                  path: extractSkillsPath,
                }),
              }),
            })}
          </Grid>
          <Grid item>
            <ChevronRightIcon className={classes.chevron} />
          </Grid>
          <Grid item className={classes.step}>
            {createLink({
              to: editExperiencePath,
              text: t("CARTONET.ACTIONS.ADD_EXPERIENCE"),
              className: clsx({
                [classes.stepActive]:
                  matchPath(history.location.pathname, {
                    path: editExperiencePath,
                  }) ||
                  matchPath(history.location.pathname, {
                    path: editTrainingPath,
                  }) ||
                  matchPath(history.location.pathname, { path: editHobbyPath }),
              }),
            })}
          </Grid>
          <Grid item>
            <ChevronRightIcon className={classes.chevron} />
          </Grid>
          <Grid item className={classes.step}>
            {createLink({
              to: editAptitudePath,
              text: t("CARTONET.ACTIONS.EDIT_APTITUDES"),
              className: clsx({
                [classes.stepActive]: matchPath(history.location.pathname, {
                  path: editAptitudePath,
                }),
              }),
            })}
          </Grid>
        </Grid>

        <If condition={description}>
          <div>{description}</div>
        </If>

        <Paper variant={"outlined"} className={classes.content}>
          <Grid
            container
            wrap={"nowrap"}
            direction={"column"}
            style={{ height: "100%" }}
          >
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
