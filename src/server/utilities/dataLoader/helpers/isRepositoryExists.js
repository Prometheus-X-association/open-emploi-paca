import got from "got";

export let isRepositoryExists = async ({ endpointURI, repoName }) => {
  let { body: repos } = await got(`${endpointURI}/rest/repositories`, {
    json: true
  });

  return Array.isArray(repos) && repos.find(({ id }) => id === repoName);
};
