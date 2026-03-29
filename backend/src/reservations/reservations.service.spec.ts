import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { Reservation } from './reservation.entity';
import { ReservationHistory } from './reservation-history.entity';
import { ConcertsService } from '../concerts/concerts.service';
import { UsersService } from '../users/users.service';

describe('ReservationsService', () => {
  let service: ReservationsService;

  const mockUser = { id: 1, username: 'testuser', email: 'test@test.com', role: 'user', reservations: [] };
  const mockConcert = { id: 1, name: 'Test Concert', description: 'Desc', seats: 2, reservations: [] };
  const mockReservation = { id: 1, user: mockUser, concert: mockConcert, createdAt: new Date() };

  const mockReservationRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockHistoryRepo = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockConcertsService = {
    findOne: jest.fn(),
  };

  const mockUsersService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        { provide: getRepositoryToken(Reservation), useValue: mockReservationRepo },
        { provide: getRepositoryToken(ReservationHistory), useValue: mockHistoryRepo },
        { provide: ConcertsService, useValue: mockConcertsService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a reservation successfully', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);
      mockConcertsService.findOne.mockResolvedValue(mockConcert);
      mockReservationRepo.findOne.mockResolvedValue(null);
      mockReservationRepo.count.mockResolvedValue(0);
      mockReservationRepo.create.mockReturnValue(mockReservation);
      mockReservationRepo.save.mockResolvedValue(mockReservation);
      mockHistoryRepo.create.mockReturnValue({ user: mockUser, concert: mockConcert, action: 'reserve' });
      mockHistoryRepo.save.mockResolvedValue({});

      const result = await service.create({ userId: 1, concertId: 1 });
      expect(result).toEqual(mockReservation);
      expect(mockHistoryRepo.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if user already reserved', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);
      mockConcertsService.findOne.mockResolvedValue(mockConcert);
      mockReservationRepo.findOne.mockResolvedValue(mockReservation);

      await expect(service.create({ userId: 1, concertId: 1 })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if no seats available', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);
      mockConcertsService.findOne.mockResolvedValue(mockConcert);
      mockReservationRepo.findOne.mockResolvedValue(null);
      mockReservationRepo.count.mockResolvedValue(2);

      await expect(service.create({ userId: 1, concertId: 1 })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('cancel', () => {
    it('should cancel a reservation and log history', async () => {
      mockReservationRepo.findOne.mockResolvedValue(mockReservation);
      mockHistoryRepo.create.mockReturnValue({ user: mockUser, concert: mockConcert, action: 'cancel' });
      mockHistoryRepo.save.mockResolvedValue({});
      mockReservationRepo.remove.mockResolvedValue(undefined);

      await service.cancel(1);
      expect(mockHistoryRepo.save).toHaveBeenCalled();
      expect(mockReservationRepo.remove).toHaveBeenCalledWith(mockReservation);
    });

    it('should throw NotFoundException if reservation not found', async () => {
      mockReservationRepo.findOne.mockResolvedValue(null);
      await expect(service.cancel(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUser', () => {
    it('should return reservations for a user', async () => {
      mockReservationRepo.find.mockResolvedValue([mockReservation]);
      const result = await service.findByUser(1);
      expect(result).toEqual([mockReservation]);
      expect(mockReservationRepo.find).toHaveBeenCalledWith({
        where: { user: { id: 1 } },
        relations: ['concert'],
      });
    });
  });

  describe('findAll', () => {
    it('should return all reservations', async () => {
      mockReservationRepo.find.mockResolvedValue([mockReservation]);
      const result = await service.findAll();
      expect(result).toEqual([mockReservation]);
      expect(mockReservationRepo.find).toHaveBeenCalledWith({
        relations: ['user', 'concert'],
      });
    });
  });

  describe('findAllHistory', () => {
    it('should return all history ordered by date desc', async () => {
      const mockHistory = [{ id: 1, action: 'reserve', createdAt: new Date() }];
      mockHistoryRepo.find.mockResolvedValue(mockHistory);
      const result = await service.findAllHistory();
      expect(result).toEqual(mockHistory);
      expect(mockHistoryRepo.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findUserHistory', () => {
    it('should return history for a specific user', async () => {
      const mockHistory = [{ id: 1, action: 'reserve', user: mockUser, createdAt: new Date() }];
      mockHistoryRepo.find.mockResolvedValue(mockHistory);
      const result = await service.findUserHistory(1);
      expect(result).toEqual(mockHistory);
      expect(mockHistoryRepo.find).toHaveBeenCalledWith({
        where: { user: { id: 1 } },
        order: { createdAt: 'DESC' },
      });
    });
  });
});
