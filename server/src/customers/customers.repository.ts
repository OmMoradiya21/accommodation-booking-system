import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customers.entity.ts';
import { CreateCustomerDto } from './dto/create-customer.dto.ts';
import { UpdateCustomerDto } from './dto/update-customer.dto.ts';

@Injectable()
export class CustomersRepository {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async findAll(companyId?: string): Promise<Customer[]> {
    if (companyId) {
      return this.customerRepository.find({
        where: { company_id: companyId },
        relations: { company: true },
        order: { createdAt: 'DESC' },
      });
    }
    return this.customerRepository.find({
      relations: { company: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Customer | null> {
    return this.customerRepository.findOne({
      where: { id },
      relations: { company: true, bookings: true },
    });
  }

  async findByEmail(
    email: string,
    companyId?: string,
  ): Promise<Customer | null> {
    const where: { email: string; company_id?: string } = { email };
    if (companyId) {
      where.company_id = companyId;
    }
    return this.customerRepository.findOne({ where });
  }

  async saveCustomer(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const customer = this.customerRepository.create(createCustomerDto);
    return this.customerRepository.save(customer);
  }

  async update(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer | null> {
    const customer = await this.customerRepository.preload({
      id,
      ...updateCustomerDto,
    });
    if (!customer) return null;
    return this.customerRepository.save(customer);
  }

  async remove(customer: Customer): Promise<void> {
    await this.customerRepository.remove(customer);
  }
}
