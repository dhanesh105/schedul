import { IsEmail, IsString, IsEnum, IsOptional, IsArray } from 'class-validator';
import { Gender, DoctorStatus } from '../entities/doctor.entity';

export class UpdateDoctorDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  registrationNumber?: string;

  @IsArray()
  @IsOptional()
  qualifications?: string[];

  @IsString()
  @IsOptional()
  biography?: string;

  @IsString()
  @IsOptional()
  profileImageUrl?: string;

  @IsEnum(DoctorStatus)
  @IsOptional()
  status?: DoctorStatus;
}
