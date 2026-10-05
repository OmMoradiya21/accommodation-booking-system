import { createBrowserRouter, Navigate } from 'react-router';
import { requireRole } from './auth/protectedLoader';
import { ProtectedLayout } from './layouts/ProtectedLayout';

import { ROLES } from './constants/role.constant';

export const router = createBrowserRouter([
  // Public Routes
  {
    path: '/login',
  },
  {
    path: '/unauthorized',
  },
  {
    element: <ProtectedLayout />,
    loader: requireRole(),
    id: 'root-protected',
    children: [
      // User, Manager, Admin
      {
        element: <ProtectedLayout />,
        loader: requireRole([ROLES.USER, ROLES.MANAGER, ROLES.ADMIN]),
        children: [
          {
            path: '/dashboard',
          },
        ],
      },

      //  Manager and Admin
      {
        element: <ProtectedLayout />,
        loader: requireRole([ROLES.MANAGER, ROLES.ADMIN]),
        children: [
          {
            path: '/reports',
          },
        ],
      },

      // for admin
      {
        element: <ProtectedLayout />,
        loader: requireRole([ROLES.ADMIN]),
        children: [
          {
            path: '/admin/',
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);