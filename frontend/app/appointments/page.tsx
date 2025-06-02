'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth';
import ProtectedRoute from '../../components/ProtectedRoute';
import Link from 'next/link';
import { Appointment, AppointmentStatus } from '../types/appointment';
import { appointmentService } from '../api/appointmentService';
import { doctorService } from '../api/doctorService';
import { patientService } from '../api/patientService';
import { Doctor } from '../types/doctor';
import { Patient } from '../types/patient';

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Record<string, Doctor>>({});
  const [patients, setPatients] = useState<Record<string, Patient>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'ALL'>('ALL');

  const fetchAppointments = useCallback(async () => {
    if (!user) return;

    console.log('🔄 fetchAppointments called for user:', user.role, user.id);

    try {
      setLoading(true);
      setError(null);

      const response = await appointmentService.getMyAppointments(
        statusFilter !== 'ALL' ? statusFilter : undefined
      );

      console.log('📋 fetchAppointments response:', response);

      if (response.error) {
        setError(response.error);
        setAppointments([]);
      } else if (response.data && Array.isArray(response.data)) {
        setAppointments(response.data);

        // Fetch doctor and patient details
        const doctorIds = new Set<string>();
        const patientIds = new Set<string>();

        response.data.forEach((appointment) => {
          doctorIds.add(appointment.doctorId);
          patientIds.add(appointment.patientId);
        });

        // Fetch actual doctor and patient data
        const doctorsMap: Record<string, Doctor> = {};
        const patientsMap: Record<string, Patient> = {};

        // Fetch doctors data
        if (doctorIds.size > 0) {
          try {
            const doctorsResponse = await doctorService.getDoctors();
            if (doctorsResponse.data) {
              doctorsResponse.data.forEach((doctor) => {
                if (doctorIds.has(doctor.id)) {
                  doctorsMap[doctor.id] = doctor;
                }
              });
            }
          } catch (error) {
            console.warn('Failed to fetch doctors data:', error);
          }
        }

        // Fetch patients data
        if (patientIds.size > 0) {
          try {
            const patientsResponse = await patientService.getPatients();
            if (patientsResponse.data) {
              patientsResponse.data.forEach((patient) => {
                if (patientIds.has(patient.id)) {
                  patientsMap[patient.id] = patient;
                }
              });
            }
          } catch (error) {
            console.warn('Failed to fetch patients data:', error);
          }
        }

        // Fill in any missing data with fallback mock data
        Array.from(doctorIds).forEach((id) => {
          if (!doctorsMap[id]) {
            doctorsMap[id] = {
              id,
              userId: `user-${id}`,
              firstName: 'Dr.',
              lastName: 'Unknown',
              gender: 'MALE' as any,
              email: 'doctor@example.com',
              phone: '123-456-7890',
              registrationNumber: 'REG12345',
              qualifications: ['MD'],
              biography: 'Doctor information not available',
              profileImageUrl: '',
              status: 'ACTIVE' as any,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          }
        });

        Array.from(patientIds).forEach((id) => {
          if (!patientsMap[id]) {
            patientsMap[id] = {
              id,
              userId: `user-${id}`,
              firstName: 'Patient',
              lastName: 'Unknown',
              gender: 'FEMALE' as any,
              email: 'patient@example.com',
              phone: '987-654-3210',
              dateOfBirth: '1990-01-01',
              address: '123 Main St',
              medicalHistory: 'No information available',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          }
        });

        setDoctors(doctorsMap);
        setPatients(patientsMap);
      } else {
        // Fallback: set empty array if data is not an array
        setAppointments([]);
      }
    } catch (err) {
      setError('Failed to fetch appointments');
      setAppointments([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, statusFilter]);

  useEffect(() => {
    fetchAppointments();
  }, [user, statusFilter, fetchAppointments]);

  // Refresh appointments when the page becomes visible (e.g., after navigation)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchAppointments();
      }
    };

    const handleFocus = () => {
      fetchAppointments();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchAppointments]);



  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as AppointmentStatus | 'ALL');
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await appointmentService.cancelAppointment(appointmentId);

      if (response.error) {
        setError(response.error);
      } else {
        // Refresh appointments to get updated data
        fetchAppointments();
      }
    } catch (err) {
      setError('Failed to cancel appointment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await appointmentService.confirmAppointment(appointmentId);

      if (response.error) {
        setError(response.error);
      } else {
        // Refresh appointments to get updated data
        fetchAppointments();
      }
    } catch (err) {
      setError('Failed to confirm appointment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectAppointment = async (appointmentId: string) => {
    const reason = prompt('Please provide a reason for rejection (optional):');

    try {
      setLoading(true);
      setError(null);

      const response = await appointmentService.rejectAppointment(appointmentId, reason || undefined);

      if (response.error) {
        setError(response.error);
      } else {
        // Refresh appointments to get updated data
        fetchAppointments();
      }
    } catch (err) {
      setError('Failed to reject appointment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && appointments.length === 0) {
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
          <h1 className="text-3xl font-bold">My Appointments</h1>

          {user?.role === UserRole.PATIENT && (
            <Link
              href="/appointments/book"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Book New Appointment
            </Link>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <label htmlFor="statusFilter" className="block text-gray-700 font-medium mb-2">
              Filter by Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={handleStatusChange}
              className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Appointments</option>
              <option value={AppointmentStatus.SCHEDULED}>Scheduled</option>
              <option value={AppointmentStatus.CONFIRMED}>Confirmed</option>
              <option value={AppointmentStatus.COMPLETED}>Completed</option>
              <option value={AppointmentStatus.CANCELLED}>Cancelled</option>
              <option value={AppointmentStatus.NO_SHOW}>No Show</option>
            </select>
          </div>

          {appointments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No appointments found.</p>
              {user?.role === UserRole.PATIENT && (
                <Link
                  href="/appointments/book"
                  className="text-blue-600 hover:underline"
                >
                  Book your first appointment
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    {user?.role === UserRole.DOCTOR ? (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                    ) : (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doctor
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(appointment.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {appointment.startTime} - {appointment.endTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user?.role === UserRole.DOCTOR ? (
                          patients[appointment.patientId] ? (
                            `${patients[appointment.patientId].firstName} ${patients[appointment.patientId].lastName}`
                          ) : (
                            'Loading...'
                          )
                        ) : (
                          doctors[appointment.doctorId] ? (
                            `Dr. ${doctors[appointment.doctorId].firstName} ${doctors[appointment.doctorId].lastName}`
                          ) : (
                            'Loading...'
                          )
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            appointment.status === AppointmentStatus.SCHEDULED
                              ? 'bg-blue-100 text-blue-800'
                              : appointment.status === AppointmentStatus.CONFIRMED
                              ? 'bg-green-100 text-green-800'
                              : appointment.status === AppointmentStatus.COMPLETED
                              ? 'bg-purple-100 text-purple-800'
                              : appointment.status === AppointmentStatus.CANCELLED
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="truncate max-w-xs">
                          {appointment.reason || 'No reason provided'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/appointments/${appointment.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </Link>

                          {/* Cancel button for scheduled/confirmed appointments */}
                          {(appointment.status === AppointmentStatus.SCHEDULED ||
                            appointment.status === AppointmentStatus.CONFIRMED) && (
                            <button
                              onClick={() => handleCancelAppointment(appointment.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
