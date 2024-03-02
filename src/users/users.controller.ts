import {
  Body,
  Controller,
  Get,
  Header,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto.js';
import { UsersService } from './users.service.js';
import { AuthGuard } from './auth.guard.js';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  public constructor(private readonly usersService: UsersService) {}

  @Post('/create')
  create(): string {
    return 'This action adds a new user';
  }

  @Post('/login')
  async login(@Body() body: LoginDto) {
    return this.usersService.login(body);
  }
  @UseGuards(AuthGuard)
  @Get('/me')
  async me(@Req() req: Request) {
    const user = (req as any)['user'];

    return {
      name: user.name,
      email: user.email,
      role: user.role,
      address: user.address,
      contact: user.contact,
      id: user.id,
    };
  }
}
