export const PERMISSIONS = {
  USER: {
    CREATE: 'user:create',
    READ: 'user:read',
    UPDATE: 'user:update',
    DELETE: 'user:delete',
  },
  ROLE: {
    CREATE: 'role:create',
    READ: 'role:read',
    UPDATE: 'role:update',
    DELETE: 'role:delete',
  },
  PERMISSION: {
    CREATE: 'permission:create',
    READ: 'permission:read',
    UPDATE: 'permission:update',
    DELETE: 'permission:delete',
  },
  COMPANY: {
    CREATE: 'company:create',
    READ: 'company:read',
    UPDATE: 'company:update',
    DELETE: 'company:delete',
  },
  CUSTOMER: {
    CREATE: 'customer:create',
    READ: 'customer:read',
    UPDATE: 'customer:update',
    DELETE: 'customer:delete',
  },
  ACCOMMODATION: {
    CREATE: 'accommodation:create',
    READ: 'accommodation:read',
    UPDATE: 'accommodation:update',
    DELETE: 'accommodation:delete',
  },
  BOOKING: {
    CREATE: 'booking:create',
    READ: 'booking:read',
    UPDATE: 'booking:update',
    DELETE: 'booking:delete',
    APPROVE: 'booking:approve',
  },
} as const;

export type PermissionKey =
  | (typeof PERMISSIONS.USER)[keyof typeof PERMISSIONS.USER]
  | (typeof PERMISSIONS.ROLE)[keyof typeof PERMISSIONS.ROLE]
  | (typeof PERMISSIONS.PERMISSION)[keyof typeof PERMISSIONS.PERMISSION]
  | (typeof PERMISSIONS.COMPANY)[keyof typeof PERMISSIONS.COMPANY]
  | (typeof PERMISSIONS.CUSTOMER)[keyof typeof PERMISSIONS.CUSTOMER]
  | (typeof PERMISSIONS.ACCOMMODATION)[keyof typeof PERMISSIONS.ACCOMMODATION]
  | (typeof PERMISSIONS.BOOKING)[keyof typeof PERMISSIONS.BOOKING];
