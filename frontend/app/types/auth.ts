export enum UserRole {
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDoctorDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  gender: string;
  phone: string;
  registrationNumber: string;
}

export interface RegisterPatientDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  gender: string;
  phone: string;
  dateOfBirth: string;
  address?: string;
  medicalHistory?: string;
}
