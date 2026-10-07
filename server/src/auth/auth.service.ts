import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { AuthRepository } from './auth.repository.ts';
import { CreatePayloadDto } from './dto/create.payload.dto.ts';
import { USERS_LOOKUP, type UsersLookup } from '../users/users-lookup.ts';
import { CreateUserDto } from '../users/dto/create-user.dto.ts';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    @Inject(USERS_LOOKUP) private readonly usersLookup: UsersLookup,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    return this.usersLookup.create(createUserDto);
  }

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
    await this.authRepository.upsertSession(authUser);

    const userProfile = await this.getUserProfile(payload.sub);

    return {
      accessToken,
      user: userProfile,
    };
  }

  async getUserProfile(userId: string) {
    const user = await this.usersLookup.findByIdWithRelations(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const permissionSet = new Set<string>();

    if (user.role?.permissions) {
      for (const p of user.role.permissions) {
        if (p && p.trim()) {
          permissionSet.add(p.trim());
        }
      }
    }

    if (user.permissions) {
      for (const p of user.permissions) {
        if (p && p.name && p.name.trim()) {
          permissionSet.add(p.name.trim());
        }
      }
    }

    const companies = (user.companies || []).map((company) => ({
      id: company.id,
      name: company.name,
    }));

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      companies,
      permissions: Array.from(permissionSet),
    };
  }

  async getCurrentUser(userId: string, activeAccessToken?: string) {
    const userProfile = await this.getUserProfile(userId);

    let accessToken = activeAccessToken;
    if (!accessToken) {
      const session = await this.authRepository.findByUserId(userId);
      accessToken = session?.accessToken;
    }

    if (!accessToken) {
      const payload: CreatePayloadDto = {
        sub: userProfile.id,
        name: userProfile.name,
        email: userProfile.email,
        role: '',
      };
      const generated = await this.generateAccessToken(payload);
      accessToken = generated.accessToken;
    }

    return {
      accessToken,
      user: userProfile,
    };
  }

  async verifyUser(email: string, pass: string) {
    const user = await this.usersLookup.findByEmail(email);

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
      role: user.role?.name,
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
    const userAuthData = await this.authRepository.findByUserId(userId);
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
          role: decoded.role,
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

    const authUser = await this.authRepository.findByUserId(payload.sub);

    if (authUser) {
      authUser.accessToken = accessToken;
      authUser.accessTokenExpires = new Date(
        Date.now() + this.accessTokenExpirationMs,
      );
      await this.authRepository.saveSession(authUser);
    }

    return { accessToken };
  }
}
