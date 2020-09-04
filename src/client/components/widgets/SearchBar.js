import React, {useEffect, useRef, useState} from "react";
import {useDebounce} from "use-debounce";
import PropTypes from "prop-types";
import IconButton from "@material-ui/core/IconButton";
import Input from "@material-ui/core/Input";
import Paper from "@material-ui/core/Paper";
import ClearIcon from "@material-ui/icons/Clear";
import SearchIcon from "@material-ui/icons/Search";
import {grey} from "@material-ui/core/colors";
import clsx from "clsx";
import {makeStyles} from "@material-ui/core/styles";

import {LoadingSplashScreen} from "./LoadingSplashScreen";
import ErrorBoundary from "./ErrorBoundary";

const useStyles = makeStyles(theme => ({
  root: {
    height: 48,
    display: "flex",
    justifyContent: "space-between"
  },
  iconButton: {
    opacity: 0.54,
    transform: "scale(1, 1)",
    transition: "transform 200ms cubic-bezier(0.4, 0.0, 0.2, 1)"
  },
  iconButtonHidden: {
    transform: "scale(0, 0)",
    "& > $icon": {
      opacity: 0
    }
  },
  iconButtonDisabled: {
    opacity: 0.38
  },
  searchIconButton: {
    marginRight: -48
  },
  progress: {
    marginTop: 10,
    marginRight: 10
  },
  icon: {
    opacity: 0.54,
    transition: "opacity 200ms cubic-bezier(0.4, 0.0, 0.2, 1)"
  },
  input: {
    width: "100%"
  },
  searchContainer: {
    margin: "auto 16px",
    width: "calc(100% - 48px - 32px)" // 48px button + 32px margin
  }
}));

export function SearchBar(props) {
  return (
    <ErrorBoundary>
      <SearchBarCode {...props} />
    </ErrorBoundary>
  );
}

function SearchBarCode(props) {
  let inputRef = useRef(null);
  let [focus, setFocus] = useState(false);
  let [value, setValue] = useState(props.value);
  let [debouncedValue] = useDebounce(value, 250);
  let [active, setActive] = useState(false);
  let defaultclasses = useStyles();
  let classes = Object.assign(defaultclasses, props.classes || {});

  useEffect(() => {
    handleRequestSearch(debouncedValue);
  }, [debouncedValue]);

  function handleFocus(e) {
    setFocus(true);
    if (props.onFocus) {
      props.onFocus(e);
    }
  }

  function handleBlur(e) {
    setFocus(false);
    if (props.onBlur) {
      props.onBlur(e);
    }
  }

  function handleInput(e) {
    setValue(e.target.value);
    if (props.onChange) {
      props.onChange(e.target.value);
    }
  }

  function handleCancel() {
    setActive(false);
    setValue("");
    if (props.onCancelSearch) {
      props.onCancelSearch();
    }
  }

  function handleKeyUp(e) {
    if (e.charCode === 13 || e.key === "Enter") {
      handleRequestSearch(value);
    } else if (props.cancelOnEscape && (e.charCode === 27 || e.key === "Escape")) {
      handleCancel();
    }
    if (props.onKeyUp) {
      props.onKeyUp(e);
    }
  }

  function handleRequestSearch(value) {
    if (props.onRequestSearch) {
      props.onRequestSearch(value);
    }
  }

  const {
    cancelOnEscape,
    className,
    closeIcon,
    disabled,
    onCancelSearch,
    onRequestSearch,
    searchIcon,
    style,
    loading,
    extraButtons,
    ...inputProps
  } = props;

  return (
    <Paper className={clsx(classes.root, className)} style={style}>
      <div className={classes.searchContainer}>
        <Input
          {...inputProps}
          inputRef={inputRef}
          onBlur={handleBlur}
          value={value}
          onChange={handleInput}
          onKeyUp={handleKeyUp}
          onFocus={handleFocus}
          fullWidth
          className={classes.input}
          disableUnderline
          disabled={disabled}
        />
      </div>
      <Choose>
        <When condition={loading}>
          <LoadingSplashScreen size={30} className={classes.progress} />
        </When>
        <Otherwise>
          {extraButtons}

          <IconButton
            onClick={handleRequestSearch}
            classes={{
              root: clsx(classes.iconButton, classes.searchIconButton, {
                [classes.iconButtonHidden]: value !== ""
              }),
              disabled: classes.iconButtonDisabled
            }}
            disabled={disabled}>
            {React.cloneElement(searchIcon, {
              classes: {root: classes.icon}
            })}
          </IconButton>
          <IconButton
            onClick={handleCancel}
            classes={{
              root: clsx(classes.iconButton, {
                [classes.iconButtonHidden]: value === ""
              }),
              disabled: classes.iconButtonDisabled
            }}
            disabled={disabled}>
            {React.cloneElement(closeIcon, {
              classes: {root: classes.icon}
            })}
          </IconButton>
        </Otherwise>
      </Choose>
    </Paper>
  );
}

SearchBar.defaultProps = {
  className: "",
  closeIcon: <ClearIcon style={{color: grey[500]}} />,
  disabled: false,
  placeholder: "Search",
  searchIcon: <SearchIcon style={{color: grey[500]}} />,
  style: null,
  value: ""
};

SearchBar.propTypes = {
  /** Whether to clear search on escape */
  cancelOnEscape: PropTypes.bool,
  /** Override or extend the styles applied to the component. */
  classes: PropTypes.object,
  /** Custom top-level class */
  className: PropTypes.string,
  /** Override the close icon. */
  closeIcon: PropTypes.node,
  /** Disables text field. */
  disabled: PropTypes.bool,
  /** Fired when the search is cancelled. */
  onCancelSearch: PropTypes.func,
  /** Fired when the text value changes. */
  onChange: PropTypes.func,
  /** Fired when the search icon is clicked. */
  onRequestSearch: PropTypes.func,
  /** Sets placeholder text for the embedded text field. */
  placeholder: PropTypes.string,
  /** Override the search icon. */
  searchIcon: PropTypes.node,
  /** Override the inline-styles of the root element. */
  style: PropTypes.object,
  /** The value of the text field. */
  value: PropTypes.string,
  /** Extra buttons */
  extraButtons: PropTypes.element
};
