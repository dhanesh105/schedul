'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../api/authService';
import { User, LoginDto, RegisterDoctorDto, RegisterPatientDto } from '../types/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginDto) => Promise<void>;
  registerDoctor: (data: RegisterDoctorDto) => Promise<void>;
  registerPatient: (data: RegisterPatientDto) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const token = authService.getToken();
    const savedUser = authService.getUser();

    if (token && savedUser) {
      setUser(savedUser);
    }

    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginDto) => {
    setIsLoading(true);
    setError(null);

    try {
      // For demo purposes, let's add a mock login
      // This will allow users to log in without a backend
      if (credentials.email === 'demo@example.com' && credentials.password === 'password') {
        const mockUser = {
          id: '1',
          email: 'demo@example.com',
          role: 'DOCTOR',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const mockToken = 'mock-token-' + Date.now();

        authService.saveToken(mockToken);
        authService.saveUser(mockUser);
        setUser(mockUser);
        router.push('/dashboard');
        return;
      }

      // Try the actual API login
      const response = await authService.login(credentials);

      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data) {
        const { user, token } = response.data;
        authService.saveToken(token);
        authService.saveUser(user);
        setUser(user);
        router.push('/dashboard');
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      setError('Failed to login. Please check your credentials.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const registerDoctor = async (data: RegisterDoctorDto) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.registerDoctor(data);

      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data) {
        const { user, token } = response.data;
        authService.saveToken(token);
        authService.saveUser(user);
        setUser(user);
        router.push('/dashboard');
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      setError('Failed to register. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const registerPatient = async (data: RegisterPatientDto) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.registerPatient(data);

      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data) {
        const { user, token } = response.data;
        authService.saveToken(token);
        authService.saveUser(user);
        setUser(user);
        router.push('/dashboard');
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      setError('Failed to register. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    router.push('/login');
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    registerDoctor,
    registerPatient,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
