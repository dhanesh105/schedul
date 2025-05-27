import { IsEmail, IsNotEmpty, IsString, IsEnum, IsOptional, IsArray } from 'class-validator';
import { Gender } from '../entities/doctor.entity';

export class CreateDoctorDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  registrationNumber: string;

  @IsArray()
  @IsOptional()
  qualifications?: string[];

  @IsString()
  @IsOptional()
  biography?: string;

  @IsString()
  @IsOptional()
  profileImageUrl?: string;
}
