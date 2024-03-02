import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto } from './dto/login.dto.js';
import { UsersService } from './users.service.js';

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
}
