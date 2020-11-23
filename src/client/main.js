import React from "react";
import ReactDOM from "react-dom";
import {BrowserRouter} from "react-router-dom";
import {ThemeProvider} from "@material-ui/core/styles";
import {ApolloProvider} from "@apollo/client";
import loadable from "@loadable/component";
import {SnackbarProvider, useSnackbar} from "notistack";

import {I18nService} from "./services/I18nService";
import {LoadingSplashScreen} from "./components/widgets/LoadingSplashScreen";
import ErrorBoundary from "./components/widgets/ErrorBoundary";
import {getApolloClient} from "./utilities/getApolloClient";
import possibleTypes from "./gql/possibleTypes";
import {theme} from "./theme";

const Application = loadable(() => import("./Application"));

let reactRootElement = document.getElementById("react-root");

const ApolloContainer = ({i18n, children, possibleTypes}) => {
  const {enqueueSnackbar} = useSnackbar();
  return <ApolloProvider client={getApolloClient({i18n, enqueueSnackbar, possibleTypes})}>{children}</ApolloProvider>;
};

I18nService().then(i18n => {
  ReactDOM.render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <SnackbarProvider maxSnack={3}>
          <ApolloContainer i18n={i18n} possibleTypes={possibleTypes}>
            <React.Suspense fallback={<LoadingSplashScreen />}>
              <ErrorBoundary>
                <Application theme={theme} />
              </ErrorBoundary>
            </React.Suspense>
          </ApolloContainer>
        </SnackbarProvider>
      </ThemeProvider>
    </BrowserRouter>,
    reactRootElement
  );
});
