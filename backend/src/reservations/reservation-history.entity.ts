import {
  CreateDateColumn,
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Concert } from '../concerts/concert.entity';

@Entity('reservation_history')
export class ReservationHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @ManyToOne(() => Concert, { eager: true, onDelete: 'SET NULL', nullable: true })
  concert: Concert | null;

  @Column()
  action: string; // 'reserve' or 'cancel'

  @CreateDateColumn()
  createdAt: Date;
}
