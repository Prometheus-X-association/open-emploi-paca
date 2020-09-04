import React from "react";
import {Tooltip} from "@material-ui/core";
import {LoadingButton} from "./LoadingButton";

/**
 * Display a button with a tooltip
 */
export const TooltipButton = ({children, ...props} = {}) => {
  return (
    <Tooltip title={tooltip} arrow>
        <span>
          <LoadingButton {...props}>
            {children}
          </LoadingButton>
        </span>
    </Tooltip>
  );
};
