import { Test, TestingModule } from '@nestjs/testing';
import { BookingsController } from './bookings.controller.js';
import { BookingsService } from './bookings.service.js';

describe('BookingsController', () => {
  let controller: BookingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [BookingsService],
    }).compile();

    controller = module.get<BookingsController>(BookingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
