import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type Relation,
} from 'typeorm';
import { Customer } from '../../customers/entities/customers.entity.ts';
import { Accommodation } from '../../accommodations/entities/accommodations.entity.ts';
import { Company } from '../../companies/entities/companies.entity.ts';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  company_id: string;

  @ManyToOne(() => Company, (company) => company.bookings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'company_id' })
  company: Relation<Company>;

  @Column()
  customer_id: string;

  @ManyToOne(() => Customer, (customer) => customer.bookings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customer_id' })
  customer: Relation<Customer>;

  @Column()
  accommodation_id: string;

  @ManyToOne(() => Accommodation, (accommodation) => accommodation.bookings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'accommodation_id' })
  accommodation: Relation<Accommodation>;

  @Column({ type: 'date' })
  check_in: Date;

  @Column({ type: 'date' })
  check_out: Date;

  @Column({ type: 'varchar', length: 20, default: 'Pending' })
  status: string;
}
