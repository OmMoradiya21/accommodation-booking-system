import { Module } from '@nestjs/common';
import { RolesService } from './roles.service.ts';
import { RolesController } from './roles.controller.ts';
import { RolesRepository } from './roles.repository.ts';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/roles.entity.ts';
import { ROLES_LOOKUP } from './roles-lookup.ts';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  controllers: [RolesController],
  providers: [
    RolesService,
    RolesRepository,
    { provide: ROLES_LOOKUP, useExisting: RolesService },
  ],
  exports: [ROLES_LOOKUP],
})
export class RolesModule {}
