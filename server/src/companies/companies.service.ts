import { Injectable, NotFoundException } from '@nestjs/common';
import { CompaniesRepository } from './companies.repository.ts';
import { Company } from './entities/companies.entity.ts';
import { CreateCompanyDto } from './dto/create-company.dto.ts';
import { UpdateCompanyDto } from './dto/update-company.dto.ts';

@Injectable()
export class CompaniesService {
  constructor(private readonly companiesRepository: CompaniesRepository) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    return this.companiesRepository.saveCompany(createCompanyDto);
  }

  async findAll(): Promise<Company[]> {
    return this.companiesRepository.findAll();
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.companiesRepository.findOne(id);
    if (!company) {
      throw new NotFoundException(`Company #${id} not found`);
    }
    return company;
  }

  async update(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    const updated = await this.companiesRepository.update(id, updateCompanyDto);
    if (!updated) {
      throw new NotFoundException(`Company #${id} not found to update`);
    }
    return updated;
  }

  async remove(id: string): Promise<{ message: string }> {
    const company = await this.findOne(id);
    await this.companiesRepository.remove(company);
    return { message: `Company #${id} removed successfully` };
  }
}
