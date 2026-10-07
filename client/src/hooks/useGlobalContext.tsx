import { createContext, useContext } from 'react'
import  { type UserData } from '../types.model';

export const GlobalContext = createContext<unknown | null>(null);

export const useGlobalContext = () => {
 const context = useContext(GlobalContext);
  
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
