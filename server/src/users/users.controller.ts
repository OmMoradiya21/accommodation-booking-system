import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service.ts';
import { CreateUserDto } from './dto/create-user.dto.ts';
import { UpdateUserDto } from './dto/update-user.dto.ts';
import { SkipJwtAccessAuthGuard } from '../auth/decorator/skipJwtAccessAuthGuard.decorator.ts';
import { Permissions } from '../auth/decorator/permissions.decorator.ts';
import { PERMISSIONS } from '../permissions/constants/permissions.constant.ts';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Permissions(PERMISSIONS.USER.CREATE)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Permissions(PERMISSIONS.USER.READ)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Permissions(PERMISSIONS.USER.READ)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Permissions(PERMISSIONS.USER.UPDATE)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Permissions(PERMISSIONS.USER.DELETE)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
