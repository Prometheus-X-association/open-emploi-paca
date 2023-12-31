/*
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
 *
 */

import { DataModel } from "@mnemotix/synaptix.js";
import ApplyDefinition from "./ApplyDefinition.js";
import AptitudeDefinition from "./AptitudeDefinition.js";
import AptitudeRatingDefinition from "./AptitudeRatingDefinition.js";
import AwardDefinition from "./AwardDefinition.js";
import ExpectationDefinition from "./ExpectationDefinition.js";
import ExperienceDefinition from "./ExperienceDefinition.js";
import OccupationDefinition from "./OccupationDefinition.js";
import OfferDefinition from "./OfferDefinition.js";
import QualificationDefinition from "./QualificationDefinition.js";
import SkillDefinition from "./SkillDefinition.js";

export let MmModelDefinitions = {
  ApplyDefinition,
  AptitudeDefinition,
  AptitudeRatingDefinition,
  AwardDefinition,
  ExpectationDefinition,
  ExperienceDefinition,
  OccupationDefinition,
  OfferDefinition,
  QualificationDefinition,
  SkillDefinition
};

export let mmDataModel = new DataModel({
  modelDefinitions: MmModelDefinitions
});
