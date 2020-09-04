import localforage from "localforage";
import {useLoggedUser} from "./useLoggedUser";
import {useEffect, useState} from "react";

/**
 * @param {any} [user]
 */
export function useLocalStorage({user} = {}) {
  const [localStorage, setLocalStorage] = useState();

  if (!user) {
    ({user} = useLoggedUser());
  }

  useEffect(() => {
    if (user) {
      setLocalStorage(createInstance({name: user?.id}));
    }
  }, [user]);

  return {localStorage};

  function createInstance({name, ...options} = {}) {
    return localforage.createInstance({
      ...options,
      name: name || "anonymous"
    });
  }
}
