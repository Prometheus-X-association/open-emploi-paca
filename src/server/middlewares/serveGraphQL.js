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

import { DataModel } from "@mnemotix/synaptix.js";
import { generateDatastoreAdapater } from "./generateDatastoreAdapter";
import { generateDataModel } from "../datamodel/generateDataModel";

/**
 * @param {[DataModel]} extraDataModels
 * @param {object} environmentDefinition
 */
export function serveGraphQL({ extraDataModels, environmentDefinition }) {
  /**
   * A function to be passed to synaptix.js launchApplication's `serveGraphQL` parameter
   * Initialize some configuration for the graphQL engine (datastore, network layer, graphQL schema from the data model)
   *
   * @param {ExpressApp} app - The synapix.js ExpressApp instance which will run the application server
   * @param {SSOApiClient} ssoApiClient
   */
  return async ({ ssoApiClient }) => {
    const dataModel = generateDataModel({
      extraDataModels,
      environmentDefinition,
    });

    const datastoreAdapter = generateDatastoreAdapater({
      ssoApiClient,
      dataModel,
    });

    /**
     * Initializing GraphQL endpoints
     */
    return [
      {
        endpointURI: "/graphql",
        graphQLSchema: dataModel.generateExecutableSchema(),
        datastoreAdapter,
        datastoreAdapterKey: "default",
        acceptAnonymousRequest: true,
      },
    ];
  };
}
