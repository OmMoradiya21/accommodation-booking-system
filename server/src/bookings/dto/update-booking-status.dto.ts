import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UpdateBookingStatusDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(['Pending', 'Approved', 'Declined'])
  status: string;
}
