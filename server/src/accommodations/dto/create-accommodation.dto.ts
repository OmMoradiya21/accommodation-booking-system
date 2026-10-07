import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAccommodationDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsNotEmpty()
  @IsNumber()
  price_per_night: number;
}
