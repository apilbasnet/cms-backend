import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { TeacherGuard } from '../guards/teacher.guard';
import { AttendanceService } from './attendance.service';
import { AttendanceDto } from './dto/attendance.dto';

@Controller('attendance')
export class AttendanceController {
  public constructor(private readonly service: AttendanceService) {}

  @UseGuards(TeacherGuard)
  @Post()
  async create(@Body() body: AttendanceDto) {
    return this.service.createAttendance(body);
  }
}
