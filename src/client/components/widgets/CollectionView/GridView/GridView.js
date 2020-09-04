import React from "react";
import get from "lodash/get";
import {fade, makeStyles} from "@material-ui/core/styles";
import {Link} from "react-router-dom";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import {getImageThumbnail} from "../../../../utilities/getImageThumbnail";
import ErrorBoundary from "../../ErrorBoundary";

/**
 * @param {object} data - GraphQL raw data
 * @param {string} gqlConnectionPath - Path in data to get nodes connection.
 * @param {function} [generateNodeRoute] - Generator called to compute item node route.
 * @param {function} [onNodeClick] - Handler called when item is clicked. Prevent generateNodeRoute if defined.
 * @return {*}
 */
export function GridView(props) {
  return (
    <ErrorBoundary>
      <GridViewCode {...props} />
    </ErrorBoundary>
  );
}

function GridViewCode({gqlConnectionPath, onNodeClick, generateNodeRoute, data} = {}) {
  const classes = useStyles();

  return (
    <div className={classes.displayGrid}>
      {get(data, gqlConnectionPath).edges.map((item) => {
        const {id, title, image, publicUrl, shortDescription, color} = item.node;

        let linkProps = {};

        if (onNodeClick) {
          linkProps.onClick = onNodeClick.bind(this, item.node);
          linkProps.to = "#";
        } else if (generateNodeRoute) {
          linkProps.to = generateNodeRoute(item.node);
        }

        return (
          <div className={classes.gridItem} key={id}>
            <Link className={classes.noTextDecoration} {...linkProps}>
              <Paper
                className={classes.gridPaper}
                elevation={5}
                style={{
                  backgroundColor: `${color}`,
                  backgroundImage: `url(${getImageThumbnail({
                    imageUrl: image || publicUrl,
                    size: "small"
                  })})`
                }}>
                <div className={classes.infosContainer}>
                  <Typography variant="subtitle1">{title}</Typography>

                  <If condition={!!shortDescription}>
                    <div className={classes.description}>
                      <Typography variant="subtitle2">{shortDescription}</Typography>
                    </div>
                  </If>
                </div>
              </Paper>
            </Link>
          </div>
        );
      })}
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  noTextDecoration: {textDecoration: "none"},

  displayGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))"
  },
  gridItem: {
    marginTop: theme.spacing(2),
    marginRight: theme.spacing(2)
  },
  gridPaper: {
    height: theme.spacing(50),
    position: "relative",
    backgroundPosition: "center",
    backgroundSize: "cover"
  },
  infosContainer: {
    background: fade(theme.palette.common.white, 0.8),
    padding: theme.spacing(1),
    position: "absolute",
    width: "100%",
    height: theme.spacing(15),
    bottom: 0,
    left: 0,
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  description: {
    marginTop: theme.spacing(1),
    display: "-webkit-box", // @see https://caniuse.com/#search=line-clamp
    lineClamp: 3,
    boxOrient: "vertical",
    overflow: "hidden"
  }
}));
