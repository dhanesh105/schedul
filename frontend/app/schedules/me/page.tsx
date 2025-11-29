'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/auth';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { scheduleService } from '../../api/scheduleService';
import { doctorService } from '../../api/doctorService';
import { WeeklySchedule } from '../../types/schedule';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
];

interface ScheduleSlot {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export default function DoctorSchedulePage() {
  const { user } = useAuth(); // Get the logged-in user
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [weeklySchedules, setWeeklySchedules] = useState<WeeklySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>(DAYS_OF_WEEK[0]);
  const [doctorId, setDoctorId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctorAndSchedule = async () => {
      try {
        setLoading(true);
        setError(null);

        // First, get the doctor's profile to get their ID
        const doctorResponse = await doctorService.getMyProfile();
        if (doctorResponse.error) {
          setError(doctorResponse.error);
          return;
        }

        const doctor = doctorResponse.data;
        if (!doctor) {
          setError('Doctor profile not found');
          return;
        }

        setDoctorId(doctor.id);

        // Fetch the doctor's weekly schedules
        const schedulesResponse = await scheduleService.getSchedules(doctor.id);

        // Don't treat empty schedules as an error - it's normal for new doctors
        const schedules = schedulesResponse.data || [];
        setWeeklySchedules(schedules);

        // Log for debugging
        console.log('Schedules response:', schedulesResponse);
        console.log('Schedules data:', schedules);

        // Convert weekly schedules to time slot format for editing
        const defaultSchedule: ScheduleSlot[] = [];

        DAYS_OF_WEEK.forEach((day) => {
          for (let i = 0; i < TIME_SLOTS.length - 1; i++) {
            defaultSchedule.push({
              day,
              startTime: TIME_SLOTS[i],
              endTime: TIME_SLOTS[i + 1],
              isAvailable: false, // Default to not available
            });
          }
        });

        // If there are existing schedules, mark the available slots
        if (schedules.length > 0) {
          const currentSchedule = schedules[0]; // Use the first/current schedule
          const updatedSchedule = defaultSchedule.map((slot) => {
            // Find matching day schedule
            const daySchedule = currentSchedule.daySchedules?.find(
              (ds) => ds.dayOfWeek === DAYS_OF_WEEK.indexOf(slot.day) + 1 // dayOfWeek is 1-based
            );

            if (daySchedule && daySchedule.isAvailable) {
              // Check if the slot falls within the day's working hours
              if (slot.startTime >= daySchedule.startTime && slot.endTime <= daySchedule.endTime) {
                return { ...slot, isAvailable: true };
              }
            }

            return slot;
          });

          setSchedule(updatedSchedule);
        } else {
          // No existing schedule, use default
          setSchedule(defaultSchedule);
        }
      } catch (err) {
        setError('Failed to fetch schedule');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === UserRole.DOCTOR) {
      fetchDoctorAndSchedule();
    }
  }, [user]);

  const handleSlotToggle = (day: string, startTime: string, endTime: string) => {
    setSchedule((prevSchedule) =>
      prevSchedule.map((slot) =>
        slot.day === day && slot.startTime === startTime && slot.endTime === endTime
          ? { ...slot, isAvailable: !slot.isAvailable }
          : slot
      )
    );
  };

  const handleSaveSchedule = async () => {
    if (!doctorId) {
      setError('Doctor ID not found');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Convert schedule slots back to weekly schedule format
      const daySchedules = DAYS_OF_WEEK.map((day, index) => {
        const daySlots = schedule.filter(slot => slot.day === day && slot.isAvailable);

        if (daySlots.length === 0) {
          return {
            dayOfWeek: index + 1, // 1-based
            isAvailable: false,
            startTime: '09:00',
            endTime: '17:00',
            slotDurationMinutes: 30,
          };
        }

        // Find the earliest start time and latest end time for the day
        const startTime = daySlots.reduce((earliest, slot) =>
          slot.startTime < earliest ? slot.startTime : earliest, daySlots[0].startTime);
        const endTime = daySlots.reduce((latest, slot) =>
          slot.endTime > latest ? slot.endTime : latest, daySlots[0].endTime);

        return {
          dayOfWeek: index + 1, // 1-based
          isAvailable: true,
          startTime,
          endTime,
          slotDurationMinutes: 30,
        };
      });

      const scheduleData = {
        effectiveFrom: new Date().toISOString().split('T')[0], // Today's date
        effectiveTo: null, // Ongoing
        daySchedules,
      };

      // Check if we have an existing schedule to update or need to create new
      if (weeklySchedules.length > 0) {
        const currentSchedule = weeklySchedules[0];
        await scheduleService.updateSchedule(doctorId, currentSchedule.id, scheduleData);
      } else {
        await scheduleService.createSchedule(doctorId, scheduleData);
      }

      setSuccess('Schedule saved successfully');
    } catch (err) {
      setError('Failed to save schedule');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const filteredSchedule = schedule.filter((slot) => slot.day === selectedDay);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || user.role !== UserRole.DOCTOR) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded my-4">
        <p>Access denied. This page is only available to doctors.</p>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={[UserRole.DOCTOR]}>
      <div className="py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Schedule</h1>

          <button
            onClick={handleSaveSchedule}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {saving ? 'Saving...' : 'Save Schedule'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            <p>{success}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Select Day</h2>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2 rounded-md ${
                    selectedDay === day
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  } transition-colors`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Available Time Slots for {selectedDay}</h2>
            <p className="text-gray-600 mb-4">
              Click on a time slot to toggle availability.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {filteredSchedule.map((slot) => (
                <button
                  key={`${slot.day}-${slot.startTime}`}
                  onClick={() => handleSlotToggle(slot.day, slot.startTime, slot.endTime)}
                  className={`p-3 rounded-md text-center ${
                    slot.isAvailable
                      ? 'bg-green-100 text-green-800 border border-green-300 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200'
                  } transition-colors`}
                >
                  {slot.startTime} - {slot.endTime}
                </button>
              ))}
            </div>

            {filteredSchedule.length === 0 && (
              <p className="text-gray-600 text-center py-8">
                No time slots available for {selectedDay}.
              </p>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
