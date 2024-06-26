import { CanActivate, Injectable, UnauthorizedException } from '@nestjs/common';
import { RoleType } from '@prisma/client';
import { AsyncLocalStorage } from 'node:async_hooks';
import { ContextData } from '../store.module';

@Injectable()
export class StudentGuard implements CanActivate {
  public constructor(private readonly store: AsyncLocalStorage<ContextData>) {}

  async canActivate(): Promise<boolean> {
    const data = this.store.getStore();
    if (data?.user?.role !== RoleType.STUDENT) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
