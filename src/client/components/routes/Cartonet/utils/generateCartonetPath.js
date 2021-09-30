import {ROUTES} from "../../../../routes";
import {generatePath, matchPath} from "react-router-dom";

export const editLinkMapping = {
  hobby: ROUTES.CARTONET_EDIT_HOBBY,
  training: ROUTES.CARTONET_EDIT_TRAINING,
  experience: ROUTES.CARTONET_EDIT_EXPERIENCE
};

/**
 * This util overrides generatePath method by guessing in which environment the user is navigating on.
 *
 * @param {object} history
 * @param {string} route
 * @param {object} params
 * @returns {*}
 */
export function generateCartonetPath({history, route, params}) {
  // This is a hack to guess if we are in cartonet standalone mode or in openemploi.
  if (!!matchPath(history.location.pathname, {path: ROUTES.PROFILE, exact: false, strict: false})) {
    route = `${ROUTES.PROFILE}${route}`;
  }

  return generatePath(route, params);
}

/**
 * This util overrides generatePath method by guessing in which environment the user is navigating on.
 *
 * @param {object} history
 * @param {object} experience
 * @returns {*}
 */
export function generateCartonetEditExperiencePath({history, experience}) {
  let route = editLinkMapping[experience.experienceType] || editLinkMapping.experience;

  return generateCartonetPath({
    history,
    route,
    params: {
      id: experience.id
    }
  });
}
