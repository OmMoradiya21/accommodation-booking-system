// user.repository.ts
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity.ts';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private readonly dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }
  async findByEmail(email: string) {
    return this.findOne({
      where: { email },
      relations: { role: true },
      select: {
        id: true,
        name: true,
        email: true,
        password:true,
        role: { id: true, name: true },
      },
    });
  }
}
