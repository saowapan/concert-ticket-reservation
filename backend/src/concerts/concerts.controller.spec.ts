import { Test, TestingModule } from '@nestjs/testing';
import { ConcertsController } from './concerts.controller';
import { ConcertsService } from './concerts.service';

describe('ConcertsController', () => {
  let controller: ConcertsController;

  const mockConcert = { id: 1, name: 'Test Concert', description: 'Desc', seats: 100, reservations: [] };

  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
    getStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConcertsController],
      providers: [{ provide: ConcertsService, useValue: mockService }],
    }).compile();

    controller = module.get<ConcertsController>(ConcertsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of concerts', async () => {
      mockService.findAll.mockResolvedValue([mockConcert]);
      const result = await controller.findAll();
      expect(result).toEqual([mockConcert]);
    });
  });

  describe('findOne', () => {
    it('should return a single concert', async () => {
      mockService.findOne.mockResolvedValue(mockConcert);
      const result = await controller.findOne(1);
      expect(result).toEqual(mockConcert);
    });
  });

  describe('create', () => {
    it('should create a concert', async () => {
      const dto = { name: 'New Concert', description: 'Desc', seats: 50 };
      mockService.create.mockResolvedValue({ id: 2, ...dto, reservations: [] });
      const result = await controller.create(dto);
      expect(result.name).toBe('New Concert');
      expect(mockService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('remove', () => {
    it('should remove a concert', async () => {
      mockService.remove.mockResolvedValue(undefined);
      await controller.remove(1);
      expect(mockService.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('getStats', () => {
    it('should return stats summary', async () => {
      const stats = { totalSeats: 500, totalReserved: 120 };
      mockService.getStats.mockResolvedValue(stats);
      const result = await controller.getStats();
      expect(result).toEqual(stats);
    });
  });
});
