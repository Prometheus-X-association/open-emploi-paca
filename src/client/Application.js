import React, {Suspense} from "react";
import {Route, Switch} from "react-router-dom";
import loadable from "@loadable/component";
import {useQuery} from "@apollo/client";
import {gql} from "@apollo/client";
import Helmet from "react-helmet";
import {ROUTES} from "./routes";
import EnvVars from "../server/config/environment";

import {useLoggedUser} from "./hooks/useLoggedUser";
import {EnvironmentContext} from "./hooks/useEnvironment";
import {DefaultLayout} from "./components/layouts/DefaultLayout";
import {LoadingSplashScreen} from "./components/widgets/LoadingSplashScreen";
import favicon from "./assets/favicon.ico";

const SignIn = loadable(() => import(/* webpackChunkName: "SignIn" */ "./components/routes/Authentication/SignIn"));
const SignUp = loadable(() => import(/* webpackChunkName: "SignUp" */ "./components/routes/Authentication/SignUp"));
const PasswordForgotten = loadable(() =>
  import(/* webpackChunkName: "PasswordForgotten" */ "./components/routes/Authentication/PasswordForgotten")
);
const Profile = loadable(() => import(/* webpackChunkName: "Profile" */ "./components/routes/Profile/Profile"));
const Dashboard = loadable(() => import(/* webpackChunkName: "Dashboard" */ "./components/routes/Dashboard/Dashboard"));
const Project = loadable(() => import(/* webpackChunkName: "Project" */ "./components/routes/Project/Project"));
const Market = loadable(() => import(/* webpackChunkName: "Market" */ "./components/routes/Market/Market"));
const Incomes = loadable(() => import(/* webpackChunkName: "Incomes" */ "./components/routes/Incomes/Incomes"));


const EditExperience = loadable(() => import(/* webpackChunkName: "EditExperience" */ "./components/routes/Cartonet/Experience/EditExperience"));
const EditAptitudes = loadable(() => import(/* webpackChunkName: "EditAptitudes" */ "./components/routes/Cartonet/Aptitudes/EditAptitudes"));
const Cartography = loadable(() => import(/* webpackChunkName: "Cartography" */ "./components/routes/Cartonet/Cartography/Cartography"));
const OccupationsMatching = loadable(() => import(/* webpackChunkName: "OccupationsMatching" */ "./components/routes/Cartonet/Recommendation/OccupationsMatching"));
const gqlEnvironmentQuery = gql`
  query EnvironmentQuery {
    environment {
      ${Object.entries(EnvVars)
        .filter(([variable, {exposeInGraphQL}]) => exposeInGraphQL === true)
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
  const {data: envData, loading: envLoading} = useQuery(gqlEnvironmentQuery);
  const {isLogged, isAdmin, isContributor, isEditor, loading} = useLoggedUser();

  return (
    <EnvironmentContext.Provider value={envData?.environment}>
      <Helmet>
        <title>Open Emploi Région Sud</title>
        <meta name="description" content="Application pour l'Open Emploi de la Région Sud" />
        <link rel="icon" href={favicon} sizes="32x32" />
      </Helmet>

      <Choose>
        <When condition={loading || envLoading}>
          <LoadingSplashScreen />
        </When>

        <When condition={isLogged}>
          <Suspense fallback={<LoadingSplashScreen />}>
            <Switch>
              <Route exact path={ROUTES.CARTONET_EDIT_EXPERIENCE} component={EditExperience}/>
              <Route exact path={ROUTES.CARTONET_EDIT_TRAINING}   render={() => <EditExperience experienceType={"training"}/>}/>
              <Route exact path={ROUTES.CARTONET_EDIT_HOBBY}      render={() => <EditExperience experienceType={"hobby"}/>}/>
              <Route exact path={ROUTES.CARTONET_EDIT_APTITUDES}  component={EditAptitudes}/>
              <Route exact path={ROUTES.CARTONET_SHOW_PROFILE}    component={Cartography}/>
              <Route exact path={ROUTES.CARTONET_SHOW_JOBS} component={OccupationsMatching} />

              <Route>
                <DefaultLayout>
                  <Switch>
                    <Route path={ROUTES.PROFILE} component={Profile} />
                    <Route path={ROUTES.PROJECT} component={Project} />
                    <Route path={ROUTES.MARKET} component={Market} />
                    <Route path={ROUTES.INCOMES} component={Incomes} />
                    <Route component={Dashboard} />
                  </Switch>
                </DefaultLayout>
              </Route>
            </Switch>
          </Suspense>
        </When>

        <Otherwise>
          <Switch>
            <Route exact path={ROUTES.PASSWORD_FORGOTTEN} component={PasswordForgotten} />
            <Route exact path={ROUTES.SIGN_UP} component={SignUp} />
            <Route component={SignIn} />
          </Switch>
        </Otherwise>
      </Choose>
    </EnvironmentContext.Provider>
  );
}
