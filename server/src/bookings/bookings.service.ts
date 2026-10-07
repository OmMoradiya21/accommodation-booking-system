import { Injectable, NotFoundException } from '@nestjs/common';
import { BookingsRepository } from './bookings.repository.ts';
import { Booking } from './entities/bookings.entity.ts';
import { CreateBookingDto } from './dto/create-booking.dto.ts';
import { UpdateBookingDto } from './dto/update-booking.dto.ts';

@Injectable()
export class BookingsService {
  constructor(private readonly bookingsRepository: BookingsRepository) {}

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    return this.bookingsRepository.saveBooking(createBookingDto);
  }

  async findAll(companyId?: string): Promise<Booking[]> {
    return this.bookingsRepository.findAll(companyId);
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne(id);
    if (!booking) {
      throw new NotFoundException(`Booking #${id} not found`);
    }
    return booking;
  }

  async updateStatus(id: string, status: string): Promise<Booking> {
    const updated = await this.bookingsRepository.updateStatus(id, status);
    if (!updated) {
      throw new NotFoundException(`Booking #${id} not found to update status`);
    }
    return updated;
  }

  async update(
    id: string,
    updateBookingDto: UpdateBookingDto,
  ): Promise<Booking> {
    const updated = await this.bookingsRepository.update(id, updateBookingDto);
    if (!updated) {
      throw new NotFoundException(`Booking #${id} not found to update`);
    }
    return updated;
  }

  async remove(id: string): Promise<{ message: string }> {
    const booking = await this.findOne(id);
    await this.bookingsRepository.remove(booking);
    return { message: `Booking #${id} removed successfully` };
  }
}
