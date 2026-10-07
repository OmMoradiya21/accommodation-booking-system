import { Module } from '@nestjs/common';
import { UsersService } from './users.service.ts';
import { UsersController } from './users.controller.ts';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity.ts';
import { USERS_LOOKUP } from './users-lookup.ts';
import { UserRepository } from './users.repository.ts';
import { RolesModule } from '../roles/roles.module.ts';

@Module({
  imports: [TypeOrmModule.forFeature([User]), RolesModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    UserRepository,
    { provide: USERS_LOOKUP, useExisting: UsersService },
  ],
  exports: [USERS_LOOKUP],
})
export class UsersModule {}
