import { forwardRef, useState } from "react";
import PropTypes from "prop-types";
import classnames from "clsx";
import {makeStyles} from "@material-ui/core/styles";
import {useSnackbar} from "notistack";
import {Card, CardActions, Collapse, IconButton, Paper, Typography} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import {useTranslation} from "react-i18next";

const useStyles = makeStyles(theme => ({
  card: {
    maxWidth: 400,
    minWidth: 344
  },
  typography: {
    color: theme.palette.error.contrastText,
    fontWeight: "bold",
    flex: 1
  },
  actionRoot: {
    display: "flex",
    padding: "8px 8px 8px 16px",
    backgroundColor: theme.palette.error.main
  },
  icons: {
    marginLeft: "auto"
  },
  expand: {
    padding: theme.spacing(1),
    transform: "rotate(0deg)",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest
    })
  },
  expandOpen: {
    transform: "rotate(180deg)"
  },
  collapse: {
    padding: theme.spacing(2),
    overflow: "scroll",
    fontSize: theme.typography.fontSize * 0.9
  },
  checkIcon: {
    fontSize: 20,
    color: "#b3b3b3",
    paddingRight: 4
  },
  button: {
    padding: 0,
    textTransform: "none"
  }
}));

export const SnackErrorMessage = forwardRef(({id, message, error}, ref) => {
  const classes = useStyles();
  const {closeSnackbar} = useSnackbar();
  const [expanded, setExpanded] = useState(false);
  const {t} = useTranslation();

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  // ne marche pas
  const handleDismiss = () => {
    closeSnackbar(id);
    // closeSnackbar(ref);
  };

  return (
    <Card className={classes.card} ref={ref}>
      <CardActions classes={{root: classes.actionRoot}}>
        <Typography variant="subtitle2" className={classes.typography}>
          {t(`APOLLO.ERROR.${message.toUpperCase()}`)}
        </Typography>
        <div className={classes.icons}>
          <IconButton
            aria-label="Show more"
            className={classnames(classes.expand, {[classes.expandOpen]: expanded})}
            onClick={handleExpandClick}>
            <ExpandMoreIcon />
          </IconButton>

          <IconButton className={classes.expand} onClick={handleDismiss}>
            <CloseIcon />
          </IconButton>
        </div>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Paper className={classes.collapse}>{error}</Paper>
      </Collapse>
    </Card>
  );
});

SnackErrorMessage.propTypes = {
  id: PropTypes.number.isRequired
};
