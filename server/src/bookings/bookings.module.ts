import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsService } from './bookings.service.ts';
import { BookingsController } from './bookings.controller.ts';
import { BookingsRepository } from './bookings.repository.ts';
import { Booking } from './entities/bookings.entity.ts';

@Module({
  imports: [TypeOrmModule.forFeature([Booking])],
  controllers: [BookingsController],
  providers: [BookingsService, BookingsRepository],
  exports: [BookingsRepository, TypeOrmModule],
})
export class BookingsModule {}
