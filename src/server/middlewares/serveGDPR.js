import {
  attachDatastoreSessionExpressMiddleware,
  logDebug,
  logError,
  logInfo,
  MnxOntologies,
} from "@mnemotix/synaptix.js";

import PersonDefinition from "../datamodel/mnx/PersonDefinition";

/**
 * Serves GDPR services
 * @param {ExpressApp} app
 * @param {function} authenticate - Authenticate middleware
 * @param {function} attachDatastoreSession - Attach a datastore session middleware
 * @param {SSOApiClient} ssoApiClient
 */
export async function serveGDPR({ app, ssoApiClient, attachDatastoreSession, authenticate}) {
  /**
   * GDPR.
   * @see https://gdpr-info.eu/art-17-gdpr/
   *
   * The process to erase a user is :
   * "Right to erasure" service
   * - Remove user private data from Graph DB.
   *   - Profile data
   *   - Skills
   *   - Experiences
   * - Remove user account from SSO
   * - Remove cookie to logout active session
   */
  app.get(
    "/gdpr/erase-user",
    [
      authenticate(),
      attachDatastoreSession({
        acceptAnonymousRequest: false
      })
    ],
    async (req, res) => {
      try {
        /** @type {SynaptixDatastoreSession} datastoreSession */
        let session = req.datastoreSession;

        const person = await session.getLoggedUserPerson();
        const username = session.getLoggedUsername();
        const userSsoId = session.getLoggedUserId();

        logInfo(`GDPR "Right to erasure" service called for user ${username}`);

        let sumup = {};

        Object.entries(person).map(([key, value]) => {
          if (!PersonDefinition.getLink(key)) {
            sumup[key] = value;
          }
        });

        // Logout session
        logDebug(
          `Logout user ${session.getLoggedUserId()} from the SSO and remove Session`
        );

        await session.getSSOControllerService().logout();

        for (const linkDefinition of PersonDefinition.getLinks()) {
          if (linkDefinition.getLinkPath()) {
            continue;
          }

          const linkedObjectsCount = await session.getLinkedObjectsCountFor({
            object: person,
            linkDefinition: linkDefinition,
          });

          if (linkedObjectsCount > 0) {
            sumup[
              `${linkDefinition.getGraphQLPropertyName()}_count`
            ] = linkedObjectsCount;

            let removingIds = [];
            let removingObjects = [];

            for (
              let page = 1;
              page <= Math.ceil(linkedObjectsCount / 5000);
              page++
            ) {
              const linkedObjects = await session.getLinkedObjectsFor({
                object: person,
                linkDefinition: linkDefinition,
                args: {
                  first: page * 5000,
                },
                fetchIdsOnly: true,
              });

              if (linkDefinition.isPlural()) {
                removingObjects = removingObjects.concat(linkedObjects);
                removingIds = removingIds.concat(
                  linkedObjects.map(({ id }) => id)
                );
              } else {
                removingObjects = [linkedObjects];
                removingIds = [linkedObjects.id];
              }
            }

            if (linkDefinition.isCascadingRemoved()) {
              sumup[
                linkDefinition.getGraphQLPropertyName()
              ] = removingObjects.reduce((removingObjects, removingObject) => {
                let removingObjectCleaned = {};
                Object.entries(removingObject).map(([key, value]) => {
                  if (
                    !linkDefinition.getRelatedModelDefinition().getLink(key)
                  ) {
                    removingObjectCleaned[key] = value;
                  }
                });
                removingObjects.push(removingObjectCleaned);
                return removingObjects;
              }, []);
            }

            if (
              linkDefinition.isCascadingRemoved() ||
              linkDefinition
                .getRelatedModelDefinition()
                .isEqualOrDescendantOf(
                  MnxOntologies.mnxContribution.ModelDefinitions
                    .ActionDefinition
                )
            ) {
              logDebug(
                `Removing ${linkedObjectsCount} objects defined by link ${linkDefinition.getLinkName()}`
              );

              for (const removingId of removingIds) {
                await session.removeObject({
                  modelDefinition: linkDefinition.getRelatedModelDefinition(),
                  objectId: removingId,
                  permanentRemoval: true,
                });
              }
            } else {
              logDebug(
                `Removing ${linkedObjectsCount} edges only defined by link ${linkDefinition.getLinkName()}`
              );

              for (const removingId of removingIds) {
                await session.removeEdge(
                  linkDefinition.getRelatedModelDefinition(),
                  person.id,
                  linkDefinition,
                  removingId
                );
              }
            }
          }
        }

        // Remove Person object from the DB
        logDebug(`Removing person ${person.id} from the Graph DB`);

        await session.removeObject({
          modelDefinition: PersonDefinition,
          objectId: person.id,
          permanentRemoval: true,
        });

        // Remove user in SSO.
        logDebug(`Removing user ${userSsoId} from the SSO`);
        await ssoApiClient.removeUser(userSsoId);

        res.json(sumup);
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
}
