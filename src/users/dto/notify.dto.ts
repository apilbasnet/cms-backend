import { RoleType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class NotifyDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsNumber()
  sentToId: number;

  @IsString()
  @IsNotEmpty()
  @IsEnum(RoleType)
  role: RoleType;
}
