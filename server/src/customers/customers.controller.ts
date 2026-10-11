import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CustomersService } from './customers.service.ts';
import { CreateCustomerDto } from './dto/create-customer.dto.ts';
import { UpdateCustomerDto } from './dto/update-customer.dto.ts';
import { Permissions } from '../auth/decorator/permissions.decorator.ts';
import { PERMISSIONS } from '../permissions/constants/permissions.constant.ts';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Permissions(PERMISSIONS.CUSTOMER.CREATE)
  @Post()
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Permissions(PERMISSIONS.CUSTOMER.READ)
  @Get()
  findAll(@Query('companyId') companyId?: string) {
    return this.customersService.findAll(companyId);
  }

  @Permissions(PERMISSIONS.CUSTOMER.READ)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Permissions(PERMISSIONS.CUSTOMER.UPDATE)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Permissions(PERMISSIONS.CUSTOMER.DELETE)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }
}
