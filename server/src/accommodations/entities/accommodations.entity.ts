import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type Relation,
} from 'typeorm';
import { Booking } from '../../bookings/entities/bookings.entity.ts';

@Entity('accommodations')
export class Accommodation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Booking, (booking) => booking.accommodation)
  bookings: Relation<Booking>[];

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255 })
  location: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price_per_night: number;
}
