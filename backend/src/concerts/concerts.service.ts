import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Concert } from './concert.entity';
import { Reservation } from '../reservations/reservation.entity';
import { ReservationHistory } from '../reservations/reservation-history.entity';
import { CreateConcertDto } from './dto/create-concert.dto';

@Injectable()
export class ConcertsService {
  constructor(
    @InjectRepository(Concert)
    private concertsRepository: Repository<Concert>,
    @InjectRepository(Reservation)
    private reservationsRepository: Repository<Reservation>,
    @InjectRepository(ReservationHistory)
    private historyRepository: Repository<ReservationHistory>,
  ) {}

  findAll(): Promise<Concert[]> {
    return this.concertsRepository.find({ relations: ['reservations'] });
  }

  async findOne(id: number): Promise<Concert> {
    const concert = await this.concertsRepository.findOne({
      where: { id },
      relations: ['reservations'],
    });
    if (!concert) throw new NotFoundException('Concert not found');
    return concert;
  }

  create(dto: CreateConcertDto): Promise<Concert> {
    const concert = this.concertsRepository.create(dto);
    return this.concertsRepository.save(concert);
  }

  async remove(id: number): Promise<void> {
    const concert = await this.findOne(id);
    const hasReservations = concert.reservations.length > 0;

    if (hasReservations) {
      await this.concertsRepository.softRemove(concert);
    } else {
      await this.concertsRepository.remove(concert);
    }
  }

  async getStats(): Promise<{ totalSeats: number; totalReserved: number; totalCancelled: number }> {
    const [totalSeatsResult, totalReserved, totalCancelled] = await Promise.all([
      this.concertsRepository
        .createQueryBuilder('concert')
        .select('COALESCE(SUM(concert.seats), 0)', 'total')
        .getRawOne(),
      this.reservationsRepository.count(),
      this.historyRepository.count({ where: { action: 'cancel' } }),
    ]);

    return {
      totalSeats: parseInt(totalSeatsResult?.total || '0', 10),
      totalReserved,
      totalCancelled,
    };
  }
}
