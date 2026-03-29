import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Reservation } from '../reservations/reservation.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column({ default: 'user' })
  role: string; // 'admin' or 'user'

  @OneToMany(() => Reservation, (reservation) => reservation.user)
  reservations: Reservation[];
}
