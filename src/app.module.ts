import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule, PrismaService } from 'nestjs-prisma';
import { CoursesController } from './courses/courses.controller';
import { CoursesService } from './courses/courses.service';
import { AsyncLocalStorage } from 'node:async_hooks';
import { NextFunction, Request, Response } from 'express';
import { User } from '@prisma/client';
import { AlsModule, ContextData } from './store.module';

@Module({
  imports: [ConfigModule.forRoot(), PrismaModule.forRoot(), AlsModule],
  controllers: [AppController, UsersController, CoursesController],
  providers: [AppService, UsersService, CoursesService],
  exports: [],
})
export class AppModule implements NestModule {
  public constructor(
    private readonly store: AsyncLocalStorage<ContextData>,
    private prisma: PrismaService,
  ) {}

  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(async (req: Request, res: Response, next: NextFunction) => {
        let user: User | null = null;

        try {
          const token = req.headers.authorization;
          if (token) {
            const data = await this.prisma.token.findUnique({
              where: { token },
              include: { user: true },
            });
            if (data) user = data.user;
          }
        } catch {}

        this.store.run(
          {
            user,
          },
          next,
        );
      })
      .forRoutes('*');
  }
}
