import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';
import { ContentType } from './Favorite';

@Entity('watch_history')
export class WatchHistory {
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

  @Column({ type: 'float', default: 0 })
  watched_duration: number;

  @Column({ type: 'float', default: 0 })
  total_duration: number;

  @Column({ nullable: true })
  season_number: number;

  @Column({ nullable: true })
  episode_number: number;

  @Column({ nullable: true })
  poster_url: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}