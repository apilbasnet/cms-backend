import { Injectable } from '@nestjs/common';
import { RoleType } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class AppService {
  public constructor(private readonly prisma: PrismaService) {}

  getHello() {
    return { message: 'Hello World!' };
  }

  async getStatistics() {
    const courses = await this.prisma.course.count();
    const subjects = await this.prisma.subject.count();
    const teachers = await this.prisma.user.count({
      where: { role: RoleType.TEACHER },
    });
    const students = await this.prisma.user.count({
      where: { role: RoleType.STUDENT },
    });
    const admins = await this.prisma.user.count({
      where: { role: RoleType.ADMIN },
    });

    return {
      courses,
      subjects,
      teachers,
      students,
      admins,
    };
  }
}
