import { Gender } from './doctor';

export interface Patient {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  email: string;
  phone: string;
  dateOfBirth: string;
  address?: string;
  medicalHistory?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatientDto {
  firstName: string;
  lastName: string;
  gender: Gender;
  email: string;
  phone: string;
  dateOfBirth: string;
  address?: string;
  medicalHistory?: string;
}

export interface UpdatePatientDto {
  firstName?: string;
  lastName?: string;
  gender?: Gender;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  medicalHistory?: string;
}
