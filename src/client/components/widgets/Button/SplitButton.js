import React from "react";
import {Button, ButtonGroup, ClickAwayListener, Grow, MenuItem, MenuList, Paper, Popper} from "@material-ui/core";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import {makeStyles} from "@material-ui/core/styles";
import clsx from "clsx";

const useStyles = makeStyles(theme => ({
  disabled: {
    boxShadow: "none"
  }
}));

/**
 * @param {string} disabled
 * @param {string} variant
 * @param {string} color
 * @param {array} options
 * @return {*}
 * @constructor
 */
export default function SplitButton({disabled, variant, color, options = []} = {}) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const handleMenuItemClick = (option, index) => {
    setSelectedIndex(index);
    setOpen(false);
    option.onClick();
  };

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen);
  };

  const handleClose = event => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  return (
    <>
      <ButtonGroup
        variant={variant}
        color={color}
        disabled={disabled}
        ref={anchorRef}
        aria-label="split button"
        className={clsx({[classes.disabled]: disabled})}>
        <Button onClick={() => options[selectedIndex].onClick()}>{options[selectedIndex].label}</Button>
        <Button
          size="small"
          aria-controls={open ? "split-button-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-label="select merge strategy"
          aria-haspopup="menu"
          onClick={handleToggle}>
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
        {({TransitionProps, placement}) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: placement === "bottom" ? "center top" : "center bottom"
            }}>
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu">
                  {options.map((option, index) => (
                    <MenuItem
                      key={index}
                      selected={index === selectedIndex}
                      onClick={() => handleMenuItemClick(option, index)}>
                      {option.label}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}
