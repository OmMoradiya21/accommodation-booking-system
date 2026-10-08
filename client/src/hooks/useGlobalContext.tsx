import { createContext, useContext } from "react";
import type { GlobalContextType } from "../types.model";

export const GlobalContext = createContext<GlobalContextType | null>(null);

export const useGlobalContext = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobalContext must be used within an AuthProvider");
  }
  return context;
};
