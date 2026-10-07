import { PartialType } from '@nestjs/mapped-types';
import { CreateCompanyDto } from './create-company.dto.ts';

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {}
