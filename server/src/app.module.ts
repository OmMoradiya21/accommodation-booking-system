import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.ts';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module.ts';
import { RolesModule } from './roles/roles.module.ts';
import { getDataSourceOptions } from './data-source.ts';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 1000 * 60,
        limit: 100,
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        const baseOptions = await getDataSourceOptions();
        return {
          ...baseOptions,
          autoLoadEntities: true,
        };
      },
    }),
    AuthModule,
    UsersModule,
    RolesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
