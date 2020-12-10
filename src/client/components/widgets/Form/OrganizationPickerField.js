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

import { useFormikContext } from "formik";
import {OrganizationAutocomplete} from "../Autocomplete/OrganizationAutocomplete/OrganizationAutocomplete";


/**
 * @param {string} label
 * @param {string} name
 * @param {string} inputName
 * @param {object} [organization]
 * @param {boolean} [creatable]
 * @return {*}
 * @constructor
 */
export function OrganizationPickerField({label, name, organization, creatable} = {}) {
  const formikContext = useFormikContext();

  return (
    <OrganizationAutocomplete
      placeholder={label}
      multiple={false}
      onSelectOrganizations={handleSelectOrganizations}
      selectedOrganizations={formikContext.getFieldProps(name).value}
      creatable={creatable}
    />
  );

  function handleSelectOrganizations(organization) {
    // New organization
    if (organization?.isCreation){
      organization = {
        name: organization.inputValue
      }
    }

    formikContext.setFieldValue(name, organization);
  }
}
