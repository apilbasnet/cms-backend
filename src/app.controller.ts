import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AsyncLocalStorage } from 'async_hooks';
import { ContextData } from './store.module';
import { RoleType } from '@prisma/client';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly store: AsyncLocalStorage<ContextData>,
  ) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }
  @Get('/statistics')
  getStatistics() {
    const user = this.store.getStore()?.user;
    const isStudent = user?.role === RoleType.STUDENT;
    return this.appService.getStatistics(isStudent, user?.id as number);
  }
}
