import { IsDateString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateDayScheduleDto } from './create-day-schedule.dto';

export class UpdateWeeklyScheduleDto {
  @IsDateString()
  @IsOptional()
  effectiveFrom?: string;

  @IsDateString()
  @IsOptional()
  effectiveTo?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => CreateDayScheduleDto)
  daySchedules?: CreateDayScheduleDto[];
}
