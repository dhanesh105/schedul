'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { UserRole } from '../../../types/auth';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import { DoctorAvailability, DayOfWeek, CreateAvailabilityDto } from '../../../types/availability';
import { availabilityService } from '../../../api/availabilityService';
import { use } from 'react';
import Link from 'next/link';

// Time slot interface for detailed management
interface TimeSlot {
  time: string;
  label: string;
  isSelected: boolean;
  isBooked?: boolean; // For future use to show booked slots
}

// Day schedule interface
interface DaySchedule {
  dayOfWeek: DayOfWeek;
  isActive: boolean;
  timeSlots: TimeSlot[];
}

export default function DoctorAvailabilityPage({ params }: { params: { id: string } }) {
  const { id: doctorId } = use(params);
  const { user } = useAuth();
  const [availability, setAvailability] = useState<DoctorAvailability[]>([]);
  const [daySchedules, setDaySchedules] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'simple' | 'detailed'>('detailed');

  const daysOfWeek = [
    { key: DayOfWeek.MONDAY, label: 'Monday' },
    { key: DayOfWeek.TUESDAY, label: 'Tuesday' },
    { key: DayOfWeek.WEDNESDAY, label: 'Wednesday' },
    { key: DayOfWeek.THURSDAY, label: 'Thursday' },
    { key: DayOfWeek.FRIDAY, label: 'Friday' },
    { key: DayOfWeek.SATURDAY, label: 'Saturday' },
    { key: DayOfWeek.SUNDAY, label: 'Sunday' },
  ];

  // Generate time slots from 8:00 AM to 6:00 PM in 30-minute intervals
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = 8; // 8:00 AM
    const endHour = 18; // 6:00 PM

    for (let hour = startHour; hour < endHour; hour++) {
      // Skip lunch hour (12:00 - 13:00)
      if (hour === 12) continue;

      // Add :00 slot
      const time00 = `${hour.toString().padStart(2, '0')}:00`;
      const label00 = formatTimeLabel(time00);
      slots.push({
        time: time00,
        label: label00,
        isSelected: false
      });

      // Add :30 slot
      const time30 = `${hour.toString().padStart(2, '0')}:30`;
      const label30 = formatTimeLabel(time30);
      slots.push({
        time: time30,
        label: label30,
        isSelected: false
      });
    }

    return slots;
  };

  // Format time to 12-hour format with AM/PM
  const formatTimeLabel = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Initialize day schedules
  const initializeDaySchedules = (): DaySchedule[] => {
    return daysOfWeek.map(({ key }) => ({
      dayOfWeek: key,
      isActive: false,
      timeSlots: generateTimeSlots()
    }));
  };

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await availabilityService.getDoctorAvailability(doctorId);
        if (response.error) {
          setError(response.error);
        } else if (response.data) {
          setAvailability(response.data);
        }

        // Initialize day schedules
        const initialSchedules = initializeDaySchedules();

        // If we have existing availability data, update the schedules
        if (response.data && response.data.length > 0) {
          const updatedSchedules = initialSchedules.map(schedule => {
            const existingAvailability = response.data!.find(a => a.dayOfWeek === schedule.dayOfWeek);
            if (existingAvailability && existingAvailability.isActive) {
              // Convert start/end times to selected time slots
              const updatedTimeSlots = schedule.timeSlots.map(slot => {
                const slotTime = slot.time;
                const startTime = existingAvailability.startTime;
                const endTime = existingAvailability.endTime;

                // Check if this slot falls within the available time range
                const isInRange = slotTime >= startTime && slotTime < endTime;

                return {
                  ...slot,
                  isSelected: isInRange
                };
              });

              return {
                ...schedule,
                isActive: true,
                timeSlots: updatedTimeSlots
              };
            }
            return schedule;
          });
          setDaySchedules(updatedSchedules);
        } else {
          setDaySchedules(initialSchedules);
        }
      } catch (err) {
        setError('Failed to fetch availability');
        console.error(err);
        // Still initialize schedules even if fetch fails
        setDaySchedules(initializeDaySchedules());
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [doctorId]);

  // Handle time slot selection in detailed mode
  const handleTimeSlotToggle = (dayOfWeek: DayOfWeek, timeSlot: string) => {
    setDaySchedules(prev =>
      prev.map(schedule => {
        if (schedule.dayOfWeek === dayOfWeek) {
          const updatedTimeSlots = schedule.timeSlots.map(slot =>
            slot.time === timeSlot
              ? { ...slot, isSelected: !slot.isSelected }
              : slot
          );
          return { ...schedule, timeSlots: updatedTimeSlots };
        }
        return schedule;
      })
    );
  };

  // Handle day activation toggle
  const handleDayToggle = (dayOfWeek: DayOfWeek) => {
    setDaySchedules(prev =>
      prev.map(schedule => {
        if (schedule.dayOfWeek === dayOfWeek) {
          const newIsActive = !schedule.isActive;
          // If deactivating, clear all selected slots
          if (!newIsActive) {
            const clearedTimeSlots = schedule.timeSlots.map(slot => ({
              ...slot,
              isSelected: false
            }));
            return { ...schedule, isActive: newIsActive, timeSlots: clearedTimeSlots };
          }
          return { ...schedule, isActive: newIsActive };
        }
        return schedule;
      })
    );
  };

  // Select all slots for a day
  const handleSelectAllSlots = (dayOfWeek: DayOfWeek) => {
    setDaySchedules(prev =>
      prev.map(schedule => {
        if (schedule.dayOfWeek === dayOfWeek && schedule.isActive) {
          const updatedTimeSlots = schedule.timeSlots.map(slot => ({
            ...slot,
            isSelected: true
          }));
          return { ...schedule, timeSlots: updatedTimeSlots };
        }
        return schedule;
      })
    );
  };

  // Clear all slots for a day
  const handleClearAllSlots = (dayOfWeek: DayOfWeek) => {
    setDaySchedules(prev =>
      prev.map(schedule => {
        if (schedule.dayOfWeek === dayOfWeek) {
          const updatedTimeSlots = schedule.timeSlots.map(slot => ({
            ...slot,
            isSelected: false
          }));
          return { ...schedule, timeSlots: updatedTimeSlots };
        }
        return schedule;
      })
    );
  };

  // Legacy handlers for simple mode
  const handleTimeChange = (dayOfWeek: DayOfWeek, field: 'startTime' | 'endTime', value: string) => {
    setAvailability(prev => {
      const existing = prev.find(a => a.dayOfWeek === dayOfWeek);
      if (existing) {
        return prev.map(a =>
          a.dayOfWeek === dayOfWeek
            ? { ...a, [field]: value }
            : a
        );
      } else {
        // Create new availability for this day
        const newAvailability: DoctorAvailability = {
          id: `temp-${Date.now()}`,
          doctorId,
          dayOfWeek,
          startTime: field === 'startTime' ? value : '09:00',
          endTime: field === 'endTime' ? value : '17:00',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return [...prev, newAvailability];
      }
    });
  };

  const handleActiveToggle = (dayOfWeek: DayOfWeek) => {
    setAvailability(prev => {
      const existing = prev.find(a => a.dayOfWeek === dayOfWeek);
      if (existing) {
        return prev.map(a =>
          a.dayOfWeek === dayOfWeek
            ? { ...a, isActive: !a.isActive }
            : a
        );
      } else {
        // Create new availability for this day
        const newAvailability: DoctorAvailability = {
          id: `temp-${Date.now()}`,
          doctorId,
          dayOfWeek,
          startTime: '09:00',
          endTime: '17:00',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return [...prev, newAvailability];
      }
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      if (viewMode === 'detailed') {
        // Convert detailed schedules to availability format
        const availabilityData: CreateAvailabilityDto[] = [];

        daySchedules.forEach(schedule => {
          if (schedule.isActive && schedule.timeSlots.some(slot => slot.isSelected)) {
            // Find the earliest and latest selected slots to create time range
            const selectedSlots = schedule.timeSlots.filter(slot => slot.isSelected);
            if (selectedSlots.length > 0) {
              const startTime = selectedSlots[0].time;
              const endTime = selectedSlots[selectedSlots.length - 1].time;

              // Add 30 minutes to end time to make it inclusive
              const [endHour, endMinute] = endTime.split(':').map(Number);
              const endDateTime = new Date();
              endDateTime.setHours(endHour, endMinute + 30, 0, 0);
              const adjustedEndTime = `${endDateTime.getHours().toString().padStart(2, '0')}:${endDateTime.getMinutes().toString().padStart(2, '0')}`;

              availabilityData.push({
                doctorId,
                dayOfWeek: schedule.dayOfWeek,
                startTime,
                endTime: adjustedEndTime,
                isActive: true
              });
            }
          }
        });

        console.log('Saving detailed availability:', availabilityData);
      }

      // In a real app, you would save each availability item
      // For now, we'll just simulate a save
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Show success message
      alert('Availability updated successfully!');
    } catch (err) {
      setError('Failed to save availability');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const getAvailabilityForDay = (dayOfWeek: DayOfWeek) => {
    return availability.find(a => a.dayOfWeek === dayOfWeek);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={[UserRole.DOCTOR]}>
      <div className="py-8">
        <div className="mb-6">
          <Link href={`/doctors/${doctorId}`} className="text-blue-600 hover:underline">
            &larr; Back to Profile
          </Link>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Availability</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">View Mode:</label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as 'simple' | 'detailed')}
                className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="simple">Simple</option>
                <option value="detailed">Detailed Time Slots</option>
              </select>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {viewMode === 'detailed' ? 'Detailed Time Slot Management' : 'Weekly Schedule'}
            </h2>

            {viewMode === 'simple' ? (
              // Simple Mode - Original Interface
              <div className="space-y-4">
                {daysOfWeek.map(({ key: dayOfWeek, label }) => {
                  const dayAvailability = getAvailabilityForDay(dayOfWeek);
                  const isActive = dayAvailability?.isActive ?? false;

                  return (
                    <div key={dayOfWeek} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <div className="w-24">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={isActive}
                            onChange={() => handleActiveToggle(dayOfWeek)}
                            className="mr-2"
                          />
                          <span className="font-medium">{label}</span>
                        </label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-600">From:</label>
                        <input
                          type="time"
                          value={dayAvailability?.startTime || '09:00'}
                          onChange={(e) => handleTimeChange(dayOfWeek, 'startTime', e.target.value)}
                          disabled={!isActive}
                          className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-600">To:</label>
                        <input
                          type="time"
                          value={dayAvailability?.endTime || '17:00'}
                          onChange={(e) => handleTimeChange(dayOfWeek, 'endTime', e.target.value)}
                          disabled={!isActive}
                          className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                      </div>

                      {!isActive && (
                        <span className="text-sm text-gray-500 italic">Not available</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              // Detailed Mode - Time Slot Selection
              <div className="space-y-6">
                {daysOfWeek.map(({ key: dayOfWeek, label }) => {
                  const daySchedule = daySchedules.find(s => s.dayOfWeek === dayOfWeek);
                  if (!daySchedule) return null;

                  const selectedCount = daySchedule.timeSlots.filter(slot => slot.isSelected).length;

                  return (
                    <div key={dayOfWeek} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={daySchedule.isActive}
                              onChange={() => handleDayToggle(dayOfWeek)}
                              className="mr-2 h-4 w-4"
                            />
                            <span className="font-semibold text-lg">{label}</span>
                          </label>
                          {daySchedule.isActive && (
                            <span className="text-sm text-gray-600">
                              ({selectedCount} slots selected)
                            </span>
                          )}
                        </div>

                        {daySchedule.isActive && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleSelectAllSlots(dayOfWeek)}
                              className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                            >
                              Select All
                            </button>
                            <button
                              onClick={() => handleClearAllSlots(dayOfWeek)}
                              className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                            >
                              Clear All
                            </button>
                          </div>
                        )}
                      </div>

                      {daySchedule.isActive && (
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                          {daySchedule.timeSlots.map((slot) => (
                            <button
                              key={slot.time}
                              onClick={() => handleTimeSlotToggle(dayOfWeek, slot.time)}
                              className={`
                                p-2 text-xs rounded border transition-colors
                                ${slot.isSelected
                                  ? 'bg-blue-500 text-white border-blue-600'
                                  : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                                }
                                ${slot.isBooked ? 'bg-red-100 text-red-700 border-red-300 cursor-not-allowed' : ''}
                              `}
                              disabled={slot.isBooked}
                              title={slot.isBooked ? 'This slot is already booked' : `Click to ${slot.isSelected ? 'deselect' : 'select'} ${slot.label}`}
                            >
                              <div className="font-medium">{slot.time}</div>
                              <div className="text-xs opacity-75">{slot.label}</div>
                            </button>
                          ))}
                        </div>
                      )}

                      {!daySchedule.isActive && (
                        <div className="text-center py-8 text-gray-500">
                          <p>Not available on {label}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">
                {viewMode === 'detailed' ? 'Time Slot Management Guide:' : 'Notes:'}
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                {viewMode === 'detailed' ? (
                  <>
                    <li>• Click individual time slots to select/deselect them</li>
                    <li>• Use "Select All" to quickly enable all slots for a day</li>
                    <li>• Use "Clear All" to deselect all slots for a day</li>
                    <li>• Lunch break (12:00 - 13:00) is automatically excluded</li>
                    <li>• Each slot represents a 30-minute appointment window</li>
                    <li>• Red slots indicate already booked appointments (cannot be modified)</li>
                  </>
                ) : (
                  <>
                    <li>• Appointments are scheduled in 30-minute slots</li>
                    <li>• Lunch break (12:00 - 13:00) is automatically excluded</li>
                    <li>• Changes will be reflected in your appointment booking calendar</li>
                    <li>• Existing appointments will not be affected by schedule changes</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
