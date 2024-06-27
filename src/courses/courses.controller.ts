import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { CreateCourseDto } from './dto/course.dto';
import { CoursesService } from './courses.service';
import { AdminGuard } from '../guards/admin.guard';
import { CreateSubjectDto, EditSubjectDto } from './dto/subject.dto';

@Controller('courses')
export class CoursesController {
  public constructor(private readonly service: CoursesService) {}

  @UseGuards(AuthGuard)
  @Get('/')
  async getCourses() {
    return this.service.getCourses();
  }

  @UseGuards(AdminGuard)
  @Post('/')
  async createCourses(@Body() body: CreateCourseDto) {
    return this.service.createCourse(body);
  }

  @UseGuards(AdminGuard)
  @Patch('/:id')
  async editCourse(@Param('id') id: number, @Body() body: CreateCourseDto) {
    return this.service.editCourse(Number(id), body);
  }

  @UseGuards(AdminGuard)
  @Delete('/:id')
  async deleteCourse(@Param('id') id: number) {
    return this.service.deleteCourse(Number(id));
  }

  @UseGuards(AdminGuard)
  @Post('/subjects')
  async createSubject(@Body() body: CreateSubjectDto) {
    return this.service.createSubject(body);
  }

  @UseGuards(AuthGuard)
  @Get('/subjects')
  async getSubject() {
    return this.service.getSubject();
  }

  @UseGuards(AdminGuard)
  @Patch('/subjects/:id')
  async editSubject(@Param('id') id: number, @Body() body: EditSubjectDto) {
    return this.service.editSubject(id, body);
  }

  @UseGuards(AdminGuard)
  @Delete('/subjects/:id')
  async deleteSubject(@Param('id') id: number) {
    return this.service.deleteSubject(id);
  }
}
