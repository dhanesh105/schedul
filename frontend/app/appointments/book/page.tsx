'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/auth';
import ProtectedRoute from '../../../components/ProtectedRoute';
import SuccessDialog from '../../../components/SuccessDialog';
import { Doctor } from '../../types/doctor';
import { doctorService } from '../../api/doctorService';
import { appointmentService } from '../../api/appointmentService';
import { availabilityService } from '../../api/availabilityService';
import { AvailableSlot } from '../../types/availability';
import { useRouter, useSearchParams } from 'next/navigation';

export default function BookAppointmentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedDoctorId = searchParams.get('doctor');

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState<any>(null);
  const [formData, setFormData] = useState({
    doctorId: preSelectedDoctorId || '',
    date: '',
    timeSlot: '',
    reason: '',
  });

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await doctorService.getDoctors();
        if (response.error) {
          setError(response.error);
        } else if (response.data) {
          setDoctors(response.data);
        }
      } catch (err) {
        setError('Failed to fetch doctors');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // If doctor or date changes, fetch available slots
    if (name === 'doctorId' || name === 'date') {
      if (formData.doctorId && formData.date) {
        fetchAvailableSlots(name === 'doctorId' ? value : formData.doctorId, name === 'date' ? value : formData.date);
      }
    }
  };

  const fetchAvailableSlots = async (doctorId: string, date: string) => {
    try {
      setSlotsLoading(true);
      setError(null);

      const response = await availabilityService.getAvailableSlots({
        doctorId,
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

  const handleSubmit = async (e: FormEvent) => {
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
        doctorId: formData.doctorId,
        patientId: user.id, // In a real app, this would be the patient's ID
        date: formData.date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        reason: formData.reason,
      };

      console.log('📝 Creating appointment with data:', appointmentData);
      console.log('👤 Current user:', user);

      const response = await appointmentService.createAppointment(appointmentData);

      console.log('📋 Appointment creation response:', response);

      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        // Success - show success dialog
        console.log('✅ Appointment created successfully, showing success dialog');
        setCreatedAppointment(response.data);
        setShowSuccessDialog(true);

        // Reset form
        setFormData({
          doctorId: preSelectedDoctorId || '',
          date: '',
          timeSlot: '',
          reason: '',
        });
        setAvailableSlots([]);
      }
    } catch (err) {
      setError('Failed to book appointment');
      console.error(err);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading && doctors.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    setCreatedAppointment(null);
  };

  const handleViewAppointments = () => {
    console.log('🔄 Navigating to appointments page...');
    setShowSuccessDialog(false);
    setCreatedAppointment(null);
    router.push('/appointments');
  };

  const getSelectedDoctorName = () => {
    const selectedDoctor = doctors.find(d => d.id === formData.doctorId);
    return selectedDoctor ? `Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}` : 'Selected Doctor';
  };

  return (
    <ProtectedRoute allowedRoles={[UserRole.PATIENT]}>
      <div className="py-8">
        <h1 className="text-3xl font-bold mb-6">Book an Appointment</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="doctorId" className="block text-gray-700 font-medium mb-2">
                Select Doctor
              </label>
              <select
                id="doctorId"
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select a doctor --</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    Dr. {doctor.firstName} {doctor.lastName} ({doctor.specializations?.[0]?.name || 'General Practice'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="date" className="block text-gray-700 font-medium mb-2">
                Select Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]} // Prevent selecting past dates
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
                onChange={handleChange}
                required
                disabled={!formData.doctorId || !formData.date || slotsLoading}
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
              {(!formData.doctorId || !formData.date) && (
                <p className="text-sm text-gray-500 mt-1">Please select a doctor and date first</p>
              )}
              {formData.doctorId && formData.date && availableSlots.length === 0 && !slotsLoading && (
                <p className="text-sm text-red-500 mt-1">No available slots for this date</p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="reason" className="block text-gray-700 font-medium mb-2">
              Reason for Visit
            </label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows={4}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Please describe your symptoms or reason for the appointment"
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={bookingLoading || !formData.doctorId || !formData.date || !formData.timeSlot}
              className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {bookingLoading ? 'Booking...' : 'Book Appointment'}
            </button>
          </div>
        </form>

        {/* Success Dialog */}
        <SuccessDialog
          isOpen={showSuccessDialog}
          onClose={handleSuccessDialogClose}
          title="Appointment Scheduled Successfully!"
          message={
            createdAppointment
              ? `Your appointment with ${getSelectedDoctorName()} has been scheduled for ${new Date(createdAppointment.date).toLocaleDateString()} at ${createdAppointment.startTime}. The doctor has been notified about your appointment.`
              : 'Your appointment has been successfully scheduled! The doctor has been notified.'
          }
          actionLabel="View My Appointments"
          onAction={handleViewAppointments}
        />
      </div>
    </ProtectedRoute>
  );
}
