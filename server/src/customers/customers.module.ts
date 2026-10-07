import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersService } from './customers.service.ts';
import { CustomersController } from './customers.controller.ts';
import { CustomersRepository } from './customers.repository.ts';
import { Customer } from './entities/customers.entity.ts';

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  controllers: [CustomersController],
  providers: [CustomersService, CustomersRepository],
  exports: [CustomersRepository, TypeOrmModule],
})
export class CustomersModule {}
