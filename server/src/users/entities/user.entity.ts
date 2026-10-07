import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
  type Relation,
} from 'typeorm';
import { Role } from '../../roles/entities/roles.entity.ts';
import { Company } from '../../companies/entities/companies.entity.ts';
import { Permission } from '../../permissions/entities/permission.entity.ts';
import * as bcrypt from 'bcrypt';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // relation
  //TODO: set default value of user id

  @Column()
  role_id: string;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Relation<Role>;

  @ManyToMany(() => Permission, (permission) => permission.users)
  @JoinTable({
    name: 'user_permissions',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: Relation<Permission>[];

  @ManyToMany(() => Company, (company) => company.users)
  companies: Relation<Company>[];

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ unique: true, type: 'varchar', length: 50 })
  email: string;

  @Column({ select: false })
  password: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (
      this.password &&
      !this.password.startsWith('$2b$') &&
      !this.password.startsWith('$2a$')
    ) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    if (this.password.startsWith('$2b$') || this.password.startsWith('$2a$')) {
      return bcrypt.compare(password, this.password);
    }
    // TODO : Remove and throw error after development
    return this.password === password;
  }
}
