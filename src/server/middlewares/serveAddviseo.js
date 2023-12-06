import { body } from "express-validator/check";
import env from "env-var";
import {
  attachDatastoreSessionExpressMiddleware,
  sendValidationErrorsJSONExpressMiddleware,
  I18nError,
  logError,
  logInfo, logDebug,
} from "@mnemotix/synaptix.js";
import { generatePath } from "react-router-dom";

import { ROUTES } from "../../client/routes";

const resourceTypesMapping = {
  edit_experience: generatePath(ROUTES.CARTONET_EDIT_EXPERIENCE),
  edit_training: generatePath(ROUTES.CARTONET_EDIT_TRAINING),
  edit_hobby: generatePath(ROUTES.CARTONET_EDIT_HOBBY),
  edit_aptitudes: generatePath(ROUTES.CARTONET_EDIT_APTITUDES),
  show_profile: generatePath(ROUTES.CARTONET_SHOW_PROFILE),
  print_profile: generatePath(ROUTES.CARTONET_PRINT_PROFILE),
  show_jobs: generatePath(ROUTES.CARTONET_SHOW_JOBS),
  upload_cv: generatePath(ROUTES.CARTONET_EXTRACT_SKILLS_FROM_CV),
  api: "/graphql",
  gdpr_erase_user: "/gdpr/erase-user",
};

/**
 * Serves AddViseo redirection pages
 * @param {ExpressApp} app
 * @param {function} attachDatastoreSession - Attach a datastore session
 */
export async function serveAddviseo({ app, attachDatastoreSession }) {
  app.post(
    "/addviseo",
    [
      body("email", "Email is empty").exists({ checkFalsy: true }).isEmail(),
      body("first_name", "First name is empty").exists({ checkFalsy: true }),
      body("last_name", "Last name is empty").exists({ checkFalsy: true }),
      body("customer_token", "Customer token is empty").exists({
        checkFalsy: true,
      }),
      body("resource_type", "Resource type is not recognized")
        .exists()
        .isIn(Object.keys(resourceTypesMapping)),
      sendValidationErrorsJSONExpressMiddleware,
      attachDatastoreSession({
        acceptAnonymousRequest: true
      }),
    ],
    async (req, res) => {
      try {
        /** @type {SynaptixDatastoreSession} datastoreSession */
        let datastoreSession = req.datastoreSession;

        const addviseoAuthLogin = env
          .get("ADDVISEO_AUTH_LOGIN")
          .required()
          .asString();
        const addviseoAuthToken = env
          .get("ADDVISEO_AUTH_TOKEN")
          .required()
          .asString();
        const addviseoPasswordSault = env
          .get("ADDVISEO_PASSWORD_SALT")
          .required()
          .asString();
        const appURL = env.get("APP_URL").required().asString();

        if (
          addviseoAuthLogin !== req.get("X-Auth-Login") ||
          addviseoAuthToken !== req.get("X-Auth-Token")
        ) {
          return res.status(401).send("Authentication headers don't match.");
        }

        const firstName = req.body?.first_name;
        const lastName = req.body?.last_name;
        const username = req.body?.email;
        const customerToken = req.body?.customer_token;
        const resourceType = req.body?.resource_type;
        const password = `${username}${addviseoPasswordSault}`;
        let httpStatus;

        try {
          await datastoreSession.getSSOControllerService().getApiClient().getUserByUsername(username);
          httpStatus = 200;
        } catch (e) {
          if (e instanceof I18nError && e.i18nKey === "USER_NOT_IN_SSO") {
            await datastoreSession
              .getSSOControllerService()
              .registerUserAccount({
                email: username,
                lastName,
                firstName,
                password,
                userAttributes: {
                  addViseoId: customerToken,
                },
              });

            httpStatus = 201;
          }
        }


        let user;

        try{
          user = await datastoreSession.getSSOControllerService().login({
            username,
            password,
            skipCookie: true,
          });
        } catch (e){
          if (e instanceof I18nError && e.i18nKey === "INVALID_CREDENTIALS") {
            const {id: userId} = await datastoreSession.getSSOControllerService().getApiClient().getUserByUsername(username);

            logDebug(`Wrong credential for user ${username} (${userId}). Might use old password generation method. Resetting it with new one...`);

            await datastoreSession.getSSOControllerService().getApiClient().resetUserPassword({
              isTemporaryPassword: false,
              password,
              userId
            });

            user = await datastoreSession.getSSOControllerService().login({
              username,
              password,
              skipCookie: true,
            });
          }
        }


        let token = Buffer.from(JSON.stringify(user.toJWTSession())).toString(
          "base64"
        );

        res
          .status(httpStatus)
          .send(`${appURL}${resourceTypesMapping[resourceType]}?jwt=${token}`);
      } catch (e) {
        logError(`An exception occured for the following body parameters ${JSON.stringify(
          req.body
        )}
  ${e.stack}`);
        res.status(500).json({
          code: e.i18nKey || "UNKNOWN",
          message: e.message,
        });
      }
    }
  );

  logInfo("Addviseo middleware loaded...");
}
