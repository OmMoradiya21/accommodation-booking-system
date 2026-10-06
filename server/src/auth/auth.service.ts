import {
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
// import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Auth_UserSession } from './entities/auth.entity.js';
import { CreatePayloadDto } from './dto/create.payload.dto.js';
import { USER_LOOKUP, type UsersLookup } from '../users/users-lookup.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth_UserSession)
    private readonly authUserRepository: Repository<Auth_UserSession>,
  
    // TODO: Make User Look-up and remove user Service // done
    // private readonly userService: UserService,
    @Inject(USER_LOOKUP) private readonly users: UsersLookup,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(payload: CreatePayloadDto) {

    const expirationMs = this.accessTokenExpirationMs;
    const refreshExpirationMs = this.refreshTokenExpirationMs;

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.accessTokenSecret,
      expiresIn: `${expirationMs}ms`,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.refreshTokenSecret,
      expiresIn: `${refreshExpirationMs}ms`,
    });

    const expiresAccessToken = new Date(Date.now() + expirationMs);
    const expiresRefreshToken = new Date(Date.now() + refreshExpirationMs);

    const authUser = {
      userId: payload.sub,
      accessToken,
      refreshToken,
      accessTokenExpires: expiresAccessToken,
      refreshTokenExpires: expiresRefreshToken,
    };
    await this.authUserRepository.upsert(authUser, ['userId']);
    return {
      access_token: accessToken,
      user: payload,
    };
  }

  async verifyUser(email: string, pass: string) {
    const user = await this.users.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await user.validatePassword(pass);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: user.id,
      name: user.name,
      email: user.email,
      role:user.role
    };

    return payload;
  }

  private get accessTokenSecret(): string {
    return (
      this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET') ||
      'jwt_access_token_secret'
    );
  }

  private get accessTokenExpirationMs(): number {
    const val = this.configService.get<string>(
      'JWT_ACCESS_TOKEN_EXPIRATION_MS',
    );
    return val ? parseInt(val, 10) : 900000;
  }

  private get refreshTokenSecret(): string {
    return (
      this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET') ||
      'jwt_refresh_token_secret'
    );
  }

  private get refreshTokenExpirationMs(): number {
    const val = this.configService.get<string>(
      'JWT_REFRESH_TOKEN_EXPIRATION_MS',
    );
    return val ? parseInt(val, 10) : 604800000;
  }

  async verifyRefreshToken(userId: string) {
    const userAuthData = await this.authUserRepository.findOneBy({
      userId: userId,
    });
    if (!userAuthData) {
      throw new UnauthorizedException(
        'User auth record not found, please login.',
      );
    }

    if (
      userAuthData.refreshTokenExpires &&
      new Date() > userAuthData.refreshTokenExpires
    ) {
      throw new UnauthorizedException('Refresh token expired, please login.');
    }

    try {
      const decoded = await this.jwtService.verifyAsync(
        userAuthData.refreshToken,
        {
          secret: this.refreshTokenSecret,
        },
      );
      return {
        payload: {
          sub: decoded.sub,
          name: decoded.name,
          email: decoded.email,
          role:decoded.role
        },
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token, please login.');
    }
  }

  async generateAccessToken(payload: CreatePayloadDto) {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.accessTokenSecret,
      expiresIn: `${this.accessTokenExpirationMs}ms`,
    });

    const authUser = await this.authUserRepository.findOneBy({
      userId: payload.sub,
    });

    if (authUser) {
      authUser.accessToken = accessToken;
      authUser.accessTokenExpires = new Date(
        Date.now() + this.accessTokenExpirationMs,
      );
      await this.authUserRepository.save(authUser);
    }

    return { accessToken };
  }
}
