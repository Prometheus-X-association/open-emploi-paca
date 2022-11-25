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
    description: "This is the application UUID.",
    defaultValue: () => `oep-application-${Date.now()}`,
    defaultValueInProduction: true,
  },
  APP_PORT: {
    description: "This is listening port of the application.",
    defaultValue: 3034,
    defaultValueInProduction: true,
  },
  APP_URL: {
    description: "This is the base url of the application.",
    defaultValue: () => `http://localhost:${process.env.APP_PORT}`,
    defaultValueInProduction: true,
  },
  SCHEMA_NAMESPACE_MAPPING: {
    description: "The ReSource ontology schema namespace mapping",
    defaultValue: JSON.stringify({
      rdfs: "http://www.w3.org/2000/01/rdf-schema#",
      skos: "http://www.w3.org/2004/02/skos/core#",
      geonames: "https://www.geonames.org/",
      foaf: "http://xmlns.com/foaf/0.1/",
      prov: "http://www.w3.org/ns/prov#",
      sioc: "http://rdfs.org/sioc/ns#",
      dc: "http://purl.org/dc/terms/",
      dct: "http://purl.org/dc/terms/",
      mnx: "http://ns.mnemotix.com/ontologies/2019/8/generic-model/",
      mm: "https://ontologies.mindmatcher.org/carto/",
      oep: "http://openemploi.datasud.fr/ontology/",
      dsud: "http://ontology.datasud.fr/openemploi/data/",
    }),
    defaultValueInProduction: true,
  },
  NODES_NAMESPACE_URI: {
    description:
      "The nodes (or individuals) (or class instances) namespace URI",
    defaultValue: "https://data.dataregionsud.fr/openemploi/",
    defaultValueInProduction: true,
  },
  NODES_PREFIX: {
    description: "The nodes or individuals) (or class instances) namespace URI",
    defaultValue: "oepd",
    defaultValueInProduction: true,
  },
  INDEX_DISABLED: {
    description: "Is index disabled",
    defaultValue: "0",
    defaultValueInProduction: true,
  },
  INDEX_MASTER_URI: {
    description: "Index master URI (ES endpoint)",
  },
  INDEX_CLUSTER_USER: {
    description: " Index cluster user",
    defaultValue: () => "",
    defaultValueInProduction: true,
  },
  INDEX_CLUSTER_PWD: {
    description: "Index cluster password",
    obfuscate: true,
    defaultValue: () => "",
    defaultValueInProduction: true,
  },
  INDEX_PREFIX_TYPES_WITH: {
    description: "Prefix all index types with a prefix",
  },
  RDFSTORE_ROOT_URI: {
    description: "RDF Graph root URI",
  },
  RDFSTORE_USER: {
    description: "RDF Graph Store user",
  },
  RDFSTORE_PWD: {
    description: "RDF Graph Store password",
    obfuscate: true,
  },
  RDFSTORE_REPOSITORY_NAME: {
    description: "RDF Graph Store default repository name",
  },
  NODES_NAMED_GRAPH: {
    description: "The ReSource nodes named graph URI",
    defaultValue: "https://data.dataregionsud.fr/openemploi/NG",
    defaultValueInProduction: true,
  },
  OAUTH_BASE_URL: {
    description: "This is the OAUTH server host",
    defaultValue: "http://localhost:8181",
    defaultValueInProduction: true,
  },
  OAUTH_REALM: {
    description: "This is the OAUTH realm used for this app",
    defaultValue: "oep",
    defaultValueInProduction: true,
  },
  OAUTH_AUTH_URL: {
    description: "This is the OAUTH authentication URL",
    defaultValue: () =>
      `${process.env.OAUTH_BASE_URL}/auth/realms/${process.env.OAUTH_REALM}/protocol/openid-connect/auth`,
    defaultValueInProduction: true,
  },
  OAUTH_TOKEN_URL: {
    description: "This is the OAUTH token validation URL",
    defaultValue: () =>
      `${process.env.OAUTH_BASE_URL}/auth/realms/${process.env.OAUTH_REALM}/protocol/openid-connect/token`,
    defaultValueInProduction: true,
  },
  OAUTH_LOGOUT_URL: {
    description: "This is the OAUTH logout URL",
    defaultValue: () =>
      `${process.env.OAUTH_BASE_URL}/auth/realms/${process.env.OAUTH_REALM}/protocol/openid-connect/logout`,
    defaultValueInProduction: true,
  },
  OAUTH_REALM_CLIENT_ID: {
    description: "This is the OAUTH Realm client ",
    defaultValue: "api",
    defaultValueInProduction: true,
  },
  OAUTH_REALM_CLIENT_SECRET: {
    description:
      "This is the OAUTH shared secret between this client app and OAuth2 server.",
    defaultValue: "e9a7be6b-5850-4d22-8740-a8d535e2880b",
    obfuscate: true,
    defaultValueInProduction: true,
  },
  OAUTH_ADMIN_USERNAME: {
    description: "This is the OAUTH admin username",
    defaultValue: "admin",
    defaultValueInProduction: true,
  },
  OAUTH_ADMIN_PASSWORD: {
    description: "This is the OAUTH admin password",
    defaultValue: "rspwd!",
    obfuscate: true,
    defaultValueInProduction: true,
  },
  OAUTH_ADMIN_TOKEN_URL: {
    description: "This is the OAUTH token validation URL for admin session",
    defaultValue: () =>
      `${process.env.OAUTH_BASE_URL}/auth/realms/master/protocol/openid-connect/token`,
    defaultValueInProduction: true,
  },
  OAUTH_ADMIN_API_URL: {
    description: "This is the OAUTH API admin session",
    defaultValue: () =>
      `${process.env.OAUTH_BASE_URL}/auth/admin/realms/${process.env.OAUTH_REALM}`,
    defaultValueInProduction: true,
  },
  OAUTH_CERTS_URL: {
    description: "This is the OAUTH token certs URL",
    defaultValue: () =>
      `${process.env.OAUTH_BASE_URL}/auth/realms/${process.env.OAUTH_REALM}/protocol/openid-connect/certs`,
    defaultValueInProduction: true,
  },
  LOG_LEVEL: {
    description: "Log level (ERROR|DEBUG|TRACE)",
    defaultValue: "ERROR",
    defaultValueInProduction: true,
  },
  SYNAPTIX_USER_SESSION_COOKIE_NAME: {
    description: "This is the session cookie name",
    defaultValue: "SNXID",
    defaultValueInProduction: true,
    exposeInGraphQL: true,
  },
  ADDVISEO_AUTH_LOGIN: {
    description: "This is addViseo X-Auth-Login",
    obfuscate: true,
    defaultValueInProduction: true,
  },
  ADDVISEO_AUTH_TOKEN: {
    description: "This is addViseo X-Auth-Token",
    obfuscate: true,
    defaultValueInProduction: true,
  },
  ADDVISEO_PASSWORD_SALT: {
    description: "This is addViseo password salt",
    defaultValue: () => "",
    obfuscate: true,
    defaultValueInProduction: true,
  },
};
