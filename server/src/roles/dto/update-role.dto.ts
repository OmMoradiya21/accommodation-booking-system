import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleDto } from './create-role.dto.ts';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
