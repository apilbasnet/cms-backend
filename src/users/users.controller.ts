import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UsersService } from './users.service';
import { AuthGuard } from '../guards/auth.guard';
import { ContextData } from '../store.module';
import { AsyncLocalStorage } from 'async_hooks';
import { AdminGuard } from '../guards/admin.guard';
import {
  CreateStudentProfileDto,
  CreateTeacherProfileDto,
  EditTeacherProfileDto,
} from './dto/profile.dto';
import { StaffGuard } from 'src/guards/staff.guard';
import { NotifyDto } from './dto/notify.dto';

@Controller('users')
export class UsersController {
  public constructor(
    private readonly usersService: UsersService,
    private readonly store: AsyncLocalStorage<ContextData>,
  ) {}

  @UseGuards(AdminGuard)
  @Post('/teacher')
  createTeacher(@Body() body: CreateTeacherProfileDto) {
    return this.usersService.createTeacher(body);
  }

  @UseGuards(AuthGuard)
  @Get('/student')
  getStudents(@Query('my') onlyMe: string = 'false') {
    const me = this.store.getStore()?.user;

    if (!me) throw new NotFoundException();

    return this.usersService.getStudents(me, onlyMe === 'true');
  }

  @UseGuards(AuthGuard)
  @Get('/teacher')
  getTeachers() {
    return this.usersService.getTeachers();
  }

  @UseGuards(AdminGuard)
  @Post('/student')
  createStudent(@Body() body: CreateStudentProfileDto) {
    return this.usersService.createStudent(body);
  }

  @UseGuards(AdminGuard)
  @Patch('/teacher/:id')
  editTeacher(@Param('id') id: number, @Body() body: EditTeacherProfileDto) {
    return this.usersService.editTeacher(Number(id), body);
  }

  @UseGuards(AdminGuard)
  @Patch('/student/:id')
  editStudent(@Param('id') id: number, @Body() body: CreateStudentProfileDto) {
    return this.usersService.editStudent(Number(id), body);
  }

  @UseGuards(AdminGuard)
  @Delete('/teacher/:id')
  deleteTeacher(@Param('id') id: number) {
    return this.usersService.deleteTeacher(id);
  }

  @UseGuards(AdminGuard)
  @Delete('/student/:id')
  deleteStudent(@Param('id') id: number) {
    return this.usersService.deleteStudent(id);
  }

  @Post('/login')
  async login(@Body() body: LoginDto) {
    return this.usersService.login(body);
  }

  @UseGuards(AuthGuard)
  @Get('/notifications')
  async getNotifications() {
    const me = this.store.getStore()?.user;

    if (!me) throw new NotFoundException();

    return this.usersService.getNotifications(me);
  }

  @UseGuards(StaffGuard)
  @Post('/notify')
  async notify(@Body() body: NotifyDto) {
    const me = this.store.getStore()?.user;

    if (!me) throw new NotFoundException();

    return this.usersService.notify(body, me);
  }

  @UseGuards(AuthGuard)
  @Get('/me')
  async me() {
    const user = this.store.getStore()!.user!;

    return {
      name: user.name,
      email: user.email,
      role: user.role,
      address: user.address,
      contact: user.contact,
      id: user.id,
    };
  }
}
