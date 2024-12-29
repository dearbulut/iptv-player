import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './User';

export enum ContentType {
  LIVE = 'live',
  MOVIE = 'movie',
  SERIES = 'series'
}

@Entity('favorites')
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  content_id: string;

  @Column({
    type: 'enum',
    enum: ContentType
  })
  content_type: ContentType;

  @Column()
  title: string;

  @Column({ nullable: true })
  poster_url: string;

  @CreateDateColumn()
  created_at: Date;
}