import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { LeaveStatus } from '../entities/leave.entity';

export class UpdateLeaveStatusDto {
  @IsEnum(LeaveStatus)
  @IsNotEmpty()
  status: LeaveStatus;

  @IsString()
  @IsNotEmpty()
  updatedBy: string;

  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
