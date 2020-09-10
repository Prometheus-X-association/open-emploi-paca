#!/usr/bin/env node

import { logWarning } from "@mnemotix/synaptix.js";
import { graphqlSync } from "graphql";
import fs from "fs";
import path from "path";
import { generateDataModel } from "../../datamodel/generateDataModel";

let extraDataModels = [];

if (!process.argv[2]) {
  logWarning(
    "You don't pass specific dataModel file location, generated fragment types will just match weever core embeded datamodel"
  );
} else {
  const dataModelLocation = path.resolve(process.cwd(), process.argv[2]);

  if (fs.existsSync(dataModelLocation)) {
    const { dataModel } = require(dataModelLocation);

    if (dataModel) {
      extraDataModels.push(dataModel);
    }
  } else {
    throw `${dataModelLocation} is not an existing file...`;
  }
}

let introspectionQuery = `
{
  __schema {
    types {
      kind
      name
      possibleTypes {
        name
      }
    }
  }
}`;

let schema = generateDataModel({ extraDataModels }).generateExecutableSchema();
let result = graphqlSync(schema, introspectionQuery);
let targetDir = path.resolve(process.cwd(), "./src/client/gql");

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir);
}

const possibleTypes = {};

// @see https://www.apollographql.com/docs/react/data/fragments/#defining-possibletypes-manually
result.data.__schema.types.forEach(supertype => {
  if (supertype.possibleTypes) {
    possibleTypes[supertype.name] =
      supertype.possibleTypes.map(subtype => subtype.name);
  }
});

fs.writeFile(path.resolve(targetDir, "possibleTypes.json"), JSON.stringify(possibleTypes, null, 2), err => {
  if (err) {
    console.error("Error writing GraphQL possible typrs file...", err);
  } else {
    console.log("GraphQL possible types successfully extracted!");
  }
});
