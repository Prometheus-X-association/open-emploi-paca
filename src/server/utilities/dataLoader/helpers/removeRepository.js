import got from "got";


export let removeRepository = async ({endpointURI, repoName}) => {
  await got.delete(`${endpointURI}/rest/repositories/${repoName}`);
};