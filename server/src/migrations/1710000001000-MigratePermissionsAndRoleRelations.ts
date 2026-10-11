import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigratePermissionsAndRoleRelations1710000001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create role_permissions table if it does not exist
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE ON UPDATE CASCADE,
        permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE ON UPDATE CASCADE,
        PRIMARY KEY (role_id, permission_id)
      );
      CREATE INDEX IF NOT EXISTS "IDX_role_permissions_role_id" ON role_permissions (role_id);
      CREATE INDEX IF NOT EXISTS "IDX_role_permissions_permission_id" ON role_permissions (permission_id);
    `);

    // 2. Drop deprecated user_permissions table and roles.permissions column
    await queryRunner.query(`
      DROP TABLE IF EXISTS user_permissions;
      ALTER TABLE roles DROP COLUMN IF EXISTS permissions;
    `);

    // 3. Clean legacy permissions before seeding standardized module permissions
    await queryRunner.query(`
      DELETE FROM role_permissions;
      DELETE FROM permissions;
    `);

    // 4. Seed all module permissions with standardized name format: module:action
    await queryRunner.query(`
      INSERT INTO permissions (id, name, "createdAt", "updatedAt") VALUES
        -- Users module
        (uuid_generate_v4(), 'user:create', now(), now()),
        (uuid_generate_v4(), 'user:read', now(), now()),
        (uuid_generate_v4(), 'user:update', now(), now()),
        (uuid_generate_v4(), 'user:delete', now(), now()),

        -- Roles module
        (uuid_generate_v4(), 'role:create', now(), now()),
        (uuid_generate_v4(), 'role:read', now(), now()),
        (uuid_generate_v4(), 'role:update', now(), now()),
        (uuid_generate_v4(), 'role:delete', now(), now()),

        -- Permissions module
        (uuid_generate_v4(), 'permission:create', now(), now()),
        (uuid_generate_v4(), 'permission:read', now(), now()),
        (uuid_generate_v4(), 'permission:update', now(), now()),
        (uuid_generate_v4(), 'permission:delete', now(), now()),

        -- Companies module
        (uuid_generate_v4(), 'company:create', now(), now()),
        (uuid_generate_v4(), 'company:read', now(), now()),
        (uuid_generate_v4(), 'company:update', now(), now()),
        (uuid_generate_v4(), 'company:delete', now(), now()),

        -- Customers module
        (uuid_generate_v4(), 'customer:create', now(), now()),
        (uuid_generate_v4(), 'customer:read', now(), now()),
        (uuid_generate_v4(), 'customer:update', now(), now()),
        (uuid_generate_v4(), 'customer:delete', now(), now()),

        -- Accommodations module
        (uuid_generate_v4(), 'accommodation:create', now(), now()),
        (uuid_generate_v4(), 'accommodation:read', now(), now()),
        (uuid_generate_v4(), 'accommodation:update', now(), now()),
        (uuid_generate_v4(), 'accommodation:delete', now(), now()),

        -- Bookings module
        (uuid_generate_v4(), 'booking:create', now(), now()),
        (uuid_generate_v4(), 'booking:read', now(), now()),
        (uuid_generate_v4(), 'booking:update', now(), now()),
        (uuid_generate_v4(), 'booking:delete', now(), now()),
        (uuid_generate_v4(), 'booking:approve', now(), now())
      ON CONFLICT (name) DO NOTHING;
    `);

    // 5. Ensure core system roles exist
    await queryRunner.query(`
      INSERT INTO roles (id, name, description, "createdAt", "updatedAt") VALUES
        ('00000000-0000-0000-0000-000000000001', 'ADMIN', 'Super administrator with full system and multi-company access', now(), now()),
        ('00000000-0000-0000-0000-000000000002', 'MANAGER', 'Company manager capable of managing customers and approving bookings', now(), now()),
        ('00000000-0000-0000-0000-000000000003', 'USER', 'Standard user capable of customer management and booking requests', now(), now())
      ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name,
        description = EXCLUDED.description;
    `);

    // 6. Assign all permissions to ADMIN
    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id
      FROM roles r
      CROSS JOIN permissions p
      WHERE r.name = 'ADMIN'
      ON CONFLICT DO NOTHING;
    `);

    // 7. Assign permissions to MANAGER
    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id
      FROM roles r
      JOIN permissions p ON p.name IN (
        'company:read',
        'customer:create', 'customer:read', 'customer:update', 'customer:delete',
        'accommodation:create', 'accommodation:read', 'accommodation:update', 'accommodation:delete',
        'booking:create', 'booking:read', 'booking:update', 'booking:delete', 'booking:approve',
        'user:read',
        'role:read'
      )
      WHERE r.name = 'MANAGER'
      ON CONFLICT DO NOTHING;
    `);

    // 8. Assign permissions to USER
    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id
      FROM roles r
      JOIN permissions p ON p.name IN (
        'company:read',
        'customer:create', 'customer:read', 'customer:update',
        'accommodation:read',
        'booking:create', 'booking:read'
      )
      WHERE r.name = 'USER'
      ON CONFLICT DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM role_permissions;`);
    await queryRunner.query(`DROP TABLE IF EXISTS role_permissions;`);
  }
}
