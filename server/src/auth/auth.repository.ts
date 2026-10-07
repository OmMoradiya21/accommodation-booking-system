import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auth_UserSession } from './entities/auth.entity.ts';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectRepository(Auth_UserSession)
    private readonly authUserRepository: Repository<Auth_UserSession>,
  ) {}

  async upsertSession(authUser: Partial<Auth_UserSession>) {
    return this.authUserRepository.upsert(authUser, ['userId']);
  }

  async findByUserId(userId: string): Promise<Auth_UserSession | null> {
    return this.authUserRepository.findOneBy({ userId });
  }

  async saveSession(authUser: Auth_UserSession): Promise<Auth_UserSession> {
    return this.authUserRepository.save(authUser);
  }
}
