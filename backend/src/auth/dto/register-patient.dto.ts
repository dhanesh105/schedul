import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsDateString } from 'class-validator';

export class RegisterPatientDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  medicalHistory?: string;
}
