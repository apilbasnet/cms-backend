import { CanActivate, Injectable, UnauthorizedException } from '@nestjs/common';
import { RoleType } from '@prisma/client';
import { AsyncLocalStorage } from 'node:async_hooks';
import { ContextData } from '../store.module';

@Injectable()
export class StaffGuard implements CanActivate {
  public constructor(private readonly store: AsyncLocalStorage<ContextData>) {}

  async canActivate(): Promise<boolean> {
    const data = this.store.getStore();
    const staffRole: RoleType[] = [RoleType.ADMIN, RoleType.TEACHER];

    if (!data?.user?.role) throw new UnauthorizedException();

    if (!staffRole.includes(data.user.role)) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
