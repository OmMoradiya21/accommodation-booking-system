import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/roles.entity.ts';
import { Repository } from 'typeorm';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}
  async findRoleIdByName(name: string) {
    const role = await this.roleRepository.findOne({ where: { name } });
    const roleId = role?.id;
    return roleId;
  }
}
