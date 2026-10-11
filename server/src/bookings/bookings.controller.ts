import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BookingsService } from './bookings.service.ts';
import { CreateBookingDto } from './dto/create-booking.dto.ts';
import { UpdateBookingDto } from './dto/update-booking.dto.ts';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto.ts';
import { Permissions } from '../auth/decorator/permissions.decorator.ts';
import { PERMISSIONS } from '../permissions/constants/permissions.constant.ts';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Permissions(PERMISSIONS.BOOKING.CREATE)
  @Post()
  create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(createBookingDto);
  }

  @Permissions(PERMISSIONS.BOOKING.READ)
  @Get()
  findAll(@Query('companyId') companyId?: string) {
    return this.bookingsService.findAll(companyId);
  }

  @Permissions(PERMISSIONS.BOOKING.READ)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Permissions(PERMISSIONS.BOOKING.APPROVE)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateBookingStatusDto: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateStatus(id, updateBookingStatusDto.status);
  }

  @Permissions(PERMISSIONS.BOOKING.UPDATE)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingsService.update(id, updateBookingDto);
  }

  @Permissions(PERMISSIONS.BOOKING.DELETE)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(id);
  }
}
