export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

export interface TimeSlot {
  startTime: string; // Format: "HH:mm" (e.g., "09:00")
  endTime: string;   // Format: "HH:mm" (e.g., "17:00")
}

export interface DoctorAvailability {
  id: string;
  doctorId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // Format: "HH:mm"
  endTime: string;   // Format: "HH:mm"
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AvailableSlot {
  date: string;      // Format: "YYYY-MM-DD"
  startTime: string; // Format: "HH:mm"
  endTime: string;   // Format: "HH:mm"
  isBooked: boolean;
}

export interface CreateAvailabilityDto {
  doctorId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

export interface UpdateAvailabilityDto {
  dayOfWeek?: DayOfWeek;
  startTime?: string;
  endTime?: string;
  isActive?: boolean;
}

export interface GetAvailableSlotsDto {
  doctorId: string;
  date: string; // Format: "YYYY-MM-DD"
}
