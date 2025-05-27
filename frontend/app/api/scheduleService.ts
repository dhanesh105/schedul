import { get, post, put } from './client';
import { WeeklySchedule, CreateWeeklyScheduleDto, UpdateWeeklyScheduleDto, TimeSlot } from '../types/schedule';

export const scheduleService = {
  getSchedules: (doctorId: string, startDate?: string, endDate?: string) => {
    let endpoint = `/api/doctors/${doctorId}/schedule`;
    if (startDate && endDate) {
      endpoint += `?startDate=${startDate}&endDate=${endDate}`;
    }
    return get<WeeklySchedule[]>(endpoint);
  },
  
  createSchedule: (doctorId: string, schedule: CreateWeeklyScheduleDto) => 
    post<WeeklySchedule>(`/api/doctors/${doctorId}/schedule`, schedule),
  
  updateSchedule: (doctorId: string, scheduleId: string, schedule: UpdateWeeklyScheduleDto) => 
    put<WeeklySchedule>(`/api/doctors/${doctorId}/schedule/${scheduleId}`, schedule),
  
  getAvailableSlots: (doctorId: string, date: string) => 
    get<TimeSlot[]>(`/api/doctors/${doctorId}/schedule/available-slots?date=${date}`),
};
