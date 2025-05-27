'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/auth';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { Doctor } from '../../types/doctor';
import { doctorService } from '../../api/doctorService';
import { appointmentService } from '../../api/appointmentService';
import { useRouter } from 'next/navigation';

export default function BookAppointmentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    doctorId: '',
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
      setLoading(true);
      setError(null);
      
      // In a real app, this would call an API to get available slots
      // For now, we'll simulate some time slots
      const mockSlots = [
        '09:00 - 09:30',
        '09:30 - 10:00',
        '10:00 - 10:30',
        '10:30 - 11:00',
        '11:00 - 11:30',
        '11:30 - 12:00',
        '14:00 - 14:30',
        '14:30 - 15:00',
        '15:00 - 15:30',
        '15:30 - 16:00',
      ];
      
      setAvailableSlots(mockSlots);
    } catch (err) {
      setError('Failed to fetch available slots');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setBookingLoading(true);
      setError(null);
      
      const [startTime, endTime] = formData.timeSlot.split(' - ');
      
      const appointmentData = {
        doctorId: formData.doctorId,
        patientId: user.id, // In a real app, this would be the patient's ID
        date: formData.date,
        startTime,
        endTime,
        reason: formData.reason,
      };
      
      const response = await appointmentService.createAppointment(appointmentData);
      
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        // Redirect to appointments page
        router.push('/appointments');
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
                    Dr. {doctor.firstName} {doctor.lastName} ({doctor.specialization})
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
                disabled={!formData.doctorId || !formData.date}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">-- Select a time slot --</option>
                {availableSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
              {(!formData.doctorId || !formData.date) && (
                <p className="text-sm text-gray-500 mt-1">Please select a doctor and date first</p>
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
      </div>
    </ProtectedRoute>
  );
}
