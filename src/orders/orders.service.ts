import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  // Only orders owned by the authenticated user. Secure on every branch.
  findAllForUser(userId: number): Promise<Order[]> {
    return this.orderRepository.find({ where: { userId } });
  }

  // Secure implementation:
  // The resource is queried using both the resource ID and authenticated owner ID.
  async findOneForUser(id: number, userId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id, userId },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  // Owner is always the authenticated user; the client cannot set userId.
  create(dto: CreateOrderDto, userId: number): Promise<Order> {
    const order = this.orderRepository.create({ ...dto, userId });
    return this.orderRepository.save(order);
  }
}
