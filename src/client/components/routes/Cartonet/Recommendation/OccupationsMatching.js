import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import {Button, DialogActions, DialogContent, DialogTitle} from "@material-ui/core";
import {useHistory} from "react-router";

const useStyles = makeStyles(theme => ({}));

/**
 *
 */
export default function OccupationsMatching({} = {}) {
  const classes = useStyles();
  const {t} = useTranslation();
  const history = useHistory();

  return (
    <>
      <DialogTitle>{t("CARTONET.OCCUPATION_MATCHING.PAGE_TITLE")}</DialogTitle>
      <DialogContent>
        Coming soon...
      </DialogContent>
      <DialogActions>
        <Button onClick={() => history.goBack()}>{t("ACTIONS.GO_BACK")}</Button>
      </DialogActions>
    </>
  );
}