import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';

describe('ReservationsController', () => {
  let controller: ReservationsController;

  const mockReservation = { id: 1, user: { id: 1 }, concert: { id: 1 }, createdAt: new Date() };

  const mockService = {
    create: jest.fn(),
    cancel: jest.fn(),
    findByUser: jest.fn(),
    findAll: jest.fn(),
    findAllHistory: jest.fn(),
    findUserHistory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [{ provide: ReservationsService, useValue: mockService }],
    }).compile();

    controller = module.get<ReservationsController>(ReservationsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a reservation', async () => {
      mockService.create.mockResolvedValue(mockReservation);
      const result = await controller.create({ userId: 1, concertId: 1 });
      expect(result).toEqual(mockReservation);
      expect(mockService.create).toHaveBeenCalledWith({ userId: 1, concertId: 1 });
    });
  });

  describe('cancel', () => {
    it('should cancel a reservation', async () => {
      mockService.cancel.mockResolvedValue(undefined);
      await controller.cancel(1);
      expect(mockService.cancel).toHaveBeenCalledWith(1);
    });
  });

  describe('findByUser', () => {
    it('should return reservations for a user', async () => {
      mockService.findByUser.mockResolvedValue([mockReservation]);
      const result = await controller.findByUser(1);
      expect(result).toEqual([mockReservation]);
    });
  });

  describe('findAllHistory', () => {
    it('should return all history', async () => {
      const history = [{ id: 1, action: 'reserve' }];
      mockService.findAllHistory.mockResolvedValue(history);
      const result = await controller.findAllHistory();
      expect(result).toEqual(history);
    });
  });

  describe('findUserHistory', () => {
    it('should return history for a specific user', async () => {
      const history = [{ id: 1, action: 'reserve' }];
      mockService.findUserHistory.mockResolvedValue(history);
      const result = await controller.findUserHistory(1);
      expect(result).toEqual(history);
      expect(mockService.findUserHistory).toHaveBeenCalledWith(1);
    });
  });
});
