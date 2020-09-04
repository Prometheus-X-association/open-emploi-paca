import React from "react";
import CircularProgress from "@material-ui/core/CircularProgress";

export function LoadingSplashScreen({children, ...props}) {
  return (
    <>
      <CircularProgress {...props} />
      {children}
    </>
  );
}
