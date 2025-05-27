import { get, post } from './client';
import {
  AuthResponse,
  LoginDto,
  RegisterDoctorDto,
  RegisterPatientDto
} from '../types/auth';

export const authService = {
  login: (credentials: LoginDto) =>
    post<AuthResponse>('/api/auth/login', credentials),

  registerDoctor: (data: RegisterDoctorDto) =>
    post<AuthResponse>('/api/auth/register/doctor', data),

  registerPatient: (data: RegisterPatientDto) =>
    post<AuthResponse>('/api/auth/register/patient', data),

  getCurrentUser: () =>
    get<AuthResponse>('/api/auth/me'),

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  saveToken: (token: string) => {
    localStorage.setItem('token', token);
  },

  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  saveUser: (user: any) => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  getUser: () => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  isAuthenticated: (): boolean => {
    return !!authService.getToken();
  }
};
