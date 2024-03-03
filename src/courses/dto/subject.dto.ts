import { IsNumber, IsString } from 'class-validator';

export class CreateSubjectDto {
  @IsNumber()
  public semesterId: number;

  @IsNumber()
  public courseId: number;

  @IsString()
  public name: string;

  @IsNumber()
  public teacherId: number;

  @IsString()
  public code: string;
}

export class EditSubjectDto {
  @IsNumber()
  public semesterId: number;

  @IsNumber()
  public courseId: number;

  @IsString()
  public name: string;

  @IsNumber()
  public teacherId: number;

  @IsString()
  public code: string;
}
