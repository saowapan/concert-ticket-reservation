import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUser = { id: 1, username: 'testuser', email: 'test@test.com', role: 'user', reservations: [] };

  const mockService = {
    findOne: jest.fn(),
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

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockService.findOne.mockResolvedValue(mockUser);
      const result = await controller.findOne(1);
      expect(result).toEqual(mockUser);
    });
  });
});
