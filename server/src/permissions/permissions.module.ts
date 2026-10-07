import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsService } from './permissions.service.ts';
import { PermissionsController } from './permissions.controller.ts';
import { PermissionsRepository } from './permissions.repository.ts';
import { Permission } from './entities/permission.entity.ts';

@Module({
  imports: [TypeOrmModule.forFeature([Permission])],
  controllers: [PermissionsController],
  providers: [PermissionsService, PermissionsRepository],
  exports: [PermissionsRepository, PermissionsService, TypeOrmModule],
})
export class PermissionsModule {}
