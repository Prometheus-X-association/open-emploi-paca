import {ROUTES} from "../../../../routes";
import {generatePath, matchPath} from "react-router";

/**
 * This util overrides generatePath method by guessing in which environment the user is navigating on.
 *
 * @param {object} history
 * @param {string} route
 * @returns {*}
 */
export function generateCartonetPath({history, route}) {
  // This is a hack to guess if we are in cartonet standalone mode or in openemploi.
  if (!!matchPath(history.location.pathname, {path: ROUTES.PROFILE, exact: false, strict: false})) {
    route = `${ROUTES.PROFILE}${route}`;
  }

  return generatePath(route);
}
