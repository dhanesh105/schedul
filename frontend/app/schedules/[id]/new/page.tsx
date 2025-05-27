'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { doctorService } from '../../../api/doctorService';
import { scheduleService } from '../../../api/scheduleService';
import { Doctor } from '../../../types/doctor';
import { CreateWeeklyScheduleDto, CreateDayScheduleDto } from '../../../types/schedule';

export default function NewSchedulePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState<CreateWeeklyScheduleDto>({
    doctorId: params.id,
    effectiveFrom: '',
    effectiveTo: '',
    daySchedules: Array(7)
      .fill(null)
      .map((_, index) => ({
        dayOfWeek: index,
        isAvailable: index < 5, // Monday to Friday available by default
        startTime: '09:00',
        endTime: '17:00',
        slotDurationMinutes: 30,
      })),
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        const response = await doctorService.getDoctorById(params.id);
        if (response.error) {
          setError(response.error);
        } else if (response.data) {
          setDoctor(response.data);
        }
      } catch (err) {
        setError('Failed to fetch doctor details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDayScheduleChange = (
    dayIndex: number,
    field: keyof CreateDayScheduleDto,
    value: string | boolean | number
  ) => {
    setFormData((prev) => {
      const updatedDaySchedules = [...prev.daySchedules];
      updatedDaySchedules[dayIndex] = {
        ...updatedDaySchedules[dayIndex],
        [field]: value,
      };
      return { ...prev, daySchedules: updatedDaySchedules };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await scheduleService.createSchedule(params.id, formData);
      if (response.error) {
        setError(response.error);
      } else {
        router.push(`/schedules/${params.id}`);
      }
    } catch (err) {
      console.error('Failed to create schedule:', err);
      setError('Failed to create schedule. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getDayName = (dayOfWeek: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error && !doctor) {
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
        <a href={`/schedules/${params.id}`} className="text-blue-600 hover:underline">
          &larr; Back to Schedules
        </a>
      </div>

      <h1 className="text-3xl font-bold mb-6">
        Create Schedule for Dr. {doctor.firstName} {doctor.lastName}
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="effectiveFrom" className="block text-sm font-medium text-gray-700 mb-1">
              Effective From *
            </label>
            <input
              type="date"
              id="effectiveFrom"
              name="effectiveFrom"
              value={formData.effectiveFrom}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="effectiveTo" className="block text-sm font-medium text-gray-700 mb-1">
              Effective To
            </label>
            <input
              type="date"
              id="effectiveTo"
              name="effectiveTo"
              value={formData.effectiveTo}
              onChange={handleChange}
              min={formData.effectiveFrom}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">Leave blank for indefinite schedule</p>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4">Weekly Schedule</h2>

        <div className="space-y-6">
          {formData.daySchedules.map((daySchedule, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 ${
                daySchedule.isAvailable ? 'bg-green-50' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{getDayName(daySchedule.dayOfWeek)}</h3>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`available-${index}`}
                    checked={daySchedule.isAvailable}
                    onChange={(e) =>
                      handleDayScheduleChange(index, 'isAvailable', e.target.checked)
                    }
                    className="mr-2"
                  />
                  <label htmlFor={`available-${index}`}>Available</label>
                </div>
              </div>

              {daySchedule.isAvailable && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor={`startTime-${index}`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Start Time
                    </label>
                    <input
                      type="time"
                      id={`startTime-${index}`}
                      value={daySchedule.startTime}
                      onChange={(e) =>
                        handleDayScheduleChange(index, 'startTime', e.target.value)
                      }
                      required={daySchedule.isAvailable}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`endTime-${index}`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      End Time
                    </label>
                    <input
                      type="time"
                      id={`endTime-${index}`}
                      value={daySchedule.endTime}
                      onChange={(e) => handleDayScheduleChange(index, 'endTime', e.target.value)}
                      required={daySchedule.isAvailable}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`slotDuration-${index}`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Slot Duration (minutes)
                    </label>
                    <select
                      id={`slotDuration-${index}`}
                      value={daySchedule.slotDurationMinutes}
                      onChange={(e) =>
                        handleDayScheduleChange(
                          index,
                          'slotDurationMinutes',
                          parseInt(e.target.value)
                        )
                      }
                      required={daySchedule.isAvailable}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>60 minutes</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={() => router.push(`/schedules/${params.id}`)}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors mr-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {submitting ? 'Saving...' : 'Save Schedule'}
          </button>
        </div>
      </form>
    </div>
  );
}
