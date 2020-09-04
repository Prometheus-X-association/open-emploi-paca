import React from 'react';
import clsx from 'clsx';
import {makeStyles} from '@material-ui/core/styles';
import {Button, CircularProgress} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  loadingButton: {
    display: "inline-block",
    position: "relative"
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
}));

export function LoadingButton({loading, ...props} = {}) {
  const classes = useStyles();

  return (
    <div className={classes.loadingButton}>
      <Button {...props} className={clsx(props.className)} disabled={props.disabled || loading}/>
      <If condition={loading}>
        <CircularProgress size={24} className={classes.buttonProgress}/>
      </If>
    </div>
  )
}