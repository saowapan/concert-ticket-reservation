import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

import { ConcertsService } from './concerts.service';
import { Concert } from './concert.entity';
import { Reservation } from '../reservations/reservation.entity';
import { ReservationHistory } from '../reservations/reservation-history.entity';

describe('ConcertsService', () => {
  let service: ConcertsService;

  const mockConcert: Concert = {
    id: 1,
    name: 'Test Concert',
    description: 'A test concert',
    seats: 100,
    reservations: [],
  };

  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
  };

  const mockConcertRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    softRemove: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  const mockReservationRepository = {
    count: jest.fn(),
  };

  const mockHistoryRepository = {
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConcertsService,
        {
          provide: getRepositoryToken(Concert),
          useValue: mockConcertRepository,
        },
        {
          provide: getRepositoryToken(Reservation),
          useValue: mockReservationRepository,
        },
        {
          provide: getRepositoryToken(ReservationHistory),
          useValue: mockHistoryRepository,
        },
      ],
    }).compile();

    service = module.get<ConcertsService>(ConcertsService);
    jest.clearAllMocks();
    mockConcertRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.select.mockReturnThis();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of concerts', async () => {
      mockConcertRepository.find.mockResolvedValue([mockConcert]);
      const result = await service.findAll();
      expect(result).toEqual([mockConcert]);
      expect(mockConcertRepository.find).toHaveBeenCalledWith({
        relations: ['reservations'],
      });
    });
  });

  describe('findOne', () => {
    it('should return a concert by id', async () => {
      mockConcertRepository.findOne.mockResolvedValue(mockConcert);
      const result = await service.findOne(1);
      expect(result).toEqual(mockConcert);
    });

    it('should throw NotFoundException if concert not found', async () => {
      mockConcertRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and save a concert', async () => {
      const dto = { name: 'New Concert', description: 'Desc', seats: 50 };
      mockConcertRepository.create.mockReturnValue(mockConcert);
      mockConcertRepository.save.mockResolvedValue(mockConcert);

      const result = await service.create(dto);
      expect(mockConcertRepository.create).toHaveBeenCalledWith(dto);
      expect(mockConcertRepository.save).toHaveBeenCalledWith(mockConcert);
      expect(result).toEqual(mockConcert);
    });
  });

  describe('remove', () => {
    it('should soft-remove a concert that has reservations', async () => {
      const concertWithReservations = { ...mockConcert, reservations: [{ id: 1 }] };
      mockConcertRepository.findOne.mockResolvedValue(concertWithReservations);
      mockConcertRepository.softRemove.mockResolvedValue(undefined);

      await service.remove(1);
      expect(mockConcertRepository.softRemove).toHaveBeenCalledWith(concertWithReservations);
      expect(mockConcertRepository.remove).not.toHaveBeenCalled();
    });

    it('should hard-remove a concert that has no reservations', async () => {
      mockConcertRepository.findOne.mockResolvedValue(mockConcert); // reservations: []
      mockConcertRepository.remove.mockResolvedValue(undefined);

      await service.remove(1);
      expect(mockConcertRepository.remove).toHaveBeenCalledWith(mockConcert);
      expect(mockConcertRepository.softRemove).not.toHaveBeenCalled();
    });
  });

  describe('getStats', () => {
    it('should return aggregated stats using database queries', async () => {
      mockQueryBuilder.getRawOne.mockResolvedValue({ total: '500' });
      mockReservationRepository.count.mockResolvedValue(120);
      mockHistoryRepository.count.mockResolvedValue(12);

      const result = await service.getStats();
      expect(result).toEqual({ totalSeats: 500, totalReserved: 120, totalCancelled: 12 });
      expect(mockConcertRepository.createQueryBuilder).toHaveBeenCalledWith('concert');
      expect(mockReservationRepository.count).toHaveBeenCalled();
      expect(mockHistoryRepository.count).toHaveBeenCalledWith({ where: { action: 'cancel' } });
    });

    it('should return zeros when no data exists', async () => {
      mockQueryBuilder.getRawOne.mockResolvedValue({ total: '0' });
      mockReservationRepository.count.mockResolvedValue(0);
      mockHistoryRepository.count.mockResolvedValue(0);

      const result = await service.getStats();
      expect(result).toEqual({ totalSeats: 0, totalReserved: 0, totalCancelled: 0 });
    });
  });
});
