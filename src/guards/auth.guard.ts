import { CanActivate, Injectable, UnauthorizedException } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import { ContextData } from 'src/store.module';

@Injectable()
export class AuthGuard implements CanActivate {
  public constructor(private readonly store: AsyncLocalStorage<ContextData>) {}

  async canActivate(): Promise<boolean> {
    const data = this.store.getStore();
    if (!data?.user) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
