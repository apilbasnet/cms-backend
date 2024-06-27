import { Injectable } from '@nestjs/common';
import { RoleType } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class AppService {
  public constructor(private readonly prisma: PrismaService) {}

  getHello() {
    return { message: 'Hello World!' };
  }

  async getStatistics(isStudent: boolean, userId: number) {
    if (!isStudent) return this.getTeacherStatistics();

    const totalSubjects = await this.prisma.subject.count();
    const today = new Date();
    const lastYear = new Date();
    lastYear.setFullYear(today.getFullYear() - 1);

    const attendance = await this.prisma.attendance.findMany({
      where: {
        userId,
      },
    });

    const totalClasses = attendance.length;
    const presentClasses = attendance.filter((a) => a.present).length;
    const absentClasses = totalClasses - presentClasses;

    const attendanceStat: {
      name: string;
      id: number;
      count: number;
    }[] = [];

    for (let i = 0; i < 12; i++) {
      const month = new Date();
      month.setMonth(i);
      month.setHours(0, 0, 0, 0);

      const monthAttendance = attendance.filter(
        (a) => a.createdAt.getMonth() === month.getMonth(),
      );

      attendanceStat.push({
        name: month.toLocaleString('default', { month: 'short' }),
        id: i,
        count: monthAttendance.length,
      });
    }

    return {
      totalClasses,
      presentClasses,
      absentClasses,
      subjects: totalSubjects,
      attendance: attendanceStat,
    };
  }

  async getTeacherStatistics() {
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

    const coursesList = await this.prisma.course.findMany();

    const studentsPerCourse: {
      name: string;
      id: number;
      count: number;
    }[] = [];

    for (const course of coursesList) {
      const students = await this.prisma.user.findMany({
        where: {
          courseId: course.id,
          role: RoleType.STUDENT,
        },
        select: {
          course: { select: { name: true, id: true } },
        },
      });

      students.forEach((student) => {
        const course = studentsPerCourse.find(
          (c) => c.name === student.course?.name,
        );

        if (course) {
          course.count++;
        } else {
          studentsPerCourse.push({
            name: student.course?.name as string,
            id: student.course?.id as number,
            count: 1,
          });
        }
      });
    }

    return {
      courses,
      subjects,
      teachers,
      students,
      admins,
      studentsPerCourse,
    };
  }
}
