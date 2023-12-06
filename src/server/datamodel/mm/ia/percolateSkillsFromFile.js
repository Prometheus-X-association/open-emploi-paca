/**
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
 */
import textract from "textract";
import SkillDefinition from "../SkillDefinition";

/**
 * @param {File} file
 * @param {SynaptixDatastoreSession} synaptixSession
 * @param {boolean} [justCount]
 * @param {object} [args]
 * @return {Model[]|number}
 */
export async function percolateSkillsFromFile({
  file,
  justCount,
  synaptixSession,
  args,
}) {
  const { mimetype, createReadStream } = await file;
  const fileStream = createReadStream();
  const fileChunks = [];

  for await (let chunk of fileStream) {
    fileChunks.push(chunk);
  }

  const extractedText = await new Promise((done, fail) => {
    textract.fromBufferWithMime(
      mimetype,
      Buffer.concat(fileChunks),
      (error, text) => {
        if (error) {
          return fail(error);
        }
        done(text);
      }
    );
  });

  return synaptixSession.getIndexService().percolateNodes({
    modelDefinition: SkillDefinition,
    text: extractedText,
    limit: synaptixSession.getLimitFromArgs(args),
    offset: synaptixSession.getOffsetFromArgs(args),
    justCount,
  });
}
