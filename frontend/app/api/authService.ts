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
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Clear cookies for middleware
    document.cookie = 'schedula_auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'schedula_user_role=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  },

  saveToken: (token: string) => {
    // Save to localStorage for client-side access
    localStorage.setItem('token', token);

    // Save to cookies for middleware access
    console.log('🍪 Setting auth token cookie:', token);
    document.cookie = `schedula_auth_token=${token}; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict`;
    console.log('🍪 All cookies after setting token:', document.cookie);
  },

  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  saveUser: (user: any) => {
    // Save to localStorage for client-side access
    localStorage.setItem('user', JSON.stringify(user));

    // Save user role to cookies for middleware access
    if (user && user.role) {
      console.log('🍪 Setting user role cookie:', user.role);
      document.cookie = `schedula_user_role=${user.role}; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict`;
      console.log('🍪 All cookies after setting role:', document.cookie);
    }
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
