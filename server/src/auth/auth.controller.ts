import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
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
    return this.authService.login(currentUserPayload);
  }

  @UseGuards(JwtAccessAuthGuard)
  @Get(['current-user', 'current-user/:userId'])
  async getCurrentUser(
    @CurrentUser() currentUserPayload: CreatePayloadDto,
    @Req() req: Request,
  ) {
    const authHeader = req.headers.authorization;
    const activeToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;
    return this.authService.getCurrentUser(currentUserPayload.sub, activeToken);
  }

  @SkipJwtAccessAuthGuard()
  @UseGuards(JwtRefreshAuthGuard)
  @Get('access-token/:userId')
  async getAccessToken(@CurrentUser() currentUserPayload: CreatePayloadDto) {
    const data = await this.authService.generateAccessToken(currentUserPayload);
    return { isAuthenticated: true, accessToken: data.accessToken, access_token: data.accessToken };
  }
}
