import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { hash, verify } from '@node-rs/argon2';
import { generateToken } from '../utils/generate-token';
import { PrismaService } from 'nestjs-prisma';
import {
  CreateStudentProfileDto,
  CreateTeacherProfileDto,
  EditTeacherProfileDto,
} from './dto/profile.dto';
import { RoleType, User } from '@prisma/client';
import { NotifyDto } from './dto/notify.dto';

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

    const { email, name, address, contact, courseId, subjects, password } =
      body;

    const newPassword = await hash(password);

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
        password: newPassword,
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

    const {
      email,
      name,
      address,
      contact,
      courseId,
      activeSemester,
      password,
    } = body;

    const newPassword = await hash(password);

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
        password: newPassword,
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

  async getMyStudents(user: User) {
    const mySubjects = await this.prisma.subject.findMany({
      where: {
        teacherId: user.id,
      },
    });

    const students = await this.prisma.user.findMany({
      where: {
        role: RoleType.STUDENT,
        semesterId: {
          in: mySubjects.map((m) => m.semesterId),
        },
        courseId: {
          in: mySubjects.map((m) => m.courseId),
        },
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

    const std = await this.prisma.$transaction(
      students
        .filter((s) => s.activeSemester != null && s.course != null)
        .map((m) => {
          return this.prisma.subject.findMany({
            where: {
              teacherId: user.id,
              semesterId: m.activeSemester!.id,
              courseId: m.course!.id,
            },
          });
        }),
    );

    return students.map((s) => ({
      ...s,
      subjects: std,
    }));
  }

  async getStudents(user: User, me: boolean) {
    if (me) return this.getMyStudents(user);
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

  async notifyAll(dto: NotifyDto) {
    const users = await this.prisma.user.findMany({
      where: {
        role: dto.role,
      },
    });

    await this.prisma.notification.createMany({
      data: users.map((u) => ({
        title: dto.title,
        message: dto.message,
        sentToId: u.id,
        sentById: dto.sentToId,
      })),
    });

    return {
      message: 'Notification sent successfully',
    };
  }

  async notify(dto: NotifyDto, me: User) {
    const isGlobal = dto.sentToId < 0;

    if (isGlobal) return this.notifyAll(dto);

    const user = await this.prisma.user.findUnique({
      where: {
        id: dto.sentToId,
      },
    });

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    await this.prisma.notification.create({
      data: {
        title: dto.title,
        message: dto.message,
        sentToId: dto.sentToId,
        sentById: me.id,
      },
    });

    return {
      message: 'Notification sent successfully',
    };
  }

  async getNotifications(user: User) {
    const notifications = await this.prisma.notification.findMany({
      where: {
        sentToId: user.id,
      },
    });

    return notifications;
  }
}
