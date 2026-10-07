import { Outlet } from "react-router";
import { useMemo, useState } from "react";
import { GlobalContext } from "../hooks/useGlobalContext";

export const GlobalContextProvider = () => {
  const [globalUserData, setGlobalUserData] = useState({
    user: { sub: "0", name: "null", email: "dummy12@gmail.com", role: "USER" },
  });

  const updateGlobalData = (newField: {}) => {
    setGlobalUserData((prevField) => ({
      ...prevField,
      ...newField,
    }));
  };
  const value = useMemo(
    () => ({ globalUserData, updateGlobalData }),
    [globalUserData],
  );
  return (
    <GlobalContext.Provider value={value}>
      <Outlet />
    </GlobalContext.Provider>
  );
};
