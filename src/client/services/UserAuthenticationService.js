import { useEffect } from "react";
import { gql } from "@apollo/client";
import i18next from "i18next";
import * as Yup from "yup";
import {
  BehaviorSubject,
  from as observableFrom,
  of as observableOf,
} from "rxjs";
import { switchMap, map, catchError, shareReplay, take } from "rxjs/operators";
import { useHistory, useLocation } from "react-router-dom";
import { useObservable } from "react-use";
import { useMutation } from "@apollo/client";
import invariant from "invariant";

import { handleGraphQLError } from "../utilities/handleGraphQLError";

export const gqlRegisterUserAccountMutation = gql`
  mutation RegisterUserAccount(
    $username: String!
    $password: String!
    $email: String!
    $firstName: String!
    $lastName: String!
  ) {
    registerUserAccount(
      input: {
        username: $username
        password: $password
        email: $email
        firstName: $firstName
        lastName: $lastName
      }
    ) {
      success
    }
  }
`;

export const gqlLoginMutation = gql`
  mutation Login($username: String!, $password: String!) {
    login(input: { username: $username, password: $password }) {
      success
    }
  }
`;

export const gqlLogoutMutation = gql`
  mutation Logout {
    logout {
      success
    }
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
      }
    }
  }
`;

export const gqlResetUserAccountPasswordMutation = gql`
  mutation ResetUserAccountPassword(
    $oldPassword: String
    $newPassword: String
    $newPasswordConfirm: String
  ) {
    resetUserAccountPassword(
      input: {
        oldPassword: $oldPassword
        newPassword: $newPassword
        newPasswordConfirm: $newPasswordConfirm
      }
    ) {
      success
    }
  }
`;

export const gqlUnregisterUserAccountMutation = gql`
  mutation UnregisterUserAccount($permanent: Boolean) {
    unregisterUserAccount(input: { permanent: $permanent }) {
      success
    }
  }
`;

export const gqlResetUserAccountPasswordByMailMutation = gql`
  mutation ResetUserAccountPasswordByMail(
    $email: String
    $redirectUri: String
  ) {
    resetUserAccountPasswordByMail(
      input: { email: $email, redirectUri: $redirectUri }
    ) {
      success
    }
  }
`;

/**
 *
 * i18n
 * ====
 *
 * The service deals with text that needs to be displayed to the user : the error messages. Some of these error messages
 * are from the form validation, and their values are finite and defined by the library. Others are sent by the backend in response
 * to the network requests. These messages are parsed dynamically and we cannot predict all messages that can be sent. Refer
 * to the API documentation, especially if you're using custom requests.
 *
 * How we deal with the internationalization of the error messages :
 *
 * For each error messages, we associate a i18n key. This key is in the following format `'<i18n_KEY_PREFIX>.<ERROR_KEY>'`.
 *
 * The i18n_KEY_PREFIX can be defined in the constructor, its default values is 'SYNAPTIX-CLIENT-TOOLKIT'.
 *
 * The list of possible values for ERROR_KEY :
 *  - FIELD_ERRORS.REQUIRED
 *  - FIELD_ERRORS.INVALID_EMAIL
 *  - FIELD_ERRORS.<Any error key returned by a response of the GraphQL API>
 *  - GENERAL_ERRORS.UNEXPECTED_ERROR
 *  - GENERAL_ERRORS.UNEXPECTED_ERROR
 *  - GENERAL_ERRORS.<Any error key returned by a response of the GraphQL API>
 *
 * Example values :
 *   "SYNAPTIX-CLIENT-TOOLKIT.FIELD_ERRORS.REQUIRED" (using the default prefix)
 *   "MY_APPLICATION.3RD_PARTY_ERRORS.FIELD_ERRORS.REQUIRED" (using a custom prefix "MY_APPLICATION.3RD_PARTY_ERRORS")
 *
 * From your application you have two options :
 *
 * - Use this service as it is, the service will returns strings with the error keys, and its your responsibility to handle the strings.
 * - Provide this service with a translate function `t` (from the `i18next` package, or a function with the same signature), which
 *   will be used internally to translate the keys, and the services will return human readable strings. You need to ensure that your instance
 *   of i18next has the translations for the keys that may be provided to the translate function. You can either write the translations yourself
 *   (refer to the list of possible keys, and take into account of the possible error key returned by the graphQL request that are being made).
 *   You can also use the translation object provided by the library and merge it to the rest of your application's translations.
 *
 *
 * Parameters
 * ==========
 *
 * @param {Object}   apolloClient   The apollo client instance of your application
 * @param {function} t              (Optional) A translate function, as provided by i18next
 * @param {GqlQuery} meQuery        (Optional) A custom graphQL query to use in place of the query 'gqlMeQuery' that is used by default. The
 *                                  query must return a top level property 'me' containing the current user data.
 * @param {String}   i18nKeyPrefix  (Optional) The custom prefix to use in i18n keys of error messages. Default : 'SYNAPTIX-CLIENT-TOOLKIT'.
 */
export class UserAuthenticationService {
  constructor({ t, apolloClient, meQuery, i18nKeyPrefix } = {}) {
    this.t = t || ((s) => s);
    this.apolloClient = apolloClient;
    this.meQuery = meQuery || gqlMeQuery;
    this.i18nKeyPrefix = i18nKeyPrefix || "SYNAPTIX-CLIENT-TOOLKIT.";
    if (!this.i18nKeyPrefix.endsWith(".")) {
      // small patch to ensure that i18nKeyPrefix end with a point, some project doesn't initiliaze it well like DDF
      this.i18nKeyPrefix += ".";
    }

    invariant(apolloClient, "You must provide an apollo client");

    /**
     * This subject is used to refresh the current user in the observable returned by the getter `currentUser()`.
     * The content of refreshCurrentUserSubject doesn't matter, but every time it emits, a new graphQL query is made
     * to fetch the current user data again
     */
    this.refreshCurrentUserSubject = new BehaviorSubject(true);
    this.currentUser$ = this.refreshCurrentUserSubject.pipe(
      switchMap(() => {
        return observableFrom(
          this.apolloClient.query({
            query: this.meQuery,
            fetchPolicy: "network-only",
          })
        ).pipe(
          catchError((error) => {
            return observableOf({
              isLogged: false,
              apiError: error,
            });
          })
        );
      }),
      map((result) => {
        if (result.isLogged === false) {
          return result;
        } else {
          return {
            isLogged: true,
            user: result.data.me,
          };
        }
      }),
      shareReplay(1)
    );
  }

  /**
   *
   * Generic hook, used to build the other hooks of this service. It works with any graphQL mutation that has the same format
   * than the mutation gqlLoginMutation. It can take any input variables (or none), and the response must have the top level property
   * 'success' of boolean type, in case of error it must return a graphQL error object that is parsable by handleGraphQLError.
   *
   *
   * The hook returns the property `success` set  to `true` if all operation succeded.
   * The hook returns the property `globalErrorMessage` set to a i18nized string in case of error.
   *
   * @param {Object} options.mutation  Provide custom graphQL mutation if you want to use a different mutation than the default provided by the service.
   *                                If not provided, the mutation `gqlLoginMutation` will be used.
   * @param {string} options.mutationName The name of the mutation, in order to retrieve the property in the data object that is returned by the graphQL
   *                                   request
   * @return {Object} result
   * @return {function} result.performAction  The function that the application needs to call to perform the action (that is, calling the mutation and
   *                                          handling the result)
   * @return {string} result.mutationError    If the mutation returned an error, this is the error object passed as is (mutationResult.error)
   * @return {boolean} result.success Set to true if the mutation was successfull
   */
  _useServiceMutation({ mutation, mutationName }) {
    const [myMutation, mutationResult] = useMutation(mutation);
    let success, mutationError;

    invariant(mutation, "A GraphQL mutation must be provided");

    if (!mutationResult.loading) {
      if (mutationResult.error) {
        mutationError = mutationResult.error;
      }
      let data = mutationResult.data && mutationResult.data[mutationName];
      let dataSuccess = data?.success;
      if (dataSuccess === true) {
        success = true;
      }
    }

    /**
     * @param {Object} values Form values object. An simple dictionnary in which the keys are the form's inputs names and their corresponding values.
     *                        You can directly pass the Formik 'values' object. These values will be passed as is to the graphQL mutation.
     * @param {Object} formikOptions (optional) Formik options object. If provided, the following helpers will be automatically called :
     *                                             - setSubmitting(false) : when the operation is finished
     *                                             - setFieldError : automatically sets any errors bound to an input field, that are returned by the API
     *
     * The async function returns the following properties :
     *
     * @return {string} globalErrorMessage   The global error message to display, that summarizes the best the batch of errors. This is
     *                                       a i18n key, to be translated by the i18n framework.
     * @return {boolean} success             If the request was successfull
     */
    async function performAction(values, formikOptions) {
      try {
        let result = await myMutation({ variables: values });
        return result.data[mutationName];
      } catch (error) {
        return handleGraphQLError(error, {
          formikOptions,
          t: this.t,
          i18nKeyPrefix: this.i18nKeyPrefix,
        });
      } finally {
        formikOptions && formikOptions.setSubmitting(false);
      }
    }

    return {
      performAction: performAction.bind(this),
      mutationError,
      success,
    };
  }

  /**
   * @param {Object} mutationError [optional] A mutation error as returned by the call to an apollo mutation (see return values of method `_useServiceMutation`)
   * @return {string|null} (globalErrorMessage) If the passed mutation error object could be interpreted,
   *                       it gives a human readable (already internationalized) error message to display to the user.
   */
  parseMutationError(mutationError) {
    return mutationError
      ? handleGraphQLError(mutationError, {
          t: this.t,
          i18nKeyPrefix: this.i18nKeyPrefix,
        })
      : null;
  }

  /**
   *
   * @typedef CurrentUserObject
   * @type {object}
   * @property {boolean} isLogged Flag to indicate whether there is a logged in user. false : no user is logged in, true : a user
   *                              is logged in and the user data is in the `user` property
   * @property {User} user The data of the currently logged in user. This property is null or undefined if there is no logged in user
   *
   *
   *
   * A user as fetched by the graphQL query 'this.meQuery' (set by the constructor). By default, the service uses the graphQL query
   * 'gqlMeQuery' defined in this module.
   * @typedef User
   * @type {object}
   *
   * @return Observable<CurrentUserObject>
   */
  get currentUser() {
    return this.currentUser$;
  }

  getSubscribeValidationSchema() {
    return Yup.object().shape({
      firstName: Yup.string().required(
        this.t(`${this.i18nKeyPrefix}FIELD_ERRORS.REQUIRED`)
      ),
      lastName: Yup.string().required(
        this.t(`${this.i18nKeyPrefix}FIELD_ERRORS.REQUIRED`)
      ),
      email: Yup.string()
        .email(this.t(`${this.i18nKeyPrefix}FIELD_ERRORS.INVALID_EMAIL`))
        .required(this.t(`${this.i18nKeyPrefix}FIELD_ERRORS.REQUIRED`)),
      password: Yup.string().required(
        this.t(`${this.i18nKeyPrefix}FIELD_ERRORS.REQUIRED`)
      ),
    });
  }

  getSubscribeFormInitialValues() {
    return {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    };
  }

  /**
   * React hook that implement the subscribe logic. Internally it uses the hook useMutation().
   * The hook gives a function to call when the subscribe form is submitted. The function is designed
   * to work out of the box with a formik form (you can pass it to formik form 'onSubmit' handler).
   * You can also use it without formik, in which case just call the handler with you form values,
   * without second parameter (the formikOptions object).
   * If formikOptions is provided, the field errors are automatically set if the mutation return form validation
   * errors.
   *
   * After the mutation has successfully run, the handler automatically logins the new created user. It then
   * updates the service's `currentUser` observable.
   *
   * The hook returns the property `success` set  to `true` if all operation succeded.
   * The hook returns the property `globalErrorMessage` set to a i18nized string in case of error.
   *
   * @param {Object} options.mutation Provide a graphql-tag query if you want to use a different query than the default provided by the service.
   *                                  If not provided, the query `gqlRegisterUserAccountMutation` will be used.
   * @param {string} options.mutationName If a custom mutation is provided, provide here the mutation name, that is the key that allow to access
   *                                      the top level property of the object returned by the graphQL API in case of success.
   *
   * @return {function} result.subcribe(values, formikOptions) => {success: <boolean>, globalErrorMessage: <string>}
   *
   *                    The function to call to perform the subscribe action. In case of successfull register, the function logs the newly created user
   *                    immediatly afterwards (it uses this services hook `useLogin()`, which can be overrided). It will update the current user observable
   *                    after the login is done.
   *                    @param {Object} values Form values object. An simple dictionnary in which the keys are the form's inputs names and their corresponding values.
   *                                           You can directly pass the Formik 'values' object
   *                    @param {string} values.email
   *                    @param {string} values.password
   *                    @param {string} values.username
   *                    @param {string} values.nickName
   *                    @param {Object} formikOptions (optional) Formik options object
   *                    @return {string}  result.globalErrorMessage
   *                    @return {boolean} result.success
   *
   * @return {string}   result.globalErrorMessage   This property is set if the login mutation returned an error that could be interpreted,
   *                                                it gives a human readable (already internationalized) error message to display to the user.
   * @return {boolean}  result.success              Set to true if all operations were successfull
   */
  useSubscribe({ mutation, mutationName } = {}) {
    let { performAction, mutationError, success } = this._useServiceMutation({
      mutation: mutation || gqlRegisterUserAccountMutation,
      mutationName: mutationName || "registerUserAccount",
    });
    const {
      login,
      success: loginSuccess,
      globalErrorMessage: loginGlobalErrorMessage,
    } = this.useLogin();
    let { globalErrorMessage } = this.parseMutationError(mutationError) || {};

    if (loginGlobalErrorMessage) {
      globalErrorMessage = loginGlobalErrorMessage;
      success = loginSuccess;
    }

    async function subscribe(values, formikOptions) {
      let result = await performAction(values, formikOptions);
      if (result.globalErrorMessage) {
        return result;
      } else {
        formikOptions && formikOptions.setSubmitting(true);
        return await login(values, formikOptions);
      }
    }

    return { subscribe, globalErrorMessage, success };
  }

  getLoginValidationSchema() {
    return Yup.object().shape({
      username: Yup.string().required(
        this.t(`${this.i18nKeyPrefix}FIELD_ERRORS.REQUIRED`)
      ),
      password: Yup.string().required(
        this.t(`${this.i18nKeyPrefix}FIELD_ERRORS.REQUIRED`)
      ),
    });
  }

  getLoginFormInitialValues() {
    return {
      username: "",
      password: "",
    };
  }

  /**
   * React hook that implement the login logic. Internally it uses the hook useMutation().
   * The hook gives a function to call when the login form is submitted. The function is designed
   * to work out of the box with a formik form (you can pass it to formik form 'onSubmit' handler).
   * You can also use it without formik, in which case just call the handler with you form values,
   * without second parameter (the formikOptions object).
   * If formikOptions is provided, the field errors are automatically set if the mutation return form validation
   * errors.
   *
   * After the mutation has successfully run, the handler automatically updates the service's `currentUser`
   * observable.
   *
   * The hook returns the property `success` set  to `true` if all operation succeded.
   * The hook returns the property `globalErrorMessage` set to a i18nized string in case of error.
   *
   * @param {Object} options.mutation Provide a custom graphQL mutation if you want don't want to use the default mutation (gqlLoginMutation) provided by the service.
   * @param {string} options.mutationName If a custom mutation is provided, provide here the mutation name, that is the key that allow to access
   *                                      the top level property of the object returned by the graphQL API in case of success.
   *
   * @return {function} result.login(values, formikOptions) => {success: <boolean>, globalErrorMessage: <string>}
   *
   *                    The function to call to perform the login action. The function will update the current user observable in case of succesful login.
   *                    @param {Object} values Form values object. An simple dictionnary in which the keys are the form's inputs names and their corresponding values.
   *                                           You can directly pass the Formik 'values' object. Below are the values expected if you use the default mutation.
   *                    @param {string} values.username
   *                    @param {string} values.password
   *                    @param {Object} formikOptions (optional) Formik options object
   *                    @return {string}  result.globalErrorMessage
   *                    @return {boolean} result.success
   *
   * @return {string}   result.globalErrorMessage   This property is set if the login mutation returned an error that could be interpreted,
   *                                                it gives a human readable (already internationalized) error message to display to the user.
   * @return {boolean}  result.success              Set to true if the login mutation was successfull
   */
  useLogin({ mutation, mutationName } = {}) {
    let self = this;
    let { performAction, mutationError, success } = this._useServiceMutation({
      mutation: mutation || gqlLoginMutation,
      mutationName: mutationName || "login",
    });
    let { globalErrorMessage } = this.parseMutationError(mutationError) || {};

    async function login(values, formikOptions) {
      let currentUserIsUpdated = new Promise((resolve) => {
        self.currentUser.pipe(take(2)).subscribe({
          complete: resolve,
        });
      });
      let result = await performAction(values, formikOptions);
      if (result.success) {
        self.refreshCurrentUser();
        await currentUserIsUpdated;
      }
      return result;
    }

    return { login, globalErrorMessage, success };
  }

  /**
   * React hook that implement the logout logic. Internally it uses the hook useMutation().
   * The hook returns a function `logout` to call in order to logout.
   *
   * After the mutation has successfully run, the handler automatically updates the service's `currentUser`
   * observable.
   *
   * The hook returns the property `success` set  to `true` if the logout operation succeded.
   * The hook returns the property `globalErrorMessage` set to a i18nized string in case of error.
   *
   * @param {Object} options.mutation Provide a custom graphQL mutation if you want don't want to use the default mutation (gqlLogoutMutation) provided by the service.
   * @param {string} options.mutationName If a custom mutation is provided, provide here the mutation name, that is the key that allow to access
   *                                      the top level property of the object returned by the graphQL API in case of success.
   *
   * @return {function} result.logout
   * @return {function} result.logout(values, formikOptions) => {success: <boolean>, globalErrorMessage: <string>}
   *                    The function to call to perform the logout action. This function will refresh the current user observable in case of succesfull
   *                    logout.
   *                    @param {Object} values Form values object. An simple dictionnary in which the keys are the form's inputs names and their corresponding values.
   *                                           You can directly pass the Formik 'values' object. Usefull if you use a custom mutation that need input variables. By default,
   *                                           the mutation doesn't need variables, so you can skip this parameter
   *                    @param {Object} formikOptions (optional) Formik options object
   *                    @return {string}  result.globalErrorMessage
   *                    @return {boolean} result.success
   * @return {string}   result.globalErrorMessage   This property is set if the login mutation returned an error that could be interpreted,
   *                                                it gives a human readable (already internationalized) error message to display to the user.
   * @return {boolean}  result.success              Set to true if the login mutation was successfull
   */
  useLogout({ mutation, mutationName } = {}) {
    let self = this;
    let { performAction, mutationError, success } = this._useServiceMutation({
      mutation: mutation || gqlLogoutMutation,
      mutationName: mutationName || "logout",
    });
    let { globalErrorMessage } = this.parseMutationError(mutationError) || {};

    async function logout(values, formikOptions) {
      let result = await performAction(values, formikOptions);
      if (result.success) {
        self.refreshCurrentUser();
      }
      return result;
    }

    return {
      logout,
      globalErrorMessage,
      success,
    };
  }

  getResetPasswordValidationSchema() {
    return Yup.object().shape({
      oldPassword: Yup.string().required(
        this.t(`${this.i18nKeyPrefix}FIELD_ERRORS.REQUIRED`)
      ),
      newPassword: Yup.string().required(
        this.t(`${this.i18nKeyPrefix}FIELD_ERRORS.REQUIRED`)
      ),
      newPasswordConfirm: Yup.string().required(
        this.t(`${this.i18nKeyPrefix}FIELD_ERRORS.REQUIRED`)
      ),
    });
  }

  getResetPasswordFormInitialValues() {
    return {
      oldPassword: "",
      newPassword: "",
      newPasswordConfirm: "",
    };
  }

  /**
   * React hook that implement the reset password logic
   * The hook gives a function to call when the reset password form is submitted.
   * If formikOptions is provided, the field errors are automatically set if the mutation return form validation
   * errors.
   *
   * The hook returns the property `success` set  to `true` if all operation succeded.
   * The hook returns the property `globalErrorMessage` set to a i18nized string in case of error.
   *
   * @param {Object} options.mutation Provide a custom graphQL mutation if you want don't want to use the default mutation (gqlResetUserAccountPasswordMutation)
   *                                  provided by the service.
   * @param {string} options.mutationName If a custom mutation is provided, provide here the mutation name, that is the key that allow to access
   *                                      the top level property of the object returned by the graphQL API in case of success.
   *
   * @return {function} result.resetPassword(values, formikOptions) => {success: <boolean>, globalErrorMessage: <string>}
   *                    The function to call to perform the graphQL mutation
   *                    @param {Object} values Form values object. An simple dictionnary in which the keys are the form's inputs names and their corresponding values.
   *                                           You can directly pass the Formik 'values' object. Below are the values expected if you use the default mutation
   *                    @param {Object} values.oldPassword
   *                    @param {Object} values.newPassword
   *                    @param {Object} values.newPasswordConfirm
   *                    @param {Object} formikOptions (optional) Formik options object
   *                    @return {string}  result.globalErrorMessage
   *                    @return {boolean} result.success
   * @return {string}   result.globalErrorMessage   This property is set if the login mutation returned an error that could be interpreted,
   *                                                it gives a human readable (already internationalized) error message to display to the user.
   * @return {boolean}  result.success              Set to true if the login mutation was successfull
   */
  useResetPassword({ mutation, mutationName } = {}) {
    let {
      performAction: resetPassword,
      mutationError,
      success,
    } = this._useServiceMutation({
      mutation: mutation || gqlResetUserAccountPasswordMutation,
      mutationName: mutationName || "resetUserAccountPassword",
    });
    let { globalErrorMessage } = this.parseMutationError(mutationError) || {};

    return { resetPassword, globalErrorMessage, success };
  }

  getResetPasswordByMailValidationSchema() {
    return Yup.object().shape({
      email: Yup.string()
        .required(this.t(`${this.i18nKeyPrefix}FIELD_ERRORS.REQUIRED`))
        .email(this.t(`${this.i18nKeyPrefix}FIELD_ERRORS.INVALID_EMAIL`)),
    });
  }

  getResetPasswordByMailFormInitialValues() {
    return {
      email: "",
      redirectUri: location.origin,
    };
  }

  /**
   * React hook that implement the reset password logic
   * The hook gives a function to call when the reset password form is submitted.
   * If formikOptions is provided, the field errors are automatically set if the mutation return form validation
   * errors.
   *
   * The hook returns the property `success` set  to `true` if all operation succeded.
   * The hook returns the property `globalErrorMessage` set to a i18nized string in case of error.
   *
   * @param {Object} options.mutation Provide a custom graphQL mutation if you want don't want to use the default mutation (gqlResetUserAccountPasswordByMailMutation)
   *                                  provided by the service.
   * @param {string} options.mutationName If a custom mutation is provided, provide here the mutation name, that is the key that allow to access
   *                                      the top level property of the object returned by the graphQL API in case of success.
   *
   * @return {function} result.resetPassword(values, formikOptions) => {success: <boolean>, globalErrorMessage: <string>}
   *                    The function to call to perform the graphQL mutation
   *                    @param {Object} values Form values object. An simple dictionnary in which the keys are the form's inputs names and their corresponding values.
   *                                           You can directly pass the Formik 'values' object. Below are the values expected if you use the default mutation
   *                    @param {Object} values.email
   *                    @param {Object} values.redirectUri
   *                    @param {Object} formikOptions (optional) Formik options object
   *                    @return {string}  result.globalErrorMessage
   *                    @return {boolean} result.success
   * @return {string}   result.globalErrorMessage   This property is set if the login mutation returned an error that could be interpreted,
   *                                                it gives a human readable (already internationalized) error message to display to the user.
   * @return {boolean}  result.success              Set to true if the login mutation was successfull
   */
  useResetPasswordByMail({ mutation, mutationName } = {}) {
    let {
      performAction: resetPassword,
      mutationError,
      success,
    } = this._useServiceMutation({
      mutation: mutation || gqlResetUserAccountPasswordByMailMutation,
      mutationName: mutationName || "resetUserAccountPasswordByMail",
    });
    let { globalErrorMessage } = this.parseMutationError(mutationError) || {};

    return { resetPassword, globalErrorMessage, success };
  }

  /**
   * React hook that implement the reset to delete an account.
   * The hook gives a function to call in order to delete the account. When the function if called, if the operation
   * is successfull, the services currentUser observable is updated.
   *
   * The hook returns the property `success` set  to `true` if the operation succeded.
   * The hook returns the property `globalErrorMessage` set to a i18nized string in case of error.
   *
   * @param {Object} options.mutation Provide a custom graphQL mutation if you want don't want to use the default mutation (gqlUnregisterUserAccountMutation)
   *                                  provided by the service.
   * @param {string} options.mutationName If a custom mutation is provided, provide here the mutation name, that is the key that allow to access
   *                                      the top level property of the object returned by the graphQL API in case of success.
   *
   * @return {function} result.unregisterUserAccount(values, formikOptions) => {success: <boolean>, globalErrorMessage: <string>}
   *                    The function to call to perform the graphQL mutation
   *                    @param {Object} values (optional) Form values object. An simple dictionnary in which the keys are the form's inputs names and their corresponding values.
   *                                           You can directly pass the Formik 'values' object. Usefull if you use a custom mutation that need input variables. By default,
   *                                           the mutation doesn't need variables, so you can skip this parameter
   *                    @param {Object} formikOptions (optional) Formik options object
   *                    @return {string}  result.globalErrorMessage
   *                    @return {boolean} result.success
   * @return {string}   result.globalErrorMessage   This property is set if the login mutation returned an error that could be interpreted,
   *                                                it gives a human readable (already internationalized) error message to display to the user.
   * @return {boolean}  result.success              Set to true if the login mutation was successfull
   */
  useUnregisterUserAccount({ mutation, mutationName } = {}) {
    let self = this;
    let { performAction, mutationError, success } = this._useServiceMutation({
      mutation: mutation || gqlUnregisterUserAccountMutation,
      mutationName: mutationName || "unregisterUserAccount",
    });
    let { globalErrorMessage } = this.parseMutationError(mutationError) || {};

    async function unregisterUserAccount(values, formikOptions) {
      let result = await performAction(values, formikOptions);
      if (result.success) {
        self.refreshCurrentUser();
      }
      return result;
    }

    return { unregisterUserAccount, globalErrorMessage, success };
  }

  /**
   * React hook. Gives the current logged user. If there is not logged in user it redirects to another URL
   * (presumably a page that isn't restricted to logged in users).
   *
   *
   * By default, it redirects to the route given as the option `redirectTo`. If this route is not provided, it will
   * redirect to '/'.
   *
   * @param {Object} options
   * @param {String} options.redirectTo The URL to use as redirection when the user is not logged
   * @param {Boolean} [options.autoRedirect=true] Autoredirect history to options.redirectTo if user not logged
   * @param {String} options.defaultUserValue The default value to return as user if no user is logged
   * @return {Object} result
   * @return {Object} result.user The current user object. If no user is logged, the value of options.defaultUserValue is returned
   * @return {boolean} result.isLogged Flag that tells if there is a logged in user
   * @return {boolean} result.loading  This flag is true when the service first initialize, and until the first network request returns.
   *                                   Until the flag becomes false, we cannot tell if there is or not a user logged in.
   */
  useLoggedUser(options = {}) {
    let { isLogged, user, loading } = useObservable(this.currentUser, {
      loading: true,
    });
    loading = !!loading;
    const history = useHistory();
    const location = useLocation();

    useEffect(() => {
      if (!loading && isLogged === false) {
        history.replace(location.pathname);
      }
    }, [isLogged]);

    return {
      user: user || options.defaultUserValue,
      isLogged,
      loading,
      useLogout: this.useLogout.bind(this),
    };
  }

  /**
   * Forces the service to fetch again the current user info on the API ('me' query) and the 'currentUser' observable
   * to emit a new user object
   */
  refreshCurrentUser() {
    this.refreshCurrentUserSubject.next(true);
  }
}

/** @type {UserAuthenticationService} */
let userAuthenticationService;

/**
 * @param apolloClient
 * @return {UserAuthenticationService}
 */
export function getUserAuthenticationService({ apolloClient }) {
  if (!userAuthenticationService) {
    userAuthenticationService = new UserAuthenticationService({
      t: i18next.t.bind(i18next),
      apolloClient,
    });
  }
  return userAuthenticationService;
}
