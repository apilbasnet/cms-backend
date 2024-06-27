import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { AttendanceDto } from './dto/attendance.dto';

@Injectable()
export class AttendanceService {
  public constructor(private readonly prisma: PrismaService) {}

  public async createAttendance(body: AttendanceDto) {
    const { date, studentId, present } = body;

    const exists = await this.prisma.attendance.findFirst({
      where: {
        date,
        userId: studentId,
      },
    });

    if (exists != null) {
      throw new HttpException(
        'Attendance already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.prisma.attendance.create({
      data: {
        date,
        present,
        userId: studentId,
      },
    });
  }
}
