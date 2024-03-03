import { Module } from '@nestjs/common';
import { User } from '@prisma/client';
import { AsyncLocalStorage } from 'async_hooks';

export interface ContextData {
  user: User | null;
}

@Module({
  providers: [
    {
      provide: AsyncLocalStorage,
      useValue: new AsyncLocalStorage<ContextData>(),
    },
  ],
  exports: [AsyncLocalStorage],
})
export class AlsModule {}
