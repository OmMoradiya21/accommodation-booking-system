import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Accommodation } from './entities/accommodations.entity.ts';
import { CreateAccommodationDto } from './dto/create-accommodation.dto.ts';
import { UpdateAccommodationDto } from './dto/update-accommodation.dto.ts';

@Injectable()
export class AccommodationsRepository {
  constructor(
    @InjectRepository(Accommodation)
    private readonly accommodationRepository: Repository<Accommodation>,
  ) {}

  async findAll(): Promise<Accommodation[]> {
    return this.accommodationRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Accommodation | null> {
    return this.accommodationRepository.findOne({
      where: { id },
      relations: { bookings: true },
    });
  }

  async saveAccommodation(createAccommodationDto: CreateAccommodationDto): Promise<Accommodation> {
    const accommodation = this.accommodationRepository.create(createAccommodationDto);
    return this.accommodationRepository.save(accommodation);
  }

  async update(id: string, updateAccommodationDto: UpdateAccommodationDto): Promise<Accommodation | null> {
    const accommodation = await this.accommodationRepository.preload({
      id,
      ...updateAccommodationDto,
    });
    if (!accommodation) return null;
    return this.accommodationRepository.save(accommodation);
  }

  async remove(accommodation: Accommodation): Promise<void> {
    await this.accommodationRepository.remove(accommodation);
  }
}
