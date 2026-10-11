import { Outlet, useNavigate } from "react-router"
import { NavBar } from "./NavBar"
import { useGlobalContext } from "../hooks/useGlobalContext";
import { useEffect } from "react";

export const AppLayout = () => {
  const { user, selectedCompany, isAuthenticated, isLoading } =
    useGlobalContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        navigate("/");
      } else if (!selectedCompany) {
        navigate("/select-company");
      }
    }
  }, [isAuthenticated, user, selectedCompany, isLoading, navigate]);
  
    if (isLoading || !user || !selectedCompany) {
      return null;
    }
  return (
    <>
      <NavBar />
      <Outlet />
    </>
  )
}
