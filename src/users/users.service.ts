import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto.js';
import { prisma } from '../database/index.js';
import { verify } from '@node-rs/argon2';
import { generateToken } from '../utils/generate-token.js';

@Injectable()
export class UsersService {
  async login(body: LoginDto) {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });

    if (!existingUser) {
      throw new HttpException(
        'User with that email does not exist',
        HttpStatus.NOT_FOUND,
      );
    }

    const passwordMatches = await verify(existingUser.password, body.password);

    if (!passwordMatches) {
      throw new HttpException('Invalid password', HttpStatus.UNAUTHORIZED);
    }

    const token = generateToken();

    await prisma.token.create({
      data: {
        userId: existingUser.id,
        token,
      },
    });

    return {
      message: 'Login successful',
      token,
      user: {
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        address: existingUser.address,
        contact: existingUser.contact,
        id: existingUser.id,
      },
    };
  }
}
