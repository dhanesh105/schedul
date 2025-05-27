export interface DaySchedule {
  id: string;
  dayOfWeek: number;
  isAvailable: boolean;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklySchedule {
  id: string;
  doctorId: string;
  effectiveFrom: string;
  effectiveTo: string;
  daySchedules: DaySchedule[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateDayScheduleDto {
  dayOfWeek: number;
  isAvailable: boolean;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
}

export interface CreateWeeklyScheduleDto {
  doctorId: string;
  effectiveFrom: string;
  effectiveTo?: string;
  daySchedules: CreateDayScheduleDto[];
}

export interface UpdateWeeklyScheduleDto {
  effectiveFrom?: string;
  effectiveTo?: string;
  daySchedules?: CreateDayScheduleDto[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}
