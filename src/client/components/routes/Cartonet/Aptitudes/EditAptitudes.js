import React from 'react';
import {DialogTitle, DialogContent} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";

const useStyles = makeStyles(theme => ({}));

/**
 *
 */
export default function EditAptitudes({} = {}) {
  const classes = useStyles();
  const {t} = useTranslation();

  return (
    <>
      <DialogTitle>
        {t("CARTONET.APTITUDES.PAGE_TITLE")}
      </DialogTitle>
      <DialogContent>

      </DialogContent>
    </>
  );
}