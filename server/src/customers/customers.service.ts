import { Injectable, NotFoundException } from '@nestjs/common';
import { CustomersRepository } from './customers.repository.ts';
import { Customer } from './entities/customers.entity.ts';
import { CreateCustomerDto } from './dto/create-customer.dto.ts';
import { UpdateCustomerDto } from './dto/update-customer.dto.ts';

@Injectable()
export class CustomersService {
  constructor(private readonly customersRepository: CustomersRepository) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    return this.customersRepository.saveCustomer(createCustomerDto);
  }

  async findAll(companyId?: string): Promise<Customer[]> {
    return this.customersRepository.findAll(companyId);
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customersRepository.findOne(id);
    if (!customer) {
      throw new NotFoundException(`Customer #${id} not found`);
    }
    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const updated = await this.customersRepository.update(id, updateCustomerDto);
    if (!updated) {
      throw new NotFoundException(`Customer #${id} not found to update`);
    }
    return updated;
  }

  async remove(id: string): Promise<{ message: string }> {
    const customer = await this.findOne(id);
    await this.customersRepository.remove(customer);
    return { message: `Customer #${id} removed successfully` };
  }
}
