import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { AuthService } from './auth.service.ts';
import { LocalAuthGuard } from './guards/local-auth.guard.ts';
import { CurrentUser } from './decorator/current-user.decorator.ts';
import { CreatePayloadDto } from './dto/create.payload.dto.ts';
import { SkipAuth } from './decorator/skipAuth.decorator.ts';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard.ts';
import { UsersService } from '../users/users.service.ts';
import { CreateUserDto } from '../users/dto/create-user.dto.ts';
import { USER_LOOKUP,type UsersLookup } from '../users/users-lookup.ts';

@SkipAuth()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
@Inject(USER_LOOKUP) private readonly usersLookup: UsersLookup,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersLookup.create(createUserDto);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@CurrentUser() currentUserPayload: CreatePayloadDto) {
    return this.authService.login(currentUserPayload);
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Get(':userId')
  async getAccessToken(@CurrentUser() currentUserPayload: CreatePayloadDto) {
    const data = await this.authService.generateAccessToken(currentUserPayload);
    return { isAuthenticated: true, access_token: data.accessToken };
  }
}
