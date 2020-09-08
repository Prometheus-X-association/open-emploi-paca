/*
 * Copyright (C) 2013-2018 MNEMOTIX <http://www.mnemotix.com/> and/or its affiliates
 * and other contributors as indicated by the @author tags.
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

import React, {useState} from "react";
import {useTranslation} from "react-i18next";
import {useFormikContext} from "formik";
import {OccupationAutocomplete} from "../Autocomplete/OccupationAutocomplete/OccupationAutocomplete";

/**
 * @param {string} v
 * @param {string} name
 * @param {object[]} [concepts]
 * @return {*}
 * @constructor
 */
export function OccupationPickerField({label, name, inputName, deleteInputName, concepts: existingConcepts = []} = {}) {
  const formikContext = useFormikContext();
  const [selectedConcepts, setSelectedConcepts] = useState([]);
  const {t} = useTranslation();

  return (
    <OccupationAutocomplete
      placeholder={label}
      multiple={multiple}
      onSelectConcepts={handleSelectConcepts}
      selectedConcepts={selectedConcepts}
    />
  );

  function handleSelectConcepts(concepts) {
    let conceptsToDelete = [];
    let conceptsToCreate = [];

    // Find new concepts to add as concepts
    for (let concept of concepts) {
      if (!existingTaggings.find(tagging => tagging.concept?.id === concept.id)) {
        conceptsToCreate.push({
          weight: 10,
          conceptInput: {
            id: concept.id
          }
        });
      }
    }

    // Find concepts to remove.
    for (let existingConcept of existingConcepts) {
      if (!concepts.find(concept => concept?.id === existingConcept.concept?.id)) {
        conceptsToDelete.push(existingConcept.id);
      }
    }

    if (conceptsToCreate.length > 0) {
      formikContext.setFieldValue(inputName, conceptsToCreate);
    }

    if (conceptsToDelete.length > 0) {
      formikContext.setFieldValue(deleteInputName, conceptsToDelete);
    }

    setSelectedConcepts(concepts);
  }
}
