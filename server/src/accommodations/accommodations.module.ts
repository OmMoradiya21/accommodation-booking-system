import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccommodationsService } from './accommodations.service.ts';
import { AccommodationsController } from './accommodations.controller.ts';
import { AccommodationsRepository } from './accommodations.repository.ts';
import { Accommodation } from './entities/accommodations.entity.ts';

@Module({
  imports: [TypeOrmModule.forFeature([Accommodation])],
  controllers: [AccommodationsController],
  providers: [AccommodationsService, AccommodationsRepository],
  exports: [AccommodationsRepository, TypeOrmModule],
})
export class AccommodationsModule {}
