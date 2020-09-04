import React from "react";
import invariant from "invariant";
import {ApolloClient} from "apollo-client";
import {HttpLink} from "apollo-link-http";
import {onError} from "apollo-link-error";
import {ApolloLink, concat} from "apollo-link";
import {InMemoryCache, IntrospectionFragmentMatcher} from "apollo-cache-inmemory";
import {SnackErrorMessage} from "../components/widgets/Snackbar/SnackErrorMessage";

export function getApolloClient({i18n, enqueueSnackbar, gqlFragments} = {}) {
  invariant(
    gqlFragments,
    "FragmentTypes must be passed. GQL Fragments are generally generated during application start. @see https://www.apollographql.com/docs/react/data/fragments/ for more details."
  );

  const fragmentMatcher = new IntrospectionFragmentMatcher({
    introspectionQueryResultData: gqlFragments
  });

  if (process.env.NODE_ENV === "test") {
    let miniStackTrace = new Error().stack
      .split("\n")
      .splice(1, 5)
      .join("\n");
    console.warn(
      "You are using the default apollo client ApolloClient in a test environment. This probably won't work " +
        "because the default apollo client hasn't access to the graphQL mocks (as provided by apollo MockedProvider). You should either mock " +
        "the service that use the apollo client in your test suite, or inject this service with a mocked apollo client such as the one " +
        "defined at /jest/utilities/MockedApolloClient.js\n\n" +
        miniStackTrace
    );
  }

  const httpLink = new HttpLink({uri: "/graphql"});

  // middleware for language
  const languageMiddleware = new ApolloLink((operation, forward) => {
    // add the authorization to the headers
    operation.setContext(({headers = {}}) => ({
      headers: {
        ...headers,
        Lang: i18n.language || "fr"
      }
    }));
    return forward(operation);
  });

  // middleware for gql error
  const errorLink = onError(({graphQLErrors, networkError}) => {
    if (graphQLErrors) {
      graphQLErrors.map(({message, extraInfos, stack, path}) => {
        const ignore = [
          "NOT AUTHENTICATED",
          "USER_MUST_BE_AUTHENTICATED",
          "INVALID_CREDENTIALS",
          "FORM_VALIDATION_ERROR"
        ];
        if (ignore.includes(message.toUpperCase())) {
          // what to do if user not authenticated?
          // route to login is already done
        } else {
          if (typeof extraInfos === "object" && extraInfos !== null) {
            extraInfos = JSON.stringify(extraInfos);
          }

          console.error(
            `[GraphQL error]: Message: ${message}, extraInfos: ${extraInfos}, 
            stack:${JSON.stringify(stack, null, 2)}, Path: ${path}`
          );

          enqueueSnackbar(message, {
            content: (id, message) => {
              return (
                <SnackErrorMessage
                  id={id}
                  message={message}
                  error={
                    <>
                      In path : {(path || []).join(".")}
                      <br />
                      Stack :{" "}
                      {(stack || []).map((line, index) => (
                        <div key={index}>{line}</div>
                      ))}
                    </>
                  }
                />
              );
            },
            persist: true,
            anchorOrigin: {
              vertical: "bottom",
              horizontal: "right"
            }
          });
        }
      });
    }
    if (networkError) console.log(`[Network error]: ${networkError}`);
  });

  // create the client and pass the middleware et cache config
  const apolloClient = new ApolloClient({
    link: concat(languageMiddleware, concat(errorLink, httpLink)),
    cache: new InMemoryCache({
      fragmentMatcher,
      dataIdFromObject: o => {
        return o.id;
      }
    }),
    defaultOptions: {
      watchQuery: {
        query: "cache-and-network"
      }
    }
  });

  i18n.on("languageChanged", () => {
    apolloClient.resetStore();
  });

  return apolloClient;
}
