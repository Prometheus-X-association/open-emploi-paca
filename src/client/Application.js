import { Suspense } from "react";
import { Route, Switch } from "react-router-dom";
import loadable from "@loadable/component";
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import Helmet from "react-helmet";
import { ROUTES } from "./routes";
import EnvVars from "../server/config/environment";

import { useLoggedUser } from "./hooks/useLoggedUser";
import { EnvironmentContext } from "./hooks/useEnvironment";
import { DefaultLayout } from "./components/layouts/DefaultLayout";
import { LoadingSplashScreen } from "./components/widgets/LoadingSplashScreen";
import favicon from "./assets/favicon.ico";
import { CssBaseline } from "@material-ui/core";

const SignIn = loadable(() =>
  import("./components/routes/Authentication/SignIn")
);
const SignUp = loadable(() =>
  import("./components/routes/Authentication/SignUp")
);
const PasswordForgotten = loadable(() =>
  import("./components/routes/Authentication/PasswordForgotten")
);
const Profile = loadable(() => import("./components/routes/Profile/Profile"));
const Dashboard = loadable(() =>
  import("./components/routes/Dashboard/Dashboard")
);
const Project = loadable(() => import("./components/routes/Project/Project"));
const Market = loadable(() => import("./components/routes/Market/Market"));
const Incomes = loadable(() => import("./components/routes/Incomes/Incomes"));
const Trainings = loadable(() =>
  import("./components/routes/Trainings/Trainings")
);
const Skills = loadable(() => import("./components/routes/Skills/Skills"));

const Cartonet = loadable(() =>
  import("./components/routes/Cartonet/Cartonet")
);

const gqlEnvironmentQuery = gql`
  query EnvironmentQuery {
    environment {
      ${Object.entries(EnvVars)
        .filter(([variable, { exposeInGraphQL }]) => exposeInGraphQL === true)
        .map(([variable]) => variable)}
    }
  }
`;

/**
 * @param extensions
 * @return {*}
 * @constructor
 */
export default function Application({} = {}) {
  const { data: envData, loading: envLoading } = useQuery(gqlEnvironmentQuery);
  const { isLogged, loading } = useLoggedUser();

  return (
    <EnvironmentContext.Provider value={envData?.environment}>
      <CssBaseline />

      <Helmet>
        <title>Open Emploi Région Sud</title>
        <meta
          name="description"
          content="Application pour l'Open Emploi de la Région Sud"
        />
        <link rel="icon" href={favicon} sizes="32x32" />
      </Helmet>

      <Choose>
        <When condition={loading || envLoading}>
          <LoadingSplashScreen />
        </When>

        <When condition={isLogged}>
          <Suspense fallback={<LoadingSplashScreen />}>
            <Switch>
              <Route path={"/cartonet"} component={Cartonet} />

              <Route>
                <DefaultLayout>
                  <Switch>
                    <Route path={ROUTES.PROFILE} component={Profile} />
                    <Route path={ROUTES.PROJECT} component={Project} />
                    <Route path={ROUTES.MARKET} component={Market} />
                    <Route path={ROUTES.INCOMES} component={Incomes} />
                    <Route path={ROUTES.TRAININGS} component={Trainings} />
                    <Route path={ROUTES.SKILLS} component={Skills} />
                    <Route component={Dashboard} />
                  </Switch>
                </DefaultLayout>
              </Route>
            </Switch>
          </Suspense>
        </When>

        <Otherwise>
          <Switch>
            <Route
              exact
              path={ROUTES.PASSWORD_FORGOTTEN}
              component={PasswordForgotten}
            />
            <Route exact path={ROUTES.SIGN_UP} component={SignUp} />
            <Route component={SignIn} />
          </Switch>
        </Otherwise>
      </Choose>
    </EnvironmentContext.Provider>
  );
}
