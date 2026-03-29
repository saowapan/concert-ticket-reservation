import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from './reservation.entity';
import { ReservationHistory } from './reservation-history.entity';
import { ConcertsService } from '../concerts/concerts.service';
import { UsersService } from '../users/users.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private reservationsRepository: Repository<Reservation>,
    @InjectRepository(ReservationHistory)
    private historyRepository: Repository<ReservationHistory>,
    private concertsService: ConcertsService,
    private usersService: UsersService,
  ) {}

  async create(dto: CreateReservationDto): Promise<Reservation> {
    const user = await this.usersService.findOne(dto.userId);
    const concert = await this.concertsService.findOne(dto.concertId);

    const existing = await this.reservationsRepository.findOne({
      where: { user: { id: user.id }, concert: { id: concert.id } },
    });
    if (existing) {
      throw new BadRequestException(
        'User already reserved a seat for this concert',
      );
    }

    const reservedCount = await this.reservationsRepository.count({
      where: { concert: { id: concert.id } },
    });
    if (reservedCount >= concert.seats) {
      throw new BadRequestException('No seats available');
    }

    const reservation = this.reservationsRepository.create({ user, concert });
    const saved = await this.reservationsRepository.save(reservation);

    // Log history
    await this.historyRepository.save(
      this.historyRepository.create({ user, concert, action: 'reserve' }),
    );

    return saved;
  }

  async cancel(id: number): Promise<void> {
    const reservation = await this.reservationsRepository.findOne({
      where: { id },
      relations: ['user', 'concert'],
    });
    if (!reservation) throw new NotFoundException('Reservation not found');

    // Log history before deleting
    await this.historyRepository.save(
      this.historyRepository.create({
        user: reservation.user,
        concert: reservation.concert,
        action: 'cancel',
      }),
    );

    await this.reservationsRepository.remove(reservation);
  }

  findByUser(userId: number): Promise<Reservation[]> {
    return this.reservationsRepository.find({
      where: { user: { id: userId } },
      relations: ['concert'],
    });
  }

  findAll(): Promise<Reservation[]> {
    return this.reservationsRepository.find({
      relations: ['user', 'concert'],
    });
  }

  findAllHistory(): Promise<ReservationHistory[]> {
    return this.historyRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  findUserHistory(userId: number): Promise<ReservationHistory[]> {
    return this.historyRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }
}
