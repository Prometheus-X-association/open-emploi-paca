import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";

import {Container, Grid, Typography} from "@material-ui/core";
import {DragHandle} from "@material-ui/icons";
import clsx from "clsx";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2),
    height: "100%"
  },
  title: {
    color: theme.palette.text.mainBlue,
    textTransform: "uppercase",
    fontSize: theme.typography.fontSize * 1.3
  },
  dragIcon: {
    width: theme.spacing(2.5),
    height: theme.spacing(2.5),
    color: theme.palette.text.mainBlue
  },
  empty: {
    textAlign: "center",
    height: "auto",
    padding: theme.spacing(10, 0),
  }
}));

/**
 * @param children
 * @param title
 * @param expandable
 * @param emptyHint
 * @return {JSX.Element}
 * @constructor
 */
export function BlockContainer({children, title, expandable, emptyHint} = {}) {
  const classes = useStyles();
  const {t} = useTranslation();

  return (
    <Container className={clsx(classes.root, {[classes.empty]: emptyHint})}>
      <Grid container spacing={1} className={classes.heading} alignItems={"center"}>
        <If condition={expandable}>
          <Grid item>
            <DragHandle className={classes.dragIcon} />
          </Grid>
        </If>
        <If condition={title}>
          <Grid item>
            <Typography className={classes.title} variant="h6" gutterBottom>
              {title}
            </Typography>
          </Grid>
        </If>
      </Grid>
      {children}
    </Container>
  );
}
