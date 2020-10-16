import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import {Grid} from "@material-ui/core";
import clsx from "clsx";

import {Version} from "../widgets/Version";
import LogoAPEC from "../../assets/logo-apec.png";
import LogoML from "../../assets/logo-ml.png";
import LogoMM from "../../assets/logo-mm.png";
import LogoMNX from "../../assets/logo-mnx.png";
import LogoPE from "../../assets/logo-pe.png";
import LogoPREF from "../../assets/logo-pref.png";

const useStyles = makeStyles(theme => ({
  top: {
    background: "white",
    padding: theme.spacing(4),
  },
  bottom: {
    textAlign: "center",
    display: "block",
    padding: theme.spacing(4, 0),
    color: "gray"
  },
  logo: {
    maxHeight: theme.spacing(8),
    width: "auto",
    verticalAlign: "middle",
    "&:not(:first-of-type)": {
      marginLeft: theme.spacing(4)
    }
  },
  bigger: {
    maxHeight: theme.spacing(10)
  },
  smaller: {
    maxHeight: theme.spacing(7)
  },
  right: {
    float: "right"
  }
}));

/**
 *
 */
export function Footer({bottomDisabled = false, className} = {}) {
  const classes = useStyles();
  const {t} = useTranslation();

  return (
    <Grid container direction="row" alignItems="center" justify="center" className={clsx(className, classes.root)}>
      <Grid item xs={12} className={classes.top}>
        <img className={clsx(classes.logo, classes.bigger)} src={LogoPREF}/>
        <img className={classes.logo} src={LogoPE}/>
        <img className={classes.logo} src={LogoAPEC}/>
        <img className={classes.logo} src={LogoML}/>

        <span className={ classes.right}>
        <img className={clsx(classes.logo, classes.smaller)} src={LogoMM}/>
        <img className={clsx(classes.logo)} src={LogoMNX}/>
        </span>
      </Grid>
      <If condition={!bottomDisabled}>
        <Grid item xs={12} className={classes.bottom}>
          <Version className={classes.version} />
        </Grid>
      </If>
    </Grid>
  );
}