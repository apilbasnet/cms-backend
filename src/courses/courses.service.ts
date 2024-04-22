import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/course.dto';
import { PrismaService } from 'nestjs-prisma';
import { CreateSubjectDto, EditSubjectDto } from './dto/subject.dto';

@Injectable()
export class CoursesService {
  public constructor(private prisma: PrismaService) {}

  async getCourses() {
    const courses = await this.prisma.course.findMany();

    return courses.map((course) => ({
      name: course.name,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      id: course.id,
    }));
  }

  async createCourse(body: CreateCourseDto) {
    const { name } = body;

    const course = await this.prisma.course.create({
      data: {
        name,
      },
    });

    return {
      name: course.name,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      id: course.id,
    };
  }

  public async deleteCourse(id: number) {
    const record = await this.prisma.course.findUnique({
      where: {
        id,
      },
    });

    if (!record) {
      throw new HttpException('Course does not exist', HttpStatus.NOT_FOUND);
    }

    await this.prisma.course.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Course deleted successfully',
    };
  }

  public async editCourse(id: number, body: CreateCourseDto) {
    const record = await this.prisma.course.findUnique({
      where: {
        id,
      },
    });

    if (!record)
      throw new HttpException('Course does not exist', HttpStatus.NOT_FOUND);

    const updated = await this.prisma.course.update({
      where: {
        id,
      },
      data: {
        name: body.name,
      },
    });

    return {
      name: updated.name,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      id: updated.id,
    };
  }

  public async createSubject(body: CreateSubjectDto) {
    const subjectExists = await this.prisma.subject.findUnique({
      where: {
        semesterId: body.semesterId,
        courseId: body.courseId,
        code: body.code,
      },
    });

    if (subjectExists) {
      throw new HttpException('Subject already exists', HttpStatus.BAD_REQUEST);
    }

    const subject = await this.prisma.subject.create({
      data: {
        name: body.name,
        semesterId: body.semesterId,
        courseId: body.courseId,
        teacherId: body.teacherId,
        code: body.code,
      },
    });

    return {
      name: subject.name,
      code: subject.code,
      teacherId: subject.teacherId,
      courseId: subject.courseId,
      createdAt: subject.createdAt,
      updatedAt: subject.updatedAt,
      id: subject.id,
    };
  }

  public async getSubject() {
    const subjects = await this.prisma.subject.findMany();

    return subjects;
  }

  public async editSubject(id: number, body: EditSubjectDto) {
    const subjectExists = await this.prisma.subject.findUnique({
      where: {
        id,
      },
    });

    if (!subjectExists) {
      throw new HttpException('Subject does not exist', HttpStatus.BAD_REQUEST);
    }

    const subject = await this.prisma.subject.update({
      where: {
        id,
      },
      data: {
        name: body.name,
        semesterId: body.semesterId,
        courseId: body.courseId,
        teacherId: body.teacherId,
        code: body.code,
      },
    });

    return {
      name: subject.name,
      code: subject.code,
      teacherId: subject.teacherId,
      courseId: subject.courseId,
      createdAt: subject.createdAt,
      updatedAt: subject.updatedAt,
      id: subject.id,
    };
  }

  public async deleteSubject(id: number) {
    const res = await this.prisma.subject.delete({
      where: { id },
    });

    if (!res) {
      throw new HttpException('Subject does not exist', HttpStatus.NOT_FOUND);
    }

    return {
      message: 'Subject deleted successfully',
    };
  }
}
