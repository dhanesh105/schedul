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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {schedule.daySchedules.map((daySchedule) => (
                    <div
                      key={daySchedule.id}
                      className={`border rounded-lg p-4 ${
                        daySchedule.isAvailable ? 'bg-green-50' : 'bg-red-50'
                      }`}
                    >
                      <h3 className="font-semibold mb-2">{getDayName(daySchedule.dayOfWeek)}</h3>
                      {daySchedule.isAvailable ? (
                        <>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Hours:</span> {daySchedule.startTime} -{' '}
                            {daySchedule.endTime}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Slot Duration:</span>{' '}
                            {daySchedule.slotDurationMinutes} minutes
                          </p>
                          <div className="mt-2">
                            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              Available
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="mt-2">
                          <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                            Not Available
                          </span>
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
