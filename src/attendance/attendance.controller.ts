import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TeacherGuard } from '../guards/teacher.guard';
import { AttendanceService } from './attendance.service';
import { AttendanceDto } from './dto/attendance.dto';

@Controller('attendance')
export class AttendanceController {
  public constructor(private readonly service: AttendanceService) {}

  @UseGuards(TeacherGuard)
  @Get('/:subjectId')
  async getAttendance(
    @Param('subjectId') subjectId: number,
    @Query('date') date: string,
  ) {
    return this.service.getAttendance(Number(subjectId), date);
  }

  @UseGuards(TeacherGuard)
  @Post()
  async create(@Body() body: AttendanceDto) {
    return this.service.createAttendance(body);
  }
}
