import { IsNotEmpty, IsString, IsDateString, IsOptional, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateDayScheduleDto } from './create-day-schedule.dto';

export class CreateWeeklyScheduleDto {
  @IsString()
  @IsNotEmpty()
  doctorId: string;

  @IsDateString()
  @IsNotEmpty()
  effectiveFrom: string;

  @IsDateString()
  @IsOptional()
  effectiveTo?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => CreateDayScheduleDto)
  daySchedules: CreateDayScheduleDto[];
}
