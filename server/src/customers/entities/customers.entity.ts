import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type Relation,
} from 'typeorm';
import { Company } from '../../companies/entities/companies.entity.ts';
import { Booking } from '../../bookings/entities/bookings.entity.ts';


@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  company_id: string;

  @ManyToOne(() => Company, (company) => company.customers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'company_id' })
  company: Relation<Company>;

  @OneToMany(() => Booking, (booking) => booking.customer)
  bookings: Relation<Booking>[];

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string;
}
