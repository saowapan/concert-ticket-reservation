import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Concert } from '../concerts/concert.entity';

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.reservations)
  user: User;

  @ManyToOne(() => Concert, (concert) => concert.reservations, { onDelete: 'CASCADE' })
  concert: Concert;

  @CreateDateColumn()
  createdAt: Date;
}
