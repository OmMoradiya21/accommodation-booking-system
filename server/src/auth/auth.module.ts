import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.ts';
import { AuthController } from './auth.controller.ts';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth_UserSession } from './entities/auth.entity.ts';
import { APP_GUARD } from '@nestjs/core';
import { JwtAccessAuthGuard } from './guards/jwt-access-auth.guard.ts';
import { UsersModule } from '../users/users.module.ts';
import { JwtModule } from '@nestjs/jwt';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy.ts';
import { LocalStrategy } from './strategies/local.strategy.ts';

@Module({
  imports: [
    TypeOrmModule.forFeature([Auth_UserSession]),
    UsersModule,
    JwtModule.register({ global: true }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAccessStrategy,
    LocalStrategy,
    { provide: APP_GUARD, useClass: JwtAccessAuthGuard },
  ],
})
export class AuthModule {}
