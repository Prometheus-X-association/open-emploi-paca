/*
 * Copyright (C) 2013-2018 MNEMOTIX <http://www.mnemotix.com/> and/or its affiliates
 * and other contributors as indicated by the @author tags.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import path from "path";
import webpack from "webpack";
import webpackMiddleware from "webpack-dev-middleware";
import webpackHotMiddleware from "webpack-hot-middleware";
import env from "env-var";
import expressStaticGzip from "express-static-gzip";

import { ExpressApp, logInfo } from "@mnemotix/synaptix.js";

/**
 * Prepare the frontend (source bundling with webpack) and setup the express middleware to serve it
 *
 * @param {Object} webpackConfig - Config to pass to Webpack
 */
export function serveFrontend({ webpackConfig }) {
  /**
   * Prepare the frontend (source bundling with webpack) and setup the express middleware to serve it
   *
   * @param {ExpressApp} app - The expressJS application, wrapped in a synaptix.js ExpressApp instance
   */
  return ({ app, authenticate }) => {
    if (!["production", "integration"].includes(process.env.NODE_ENV)) {
      logInfo(`Building webpack resources...`);

      const compiler = webpack(webpackConfig);
      const middleware = webpackMiddleware(compiler, {
        publicPath: webpackConfig.output.publicPath,
        writeToDisk: true,
      });

      app.use(middleware);
      app.use(webpackHotMiddleware(compiler));
    }

    app.use(
      expressStaticGzip("./dist", {
        enableBrotli: true,
        orderPreference: ["br"],
      }),
      authenticate({
        acceptAnonymousRequest: true,
        disableAuthRedirection: true,
      })
    );

    app.get(
      "*",
      authenticate({
        acceptAnonymousRequest: true,
        disableAuthRedirection: true,
      }),
      (req, res) => {
        res.sendFile(path.resolve(webpackConfig.output.path, "index.html"));
      }
    );
  };
}
