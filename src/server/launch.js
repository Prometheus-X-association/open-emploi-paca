/*
 * Copyright (C) 2013-2018 MNEMOTIX <http://www.mnemotix.com/> and/or its affiliates
 * and other contributors as indicated by the @author tags.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import { launchApplication, logInfo } from "@mnemotix/synaptix.js";
import dotenv from "dotenv";
import env from "env-var";

import Package from "../../package.json";
import environmentDefinition from "./config/environment";
import webpackConfig from "../../webpack.config";

import { generateGraphQLEndpoints } from "./datamodel/generateGraphQLEndpoints";

import { serveFrontend } from "./middlewares/serveFrontend";
import { serveLocales } from "./middlewares/serveLocales";
import { serveAddviseo } from "./middlewares/serveAddviseo";
import { serveGDPR } from "./middlewares/serveGDPR";

dotenv.config();

let launchMiddlewares = [
  serveLocales,
  serveGDPR,
  serveFrontend({ webpackConfig })
];

// Disable Addviseo middleware is related env vars not set
if (
  !!env.get("ADDVISEO_AUTH_LOGIN").asString() &&
  !!env.get("ADDVISEO_AUTH_TOKEN").asString() &&
  !!env.get("ADDVISEO_PASSWORD_SALT").asString()
) {
  launchMiddlewares.push(serveAddviseo);
}

launchApplication({
  Package,
  environment: environmentDefinition,
  launchMiddlewares,
  graphQLEndpoints: generateGraphQLEndpoints({
    environmentDefinition
  }),
})
  .then(() => {
    if (!!parseInt(process.env.FRONTEND_DISABLED)) {
      logInfo(
        "`FRONTEND_DISABLED` variable detected. Frontend is disabled, serve API only."
      );
    }
  })
  .catch((error) => console.log(error));
