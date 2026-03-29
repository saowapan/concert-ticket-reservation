import { Module } from '@nestjs/common';
import { Reservation } from './reservation.entity';
import { ReservationHistory } from './reservation-history.entity';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConcertsModule } from '../concerts/concerts.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation, ReservationHistory]),
    ConcertsModule,
    UsersModule,
  ],
  providers: [ReservationsService],
  controllers: [ReservationsController],
})
export class ReservationsModule {}
