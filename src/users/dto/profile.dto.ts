import { IsEmail, IsNumber, IsString } from 'class-validator';

export class CreateTeacherProfileDto {
  @IsEmail()
  public email: string;

  @IsString()
  public name: string;

  @IsString()
  public address: string;

  @IsString()
  public contact: string;

  @IsString()
  public password: string;

  @IsNumber()
  public courseId: number;
}

export class EditTeacherProfileDto {
  @IsEmail()
  public email: string;

  @IsString()
  public name: string;

  @IsString()
  public address: string;

  @IsString()
  public contact: string;

  @IsNumber()
  public courseId: number;

  @IsString()
  public password: string;

  @IsNumber({}, { each: true })
  public subjects: number[];
}

export class CreateStudentProfileDto {
  @IsEmail()
  public email: string;

  @IsString()
  public name: string;

  @IsString()
  public address: string;

  @IsString()
  public contact: string;

  @IsString()
  public password: string;

  @IsNumber()
  public courseId: number;

  @IsNumber()
  public activeSemester: number;
}

export class EditStudentProfileDto {
  @IsEmail()
  public email: string;

  @IsString()
  public name: string;

  @IsString()
  public address: string;

  @IsString()
  public contact: string;

  @IsNumber()
  public courseId: number;

  @IsNumber()
  public activeSemester: number;
}
