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

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Available Hours</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {daysOfWeek.map(({ key: dayOfWeek, label }) => {
              const dayAvailability = getAvailabilityForDay(dayOfWeek);
              
              return (
                <div key={dayOfWeek} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">{label}</h3>
                  {dayAvailability ? (
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Available</span>
                      </div>
                      <div className="mt-1">
                        {formatTime(dayAvailability.startTime)} - {formatTime(dayAvailability.endTime)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        (Lunch: 12:00 PM - 1:00 PM)
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span>Not Available</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Appointment Information:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Appointments are scheduled in 30-minute slots</li>
              <li>• Please arrive 15 minutes before your scheduled time</li>
              <li>• Lunch break is from 12:00 PM to 1:00 PM (no appointments)</li>
              <li>• For urgent matters outside these hours, please contact the clinic directly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
