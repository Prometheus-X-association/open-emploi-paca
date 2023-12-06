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
import isUndefined from "lodash/isUndefined";
import has from "lodash/has";
import get from "lodash/get";
import isEqual from "lodash/isEqual";
import isObjectLike from "lodash/isObjectLike";

/**
 * Deep diff between two object-likes
 * @param  {Object} fromObject the original object
 * @param  {Object} toObject   the updated object
 * @param {boolean} [preserveId=true] Is id preserved from diff ?
 * @return {Object}            a new object which represents the diff
 */
export function getObjectsDiff(fromObject = {}, toObject = {}, preserveId = true) {
  const changes = {};

  const buildPath = (path, obj, key) =>
    isUndefined(path) ? key : `${path}.${key}`;

  const walk = (fromObject, toObject, path) => {
    for (let [key, to] of Object.entries(toObject)) {
      // If the value is a dayjs date, convert it to an ISO string
      if (!!to?.toISOString) {
        to = to.toISOString();
      }

      const currentPath = buildPath(path, toObject, key);
      if (currentPath.match(/^__.*/)) {
        // Do nothing. This is a technical field such as __typename, __localId...
      } else if (!has(fromObject, key)) {
        changes[currentPath] = to;
      } else {
        let from = get(fromObject, key);

        if (!!from?.toISOString) {
          from = from.toISOString();
        }

        if (!isEqual(from, to)) {
          if (isObjectLike(to) && isObjectLike(from)) {
            walk(from, to, currentPath);
          } else {
            changes[currentPath] = to;
          }
        }
      }
    }
  };

  walk(fromObject, toObject);

  if (!changes.id && fromObject.id && preserveId) {
    changes.id = fromObject.id;
  }

  return changes;
}