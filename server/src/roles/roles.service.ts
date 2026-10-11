import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RolesRepository } from './roles.repository.ts';
import { Role } from './entities/roles.entity.ts';
import { CreateRoleDto } from './dto/create-role.dto.ts';
import { UpdateRoleDto } from './dto/update-role.dto.ts';

@Injectable()
export class RolesService {
  constructor(private readonly rolesRepository: RolesRepository) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const existing = await this.rolesRepository.findByName(createRoleDto.name);
    if (existing) {
      throw new ConflictException(
        `Role '${createRoleDto.name}' already exists`,
      );
    }
    return this.rolesRepository.saveRole(createRoleDto);
  }

  async findAll(): Promise<Role[]> {
    return this.rolesRepository.findAll();
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.rolesRepository.findOne(id);
    if (!role) {
      throw new NotFoundException(`Role #${id} not found`);
    }
    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    await this.findOne(id);

    if (updateRoleDto.name) {
      const existing = await this.rolesRepository.findByName(
        updateRoleDto.name,
      );
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Role '${updateRoleDto.name}' already exists`,
        );
      }
    }

    const updated = await this.rolesRepository.update(id, updateRoleDto);
    if (!updated) {
      throw new NotFoundException(`Role #${id} not found to update`);
    }
    return updated;
  }

  async remove(id: string): Promise<{ message: string }> {
    const role = await this.findOne(id);
    await this.rolesRepository.remove(role);
    return { message: `Role #${id} removed successfully` };
  }

  async findRoleIdByName(name: string): Promise<string | undefined> {
    const role = await this.rolesRepository.findByName(name);
    return role?.id;
  }
}
