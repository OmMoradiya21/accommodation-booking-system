import { Injectable, NotFoundException } from '@nestjs/common';
import { AccommodationsRepository } from './accommodations.repository.ts';
import { Accommodation } from './entities/accommodations.entity.ts';
import { CreateAccommodationDto } from './dto/create-accommodation.dto.ts';
import { UpdateAccommodationDto } from './dto/update-accommodation.dto.ts';

@Injectable()
export class AccommodationsService {
  constructor(
    private readonly accommodationsRepository: AccommodationsRepository,
  ) {}

  async create(
    createAccommodationDto: CreateAccommodationDto,
  ): Promise<Accommodation> {
    return this.accommodationsRepository.saveAccommodation(
      createAccommodationDto,
    );
  }

  async findAll(): Promise<Accommodation[]> {
    return this.accommodationsRepository.findAll();
  }

  async findOne(id: string): Promise<Accommodation> {
    const accommodation = await this.accommodationsRepository.findOne(id);
    if (!accommodation) {
      throw new NotFoundException(`Accommodation #${id} not found`);
    }
    return accommodation;
  }

  async update(
    id: string,
    updateAccommodationDto: UpdateAccommodationDto,
  ): Promise<Accommodation> {
    const updated = await this.accommodationsRepository.update(
      id,
      updateAccommodationDto,
    );
    if (!updated) {
      throw new NotFoundException(`Accommodation #${id} not found to update`);
    }
    return updated;
  }

  async remove(id: string): Promise<{ message: string }> {
    const accommodation = await this.findOne(id);
    await this.accommodationsRepository.remove(accommodation);
    return { message: `Accommodation #${id} removed successfully` };
  }
}
