import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  type Relation,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.ts';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ unique: true })
  name: string;

  @ManyToMany(() => User, (user) => user.permissions)
  users: Relation<User>[];
}
