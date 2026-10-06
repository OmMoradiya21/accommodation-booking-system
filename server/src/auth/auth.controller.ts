import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LocalAuthGuard } from './guards/local-auth.guard.js';
import { CurrentUser } from './decorator/current-user.decorator.js';
import { CreatePayloadDto } from './dto/create.payload.dto.js';
import { SkipAuth } from './decorator/skipAuth.decorator.js';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard.js';

@SkipAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  login(@CurrentUser() currentUserPayload: CreatePayloadDto) {
    this.authService.login(currentUserPayload);
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Get(':userId')
  async getAccessToken(@CurrentUser() currentUserPayload: CreatePayloadDto) {
    const data = await this.authService.generateAccessToken(currentUserPayload);
    return { isAuthenticated: true, access_token: data.accessToken };
  }
}
