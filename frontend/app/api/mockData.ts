import { Doctor } from '../types/doctor';
import { Patient } from '../types/patient';
import { Appointment, AppointmentStatus } from '../types/appointment';
import { WeeklySchedule } from '../types/schedule';
import { Leave, LeaveStatus } from '../types/leave';
import { Gender } from '../types/doctor';

// Mock Doctors
export const mockDoctors: Doctor[] = [
  {
    id: '1',
    userId: 'user-1',
    firstName: 'John',
    lastName: 'Doe',
    gender: Gender.MALE,
    email: 'john.doe@example.com',
    phone: '123-456-7890',
    registrationNumber: 'MED12345',
    specializations: [
      { id: '1', name: 'Cardiology' },
      { id: '2', name: 'Internal Medicine' }
    ],
    capabilities: [
      { id: '1', name: 'ECG' },
      { id: '2', name: 'Stress Test' }
    ],
    biography: 'Dr. John Doe is a cardiologist with over 10 years of experience.',
    qualifications: ['MD', 'PhD'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    userId: 'user-2',
    firstName: 'Jane',
    lastName: 'Smith',
    gender: Gender.FEMALE,
    email: 'jane.smith@example.com',
    phone: '987-654-3210',
    registrationNumber: 'MED67890',
    specializations: [
      { id: '3', name: 'Pediatrics' }
    ],
    capabilities: [
      { id: '3', name: 'Vaccination' }
    ],
    biography: 'Dr. Jane Smith is a pediatrician specializing in child healthcare.',
    qualifications: ['MD'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    userId: 'user-3',
    firstName: 'Michael',
    lastName: 'Johnson',
    gender: Gender.MALE,
    email: 'michael.johnson@example.com',
    phone: '555-123-4567',
    registrationNumber: 'MED54321',
    specializations: [
      { id: '4', name: 'Orthopedics' }
    ],
    capabilities: [
      { id: '4', name: 'Joint Replacement' },
      { id: '5', name: 'Sports Injury' }
    ],
    biography: 'Dr. Michael Johnson is an orthopedic surgeon specializing in sports injuries.',
    qualifications: ['MD', 'MS'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// Mock Patients
export const mockPatients: Patient[] = [
  {
    id: '1',
    userId: 'user-4',
    firstName: 'Alice',
    lastName: 'Johnson',
    gender: Gender.FEMALE,
    email: 'alice.johnson@example.com',
    phone: '111-222-3333',
    dateOfBirth: '1990-05-15',
    address: '123 Main St, Anytown, USA',
    medicalHistory: 'No major issues',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    userId: 'user-5',
    firstName: 'Bob',
    lastName: 'Williams',
    gender: Gender.MALE,
    email: 'bob.williams@example.com',
    phone: '444-555-6666',
    dateOfBirth: '1985-10-20',
    address: '456 Oak St, Somewhere, USA',
    medicalHistory: 'Allergic to penicillin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// Mock Appointments
export const mockAppointments: Appointment[] = [
  {
    id: '1',
    doctorId: '1',
    patientId: '1',
    date: '2023-06-15',
    startTime: '09:00',
    endTime: '09:30',
    status: AppointmentStatus.CONFIRMED,
    reason: 'Annual checkup',
    notes: 'Patient has reported chest pain',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    doctorId: '2',
    patientId: '2',
    date: '2023-06-16',
    startTime: '10:00',
    endTime: '10:30',
    status: AppointmentStatus.SCHEDULED,
    reason: 'Flu symptoms',
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// Mock Schedules
export const mockSchedules: WeeklySchedule[] = [
  {
    id: '1',
    doctorId: '1',
    effectiveFrom: '2023-06-01',
    effectiveTo: '2023-12-31',
    daySchedules: [
      {
        id: '1',
        dayOfWeek: 1, // Monday
        isAvailable: true,
        startTime: '09:00',
        endTime: '17:00',
        slotDurationMinutes: 30,
      },
      {
        id: '2',
        dayOfWeek: 2, // Tuesday
        isAvailable: true,
        startTime: '09:00',
        endTime: '17:00',
        slotDurationMinutes: 30,
      },
      {
        id: '3',
        dayOfWeek: 3, // Wednesday
        isAvailable: true,
        startTime: '09:00',
        endTime: '17:00',
        slotDurationMinutes: 30,
      },
      {
        id: '4',
        dayOfWeek: 4, // Thursday
        isAvailable: true,
        startTime: '09:00',
        endTime: '17:00',
        slotDurationMinutes: 30,
      },
      {
        id: '5',
        dayOfWeek: 5, // Friday
        isAvailable: true,
        startTime: '09:00',
        endTime: '17:00',
        slotDurationMinutes: 30,
      },
      {
        id: '6',
        dayOfWeek: 6, // Saturday
        isAvailable: false,
        startTime: '',
        endTime: '',
        slotDurationMinutes: 0,
      },
      {
        id: '7',
        dayOfWeek: 0, // Sunday
        isAvailable: false,
        startTime: '',
        endTime: '',
        slotDurationMinutes: 0,
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// Mock Leaves
export const mockLeaves: Leave[] = [
  {
    id: '1',
    doctorId: '1',
    startDate: '2023-07-01',
    endDate: '2023-07-07',
    reason: 'Vacation',
    status: LeaveStatus.APPROVED,
    requestedAt: '2023-06-01',
    approvedAt: '2023-06-02',
    approvedBy: 'admin',
    rejectedAt: null,
    rejectedBy: null,
    rejectionReason: null,
  },
  {
    id: '2',
    doctorId: '2',
    startDate: '2023-08-15',
    endDate: '2023-08-20',
    reason: 'Conference',
    status: LeaveStatus.PENDING,
    requestedAt: '2023-06-05',
    approvedAt: null,
    approvedBy: null,
    rejectedAt: null,
    rejectedBy: null,
    rejectionReason: null,
  }
];
