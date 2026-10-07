import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/bookings.entity.ts';
import { CreateBookingDto } from './dto/create-booking.dto.ts';
import { UpdateBookingDto } from './dto/update-booking.dto.ts';

@Injectable()
export class BookingsRepository {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  async saveBooking(createBookingDto: CreateBookingDto): Promise<Booking> {
    const booking = this.bookingRepository.create({
      ...createBookingDto,
      status: createBookingDto.status || 'Pending',
    });
    return this.bookingRepository.save(booking);
  }

  async findAll(companyId?: string): Promise<Booking[]> {
    if (companyId) {
      return this.bookingRepository.find({
        where: { company_id: companyId },
        relations: {
          customer: true,
          accommodation: true,
          company: true,
        },
        order: { createdAt: 'DESC' },
      });
    }

    return this.bookingRepository.find({
      relations: {
        customer: true,
        accommodation: true,
        company: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Booking | null> {
    return this.bookingRepository.findOne({
      where: { id },
      relations: {
        customer: true,
        accommodation: true,
        company: true,
      },
    });
  }

  async update(id: string, updateBookingDto: UpdateBookingDto): Promise<Booking | null> {
    const booking = await this.bookingRepository.preload({
      id,
      ...updateBookingDto,
    });
    if (!booking) return null;
    return this.bookingRepository.save(booking);
  }

  async updateStatus(id: string, status: string): Promise<Booking | null> {
    const booking = await this.findOne(id);
    if (!booking) return null;
    booking.status = status;
    return this.bookingRepository.save(booking);
  }

  async remove(booking: Booking): Promise<void> {
    await this.bookingRepository.remove(booking);
  }
}
