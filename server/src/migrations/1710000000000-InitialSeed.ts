import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSeed1710000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // 2. Ensure schema tables exist
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR NOT NULL,
        description VARCHAR NOT NULL,
        permissions VARCHAR DEFAULT '',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS permissions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR NOT NULL UNIQUE,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS companies (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL,
        address VARCHAR(255),
        industry VARCHAR(100),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        name VARCHAR(50) NOT NULL,
        email VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS user_companies (
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        PRIMARY KEY (company_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS user_permissions (
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, permission_id)
      );

      CREATE TABLE IF NOT EXISTS accommodations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL,
        description TEXT,
        location VARCHAR(255) NOT NULL,
        price_per_night DECIMAL(10,2) NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS customers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(50),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS bookings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        accommodation_id UUID NOT NULL REFERENCES accommodations(id) ON DELETE CASCADE,
        check_in DATE NOT NULL,
        check_out DATE NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'Pending',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS auth_user_sessions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" VARCHAR NOT NULL UNIQUE,
        "accessToken" TEXT,
        "refreshToken" TEXT,
        "accessTokenExpires" TIMESTAMP,
        "refreshTokenExpires" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    // 3. Seed Base Permissions
    await queryRunner.query(`
      INSERT INTO permissions (id, name) VALUES
        ('10000000-0000-0000-0000-000000000001', 'can_create_company'),
        ('10000000-0000-0000-0000-000000000002', 'can_manage_customers'),
        ('10000000-0000-0000-0000-000000000003', 'can_request_booking'),
        ('10000000-0000-0000-0000-000000000004', 'can_approve_booking'),
        ('10000000-0000-0000-0000-000000000005', 'can_manage_users'),
        ('10000000-0000-0000-0000-000000000006', 'can_manage_accommodations')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 4. Seed Roles (ADMIN with all permissions, USER with basic permissions)
    await queryRunner.query(`
      INSERT INTO roles (id, name, description, permissions) VALUES
        ('00000000-0000-0000-0000-000000000001', 'ADMIN', 'Super administrator with full system and company access', 'can_create_company,can_manage_customers,can_request_booking,can_approve_booking,can_manage_users,can_manage_accommodations'),
        ('00000000-0000-0000-0000-000000000002', 'USER', 'Standard user with basic workspace access', 'can_manage_customers,can_request_booking')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 5. Seed Initial Companies
    await queryRunner.query(`
      INSERT INTO companies (id, name, address, industry) VALUES
        ('20000000-0000-0000-0000-000000000001', 'Acme Lodging & Hospitality', '100 Ocean Boulevard, Miami, FL', 'Hospitality & Tourism'),
        ('20000000-0000-0000-0000-000000000002', 'Global Lodging Corp', '450 Lexington Ave, New York, NY', 'Corporate Housing')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 6. Seed Users (Admin & Staff)
    await queryRunner.query(`
      INSERT INTO users (id, role_id, name, email, password) VALUES
        ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Admin User', 'admin@example.com', '$2b$10$g/a38u7el5ZCIhnUJxRGdejUSf8q2kAjgx9X3IsNNMmG7VKnAH55O'),
        ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Jane Doe', 'jane@example.com', '$2b$10$Z2iSRes4f.qQiTG6QCDcTez2QedJzosXfGPozdm8siGtYHGzAFaAK')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 7. Seed User Companies (Admin associated with ONLY 1 company; Jane with 2)
    await queryRunner.query(`
      INSERT INTO user_companies (company_id, user_id) VALUES
        ('20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001'),
        ('20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002'),
        ('20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002')
      ON CONFLICT (company_id, user_id) DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM user_companies WHERE user_id IN ('30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002');
      DELETE FROM users WHERE id IN ('30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002');
      DELETE FROM companies WHERE id IN ('20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002');
      DELETE FROM roles WHERE id IN ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002');
      DELETE FROM permissions WHERE id LIKE '10000000-0000-0000-0000-%';
    `);
  }
}
