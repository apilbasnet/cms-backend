import {
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsString,
  Matches,
} from 'class-validator';

export class AttendanceDto {
  @IsNumber()
  @IsNotEmpty()
  public studentId: number;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsNotEmpty()
  public date: string;

  @IsBoolean()
  @IsNotEmpty()
  public present: boolean;
}
