import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AppointmentStatus } from '../entities/appointment.entity';

export class UpdateAppointmentDto {
  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}
