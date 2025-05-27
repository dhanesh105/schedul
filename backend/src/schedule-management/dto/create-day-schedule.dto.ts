import { IsNotEmpty, IsNumber, IsBoolean, IsString, Min, Max, IsOptional } from 'class-validator';

export class CreateDayScheduleDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @IsBoolean()
  @IsNotEmpty()
  isAvailable: boolean;

  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  endTime: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(5)
  slotDurationMinutes: number;
}
