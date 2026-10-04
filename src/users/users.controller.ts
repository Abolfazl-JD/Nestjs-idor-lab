import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /users/me -> the authenticated user's own profile (never the password hash).
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Request() req: { user: { userId: number } }) {
    const user = await this.usersService.findById(req.user.userId);
    return {
      id: user!.id,
      username: user!.username,
      createdAt: user!.createdAt,
    };
  }
}
