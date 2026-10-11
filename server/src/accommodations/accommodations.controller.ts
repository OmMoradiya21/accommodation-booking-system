import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AccommodationsService } from './accommodations.service.ts';
import { CreateAccommodationDto } from './dto/create-accommodation.dto.ts';
import { UpdateAccommodationDto } from './dto/update-accommodation.dto.ts';
import { Permissions } from '../auth/decorator/permissions.decorator.ts';
import { PERMISSIONS } from '../permissions/constants/permissions.constant.ts';

@Controller('accommodations')
export class AccommodationsController {
  constructor(private readonly accommodationsService: AccommodationsService) {}

  @Permissions(PERMISSIONS.ACCOMMODATION.CREATE)
  @Post()
  create(@Body() createAccommodationDto: CreateAccommodationDto) {
    return this.accommodationsService.create(createAccommodationDto);
  }

  @Permissions(PERMISSIONS.ACCOMMODATION.READ)
  @Get()
  findAll() {
    return this.accommodationsService.findAll();
  }

  @Permissions(PERMISSIONS.ACCOMMODATION.READ)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accommodationsService.findOne(id);
  }

  @Permissions(PERMISSIONS.ACCOMMODATION.UPDATE)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAccommodationDto: UpdateAccommodationDto,
  ) {
    return this.accommodationsService.update(id, updateAccommodationDto);
  }

  @Permissions(PERMISSIONS.ACCOMMODATION.DELETE)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accommodationsService.remove(id);
  }
}
