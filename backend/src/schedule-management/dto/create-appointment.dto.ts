import { IsNotEmpty, IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  @IsNotEmpty()
  doctorId: string;

  @IsString()
  @IsNotEmpty()
  patientId: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  endTime: string;

  @IsString()
  @IsOptional()
  reason?: string;
}
