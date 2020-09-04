import got from "got";
import FormData from "form-data";
import fs from "fs";
import os from "os";

export let createRepository = async ({
  endpointURI,
  repoName,
  configFileURI
}) => {
  let { body: config } = await got(configFileURI);
  const form = new FormData();

  fs.writeFileSync(`${os.tmpdir()}/config.ttl`, config);
  form.append("config", fs.createReadStream(`${os.tmpdir()}/config.ttl`));

  await got.post(`${endpointURI}/rest/repositories`, {
    body: form
  });
};
