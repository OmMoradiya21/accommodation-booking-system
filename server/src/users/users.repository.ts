import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.ts';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto.ts';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async findAll() {
    const users = await this.userRepository.find({
      relations: { role: true, companies: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: { id: true, name: true },
        companies: { id: true, name: true },
        createdAt: true,
      },
      order: { createdAt: 'DESC' },
    });
    return users;
  }

  async linkUserToCompanies(userId: string, companyIds: string[]) {
    for (const companyId of companyIds) {
      await this.userRepository.manager.query(
        `INSERT INTO user_companies (user_id, company_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [userId, companyId],
      );
    }
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { role: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: { id: true, name: true },
        createdAt: true,
      },
    });
    return user;
  }

  async findByIdWithRelations(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: {
        role: true,
        permissions: true,
        companies: true,
      },
    });
  }
  async findByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: { role: true },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: { id: true, name: true },
      },
    });
    return user;
  }
  async saveUser(createUserDto: Partial<User>) {
    if (
      createUserDto.password &&
      !createUserDto.password.startsWith('$2b$') &&
      !createUserDto.password.startsWith('$2a$')
    ) {
      createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
    }
    const user = this.userRepository.create(createUserDto);
    const savedUser = await this.userRepository.save(user);
    return savedUser;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const updatedUser = await this.userRepository.preload({
      id,
      ...updateUserDto,
    });
    return updatedUser;
  }

  async remove(user: User) {
     await this.userRepository.remove(user);

  }
}
