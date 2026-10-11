import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CompaniesService } from './companies.service.ts';
import { CreateCompanyDto } from './dto/create-company.dto.ts';
import { UpdateCompanyDto } from './dto/update-company.dto.ts';
import { Permissions } from '../auth/decorator/permissions.decorator.ts';
import { PERMISSIONS } from '../permissions/constants/permissions.constant.ts';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Permissions(PERMISSIONS.COMPANY.CREATE)
  @Post()
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @Permissions(PERMISSIONS.COMPANY.READ)
  @Get()
  findAll() {
    return this.companiesService.findAll();
  }

  @Permissions(PERMISSIONS.COMPANY.READ)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @Permissions(PERMISSIONS.COMPANY.UPDATE)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companiesService.update(id, updateCompanyDto);
  }

  @Permissions(PERMISSIONS.COMPANY.DELETE)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companiesService.remove(id);
  }
}
