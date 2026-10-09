import { createBrowserRouter, Navigate } from "react-router";
import { GlobalContextProvider } from "./components/AuthProvider";
import { ErrorElement } from "./components/ErrorElement";
import { Login } from "./components/Login";
import { CompanySelect } from "./components/CompanySelect";
import { Dashboard } from "./components/Dashboard";
import { ManageCustomer } from "./components/ManageCustomer";

export const router = createBrowserRouter([
  {
    Component: GlobalContextProvider,
    ErrorBoundary: ErrorElement,
    children: [
      {
        index: true,
        Component: Login,
      },
      {
        path: "login",
        Component: Login,
      },
      {
        path: "company",
        Component: CompanySelect,
      },
      {
        path: "dashboard",
        Component: Dashboard,
      },
      {
        path: "customers",
        Component: ManageCustomer,
      },
      {
        path: "*",
        Component: () => <Navigate to="/" replace />,
      },
    ],
  },
]);
