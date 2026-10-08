import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PermissionsRepository } from './permissions.repository.ts';
import { Permission } from './entities/permission.entity.ts';
import { CreatePermissionDto } from './dto/create-permission.dto.ts';
import { UpdatePermissionDto } from './dto/update-permission.dto.ts';

@Injectable()
export class PermissionsService {
  constructor(private readonly permissionsRepository: PermissionsRepository) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const existing = await this.permissionsRepository.findByName(
      createPermissionDto.name,
    );
    if (existing) {
      throw new ConflictException(
        `Permission '${createPermissionDto.name}' already exists`,
      );
    }
    return this.permissionsRepository.savePermission(createPermissionDto);
  }

  async findAll(): Promise<Permission[]> {
    return this.permissionsRepository.findAll();
  }

  async findOne(id: string): Promise<Permission> {
    const permission = await this.permissionsRepository.findOne(id);
    if (!permission) {
      throw new NotFoundException(`Permission #${id} not found`);
    }
    return permission;
  }

  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    const updated = await this.permissionsRepository.update(
      id,
      updatePermissionDto,
    );
    if (!updated) {
      throw new NotFoundException(`Permission #${id} not found to update`);
    }
    return updated;
  }

  async remove(id: string): Promise<{ message: string }> {
    const permission = await this.findOne(id);
    await this.permissionsRepository.remove(permission);
    return { message: `Permission #${id} removed successfully` };
  }
}
