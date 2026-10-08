import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/companies.entity.ts';
import { CreateCompanyDto } from './dto/create-company.dto.ts';
import { UpdateCompanyDto } from './dto/update-company.dto.ts';

@Injectable()
export class CompaniesRepository {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async findAll(): Promise<Company[]> {
    return this.companyRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Company | null> {
    return this.companyRepository.findOne({
      where: { id },
      relations: { users: true, customers: true, bookings: true },
    });
  }

  async saveCompany(createCompanyDto: CreateCompanyDto): Promise<Company> {
    const company = this.companyRepository.create(createCompanyDto);
    return this.companyRepository.save(company);
  }

  async update(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company | null> {
    const company = await this.companyRepository.preload({
      id,
      ...updateCompanyDto,
    });
    if (!company) return null;
    return this.companyRepository.save(company);
  }

  async remove(company: Company): Promise<void> {
    await this.companyRepository.remove(company);
  }
}
