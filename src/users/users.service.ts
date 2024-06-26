import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { hash, verify } from '@node-rs/argon2';
import { generateToken } from '../utils/generate-token';
import { PrismaService } from 'nestjs-prisma';
import {
  CreateStudentProfileDto,
  CreateTeacherProfileDto,
  EditTeacherProfileDto,
} from './dto/profile.dto';
import { RoleType } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createTeacher(body: CreateTeacherProfileDto) {
    const { email, name, password, address, contact, courseId } = body;

    const existingUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new HttpException(
        'User with that email already exists',
        HttpStatus.CONFLICT,
      );
    }

    const hashedPassword = await hash(password);

    const teacher = await this.prisma.user.create({
      data: {
        name,
        email,
        contact,
        address,
        password: hashedPassword,
        courseId,
        role: RoleType.TEACHER,
      },
    });

    return {
      message: 'Teacher created successfully',
      data: {
        name: teacher.name,
        email: teacher.email,
        role: teacher.role,
        address: teacher.address,
        contact: teacher.contact,
        id: teacher.id,
      },
    };
  }

  async createStudent(body: CreateStudentProfileDto) {
    const {
      email,
      name,
      password,
      address,
      contact,
      courseId,
      activeSemester,
    } = body;

    const existingUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new HttpException(
        'User with that email already exists',
        HttpStatus.CONFLICT,
      );
    }

    const hashedPassword = await hash(password);

    const student = await this.prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        address,
        contact,
        role: RoleType.STUDENT,
        courseId,
        semesterId: activeSemester,
      },
    });

    return {
      message: 'Student created successfully',
      data: {
        name: student.name,
        email: student.email,
        role: student.role,
        address: student.address,
        contact: student.contact,
        id: student.id,
      },
    };
  }

  async editTeacher(id: number, body: EditTeacherProfileDto) {
    const iTeacher = await this.prisma.user.findUnique({
      where: {
        id,
        role: RoleType.TEACHER,
      },
    });

    if (!iTeacher) {
      throw new HttpException('Teacher does not exist', HttpStatus.NOT_FOUND);
    }

    const { email, name, address, contact, courseId, subjects } = body;

    const teacher = await this.prisma.user.update({
      where: {
        id,
        role: RoleType.TEACHER,
      },
      data: {
        email,
        name,
        address,
        contact,
        courseId,
      },
    });

    await this.prisma.subject.updateMany({
      where: {
        id: {
          in: subjects,
        },
      },
      data: {
        teacherId: teacher.id,
        courseId,
      },
    });

    return {
      message: 'Teacher updated successfully',
      data: {
        name,
        email,
        role: teacher.role,
        address,
        contact,
        id,
      },
    };
  }

  async editStudent(id: number, body: CreateStudentProfileDto) {
    const iStudent = await this.prisma.user.findUnique({
      where: {
        id: Number(id),
        role: RoleType.STUDENT,
      },
    });

    if (!iStudent) {
      throw new HttpException('Student does not exist', HttpStatus.NOT_FOUND);
    }

    const { email, name, address, contact, courseId, activeSemester } = body;

    const student = await this.prisma.user.update({
      where: {
        id,
        role: RoleType.STUDENT,
      },
      data: {
        email,
        name,
        address,
        contact,
        courseId,
        semesterId: activeSemester,
      },
    });

    return {
      message: 'Student updated successfully',
      data: {
        name,
        email,
        role: student.role,
        address,
        contact,
        id,
      },
    };
  }

  async getStudents() {
    const students = await this.prisma.user.findMany({
      where: {
        role: RoleType.STUDENT,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        address: true,
        contact: true,
        activeSemester: {
          select: { name: true, id: true },
        },
        course: { select: { name: true, id: true } },
      },
    });

    return students;
  }

  async getTeachers() {
    const teachers = await this.prisma.user.findMany({
      where: {
        role: RoleType.TEACHER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        address: true,
        Subject: true,
        contact: true,
        course: { select: { name: true, id: true } },
      },
    });

    return teachers;
  }

  async deleteTeacher(id: number) {
    const res = await this.prisma.user.delete({
      where: {
        id: Number(id),
        role: RoleType.TEACHER,
      },
    });

    if (!res) {
      throw new HttpException('Teacher does not exist', HttpStatus.NOT_FOUND);
    }

    return {
      message: 'Teacher deleted successfully',
    };
  }

  async deleteStudent(id: number) {
    await this.prisma.token.deleteMany({
      where: {
        userId: Number(id),
      },
    });
    const res = await this.prisma.user.delete({
      where: {
        id: Number(id),
        role: RoleType.STUDENT,
      },
    });

    if (!res) {
      throw new HttpException('Student does not exist', HttpStatus.NOT_FOUND);
    }

    return {
      message: 'Student deleted successfully',
    };
  }

  async login(body: LoginDto) {
    const existingUser = await this.prisma.user.findUnique({
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

    await this.prisma.token.upsert({
      create: {
        userId: existingUser.id,
        token,
      },
      update: {
        token,
      },
      where: {
        userId: existingUser.id,
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

  public async getOverallAttendance(studentId: number, semesterId: number) {
    const attendance = await this.prisma.attendance.groupBy({
      by: ['subjectId'],
      where: {
        userId: studentId,
        subject: {
          semesterId,
        },
        present: true,
      },
      _count: {
        present: true,
      },
    });

    return attendance;
  }
}
