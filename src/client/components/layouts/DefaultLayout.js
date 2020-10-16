import React from "react";
import grey from "@material-ui/core/colors/grey";
import {Link} from "react-router-dom";
import {CssBaseline, Divider, Drawer, Grid, List, ListItem, ListItemText} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import {Version} from "../widgets/Version";
import Logo from "../../assets/logo-region-sud.png";
import {AppBar} from "./AppBar";
import {useLocation} from "react-router";
import clsx from "clsx";
import {ROUTES} from "../../routes";

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex"
  },
  logo: {
    maxWidth: "100%",
    height: "auto",
    padding: theme.spacing(2)
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0
  },
  drawerPaper: {
    width: drawerWidth
  },
  menuItem: {
    padding: theme.spacing(2, 0)
  },
  menuItemText: {
    textAlign: "center",
    textTransform: "uppercase",
    color: theme.palette.text.drawerMenuItemText
  },
  menuItemTextActive: {
    color: theme.palette.text.mainBlue,
    fontWeight: theme.typography.fontWeightBold
  },
  viewport: {
    flexGrow: 1,
    background: theme.palette.backgroundColor
  },
  toolbar: {},
  content: {
    minHeight: `calc(100vh - ${theme.spacing(5)}px)`,
    padding: theme.spacing(1, 3)
  },
  footer: {
    width: "100%",
    background: grey["800"],
    color: "white",
    padding: theme.spacing(0, 2)
  },
  footerContent: {
    height: theme.spacing(5)
  },
  version: {
    textAlign: "right",
    display: "block"
  }
}));

/**
 * @param {Component} [TitleComponent]
 * @param children
 * @return {*}
 * @constructor
 */
export function DefaultLayout({TitleComponent, children}) {
  let classes = useStyles();
  let {t} = useTranslation();
  const location = useLocation();
  const routes = [
    {
      path: ROUTES.INDEX,
      text: "Accueil"
    },
    {
      path: ROUTES.PROFILE,
      text: "Profil"
    },
    {
      path: ROUTES.PROJECT,
      text: "Projet"
    },
    {
      path: ROUTES.MARKET,
      text: "Marché"
    },
    {
      path: ROUTES.INCOMES,
      text: "Salaires"
    },
    {
      path: ROUTES.SKILLS,
      text: "Compétences",
      disabled: true
    },
    {
      path: ROUTES.TRAININGS,
      text: "Formations",
      disabled: true
    },
    {
      path: ROUTES.TRANSPORTS,
      text: "Transport et logement",
      disabled: true
    },
    {
      path: ROUTES.LIFE_STYLE,
      text: "cadre de vie",
      disabled: true
    }
  ];

  return (
    <div className={classes.root}>
      <CssBaseline />
      <Drawer
        className={classes.drawer}
        variant="permanent"
        classes={{
          paper: classes.drawerPaper
        }}
        anchor="left">
        <img className={classes.logo} src={Logo} alt={"Logo Région Sud"} />
        <Divider />
        <List>
          {routes.map(({text, path, disabled}) => (
            <ListItem
              alignItems="center"
              key={text}
              className={clsx(classes.menuItem)}
              button
              component={disabled ? null : Link}
              to={path}
              disabled={disabled}
            >
              <ListItemText
                classes={{
                  root: classes.menuItemText,
                  primary: clsx({[classes.menuItemTextActive]: location.pathname === path})
                }}
                primary={text}
              />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <div className={classes.viewport}>
        <main className={classes.content}>
          <AppBar />
          {children}
        </main>
        <footer className={classes.footer}>
          <Grid container direction="row" alignItems="center" justify="center" className={classes.footerContent}>
            <Grid item xs={12}>
              <Version className={classes.version} />
            </Grid>
          </Grid>
        </footer>
      </div>
    </div>
  );
}
