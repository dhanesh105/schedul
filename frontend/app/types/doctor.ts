export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum DoctorStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export interface Specialization {
  id: string;
  name: string;
  description: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export interface Capability {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  email: string;
  phone: string;
  registrationNumber: string;
  qualifications: string[];
  biography: string;
  profileImageUrl: string;
  status: DoctorStatus;
  specializations?: Specialization[];
  capabilities?: Capability[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateDoctorDto {
  firstName: string;
  lastName: string;
  gender: Gender;
  email: string;
  phone: string;
  registrationNumber: string;
  qualifications?: string[];
  biography?: string;
  profileImageUrl?: string;
  specializationIds?: string[];
  capabilityIds?: string[];
}

export interface UpdateDoctorDto {
  firstName?: string;
  lastName?: string;
  gender?: Gender;
  email?: string;
  phone?: string;
  registrationNumber?: string;
  qualifications?: string[];
  biography?: string;
  profileImageUrl?: string;
  status?: DoctorStatus;
}
