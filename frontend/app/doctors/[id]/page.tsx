'use client';

import { useEffect, useState, FormEvent } from 'react';
import { doctorService } from '../../api/doctorService';
import { Doctor } from '../../types/doctor';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/auth';
import Link from 'next/link';
import { use } from 'react';
import { DoctorAvailability, DayOfWeek, AvailableSlot } from '../../types/availability';
import { availabilityService } from '../../api/availabilityService';
import { appointmentService } from '../../api/appointmentService';
import SuccessDialog from '../../../components/SuccessDialog';
import { useRouter } from 'next/navigation';

export default function DoctorDetailPage({ params }: { params: { id: string } }) {
  // Use React.use() to unwrap the params object
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();

  // Doctor details state
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Schedule state
  const [availability, setAvailability] = useState<DoctorAvailability[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  // Booking state
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'schedule' | 'booking'>('details');
  const [formData, setFormData] = useState({
    date: '',
    timeSlot: '',
    reason: '',
  });

  // Days of week for schedule display
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
          doctorService.getDoctorById(id),
          availabilityService.getDoctorAvailability(id),
        ]);

        if (doctorResponse.error) {
          setError(doctorResponse.error);
          return;
        }

        if (availabilityResponse.error) {
          console.warn('Failed to fetch availability:', availabilityResponse.error);
          // Don't set error for availability, just log it
        }

        setDoctor(doctorResponse.data || null);
        setAvailability(availabilityResponse.data || []);
      } catch (err) {
        setError('Failed to fetch doctor details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Helper functions
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

  const fetchAvailableSlots = async (date: string) => {
    try {
      setSlotsLoading(true);
      setError(null);

      const response = await availabilityService.getAvailableSlots({
        doctorId: id,
        date,
      });

      if (response.error) {
        setError(response.error);
        setAvailableSlots([]);
      } else if (response.data) {
        // Filter out booked slots
        const availableSlots = response.data.filter(slot => !slot.isBooked);
        setAvailableSlots(availableSlots);
      }
    } catch (err) {
      setError('Failed to fetch available slots');
      console.error(err);
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // If date changes, fetch available slots
    if (name === 'date' && value) {
      fetchAvailableSlots(value);
    }
  };

  const handleBookingSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      setBookingLoading(true);
      setError(null);

      // Find the selected slot to get the exact times
      const selectedSlot = availableSlots.find(slot =>
        `${slot.startTime} - ${slot.endTime}` === formData.timeSlot
      );

      if (!selectedSlot) {
        setError('Selected time slot is no longer available');
        return;
      }

      const appointmentData = {
        doctorId: id,
        patientId: user.id,
        date: formData.date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        reason: formData.reason,
      };

      const response = await appointmentService.createAppointment(appointmentData);

      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setCreatedAppointment(response.data);
        setShowSuccessDialog(true);
        setFormData({ date: '', timeSlot: '', reason: '' });
        setAvailableSlots([]);
      }
    } catch (err) {
      setError('Failed to book appointment');
      console.error(err);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    setCreatedAppointment(null);
  };

  const handleViewAppointments = () => {
    setShowSuccessDialog(false);
    setCreatedAppointment(null);
    router.push('/appointments');
  };

  if (loading) {
    return <div className="text-center py-8">Loading doctor details...</div>;
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
        <Link href="/doctors" className="text-blue-600 hover:underline">
          &larr; Back to Doctors
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3 p-6 bg-gray-50">
            <div className="text-center">
              {doctor.profileImageUrl ? (
                <img
                  src={doctor.profileImageUrl}
                  alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full mx-auto mb-4 bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 text-2xl font-bold">
                    {doctor.firstName[0]}
                    {doctor.lastName[0]}
                  </span>
                </div>
              )}
              <h1 className="text-2xl font-bold">
                Dr. {doctor.firstName} {doctor.lastName}
              </h1>
              <p className="text-gray-600 mt-1">{doctor.email}</p>
              <p className="text-gray-600">{doctor.phone}</p>

              <div className="mt-4">
                <span
                  className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                    doctor.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800'
                      : doctor.status === 'INACTIVE'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {doctor.status}
                </span>
              </div>

              {/* Show management buttons only for doctors viewing their own profile */}
              {user?.role === UserRole.DOCTOR && user.id === doctor.userId && (
                <div className="mt-6 flex justify-center space-x-3">
                  <Link
                    href={`/doctors/${doctor.id}/edit`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Edit Profile
                  </Link>
                  <Link
                    href={`/doctors/${doctor.id}/availability`}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Manage Availability
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="md:w-2/3 p-6">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'details'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Details
                </button>
                <button
                  onClick={() => setActiveTab('schedule')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'schedule'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Schedule
                </button>
                {user?.role === UserRole.PATIENT && (
                  <button
                    onClick={() => setActiveTab('booking')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'booking'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Book Appointment
                  </button>
                )}
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'details' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Registration Details</h2>
                  <p className="text-gray-600">
                    <span className="font-medium">Registration Number:</span> {doctor.registrationNumber}
                  </p>
                </div>

                {doctor.biography && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Biography</h2>
                    <p className="text-gray-600">{doctor.biography}</p>
                  </div>
                )}

                {doctor.qualifications && doctor.qualifications.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Qualifications</h2>
                    <ul className="list-disc list-inside text-gray-600">
                      {doctor.qualifications.map((qualification, index) => (
                        <li key={index}>{qualification}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {doctor.specializations && doctor.specializations.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Specializations</h2>
                    <div className="flex flex-wrap gap-2">
                      {doctor.specializations.map((specialization) => (
                        <span
                          key={specialization.id}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          {specialization.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {doctor.capabilities && doctor.capabilities.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Capabilities</h2>
                    <div className="flex flex-wrap gap-2">
                      {doctor.capabilities.map((capability) => (
                        <span
                          key={capability.id}
                          className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                        >
                          {capability.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Schedule Tab */}
            {activeTab === 'schedule' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Weekly Schedule & Available Time Slots</h2>

                <div className="space-y-6">
                  {daysOfWeek.map(({ key: dayOfWeek, label }) => {
                    const dayAvailability = getAvailabilityForDay(dayOfWeek);

                    return (
                      <div key={dayOfWeek} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium text-gray-900 text-lg">{label}</h3>
                          {dayAvailability ? (
                            <div className="flex items-center space-x-2 text-green-600">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="font-medium">Available</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2 text-red-500">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                              <span className="font-medium">Not Available</span>
                            </div>
                          )}
                        </div>

                        {dayAvailability ? (
                          <div>
                            <div className="mb-3 text-sm text-gray-600">
                              <span className="font-medium">Working Hours:</span> {formatTime(dayAvailability.startTime)} - {formatTime(dayAvailability.endTime)}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                              {generateTimeSlots(dayAvailability.startTime, dayAvailability.endTime).map((slot, index) => (
                                <div
                                  key={index}
                                  className="bg-green-50 border border-green-200 rounded px-2 py-1 text-xs text-green-700 text-center font-medium"
                                >
                                  {slot.formatted}
                                </div>
                              ))}
                            </div>

                            <div className="mt-2 text-xs text-gray-500">
                              <span className="font-medium">Note:</span> Lunch break 12:00 PM - 1:00 PM (no appointments)
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-500">
                            <p>No appointments available on this day</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Appointment Information:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Each time slot represents a 30-minute appointment window</li>
                    <li>• Green slots indicate available appointment times</li>
                    <li>• Please arrive 15 minutes before your scheduled time</li>
                    <li>• Lunch break is from 12:00 PM to 1:00 PM (no appointments)</li>
                    <li>• For urgent matters outside these hours, please contact the clinic directly</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Booking Tab */}
            {activeTab === 'booking' && user?.role === UserRole.PATIENT && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Book an Appointment</h2>

                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    <p>{error}</p>
                  </div>
                )}

                <form onSubmit={handleBookingSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="date" className="block text-gray-700 font-medium mb-2">
                        Select Date
                      </label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleFormChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="timeSlot" className="block text-gray-700 font-medium mb-2">
                        Select Time Slot
                      </label>
                      <select
                        id="timeSlot"
                        name="timeSlot"
                        value={formData.timeSlot}
                        onChange={handleFormChange}
                        required
                        disabled={!formData.date || slotsLoading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      >
                        <option value="">
                          {slotsLoading ? 'Loading available slots...' : '-- Select a time slot --'}
                        </option>
                        {availableSlots.map((slot) => (
                          <option key={`${slot.startTime}-${slot.endTime}`} value={`${slot.startTime} - ${slot.endTime}`}>
                            {slot.startTime} - {slot.endTime}
                          </option>
                        ))}
                      </select>
                      {!formData.date && (
                        <p className="text-sm text-gray-500 mt-1">Please select a date first</p>
                      )}
                      {formData.date && availableSlots.length === 0 && !slotsLoading && (
                        <p className="text-sm text-red-500 mt-1">No available slots for this date</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reason" className="block text-gray-700 font-medium mb-2">
                      Reason for Visit
                    </label>
                    <textarea
                      id="reason"
                      name="reason"
                      value={formData.reason}
                      onChange={handleFormChange}
                      rows={4}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Please describe your symptoms or reason for the appointment"
                    ></textarea>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={bookingLoading || !formData.date || !formData.timeSlot}
                      className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                    >
                      {bookingLoading ? 'Booking...' : 'Book Appointment'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      <SuccessDialog
        isOpen={showSuccessDialog}
        onClose={handleSuccessDialogClose}
        title="Appointment Scheduled Successfully!"
        message={
          createdAppointment
            ? `Your appointment with Dr. ${doctor.firstName} ${doctor.lastName} has been scheduled for ${new Date(createdAppointment.date).toLocaleDateString()} at ${createdAppointment.startTime}. The doctor has been notified about your appointment.`
            : 'Your appointment has been successfully scheduled! The doctor has been notified.'
        }
        actionLabel="View My Appointments"
        onAction={handleViewAppointments}
      />
    </div>
  );
}
