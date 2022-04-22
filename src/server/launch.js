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
import { DataModel, launchApplication, logInfo } from "@mnemotix/synaptix.js";
import dotenv from "dotenv";

import { serveGraphQL } from "./middlewares/serveGraphQL";
import { serveFrontend } from "./middlewares/serveFrontend";
import { serveLocales } from "./middlewares/serveLocales";
import { servePdf } from "./middlewares/servePdf";
import { serveAddviseo } from "./middlewares/serveAddviseo";
import { serveGDPR } from "./middlewares/serveGDPR";

/**
 * @param {object} Package - Basically package.json file.
 * @param {object} environmentDefinition - Environment file describing require env variables
 * @param {[DataModel]} extraDataModels
 * @param {object} locales
 * @param {object} webpackConfig
 */
export function launch({
  Package,
  environmentDefinition,
  extraDataModels,
  locales = {},
  webpackConfig,
} = {}) {
  dotenv.config();

  let launchMiddlewares = [
    servePdf,
    serveLocales({ locales }),
    serveAddviseo,
    serveGDPR,
  ];

  if (!parseInt(process.env.FRONTEND_DISABLED)) {
    launchMiddlewares.push(serveFrontend({ webpackConfig }));
  }

  return launchApplication({
    Package,
    environment: environmentDefinition,
    generateGraphQLEndpoints: serveGraphQL({
      extraDataModels,
      environmentDefinition,
    }),
    launchMiddlewares,
  })
    .then(() => {
      if (!!parseInt(process.env.FRONTEND_DISABLED)) {
        logInfo(
          "`FRONTEND_DISABLED` variable detected. Frontend is disabled, serve API only."
        );
      }
    })
    .catch((error) => console.log(error));
}
