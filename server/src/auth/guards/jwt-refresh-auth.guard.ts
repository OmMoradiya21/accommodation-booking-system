import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service.js';

@Injectable()
export class JwtRefreshAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private configService: ConfigService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const userId = request.params.userId;
    if (!userId || userId === 'undefined') {
      throw new UnauthorizedException('Valid user ID required');
    }

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token required');
    }

    const secret = this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET');

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret,
        ignoreExpiration: true,
      });

      if (payload.sub !== userId) {
        throw new UnauthorizedException('Token user Mismatch');
      }

      const data = await this.authService.verifyRefreshToken(userId);
      if (!data) {
        return false;
      }
      request['user'] = data.payload;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        const status = error.getStatus();
        const response = error.getResponse();
        console.log(`Status: ${status}`, response);
        throw new BadRequestException('something is bad..response: ', response);
      } else if (error instanceof Error) {
        throw new UnauthorizedException(error.message);
      } else {
        throw new InternalServerErrorException('An unexpected error occurred');
      }
    }
    return true;
  }
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
