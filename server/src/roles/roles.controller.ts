import { Controller, Get } from '@nestjs/common';
import { RolesService } from './roles.service.ts';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  findAll() {
    return this.rolesService.findAll();
  }
}
