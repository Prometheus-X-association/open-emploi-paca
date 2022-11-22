import { getUserAuthenticationService } from "../services/UserAuthenticationService";
import { useApolloClient } from "@apollo/client";

/**
 *  @param {UserAuthenticationService} [userAuthenticationService]
 *  @return {object}
 */
export function useLoggedUser({ userAuthenticationService } = {}) {
  const apolloClient = useApolloClient();

  return getUserAuthenticationService({ apolloClient }).useLoggedUser();
}
