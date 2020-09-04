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

export default {
  UUID: {
    description: 'This is the application UUID.',
    defaultValue: () => `oep-application-${Date.now()}`,
    defaultValueInProduction: true
  },
  SCHEMA_NAMESPACE_MAPPING: {
    description: 'The ReSource ontology schema namespace mapping',
    defaultValue: JSON.stringify({
      "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
      "skos": "http://www.w3.org/2004/02/skos/core#",
      "geonames": "https://www.geonames.org/",
      "foaf": "http://xmlns.com/foaf/0.1/",
      "prov": "http://www.w3.org/ns/prov#",
      "sioc": "http://rdfs.org/sioc/ns#",
      "dc": "http://purl.org/dc/terms/",
      "mnx": "http://ns.mnemotix.com/ontologies/2019/8/generic-model/",
      "mm": "https://ontologies.mindmatcher.org/carto/",
      "oep": "http://ontology.datasud.fr/openemploi/",
    }),
    defaultValueInProduction: true
  },
  NODES_NAMESPACE_URI: {
    description: 'The nodes (or individuals) (or class instances) namespace URI',
    defaultValue: 'https://data.dataregionsud.fr/openemploi/',
    defaultValueInProduction: true
  },
  NODES_PREFIX: {
    description: 'The nodes or individuals) (or class instances) namespace URI',
    defaultValue: 'oepd',
    defaultValueInProduction: true
  },
  NODES_NAMED_GRAPH: {
    description: 'The ReSource nodes named graph URI',
    defaultValue: 'https://data.dataregionsud.fr/openemploi/NG',
    defaultValueInProduction: true
  },
  OAUTH_BASE_URL: {
    description: 'This is the OAUTH server host',
    defaultValue: 'http://localhost:8181'
  },
  OAUTH_REALM: {
    description: "This is the OAUTH realm used for this app",
    defaultValue: 'oep',
  },
  OAUTH_AUTH_URL: {
    description: 'This is the OAUTH authentication URL',
    defaultValue: () => `${process.env.OAUTH_BASE_URL}/auth/realms/${process.env.OAUTH_REALM}/protocol/openid-connect/auth`,
    defaultValueInProduction: true
  },
  OAUTH_TOKEN_URL: {
    description: 'This is the OAUTH token validation URL',
    defaultValue: () => `${process.env.OAUTH_BASE_URL}/auth/realms/${process.env.OAUTH_REALM}/protocol/openid-connect/token`,
    defaultValueInProduction: true
  },
  OAUTH_LOGOUT_URL: {
    description: 'This is the OAUTH logout URL',
    defaultValue: () => `${process.env.OAUTH_BASE_URL}/auth/realms/${process.env.OAUTH_REALM}/protocol/openid-connect/logout`,
    defaultValueInProduction: true,
  },
  OAUTH_REALM_CLIENT_ID: {
    description: 'This is the OAUTH Realm client ',
    defaultValue: 'api'
  },
  OAUTH_REALM_CLIENT_SECRET: {
    description: 'This is the OAUTH shared secret between this client app and OAuth2 server.',
    defaultValue: 'e9a7be6b-5850-4d22-8740-a8d535e2880b',
    obfuscate: true
  },
  OAUTH_ADMIN_USERNAME: {
    description: 'This is the OAUTH admin username',
    defaultValue: 'admin'
  },
  OAUTH_ADMIN_PASSWORD: {
    description: 'This is the OAUTH admin password',
    defaultValue: 'rspwd!',
    obfuscate: true
  },
  OAUTH_ADMIN_TOKEN_URL: {
    description: 'This is the OAUTH token validation URL for admin session',
    defaultValue: () => `${process.env.OAUTH_BASE_URL}/auth/realms/master/protocol/openid-connect/token`,
    defaultValueInProduction: true
  },
  OAUTH_ADMIN_API_URL: {
    description: 'This is the OAUTH API admin session',
    defaultValue: () => `${process.env.OAUTH_BASE_URL}/auth/admin/realms/${process.env.OAUTH_REALM}`,
    defaultValueInProduction: true
  },
  APP_PORT: {
    description: 'This is listening port of the application.',
    defaultValue: 3034
  },
  APP_URL: {
    description: 'This is the base url of the application.',
    defaultValue: () => `http://localhost:${process.env.APP_PORT}`
  },
  RABBITMQ_HOST: {
    description: 'This is RabbitMQ host.',
    defaultValue: 'localhost'
  },
  RABBITMQ_PORT: {
    description: 'This is RabbitMQ port.',
    defaultValue: 5672
  },
  RABBITMQ_LOGIN: {
    description: 'This is RabbitMQ login.',
    defaultValue: 'guest'
  },
  RABBITMQ_PASSWORD: {
    description: 'This is RabbitMQ password.',
    defaultValue: 'rspwd!',
    obfuscate: true
  },
  RABBITMQ_EXCHANGE_NAME: {
    description: 'This is RabbitMQ exchange name.',
    defaultValue: 'local-oep'
  },
  RABBITMQ_EXCHANGE_DURABLE: {
    description: 'Is RabbitMQ exchange durable.',
    defaultValue: "0",
    defaultValueInProduction: true
  },
  RABBITMQ_RPC_TIMEOUT: {
    description: 'RPC timeout',
    defaultValue: 10e3,
    defaultValueInProduction: true
  },
  INDEX_DISABLED: {
    description: 'Is index disabled',
    defaultValue: '1',
    defaultValueInProduction: true
  },
  INDEX_PREFIX_TYPES_WITH: {
    description: 'Prefix all index types with a prefix',
    defaultValue: 'local-oep-',
  },
  RABBITMQ_LOG_LEVEL: {
    description: 'RabbitMQ log level (DEBUG, ERROR or NONE)',
    defaultValue: "ERROR",
    defaultValueInProduction: true
  },
  GEONAMES_USERNAME: {
    description: 'Geonames usename to call geonames API',
    defaultValue: 'dev.mnemotix',
  },
  SYNAPTIX_USER_SESSION_COOKIE_NAME: {
    description: 'This is the session cookie name',
    defaultValue: 'SNXID',
    defaultValueInProduction: true,
    exposeInGraphQL: true
  },
  TUSD_ENDPOINT: {
    description: 'This is the TUS resumable uploader server endpoint',
    defaultValue: 'http://localhost:1080/files/',
    exposeInGraphQL: true
  },
  THUMBOR_BASE_URL: {
    description: 'This is the Thumbor (thumbnail generation) endpoint',
    defaultValue: 'http://127.0.0.1:8000/unsafe',
    exposeInGraphQL: true
  },
  DATA_DEBUG_ENABLED: {
    description: 'This is an option to debug data and tell FrontEnd to display legacy URLs',
    defaultValue: 1,
    exposeInGraphQL: true
  },
  COMPANION_ENDPOINT: {
    description: 'This is the Uppy companion endpoint to enabled server to server upload',
    defaultValue: 'http://localhost:3020',
    exposeInGraphQL: true
  },
  COMPANION_GOOGLE_DRIVE_ENABLED: {
    description: 'Is Google Drive files upload enabled in Uppy',
    defaultValue: "1",
    exposeInGraphQL: true
  },
  COMPANION_REMOTE_URL_ENABLED: {
    description: 'Is Google Drive files upload enabled in Uppy',
    defaultValue: "1",
    exposeInGraphQL: true
  },
  CONTRIBUTOR_USER_GROUP_ID: {
    description: 'The DDF UserGroup contributor URI',
    defaultValue: () => `${process.env.NODES_NAMESPACE_URI}user-group/ContributorGroup`,
    defaultValueInProduction: true
  },
  EDITOR_USER_GROUP_ID: {
    description: 'The DDF UserGroup edtitor URI',
    defaultValue: () => `${process.env.NODES_NAMESPACE_URI}user-group/EditorGroup`,
    defaultValueInProduction: true
  },
  ADMIN_USER_GROUP_ID: {
    description: 'Administrator user group URI',
    defaultValue: () => `${process.env.NODES_NAMESPACE_URI}user-group/AdministratorGroup`,
    defaultValueInProduction: true
  },
  PUBLIC_POLICY_ID: {
    description: 'Public access policy URI. Use this id to publish oeps',
    defaultValue: () => `access-policy/PublicPolicy`,
    defaultValueInProduction: true
  },
  DEFAULT_POLICY_ID: {
    description: 'Default access policy URI',
    defaultValue: () => `access-policy/PrivatePolicy`,
    defaultValueInProduction: true,
    exposeInGraphQL: true
  },
}