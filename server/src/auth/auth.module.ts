import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth_UserSession } from './entities/auth.entity.js';
import { APP_GUARD } from '@nestjs/core';
import { JwtAccessAuthGuard } from './guards/jwt-access-auth.guard.js';

@Module({
  imports: [TypeOrmModule.forFeature([Auth_UserSession])],
  controllers: [AuthController],
  providers: [
    AuthService,
    { provide: APP_GUARD, useClass: JwtAccessAuthGuard },
  ],
})
export class AuthModule {}
