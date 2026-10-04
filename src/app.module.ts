import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { Order } from './orders/order.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';
import { SeedService } from './database/seed.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'data/idor-lab.sqlite',
      entities: [User, Order],
      synchronize: true, // Fine for a throwaway university demo database.
    }),
    TypeOrmModule.forFeature([User, Order]),
    AuthModule,
    UsersModule,
    OrdersModule,
  ],
  providers: [SeedService],
})
export class AppModule {}
