import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type Relation,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.ts';
import { Customer } from '../../customers/entities/customers.entity.ts';
import { Booking } from '../../bookings/entities/bookings.entity.ts';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => User, (user) => user.companies)
  @JoinTable({
    name: 'user_companies',
    joinColumn: { name: 'company_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  users: Relation<User>[];

  @OneToMany(() => Customer, (customer) => customer.company)
  customers: Relation<Customer>[];

  @OneToMany(() => Booking, (booking) => booking.company)
  bookings: Relation<Booking>[];

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  industry?: string;
}
