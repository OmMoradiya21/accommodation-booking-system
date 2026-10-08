import {
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
import { AuthService } from '../auth.service.ts';

@Injectable()
export class JwtRefreshAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private configService: ConfigService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

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

      const paramUserId = request.params.userId;
      const isParamKeyword = paramUserId === 'refresh';

      const userId =
        paramUserId && !isParamKeyword ? paramUserId : payload.sub;

      if (!userId) {
        throw new UnauthorizedException('Valid user ID required');
      }

      const data = await this.authService.verifyRefreshToken(userId);
      if (!data) {
        return false;
      }
      request['user'] = data.payload;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
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
