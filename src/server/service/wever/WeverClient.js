/**
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
 */

import got from "got";
import { I18nError, logError } from "@mnemotix/synaptix.js";
import dayjs from "dayjs";
import { createCache } from "../Cache";
import env from "env-var";

// TTL = 5 min
const cache = createCache({ ttl: 300 });

class WeverClient {
  /**
   * Get the Wever application token.
   * @return {string}
   */
  getApplicationToken() {
    return env.get("WEVER_APPLICATION_TOKEN").required().asString();
  }

  /**
   * Make an API Request
   * @param {string} service - OpenWeather API service name (IE: onecall)
   * @param {object} [params]  - OpenWeather API service params
   * @param {object} [requestOptions]
   * @return {object}
   */
  async get({ service = "", params = {}, requestOptions = {} } = {}) {
    params.cacheBuster = dayjs().format("YYYYMMDDHH");
    const serializedParams = Object.entries(params)
      .reduce((acc, [key, value]) => {
        if (Array.isArray(value)) {
          for (let valueFragment of value) {
            acc.push(`${key}=${valueFragment}`);
          }
        } else {
          acc.push(`${key}=${value}`);
        }
        return acc;
      }, [])
      .join("&");

    const uri = `${env
      .get("WEVER_API_ENDPOINT")
      .required()
      .asString()}${service}`;
    const cachedUri = `${uri}?${serializedParams}`;

    if (cache.has(cachedUri)) {
      return cache.get(cachedUri);
    }

    let response = await got({
      url: uri,
      method: "POST",
      retry: 3,
      json: params,
      ...requestOptions,
    }).json();

    if (response) {
      cache.set(cachedUri, response);
      return response;
    }
  }

  /**
   * Make an API Request
   * @param {object} [params]  - Wever API service params
   * @return {{
   *   token: string,
   *   reportId: string,
   *   mapId: string
   * }}
   */
  async getUserInfos({ email } = {}) {
    try {
      const result =
        (await this.get({
          service: "/auth/partner",
          params: {
            email,
            token: this.getApplicationToken(),
          },
        })) || {};

      console.log(result);
      return result;
    } catch (e) {
      logError("There is an error while fetch Wever API :");
      logError(e);
      return {};
    }
  }
}

export const weverClient = new WeverClient();
