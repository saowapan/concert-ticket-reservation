import {
  Body,
  Controller,
  Get,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateReservationDto) {
    return this.reservationsService.create(dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.reservationsService.cancel(id);
  }

  @Get('history')
  findAllHistory() {
    return this.reservationsService.findAllHistory();
  }

  @Get('history/user/:userId')
  findUserHistory(@Param('userId', ParseIntPipe) userId: number) {
    return this.reservationsService.findUserHistory(userId);
  }

  @Get('user/:userId')
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.reservationsService.findByUser(userId);
  }

  @Get()
  findAll() {
    return this.reservationsService.findAll();
  }
}
