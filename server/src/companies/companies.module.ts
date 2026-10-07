import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesService } from './companies.service.ts';
import { CompaniesController } from './companies.controller.ts';
import { CompaniesRepository } from './companies.repository.ts';
import { Company } from './entities/companies.entity.ts';

@Module({
  imports: [TypeOrmModule.forFeature([Company])],
  controllers: [CompaniesController],
  providers: [CompaniesService, CompaniesRepository],
  exports: [CompaniesRepository, TypeOrmModule],
})
export class CompaniesModule {}
