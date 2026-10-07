import { createBrowserRouter, Navigate } from 'react-router';
import { requireRole } from './auth/protectedLoader';
import { ProtectedLayout } from './layouts/ProtectedLayout';

import { ROLES } from './constants/role.constant';
import { ErrorElement } from './components/ErrorElement';
import { Login } from './components/Login';
import { GlobalContextProvider } from './components/AuthProvider';

export const router = createBrowserRouter([
  {
    Component: GlobalContextProvider,
    ErrorBoundary: ErrorElement,
    children: [
      {
        index: true,
        Component: Login,
        ErrorBoundary: ErrorElement,
      },
      {
        path: "company",
        Component: ProtectedLayout,
        children: [
          {
            Component: AppLayout,
            children: [
              {
                index: true,
                Component: Dashboard,
              },
              {
                path: "projects",
                Component: Customer,
              },
              
            ],
          },
        ],
      },
    ],
  },
]);
