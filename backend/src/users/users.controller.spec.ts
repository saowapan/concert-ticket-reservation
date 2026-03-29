import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUser = { id: 1, username: 'testuser', email: 'test@test.com', role: 'user', reservations: [] };

  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      mockService.findAll.mockResolvedValue([mockUser]);
      const result = await controller.findAll();
      expect(result).toEqual([mockUser]);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockService.findOne.mockResolvedValue(mockUser);
      const result = await controller.findOne(1);
      expect(result).toEqual(mockUser);
    });
  });

  describe('create', () => {
    it('should create a user', async () => {
      const dto = { username: 'newuser', email: 'new@test.com' };
      mockService.create.mockResolvedValue(mockUser);
      const result = await controller.create(dto);
      expect(result).toEqual(mockUser);
      expect(mockService.create).toHaveBeenCalledWith(dto);
    });
  });
});
