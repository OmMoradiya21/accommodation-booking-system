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
import { SkipJwtAccessAuthGuard } from './decorator/skipJwtAccessAuthGuard.decorator.ts';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard.ts';
import { CreateUserDto } from '../users/dto/create-user.dto.ts';
import { JwtAccessAuthGuard } from './guards/jwt-access-auth.guard.ts';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SkipJwtAccessAuthGuard()
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @SkipJwtAccessAuthGuard()
  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@CurrentUser() currentUserPayload: CreatePayloadDto) {
    console.log(currentUserPayload);
    return this.authService.login(currentUserPayload);
  }

  @SkipJwtAccessAuthGuard()
  @UseGuards(JwtRefreshAuthGuard)
  @Get(':userId')
  async getAccessToken(@CurrentUser() currentUserPayload: CreatePayloadDto) {
    const data = await this.authService.generateAccessToken(currentUserPayload);
    return { isAuthenticated: true, access_token: data.accessToken };
  }

  @UseGuards(JwtAccessAuthGuard)
  @Get('current-user/:userId')
  async getCurrentUser(@CurrentUser() currentUserPayload: CreatePayloadDto) {
    // TODO : sent permissions with this object.
    return { ...currentUserPayload };
  }
}
