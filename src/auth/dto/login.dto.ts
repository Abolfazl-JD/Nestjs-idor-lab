import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'ali' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'ali123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
