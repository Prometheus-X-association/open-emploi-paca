import React, {useContext} from "react";
import {useLoggedUser} from "./useLoggedUser";

export const PermissionsContext = React.createContext();

export function usePermissions({} = {}) {
  const permissions = useContext(PermissionsContext);
  const {isAdmin, isOperator, isContributor} = useLoggedUser();

  function isWriteGrantedFor({key}) {
    if (permissions[key]) {
    } else {
      console.warn(`Permission key ${key} is requested but not defined in PermissionContext`);
    }
  }

  return {
    isWriteGranted
  };
}
