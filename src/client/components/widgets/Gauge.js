import PropTypes from "prop-types";
import {CircularProgress, Box, Typography} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import clsx from "clsx";

const useStyles = makeStyles(theme => ({
  value: {
    fontSize: theme.typography.pxToRem(8),
    color: "white",
    fontWeight: "bold"
  },
  big: {
    fontSize: theme.typography.pxToRem(11)
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
  },
  disabled: {
    color: "#969696",
    "& circle": {
      fill: "#e3e3e3"
    }
  }
}));

export function Gauge({value, big, disabled, hideText, label, ...props} = {}) {
  const classes = useStyles();
  let color = "red";

  if (value >= 25) {
    color = "orange";
  }

  if (value >= 50) {
    color = "yellow";
  }

  if (value >= 75) {
    color = "green";
  }

  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress
        variant="determinate"
        value={value}
        {...props}
        thickness={4}
        className={disabled ? classes.disabled : classes[color]}
        size={big ? 80 : 40}
      />
      <If condition={!hideText}>
        <Box
          top={0}
          left={0}
          bottom={0}
          right={0}
          position="absolute"
          display="flex"
          alignItems="center"
          justifyContent="center">
          <Typography
            className={clsx(classes.value, disabled ? classes.disabled : classes[color], {[classes.big]: big})}
            variant="caption"
            component="div"
            color="textSecondary">
            {disabled ? "À VENIR" : label || `${Math.round(value)}%`}
          </Typography>
        </Box>
      </If>
    </Box>
  );
}

Gauge.propTypes = {
  /**
   * The value of the progress indicator for the determinate and static variants.
   * Value between 0 and 100.
   */
  value: PropTypes.number.isRequired
};
