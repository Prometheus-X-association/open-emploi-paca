import got from "got";


export let loadDataFileInRepository = async ({endpointURI, repoName, file, context}) => {
  return got.post(`${endpointURI}/rest/data/import/upload/${repoName}/url`, {
    json: true,
    body: {
      "data": file,
      "name": file,
      "type": "url",
      "context": context,
      "replaceGraphs": [context],
      "parserSettings": {
        "failOnUnknownDataTypes": false,
        "failOnUnknownLanguageTags": false,
        "verifyDataTypeValues": false,
        "verifyLanguageTags": false,
        "verifyRelativeURIs": false,
        "verifyURISyntax": false,
        "stopOnError": false
      }
    }
  });
};