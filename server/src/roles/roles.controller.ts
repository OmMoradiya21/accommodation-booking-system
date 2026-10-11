import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RolesService } from './roles.service.ts';
import { CreateRoleDto } from './dto/create-role.dto.ts';
import { UpdateRoleDto } from './dto/update-role.dto.ts';
import { Permissions } from '../auth/decorator/permissions.decorator.ts';
import { PERMISSIONS } from '../permissions/constants/permissions.constant.ts';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Permissions(PERMISSIONS.ROLE.CREATE)
  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Permissions(PERMISSIONS.ROLE.READ)
  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @Permissions(PERMISSIONS.ROLE.READ)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Permissions(PERMISSIONS.ROLE.UPDATE)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Permissions(PERMISSIONS.ROLE.DELETE)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
