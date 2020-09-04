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
import CertifinfoDefinition from "./CertifinfoDefinition.js";
import FormaCodeDefinition from "./FormaCodeDefinition.js";
import KnowledgeDefinition from "./KnowledgeDefinition.js";
import NsfDefinition from "./NsfDefinition.js";
import PrerequisiteDefinition from "./PrerequisiteDefinition.js";
import RncpDefinition from "./RncpDefinition.js";
import SkillGroupDefinition from "./SkillGroupDefinition.js";
import TrainingDefinition from "./TrainingDefinition.js";
import PersonDefinition from "../mnx/PersonDefinition";

export let OepModelDefinitions = {
  CertifinfoDefinition,
  FormaCodeDefinition,
  KnowledgeDefinition,
  NsfDefinition,
  PrerequisiteDefinition,
  RncpDefinition,
  SkillGroupDefinition,
  TrainingDefinition,
  PersonDefinition
};

export let oepDataModel = new DataModel({
  modelDefinitions: OepModelDefinitions
});
