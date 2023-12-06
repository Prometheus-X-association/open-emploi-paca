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

import { locales } from "../../locales";

/**
 * Serves localized labels for the application under the endpoint /locales/:lang
 *
 * The locales are defined in the directory src/locales
 *
 */
export function serveLocales({ app }) {
  app.get("/locales/:lang", async (req, res) => {
    let lang = req.params.lang;
    let locale;

    if (process.env.NODE_ENV !== "production") {
      /* In development mode, dynamically load the locale file in order to have live reloading
       * if the file changes without restarting the server */
      let localeFile = `../../locales/${lang}`;
      delete require.cache[require.resolve(localeFile)];
      locale = require(localeFile)[lang];
    } else {
      locale = locales[lang];
    }

    if (!locale) {
      res.send(404);
    }

    return res.json(locale);
  });
}
