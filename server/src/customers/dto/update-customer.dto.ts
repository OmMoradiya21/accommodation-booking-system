import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomerDto } from './create-customer.dto.ts';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {}
