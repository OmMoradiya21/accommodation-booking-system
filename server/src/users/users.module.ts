import { Module } from '@nestjs/common';
import { UsersService } from './users.service.ts';
import { UsersController } from './users.controller.ts';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity.ts';
import { USER_LOOKUP } from './users-lookup.ts';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [
    UsersService,
    { provide: USER_LOOKUP, useExisting: UsersService },
  ],
  exports:[USER_LOOKUP]
})
export class UsersModule {}
