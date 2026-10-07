import { NestFactory } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Module } from '@nestjs/common';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
})
class DataSourceConfigModule {}

export async function getDataSourceOptions(): Promise<DataSourceOptions> {
  const app = await NestFactory.createApplicationContext(
    DataSourceConfigModule,
  );
  const configService = app.get(ConfigService);

  const options: DataSourceOptions = {
    type: 'postgres',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: parseInt(configService.get<string>('DB_PORT', '5432'), 10),
    username: configService.get<string>('DB_USERNAME', 'postgres'),
    password: configService.get<string>('DB_PASSWORD', 'password'),
    database: configService.get<string>('DB_NAME', 'my_database'),
    entities: [import.meta.dirname + '/**/*.entity.ts'],
    migrations: [import.meta.dirname + '/migrations/**/*.ts'],
    synchronize: true,
  };

  await app.close();
  return options;
}

export const AppDataSource = getDataSourceOptions().then(
  (options) => new DataSource(options),
);
