import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity.ts';
import { CreatePermissionDto } from './dto/create-permission.dto.ts';
import { UpdatePermissionDto } from './dto/update-permission.dto.ts';

@Injectable()
export class PermissionsRepository {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Permission | null> {
    return this.permissionRepository.findOne({
      where: { id },
      relations: { users: true },
    });
  }

  async findByName(name: string): Promise<Permission | null> {
    return this.permissionRepository.findOne({
      where: { name },
    });
  }

  async savePermission(
    createPermissionDto: CreatePermissionDto,
  ): Promise<Permission> {
    const permission = this.permissionRepository.create(createPermissionDto);
    return this.permissionRepository.save(permission);
  }

  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission | null> {
    const permission = await this.permissionRepository.preload({
      id,
      ...updatePermissionDto,
    });
    if (!permission) return null;
    return this.permissionRepository.save(permission);
  }

  async remove(permission: Permission): Promise<void> {
    await this.permissionRepository.remove(permission);
  }
}
