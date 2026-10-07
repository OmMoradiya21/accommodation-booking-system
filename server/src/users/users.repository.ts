import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.ts';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto.ts';
import { UpdateUserDto } from './dto/update-user.dto.ts';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async findAll() {
    const users = await this.userRepository.find({
      relations: { role: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: { id: true, name: true },
        createdAt: true,
      },
    });
    return users;
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
  async saveUser(createUserDto: CreateUserDto) {
    const savedUser = await this.userRepository.save(createUserDto);
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
