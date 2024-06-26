import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { AttendanceDto } from './dto/attendance.dto';

@Injectable()
export class AttendanceService {
  public constructor(private readonly prisma: PrismaService) {}

  public async createAttendance(body: AttendanceDto) {
    const { date, studentId, subjectId, present } = body;

    const exists = this.prisma.attendance.findFirst({
      where: {
        date,
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
        subjectId,
        userId: studentId,
      },
    });
  }

  public async getAttendance(subjectId: number, date: string) {
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);

    const currentMonthEnd = new Date();
    currentMonthEnd.setDate(31);
    currentMonthEnd.setHours(23, 59, 59, 999);

    return this.prisma.attendance.findMany({
      where: {
        subjectId: Number(subjectId),
        OR: [
          date
            ? { date }
            : {
                createdAt: {
                  gte: currentMonthStart,
                  lte: currentMonthEnd,
                },
              },
        ],
      },
    });
  }
}
