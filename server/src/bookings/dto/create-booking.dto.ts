import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsNotEmpty()
  @IsString()
  customer_id: string;

  @IsNotEmpty()
  @IsString()
  accommodation_id: string;

  @IsNotEmpty()
  @IsString()
  company_id: string;

  @IsNotEmpty()
  @IsDateString()
  check_in: string;

  @IsNotEmpty()
  @IsDateString()
  check_out: string;

  @IsOptional()
  @IsString()
  status?: string;
}
