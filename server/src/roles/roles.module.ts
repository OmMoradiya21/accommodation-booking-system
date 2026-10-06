import { Module } from '@nestjs/common';
import { RolesService } from './roles.service.ts';
import { RolesController } from './roles.controller.ts';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/roles.entity.ts';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
