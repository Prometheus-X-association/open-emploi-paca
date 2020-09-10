import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";

const useStyles = makeStyles(theme => ({}));

/**
 *
 */
export default function Cartography({} = {}) {
  const classes = useStyles();
  const {t} = useTranslation();

  return (
    <>
      Cartographie Carto.net
    </>
  );
}