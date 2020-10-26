import React from 'react';
import PropTypes from 'prop-types';
import {CircularProgress, Box, Typography} from '@material-ui/core';
import {makeStyles} from "@material-ui/core/styles";
import clsx from "clsx";

const useStyles = makeStyles(theme => ({
  value: {
    fontSize: theme.typography.pxToRem(10),
    color: "white",
    fontWeight: "bold"
  },
  green: {
    color: "#099906",
    "& circle": {
      fill: "#92de91"
    }
  },
  yellow: {
    color: "#aecb00",
    "& circle": {
      fill: "#d9ffa9"
    }
  },
  orange: {
    color: "#e27700",
    "& circle": {
      fill: "#ffc88c"
    }
  },
  red: {
    color: "#dd0101",
    "& circle": {
      fill: "#ff9a9a"
    }
  }
}));

export function Gauge({value, ...props} = {}) {
  const classes = useStyles();
  let color = "red";

  if (value >= 25){
    color = "orange";
  }

  if (value >= 50){
    color = "yellow";
  }

  if (value >= 75){
    color = "green";
  }

  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress variant="static" value={value} {...props} thickness={4} className={classes[color]}/>
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography className={clsx(classes.value, classes[color])} variant="caption" component="div" color="textSecondary">
          {`${Math.round(value)}%`}
        </Typography>
      </Box>
    </Box>
  );
}

Gauge.propTypes = {
  /**
   * The value of the progress indicator for the determinate and static variants.
   * Value between 0 and 100.
   */
  value: PropTypes.number.isRequired,
};