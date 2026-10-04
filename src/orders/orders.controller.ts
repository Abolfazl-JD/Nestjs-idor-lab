import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // GET /orders -> only the authenticated user's own orders.
  @Get()
  findAll(@Request() req: { user: { userId: number } }) {
    return this.ordersService.findAllForUser(req.user.userId);
  }

  // GET /orders/:id
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { userId: number } },
  ) {
    return this.ordersService.findOneForUser(id, req.user.userId);
  }

  // POST /orders -> owner is taken from the JWT, never from the request body.
  @Post()
  create(
    @Body() dto: CreateOrderDto,
    @Request() req: { user: { userId: number } },
  ) {
    return this.ordersService.create(dto, req.user.userId);
  }
}
