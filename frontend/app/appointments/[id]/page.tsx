'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/auth';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Appointment, AppointmentStatus } from '../../types/appointment';
import { appointmentService } from '../../api/appointmentService';
import { doctorService } from '../../api/doctorService';
import { patientService } from '../../api/patientService';
import { Doctor } from '../../types/doctor';
import { Patient } from '../../types/patient';

// We'll handle the TypeScript error in a different way

export default function AppointmentDetailsPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.id as string;

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      if (!user || !appointmentId) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch appointment details
        const appointmentResponse = await appointmentService.getAppointmentById(appointmentId);

        if (appointmentResponse.error) {
          setError(appointmentResponse.error);
          return;
        }

        if (appointmentResponse.data) {
          setAppointment(appointmentResponse.data);

          // In a real app, we would fetch doctor and patient details from the API
          // For now, we'll simulate the data

          // Simulate doctor data
          setDoctor({
            id: appointmentResponse.data.doctorId,
            userId: `user-${appointmentResponse.data.doctorId}`,
            firstName: 'John',
            lastName: 'Doe',
            gender: 'MALE',
            email: 'doctor@example.com',
            phone: '123-456-7890',
            specialization: 'General Medicine',
            registrationNumber: 'REG12345',
            qualifications: 'MD',
            bio: 'Experienced doctor',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });

          // Simulate patient data
          setPatient({
            id: appointmentResponse.data.patientId,
            userId: `user-${appointmentResponse.data.patientId}`,
            firstName: 'Jane',
            lastName: 'Smith',
            gender: 'FEMALE',
            email: 'patient@example.com',
            phone: '987-654-3210',
            dateOfBirth: '1990-01-01',
            address: '123 Main St',
            medicalHistory: 'No major issues',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        setError('Failed to fetch appointment details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentDetails();
  }, [user, appointmentId]);

  const handleCancelAppointment = async () => {
    if (!appointment) return;

    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);

      const response = await appointmentService.cancelAppointment(appointment.id);

      if (response.error) {
        setError(response.error);
      } else {
        setAppointment({ ...appointment, status: AppointmentStatus.CANCELLED });
        setSuccess('Appointment cancelled successfully');
      }
    } catch (err) {
      setError('Failed to cancel appointment');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (status: AppointmentStatus) => {
    if (!appointment) return;

    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);

      const response = await appointmentService.updateAppointment(appointment.id, { status });

      if (response.error) {
        setError(response.error);
      } else {
        setAppointment({ ...appointment, status });
        setSuccess(`Appointment status updated to ${status}`);
      }
    } catch (err) {
      setError('Failed to update appointment status');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Appointment Details</h1>

          <Link
            href="/appointments"
            className="text-blue-600 hover:underline flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-1">
              <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
            </svg>
            Back to Appointments
          </Link>
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

        {appointment && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Appointment Information</h2>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">Date:</span>{' '}
                    {new Date(appointment.date).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Time:</span>{' '}
                    {appointment.startTime} - {appointment.endTime}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>{' '}
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        appointment.status === AppointmentStatus.SCHEDULED
                          ? 'bg-yellow-100 text-yellow-800'
                          : appointment.status === AppointmentStatus.CONFIRMED
                          ? 'bg-green-100 text-green-800'
                          : appointment.status === AppointmentStatus.COMPLETED
                          ? 'bg-blue-100 text-blue-800'
                          : appointment.status === AppointmentStatus.CANCELLED
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Reason for Visit:</span>
                    <p className="mt-1 text-gray-600">{appointment.reason || 'No reason provided'}</p>
                  </div>
                  {appointment.notes && (
                    <div>
                      <span className="font-medium text-gray-700">Notes:</span>
                      <p className="mt-1 text-gray-600">{appointment.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                {user?.role === UserRole.PATIENT && doctor && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Doctor Information</h2>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-gray-700">Name:</span>{' '}
                        Dr. {doctor.firstName} {doctor.lastName}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Specialization:</span>{' '}
                        {doctor.specialization}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Email:</span>{' '}
                        {doctor.email}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Phone:</span>{' '}
                        {doctor.phone}
                      </div>
                    </div>
                  </div>
                )}

                {user?.role === UserRole.DOCTOR && patient && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Patient Information</h2>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-gray-700">Name:</span>{' '}
                        {patient.firstName} {patient.lastName}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Gender:</span>{' '}
                        {patient.gender}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Date of Birth:</span>{' '}
                        {new Date(patient.dateOfBirth).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Email:</span>{' '}
                        {patient.email}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Phone:</span>{' '}
                        {patient.phone}
                      </div>
                      {patient.medicalHistory && (
                        <div>
                          <span className="font-medium text-gray-700">Medical History:</span>
                          <p className="mt-1 text-gray-600">{patient.medicalHistory}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">Actions</h2>

              <div className="flex flex-wrap gap-4">
                {appointment.status === AppointmentStatus.SCHEDULED && (
                  <>
                    <button
                      onClick={handleCancelAppointment}
                      disabled={actionLoading}
                      className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors disabled:bg-red-400"
                    >
                      {actionLoading ? 'Processing...' : 'Cancel Appointment'}
                    </button>

                    {user?.role === UserRole.DOCTOR && (
                      <button
                        onClick={() => handleUpdateStatus(AppointmentStatus.CONFIRMED)}
                        disabled={actionLoading}
                        className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:bg-green-400"
                      >
                        {actionLoading ? 'Processing...' : 'Confirm Appointment'}
                      </button>
                    )}
                  </>
                )}

                {user?.role === UserRole.DOCTOR && appointment.status === AppointmentStatus.CONFIRMED && (
                  <button
                    onClick={() => handleUpdateStatus(AppointmentStatus.COMPLETED)}
                    disabled={actionLoading}
                    className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                  >
                    {actionLoading ? 'Processing...' : 'Mark as Completed'}
                  </button>
                )}

                {user?.role === UserRole.DOCTOR && appointment.status === AppointmentStatus.SCHEDULED && (
                  <button
                    onClick={() => handleUpdateStatus(AppointmentStatus.NO_SHOW)}
                    disabled={actionLoading}
                    className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors disabled:bg-gray-400"
                  >
                    {actionLoading ? 'Processing...' : 'Mark as No-Show'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
