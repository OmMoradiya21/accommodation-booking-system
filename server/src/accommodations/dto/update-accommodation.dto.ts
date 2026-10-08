import { PartialType } from '@nestjs/mapped-types';
import { CreateAccommodationDto } from './create-accommodation.dto.ts';

export class UpdateAccommodationDto extends PartialType(
  CreateAccommodationDto,
) {}
