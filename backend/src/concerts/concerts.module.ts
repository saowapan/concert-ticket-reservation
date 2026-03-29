import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Concert } from './concert.entity';
import { Reservation } from '../reservations/reservation.entity';
import { ReservationHistory } from '../reservations/reservation-history.entity';
import { ConcertsService } from './concerts.service';
import { ConcertsController } from './concerts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Concert, Reservation, ReservationHistory])],
  providers: [ConcertsService],
  controllers: [ConcertsController],
  exports: [ConcertsService],
})
export class ConcertsModule {}
