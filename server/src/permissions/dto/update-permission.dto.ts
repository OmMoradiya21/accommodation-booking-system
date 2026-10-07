import { PartialType } from '@nestjs/mapped-types';
import { CreatePermissionDto } from './create-permission.dto.ts';

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {}
