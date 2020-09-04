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

import got from "got";
import {logError} from "@mnemotix/synaptix.js";

/**
 * Serves localized labels for the application under the endpoint /locales/:lang
 *
 * The locales are defined in the directory src/locales
 *
 */
export async function servePdf({app}) {
  app.get("/pdf", async (req, res) => {
    try {
      const uri = req.query.uri.replace(' ', '+');
      got
        .stream(uri)
        .on("response", res => {
          res.headers["content-disposition"] = "";
        })
        .on("error", error => {
          logError(`Impossible to proxy PDF located at ${uri}`);
          console.log(error);
          res.status(500).send(error);
        })
        .pipe(res);
    } catch (e) {
      res.status(500).send(e.message);
    }
  });
}
