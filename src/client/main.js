import {Suspense} from "react";
import ReactDOM from "react-dom";
import {BrowserRouter} from "react-router-dom";
import {ThemeProvider} from "@material-ui/core/styles";
import {SnackbarProvider} from "notistack";

import {I18nService} from "./utilities/i18n/I18nService";
import {LoadingSpinner} from "./components/widgets/LoadingSpinner";
import ErrorBoundary from "./components/widgets/ErrorBoundary";
import possibleTypes from "./gql/possibleTypes";
import {ApolloProvider} from "./components/ApolloProvider";

import {Application} from "./Application";
import {theme} from "./theme";

/**
 * Launch application
 * @return {Promise<void>}
 */
async function launchApplication(){
  const i18n = await I18nService();

  ReactDOM.render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <SnackbarProvider maxSnack={3}>
          <ApolloProvider i18n={i18n} possibleTypes={possibleTypes}>
            <Suspense fallback={<LoadingSpinner />}>
              <ErrorBoundary>
                <Application theme={theme} />
              </ErrorBoundary>
            </Suspense>
          </ApolloProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </BrowserRouter>,
    document.getElementById("react-root")
  );
}

launchApplication()
  .then(() => {
    // Application launched
  });
