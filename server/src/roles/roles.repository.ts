import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/roles.entity.ts';
import { CreateRoleDto } from './dto/create-role.dto.ts';
import { UpdateRoleDto } from './dto/update-role.dto.ts';
import { Permission } from '../permissions/entities/permission.entity.ts';

@Injectable()
export class RolesRepository {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({
      select: {
        id: true,
        name: true,
        description: true,
      },
    });
  }

  async findOne(id: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { id },
      relations: { permissions: true },
      select: {
        id: true,
        name: true,
        description: true,
        permissions: { id: true, name: true },
      },
    });
  }

  async findByName(name: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { name },
      relations: { permissions: true },
    });
  }

  async saveRole(createRoleDto: CreateRoleDto): Promise<Role> {
    const { permission_ids, ...roleData } = createRoleDto;
    const role = this.roleRepository.create({
      ...roleData,
      description: roleData.description ?? '',
      permissions: permission_ids?.map((id) => ({ id }) as Permission),
    });
    const saved = await this.roleRepository.save(role);
    return (await this.findOne(saved.id)) || saved;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role | null> {
    const role = await this.findOne(id);
    if (!role) return null;

    const { permission_ids, ...rest } = updateRoleDto;

    if (Object.keys(rest).length > 0) {
      await this.roleRepository.update(id, rest);
    }

    if (permission_ids !== undefined) {
      const currentPermissionIds = (role.permissions || []).map((p) => p.id);
      const targetPermissionIds = [...new Set(permission_ids)];

      const toRemoveIds = currentPermissionIds.filter(
        (permId) => !targetPermissionIds.includes(permId),
      );

      const toAddIds = targetPermissionIds.filter(
        (permId) => !currentPermissionIds.includes(permId),
      );

      if (toRemoveIds.length > 0 || toAddIds.length > 0) {
        await this.roleRepository
          .createQueryBuilder()
          .relation(Role, 'permissions')
          .of(role)
          .addAndRemove(toAddIds, toRemoveIds);
      }
    }

    return this.findOne(id);
  }

  async remove(role: Role): Promise<void> {
    await this.roleRepository.remove(role);
  }
}
