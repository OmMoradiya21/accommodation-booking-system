import { DataSource, DataSourceOptions } from 'typeorm';

if (process.loadEnvFile) {
  try {
    process.loadEnvFile('.env');
  } catch {
    // ignore if .env file is missing or in test environment
  }
}

export function getDataSourceOptions(): DataSourceOptions {
  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'accommodation_booking_system',
    entities: [import.meta.dirname + '/**/*.entity.ts'],
    migrations: [import.meta.dirname + '/migrations/**/*.ts'],
    synchronize: true,
  };
}

export default new DataSource(getDataSourceOptions());
