import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('auth_user_sessions')
export class Auth_UserSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  userId!: string;

  @Column()
  accessToken!: string;

  @Column()
  accessTokenExpires!: Date;

  @Column()
  refreshToken!: string;

  @Column()
  refreshTokenExpires!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
