import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type Relation,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.ts';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => User, (user) => user.role)
  users: Relation<User>[];

  @Column()
  name: string;

  @Column()
  description: string;

  @Column('simple-array', { nullable: true, default: '' })
  permissions: string[];
}
