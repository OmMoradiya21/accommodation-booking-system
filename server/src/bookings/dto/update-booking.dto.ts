import { PartialType } from '@nestjs/mapped-types';
import { CreateBookingDto } from './create-booking.dto.ts';

export class UpdateBookingDto extends PartialType(CreateBookingDto) {}
