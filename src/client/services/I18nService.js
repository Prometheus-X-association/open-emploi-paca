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

import i18n from "i18next";
import i18nextXhrBackend from "i18next-xhr-backend";
import {initReactI18next} from "react-i18next";
import "dayjs/locale/fr";
import "dayjs/locale/en";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import RelativeTime from "dayjs/plugin/relativeTime";

export async function I18nService() {
  let lang = localStorage.getItem("lang") || "fr";

  dayjs.extend(LocalizedFormat);
  dayjs.locale(lang);
  dayjs.extend(RelativeTime);

  await i18n
    .use(i18nextXhrBackend)
    .use(initReactI18next)
    .init(
      {
        backend: {
          loadPath: "/locales/{{lng}}"
        },
        fallbackLng: "fr",
        lng: lang,
        ns: ["common"],
        defaultNS: "common",
        debug: false,
        interpolation: {
          escapeValue: false // not needed for react!!
        },
        keySeparator: ".",
        react: {
          useSuspense: true,
          transSupportBasicHtmlNodes: true
        }
      },
      (err, t) => {}
    );

  return i18n;
}
