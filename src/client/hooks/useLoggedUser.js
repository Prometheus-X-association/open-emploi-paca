import {getUserAuthenticationService} from "../services/UserAuthenticationService";
import {useApolloClient} from "@apollo/client";

/**
 * @param {UserAuthenticationService} [userAuthenticationService]
 *  @return {{isLogged: boolean, loading: any, user: object, isContributor: boolean, isEditor: boolean, isAdmin: boolean, useLogout: Function}}
 */
export function useLoggedUser({userAuthenticationService} = {}) {
  if (!userAuthenticationService) {
    userAuthenticationService = getUserAuthenticationService({
      apolloClient: useApolloClient()
    });
  }

  return userAuthenticationService.useLoggedUser();
}
