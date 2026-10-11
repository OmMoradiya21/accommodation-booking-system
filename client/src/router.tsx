import { createBrowserRouter, Navigate } from "react-router";
import { GlobalContextProvider } from "./components/AuthProvider";
import { ErrorElement } from "./components/ErrorElement";
import { Login } from "./components/Login";
import { CompanySelect } from "./components/CompanySelect";
import { CustomersManagement } from "./components/CustomersManagement";
import { AppLayout } from "./components/AppLayout";
import { Workspace } from "./components/Workspace";
import { UsersManagement } from "./components/UsersManagement";
import { CompaniesManagement } from "./components/CompaniesManagement";
import { RoleManagement } from "./components/admin/RoleManagement";
import { PermissionManagement } from "./components/admin/PermissionManagement";
import { AccommodationsManagement } from "./components/AccommodationsManagement";
import { BookingsManagement } from "./components/BookingsManagement";

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
        path: "select-company",
        Component: CompanySelect,
      },
      {
        path: "user",
        Component: AppLayout,
        children: [
          {
            index: true,
            Component: Workspace,
          },
          {
            path: "customer-management",
            Component: CustomersManagement,
          },
          {
            path: "user-management",
            Component: UsersManagement,
          },
          {
            path: "company-management",
            Component: CompaniesManagement,
          },
          {
            path: "role-management",
            Component: RoleManagement,
          },
          {
            path: "permission-management",
            Component: PermissionManagement,
          },
          {
            path: "accommodation-management",
            Component: AccommodationsManagement,
          },
          {
            path: "booking-management",
            Component: BookingsManagement,
          },
        ],
      },
      {
        path: "*",
        Component: () => <Navigate to="/" replace />,
      },
    ],
  },
]);
