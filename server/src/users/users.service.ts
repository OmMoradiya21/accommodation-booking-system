import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.ts';
import { UpdateUserDto } from './dto/update-user.dto.ts';
import { UserRepository } from './users.repository.ts';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exist.');
    }

    let roleId = createUserDto.role_id;
    // TODO: get by rolesLookup

    // if (!roleId) {
    //   let defaultRole = await this.roleRepository.findOne({
    //     where: { name: 'USER' },
    //   });
    //   roleId = defaultRole.id;
    // }

    const savedUser = await this.userRepository.save({
      ...createUserDto,
      roleId,
    });

    return savedUser;
  }

  async findAll() {
    return this.userRepository.find({
      relations: { role: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: { id: true, name: true },
        createdAt: true,
      },
    });
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
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
    return { message: `User Removed Successfully` };
  }

  async findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }
}
