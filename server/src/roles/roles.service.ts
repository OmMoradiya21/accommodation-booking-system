import { Injectable } from '@nestjs/common';
import { RolesRepository } from './roles.repository.ts';

@Injectable()
export class RolesService {
  constructor(private readonly rolesRepository: RolesRepository) {}

  async findRoleIdByName(name: string) {
    const role = await this.rolesRepository.findByName(name);
    return role?.id;
  }
}
