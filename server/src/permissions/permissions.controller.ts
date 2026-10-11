import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service.ts';
import { CreatePermissionDto } from './dto/create-permission.dto.ts';
import { UpdatePermissionDto } from './dto/update-permission.dto.ts';
import { Permissions } from '../auth/decorator/permissions.decorator.ts';
import { PERMISSIONS } from './constants/permissions.constant.ts';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Permissions(PERMISSIONS.PERMISSION.CREATE)
  @Post()
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Permissions(PERMISSIONS.PERMISSION.READ)
  @Get()
  findAll() {
    return this.permissionsService.findAll();
  }

  @Permissions(PERMISSIONS.PERMISSION.READ)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }

  @Permissions(PERMISSIONS.PERMISSION.UPDATE)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionsService.update(id, updatePermissionDto);
  }

  @Permissions(PERMISSIONS.PERMISSION.DELETE)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(id);
  }
}
