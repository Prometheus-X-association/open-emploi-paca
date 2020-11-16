import {UserAuthenticationService as DefaultUserAuthenticationService} from "@mnemotix/synaptix-client-toolkit";
import i18next from "i18next";
import {gql} from "@apollo/client";
import * as Yup from "yup";
import {useEffect} from "react";
import {useHistory} from "react-router-dom";
import {useObservable} from "react-use";

export const gqlRegisterUserAccountMutation = gql`
  mutation RegisterUserAccount(
    $username: String!
    $password: String!
    $email: String!
    $firstName: String!
    $lastName: String!
  ) {
    registerUserAccount(
      input: {username: $username, password: $password, email: $email, firstName: $firstName, lastName: $lastName}
    ) {
      success
    }
  }
`;

/**
 * The following groups are globals and created in dataset.
 * They are listed
 */
export const gqlUserAccountGroupsFragment = gql`
  fragment UserAccountGroupsFragment on UserAccount {
    isAdmin: isInGroup(userGroupId: "user-group/AdministratorGroup")
    isEditor: isInGroup(userGroupId: "user-group/EditorGroup")
    isContributor: isInGroup(userGroupId: "user-group/ContributorGroup")
  }
`;

export const gqlMeQuery = gql`
  query Me {
    me {
      id
      uri
      avatar
      firstName
      lastName
      userAccount {
        id
        username
        userId
        ...UserAccountGroupsFragment
      }
    }
  }

  ${gqlUserAccountGroupsFragment}
`;

export const formikValidationSchema = Yup.object().shape({
  firstName: Yup.string().required(this?.t("FORM_ERRORS.FIELD_ERRORS.REQUIRED") || "Required"),
  lastName: Yup.string().required(this?.t("FORM_ERRORS.FIELD_ERRORS.REQUIRED") || "Required"),
  email: Yup.string()
    .email(this?.t("FORM_ERRORS.FIELD_ERRORS.INVALID_EMAIL") || "Invalid Email")
    .required(this?.t("FORM_ERRORS.FIELD_ERRORS.REQUIRED") || "Required"),
  password: Yup.string().required(this?.t("FORM_ERRORS.FIELD_ERRORS.REQUIRED") || "Required")
});

export class UserAuthenticationService extends DefaultUserAuthenticationService {
  constructor({t, apolloClient} = {}) {
    super({
      t,
      apolloClient,
      meQuery: gqlMeQuery
    });
  }

  getSubscribeValidationSchema() {
    return formikValidationSchema;
  }

  useSubscribe() {
    let {subscribe: superSubscribe, globalErrorMessage, success} = super.useSubscribe({
      mutation: gqlRegisterUserAccountMutation,
      mutationName: "registerUserAccount"
    });

    function subscribe(values, formikOptions) {
      return superSubscribe(
        {
          username: values.email,
          ...values
        },
        formikOptions
      );
    }

    return {
      subscribe,
      globalErrorMessage,
      success
    };
  }

  useLogin() {
    let {login: superLogin, globalErrorMessage, success} = super.useLogin();

    function login({email, password}, formikOptions) {
      return superLogin({username: email, password}, formikOptions);
    }

    return {login, globalErrorMessage, success};
  }

  /**
   * @param options
   * @return {{isLogged: boolean, loading: any, user: object, isContributor: boolean, isEditor: boolean, isAdmin: boolean, useLogout: Function}}
   */
  useLoggedUser(options = {}) {
    let redirectTo = options.redirectTo || "/";
    let {isLogged, user, loading} = useObservable(this.currentUser, {loading: true});
    loading = !!loading;
    const history = useHistory();

    useEffect(() => {
      if (!loading && isLogged === false) {
        history.replace(redirectTo);
      }
    }, [isLogged]);

    return {
      user: user || options.defaultUserValue,
      isLogged,
      isAdmin: user?.userAccount?.isAdmin,
      isEditor: user?.userAccount?.isAdmin || user?.userAccount?.isEditor,
      isContributor: user?.userAccount?.isAdmin || user?.userAccount?.isEditor || user?.userAccount?.isContributor,
      loading,
      useLogout: this.useLogout.bind(this)
    };
  }
}

let userAuthenticationService;

/**
 * @param apolloClient
 * @return {UserAuthenticationService}
 */
export function getUserAuthenticationService({apolloClient}) {
  return (
    userAuthenticationService ||
    (userAuthenticationService = new UserAuthenticationService({
      t: i18next.t.bind(i18next),
      apolloClient
    }))
  );
}
