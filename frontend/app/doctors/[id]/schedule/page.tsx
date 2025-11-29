'use client';

import { useEffect, useState } from 'react';
import { DoctorAvailability, DayOfWeek } from '../../../types/availability';
import { availabilityService } from '../../../api/availabilityService';
import { doctorService } from '../../../api/doctorService';
import { Doctor } from '../../../types/doctor';
import { use } from 'react';
import Link from 'next/link';

export default function DoctorSchedulePage({ params }: { params: { id: string } }) {
  const { id: doctorId } = use(params);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [availability, setAvailability] = useState<DoctorAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const daysOfWeek = [
    { key: DayOfWeek.MONDAY, label: 'Monday' },
    { key: DayOfWeek.TUESDAY, label: 'Tuesday' },
    { key: DayOfWeek.WEDNESDAY, label: 'Wednesday' },
    { key: DayOfWeek.THURSDAY, label: 'Thursday' },
    { key: DayOfWeek.FRIDAY, label: 'Friday' },
    { key: DayOfWeek.SATURDAY, label: 'Saturday' },
    { key: DayOfWeek.SUNDAY, label: 'Sunday' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch doctor details and availability
        const [doctorResponse, availabilityResponse] = await Promise.all([
          doctorService.getDoctorById(doctorId),
          availabilityService.getDoctorAvailability(doctorId),
        ]);
        
        if (doctorResponse.error) {
          setError(doctorResponse.error);
          return;
        }
        
        if (availabilityResponse.error) {
          setError(availabilityResponse.error);
          return;
        }
        
        setDoctor(doctorResponse.data || null);
        setAvailability(availabilityResponse.data || []);
      } catch (err) {
        setError('Failed to fetch doctor schedule');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [doctorId]);

  const getAvailabilityForDay = (dayOfWeek: DayOfWeek) => {
    return availability.find(a => a.dayOfWeek === dayOfWeek && a.isActive);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Generate time slots for a given day
  const generateTimeSlots = (startTime: string, endTime: string) => {
    const slots = [];
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const lunchStart = new Date(`2000-01-01T12:00:00`);
    const lunchEnd = new Date(`2000-01-01T13:00:00`);

    let current = new Date(start);

    while (current < end) {
      const slotEnd = new Date(current.getTime() + 30 * 60000); // 30 minutes later

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
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>Doctor not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="mb-6">
        <Link href={`/doctors/${doctorId}`} className="text-blue-600 hover:underline">
          &larr; Back to Doctor Profile
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dr. {doctor.firstName} {doctor.lastName}</h1>
          <p className="text-gray-600">Weekly Schedule</p>
        </div>
        <Link
          href={`/appointments/book?doctor=${doctorId}`}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Book Appointment
        </Link>
      </div>

      {/* Simple Schedule Display */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Available Hours</h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {daysOfWeek.map(({ key: dayOfWeek, label }) => {
              const dayAvailability = getAvailabilityForDay(dayOfWeek);

              return (
                <div key={dayOfWeek} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">{label}</h3>

                  {dayAvailability ? (
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600">
                        <strong>Hours:</strong> {formatTime(dayAvailability.startTime)} - {formatTime(dayAvailability.endTime)}
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Available Times:</h4>
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                          {generateTimeSlots(dayAvailability.startTime, dayAvailability.endTime).map((slot, index) => (
                            <div
                              key={index}
                              className="px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800 text-center hover:bg-blue-100 cursor-pointer"
                            >
                              {slot.formatted}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <span className="text-red-500 text-sm">Not Available</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> Lunch break is from 12:00 PM - 1:00 PM (no appointments available)
            </p>
          </div>
        </div>
      </div>

      {/* Simple Information */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Appointment Information</h3>
        </div>
        <div className="p-6">
          <div className="text-sm text-gray-600 space-y-2">
            <p>• Each appointment is 30 minutes</p>
            <p>• Please arrive 15 minutes early</p>
            <p>• Bring your insurance card and ID</p>
            <p>• For urgent matters, contact the clinic directly</p>
          </div>
        </div>
      </div>
    </div>
  );
}
