import React, {useContext} from "react";

export const EnvironmentContext = React.createContext();

/**
 * @param {string} environmentName
 * @param isBoolean
 * @param isNumber
 */
export function useEnvironment(environmentName, {isBoolean, isFloat, isInt} = {}) {
  const environments = useContext(EnvironmentContext);
  let environment = environments?.[environmentName];

  if (isBoolean) {
    environment = !!parseInt(environment);
  }

  if (isFloat) {
    environment = parseFloat(environment);
  }

  if (isInt) {
    environment = parseInt(environment);
  }

  return environment;
}
