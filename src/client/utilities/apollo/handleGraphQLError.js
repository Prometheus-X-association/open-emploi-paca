import invariant from "invariant";

/**
 * Possible error scenarios :
 *
 * - GraphQL request errors, the apollo client gives us an error object
 *   - it has `graphQLErrors` property (an array of graphQLError objects): errors that occured in the graphQL resolvers
 *   - it has `networkError` property : error that occured outside of the graphQL resolvers (this includes the error relative to a malformed graphQL queries)
 *
 *
 * - Return object :
 *
 *   {
 *      globalErrorMessage: "A single message to describe the error",
 *      formValidationErrors: {
 *        "inputName1: "Description of error for input1",
 *        "inputName2": Description of error for input2"
 *      }
 *   }
 *
 * @param {Object}   error The error object as received by the failed mutation
 * @param {Object}   formikOptions If provided, the function will call the formik helpers such as setFieldError
 * @param {i18next.TFunction} t             react-18next t() translate function
 * @param {String}   [i18nKeyPrefix]  The custom prefix to use in i18n keys of error messages. Default : 'SYNAPTIX-CLIENT-TOOLKIT'.
 */
export function handleGraphQLError(
  error,
  { formikOptions, t, i18nKeyPrefix = "SYNAPTIX-CLIENT-TOOLKIT." } = {}
) {
  invariant(!!t, "t translation service must be provided");
  if (typeof error === "undefined") return;
  if (error.networkError) {
    console.warn("Apollo request returned the following Network error");
    console.warn(error.networkError);
  }
  if (!error.graphQLErrors) {
    /* This is not an expected error format, throw it again */
    throw error;
  }
  console.warn("Apollo request returned the following GraphQL error");
  console.warn(JSON.stringify(error, null, 2));
  let globalErrorMessage, formValidationErrors, newStatus;
  let graphQLErrors = error.graphQLErrors;
  if (graphQLErrors.length > 0) {
    /* Handle graphQL errors */
    ({ globalErrorMessage, formValidationErrors } = parseGraphQLErrors({
      graphQLErrors,
      formikOptions,
      t,
      i18nKeyPrefix,
    }));
  } else {
    /* Unexpected error, probably under networkError */
    globalErrorMessage = t(`${i18nKeyPrefix}GENERAL_ERRORS.UNEXPECTED_ERROR`);
  }

  return {
    globalErrorMessage,
    formValidationErrors,
  };
}

/**
 *
 * @param {Object}   options
 * @param {Array}    options.graphQLErrors The array of graphQLError objects, as returned by the apollo API
 * @param {Object}   options.formikOptions If provided, the function will call the formik helpers such as setFieldError
 *                                         according to the API response.
 * @param {function} options.t react-18next t() translate function
 *
 * @return {Object} result                      The encapsulating object for the different values returned by the function
 * @return {string} result.globalErrorMessage   The global error message to display, that summarizes the best the batch of errors. This is
 *                                              a i18n key, to be translated by the i18n framework.
 * @return {Object} result.formValidationErrors
 */
function parseGraphQLErrors({
  graphQLErrors,
  formikOptions,
  t,
  i18nKeyPrefix,
}) {
  let formValidationErrors;

  /* Handle each graphQL Error */
  graphQLErrors.forEach((graphQLError) => {
    ({ formValidationErrors } = parseGraphQLError({
      graphQLError,
      formikOptions,
      t,
      i18nKeyPrefix,
    }));
  });

  /* Determine one global error message to show.
   *
   * Strategy : search for the following expected errors :
   * - FORM_VALIDATION_ERROR
   * - INVALID_CREDENTIALS
   * Otherwise, show UNEXPECTED_ERROR.
   */
  let globalErrorMessage;
  /*
   * To avoid displaying untranslated messages to the user, we whitelist here the messages codes that have
   * translations ready, otherwise we display the generic error message
   */
  const translatedErrorCodes = [
    "FORM_VALIDATION_ERROR",
    "INVALID_CREDENTIALS",
    "USER_MUST_BE_AUTHENTICATED",
    "USER_NOT_ALLOWED",
  ];
  let firstErrorCode = graphQLErrors.find((err) =>
    translatedErrorCodes.includes(err.message)
  );
  if (firstErrorCode) {
    globalErrorMessage = t(
      `${i18nKeyPrefix}GENERAL_ERRORS.${firstErrorCode.message}`
    );
  } else {
    globalErrorMessage = t(`${i18nKeyPrefix}GENERAL_ERRORS.UNEXPECTED_ERROR`);
  }

  return {
    globalErrorMessage,
    formValidationErrors,
  };
}

/**
 * Parsing logic for a single graphQLError object
 */
function parseGraphQLError({ graphQLError, formikOptions, t, i18nKeyPrefix }) {
  let formValidationErrors = {};
  if (graphQLError.message === "FORM_VALIDATION_ERROR") {
    /* Handle FORM_VALIDATION_ERROR kind of error */
    /* Parse formInputErrors */
    graphQLError.formInputErrors.forEach((formInputError) => {
      let formikFieldName = formInputError.field.replace(/^input\./, "");
      /* We display only the first message of the array of error messages */
      let errorMessage = t(
        `${i18nKeyPrefix}FIELD_ERRORS.${formInputError.errors[0]}`
      );
      if (formikOptions) {
        formikOptions.setFieldError(formikFieldName, errorMessage);
      }
      formValidationErrors[formikFieldName] = errorMessage;
    });
  }
  return { formValidationErrors };
}
