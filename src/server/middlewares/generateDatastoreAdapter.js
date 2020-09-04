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

import {
  ExpressApp,
  MnxActionGraphMiddleware,
  NetworkLayerAMQP,
  SSOApiClient,
  SynaptixDatastoreAdapter,
  SynaptixDatastoreRdfAdapter
} from "@mnemotix/synaptix.js";
import kebabCase from "lodash/kebabCase";

/**
 * A function to generate a datastore adapter with inited network layer.
 *
 * @param {ExpressApp} app - The synapix.js ExpressApp instance which will run the application server
 * @param {SSOApiClient} [ssoApiClient]
 * @param {DataModel} dataModel
 * @return {{datastoreAdapter: SynaptixDatastoreAdapter, networkLayer: NetworkLayerAMQP}}
 */
export async function generateDatastoreAdapater({
  ssoApiClient,
  graphMiddlewares,
  dataModel
} = {}) {
  /**
   * Connecting network layer.
   */
  const amqpURL = `amqp://${process.env.RABBITMQ_LOGIN}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`;

  let networkLayer = new NetworkLayerAMQP(
    amqpURL,
    process.env.RABBITMQ_EXCHANGE_NAME,
    {},
    {
      durable: !!parseInt(process.env.RABBITMQ_EXCHANGE_DURABLE || 1)
    }
  );

  await networkLayer.connect();

  if (!graphMiddlewares) {
    graphMiddlewares = [new MnxActionGraphMiddleware()];
  }

  /**
   * Initializing datastore adapter (data layer).
   */
  const datastoreAdapter = new SynaptixDatastoreRdfAdapter({
    networkLayer,
    modelDefinitionsRegister: dataModel.generateModelDefinitionsRegister(),
    ssoApiClient,
    graphMiddlewares,
    nodesTypeFormatter: nodeType => {
      return kebabCase(nodeType);
    }
  });

  return {
    networkLayer,
    datastoreAdapter
  };
}
