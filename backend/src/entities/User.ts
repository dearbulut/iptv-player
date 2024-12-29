import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsEmail, MinLength } from 'class-validator';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column()
  @MinLength(6)
  password: string;

  @Column()
  username: string;

  @Column({ nullable: true })
  xtream_username: string;

  @Column({ nullable: true })
  xtream_password: string;

  @Column({ nullable: true })
  xtream_url: string;

  @Column({ default: false })
  is_admin: boolean;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  adult_content_enabled: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}