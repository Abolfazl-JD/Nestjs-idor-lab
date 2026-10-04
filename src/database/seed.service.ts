import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { Order } from '../orders/order.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  // Seed demo data only when the database is empty, so restarts don't duplicate.
  async onModuleInit() {
    const existing = await this.userRepository.count();
    if (existing > 0) {
      return;
    }

    const ali = await this.userRepository.save({
      username: 'ali',
      passwordHash: await bcrypt.hash('ali123', 10),
    });

    const reza = await this.userRepository.save({
      username: 'reza',
      passwordHash: await bcrypt.hash('reza123', 10),
    });

    await this.orderRepository.save({
      title: 'Ali Laptop Order',
      description: 'Private demo order belonging to Ali',
      amount: 1200,
      userId: ali.id,
    });

    await this.orderRepository.save({
      title: 'Reza Phone Order',
      description: 'Private demo order belonging to Reza',
      amount: 800,
      userId: reza.id,
    });

    console.log('Seeded demo users (ali, reza) and their orders.');
  }
}
