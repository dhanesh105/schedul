import { ApiResponse } from './types';
import {
  DoctorAvailability,
  AvailableSlot,
  CreateAvailabilityDto,
  UpdateAvailabilityDto,
  GetAvailableSlotsDto,
  DayOfWeek,
} from '../types/availability';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

class AvailabilityService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          error: errorData.message || `HTTP error! status: ${response.status}`,
        };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  // Get doctor's availability schedule
  async getDoctorAvailability(doctorId: string): Promise<ApiResponse<DoctorAvailability[]>> {
    // For now, return mock data since we don't have a backend
    const mockAvailability: DoctorAvailability[] = [
      {
        id: '1',
        doctorId,
        dayOfWeek: DayOfWeek.MONDAY,
        startTime: '09:00',
        endTime: '17:00',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        doctorId,
        dayOfWeek: DayOfWeek.TUESDAY,
        startTime: '09:00',
        endTime: '17:00',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        doctorId,
        dayOfWeek: DayOfWeek.WEDNESDAY,
        startTime: '09:00',
        endTime: '17:00',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '4',
        doctorId,
        dayOfWeek: DayOfWeek.THURSDAY,
        startTime: '09:00',
        endTime: '17:00',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '5',
        doctorId,
        dayOfWeek: DayOfWeek.FRIDAY,
        startTime: '09:00',
        endTime: '17:00',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    return { data: mockAvailability };
  }

  // Get available time slots for a specific doctor and date
  async getAvailableSlots(params: GetAvailableSlotsDto): Promise<ApiResponse<AvailableSlot[]>> {
    const { doctorId, date } = params;
    
    // Get the day of week for the selected date
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Convert to our enum (assuming Monday = 1, Sunday = 0)
    const dayMapping = {
      0: DayOfWeek.SUNDAY,
      1: DayOfWeek.MONDAY,
      2: DayOfWeek.TUESDAY,
      3: DayOfWeek.WEDNESDAY,
      4: DayOfWeek.THURSDAY,
      5: DayOfWeek.FRIDAY,
      6: DayOfWeek.SATURDAY,
    };
    
    const targetDay = dayMapping[dayOfWeek as keyof typeof dayMapping];
    
    // Get doctor's availability for this day
    const availabilityResponse = await this.getDoctorAvailability(doctorId);
    if (availabilityResponse.error || !availabilityResponse.data) {
      return { error: 'Failed to get doctor availability' };
    }
    
    const dayAvailability = availabilityResponse.data.find(
      (avail) => avail.dayOfWeek === targetDay && avail.isActive
    );
    
    if (!dayAvailability) {
      return { data: [] }; // No availability for this day
    }
    
    // Generate 30-minute slots between start and end time
    const slots: AvailableSlot[] = [];
    const startHour = parseInt(dayAvailability.startTime.split(':')[0]);
    const startMinute = parseInt(dayAvailability.startTime.split(':')[1]);
    const endHour = parseInt(dayAvailability.endTime.split(':')[0]);
    const endMinute = parseInt(dayAvailability.endTime.split(':')[1]);
    
    let currentHour = startHour;
    let currentMinute = startMinute;
    
    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      const slotStart = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      
      // Add 30 minutes
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentMinute -= 60;
        currentHour += 1;
      }
      
      const slotEnd = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      
      // Skip lunch break (12:00 - 13:00)
      if (!(currentHour === 12 && currentMinute === 0) && !(currentHour === 12 && currentMinute === 30)) {
        slots.push({
          date,
          startTime: slotStart,
          endTime: slotEnd,
          isBooked: Math.random() > 0.7, // Randomly mark some as booked for demo
        });
      }
    }
    
    return { data: slots };
  }

  // Create or update doctor availability
  async createAvailability(data: CreateAvailabilityDto): Promise<ApiResponse<DoctorAvailability>> {
    // Mock implementation - in real app, this would call the API
    const mockAvailability: DoctorAvailability = {
      id: Date.now().toString(),
      ...data,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return { data: mockAvailability };
  }

  // Update doctor availability
  async updateAvailability(
    id: string,
    data: UpdateAvailabilityDto
  ): Promise<ApiResponse<DoctorAvailability>> {
    // Mock implementation
    const mockAvailability: DoctorAvailability = {
      id,
      doctorId: 'mock-doctor-id',
      dayOfWeek: data.dayOfWeek || DayOfWeek.MONDAY,
      startTime: data.startTime || '09:00',
      endTime: data.endTime || '17:00',
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return { data: mockAvailability };
  }

  // Delete doctor availability
  async deleteAvailability(id: string): Promise<ApiResponse<void>> {
    // Mock implementation
    return { data: undefined };
  }
}

export const availabilityService = new AvailabilityService();
