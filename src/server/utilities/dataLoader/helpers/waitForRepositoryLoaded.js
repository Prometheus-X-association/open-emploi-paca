import got from "got";


const snooze = ms => new Promise(resolve => setTimeout(resolve, ms));

export let waitForRepositoryLoaded = async ({endpointURI, repoName, spinner, totalCount}) => {
  let {body: remaining} = await got(`${endpointURI}/rest/data/import/active/${repoName}`);

  if (parseInt(remaining) !== 0) {
    spinner.text = `Waiting data to be loaded (remaining ${remaining} files)...`;
    spinner.color = Math.ceil(remaining / totalCount) > 0.5 ? 'yellow' : 'green';
    await snooze(500);
    return waitForRepositoryLoaded({endpointURI, repoName, spinner, totalCount});
  }
};