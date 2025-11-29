'use client';

import { useEffect, useState } from 'react';
import { doctorService } from '../../api/doctorService';
import { scheduleService } from '../../api/scheduleService';
import { Doctor } from '../../types/doctor';
import { WeeklySchedule } from '../../types/schedule';
import Link from 'next/link';
import { use } from 'react';

export default function DoctorSchedulePage({ params }: { params: { id: string } }) {
  // Use React.use() to unwrap the params object
  const { id } = use(params);

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [schedules, setSchedules] = useState<WeeklySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch doctor and schedule data
        const [doctorResponse, schedulesResponse] = await Promise.all([
          doctorService.getDoctorById(id),
          scheduleService.getSchedules(id),
        ]);

        // Handle doctor response
        if (doctorResponse.error) {
          setError(doctorResponse.error);
          return;
        }

        // Handle schedule response
        if (schedulesResponse.error) {
          setError(schedulesResponse.error);
          return;
        }

        // Set the data
        setDoctor(doctorResponse.data || null);
        setSchedules(schedulesResponse.data || []);
      } catch (err) {
        setError('Failed to fetch data');
        console.error('Error in fetchData:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const getDayName = (dayOfWeek: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Generate time slots for a given day
  const generateTimeSlots = (startTime: string, endTime: string, slotDuration: number) => {
    const slots = [];
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const lunchStart = new Date(`2000-01-01T12:00:00`);
    const lunchEnd = new Date(`2000-01-01T13:00:00`);

    let current = new Date(start);

    while (current < end) {
      const slotEnd = new Date(current.getTime() + slotDuration * 60000);

      // Skip lunch hour
      if (!(current >= lunchStart && current < lunchEnd)) {
        const timeString = current.toTimeString().slice(0, 5);
        const endTimeString = slotEnd.toTimeString().slice(0, 5);

        slots.push({
          startTime: timeString,
          endTime: endTimeString,
          formatted: `${formatTime(timeString)} - ${formatTime(endTimeString)}`
        });
      }

      current = slotEnd;
    }

    return slots;
  };

  if (loading) {
    return <div className="text-center py-8">Loading schedule...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded my-4">
        <p>{error}</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded my-4">
        <p>Doctor not found</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="mb-6">
        <Link href="/schedules" className="text-blue-600 hover:underline">
          &larr; Back to Schedules
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Dr. {doctor.firstName} {doctor.lastName}&apos;s Schedule
        </h1>
        <a
          href={`/schedules/${doctor.id}/edit`}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Edit Schedule
        </a>
      </div>

      {schedules.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>No schedules found for this doctor. Create a new schedule to get started.</p>
          <div className="mt-4">
            <a
              href={`/schedules/${doctor.id}/new`}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors inline-block"
            >
              Create Schedule
            </a>
          </div>
        </div>
      ) : (
        <div>
          {schedules.map((schedule) => (
            <div key={schedule.id} className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h2 className="text-xl font-semibold">
                  Schedule: {formatDate(schedule.effectiveFrom)} -{' '}
                  {schedule.effectiveTo ? formatDate(schedule.effectiveTo) : 'Ongoing'}
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 gap-6">
                  {schedule.daySchedules.map((daySchedule) => (
                    <div
                      key={daySchedule.id}
                      className={`border rounded-lg ${
                        daySchedule.isAvailable ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="p-4 border-b bg-white rounded-t-lg">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold">{getDayName(daySchedule.dayOfWeek)}</h3>
                          <div>
                            {daySchedule.isAvailable ? (
                              <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                                Available
                              </span>
                            ) : (
                              <span className="inline-block bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full">
                                Not Available
                              </span>
                            )}
                          </div>
                        </div>
                        {daySchedule.isAvailable && (
                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">Working Hours:</span> {formatTime(daySchedule.startTime)} - {formatTime(daySchedule.endTime)}
                            <span className="ml-4 font-medium">Slot Duration:</span> {daySchedule.slotDurationMinutes} minutes
                          </div>
                        )}
                      </div>

                      {daySchedule.isAvailable && (
                        <div className="p-4">
                          <h4 className="font-medium text-gray-700 mb-3">Available Time Slots:</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                            {generateTimeSlots(
                              daySchedule.startTime,
                              daySchedule.endTime,
                              daySchedule.slotDurationMinutes
                            ).map((slot, index) => (
                              <div
                                key={index}
                                className="bg-white border border-green-300 rounded-md p-2 text-center text-sm hover:bg-green-100 transition-colors cursor-pointer"
                              >
                                {slot.formatted}
                              </div>
                            ))}
                          </div>
                          {generateTimeSlots(
                            daySchedule.startTime,
                            daySchedule.endTime,
                            daySchedule.slotDurationMinutes
                          ).length === 0 && (
                            <p className="text-gray-500 text-sm italic">No available slots</p>
                          )}
                          <div className="mt-3 text-xs text-gray-500">
                            <span className="font-medium">Note:</span> Lunch break (12:00 PM - 1:00 PM) is excluded from available slots
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
