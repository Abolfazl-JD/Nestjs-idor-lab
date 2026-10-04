import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  amount: number;
}
