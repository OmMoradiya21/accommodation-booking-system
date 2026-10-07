import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePayloadDto {
  @IsNotEmpty()
  @IsString()
  sub: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  role: string;
}
