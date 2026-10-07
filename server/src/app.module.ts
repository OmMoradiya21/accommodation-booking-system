import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.ts';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module.ts';
import { RolesModule } from './roles/roles.module.ts';
import { getDataSourceOptions } from './data-source.ts';
import { CompaniesModule } from './companies/companies.module.ts';
import { CustomersModule } from './customers/customers.module.ts';
import { AccommodationsModule } from './accommodations/accommodations.module.ts';
import { BookingsModule } from './bookings/bookings.module.ts';
import { PermissionsModule } from './permissions/permissions.module.ts';

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
    CompaniesModule,
    CustomersModule,
    AccommodationsModule,
    BookingsModule,
    PermissionsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
