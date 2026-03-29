import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import { Reservation } from '../reservations/reservation.entity';

@Entity('concerts')
export class Concert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  seats: number;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @OneToMany(() => Reservation, (reservation) => reservation.concert)
  reservations: Reservation[];
}
