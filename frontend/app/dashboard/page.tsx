'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth';
import ProtectedRoute from '../../components/ProtectedRoute';
import Link from 'next/link';
import { Doctor } from '../types/doctor';
import { Patient } from '../types/patient';
import { Appointment, AppointmentStatus } from '../types/appointment';
import { doctorService } from '../api/doctorService';
import { patientService } from '../api/patientService';
import { appointmentService } from '../api/appointmentService';

export default function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Doctor | Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Record<string, Doctor>>({});
  const [patients, setPatients] = useState<Record<string, Patient>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch profile data based on user role
        if (user.role === UserRole.DOCTOR) {
          const profileResponse = await doctorService.getMyProfile();
          if (profileResponse.error) {
            setError(profileResponse.error);
          } else if (profileResponse.data) {
            setProfile(profileResponse.data);
          }
        } else if (user.role === UserRole.PATIENT) {
          const profileResponse = await patientService.getMyProfile();
          if (profileResponse.error) {
            setError(profileResponse.error);
          } else if (profileResponse.data) {
            setProfile(profileResponse.data);
          }
        }

        // Fetch appointments
        const appointmentsResponse = await appointmentService.getMyAppointments();
        if (appointmentsResponse.error) {
          console.warn('Appointments error:', appointmentsResponse.error);
          // Don't set error for appointments, just use empty array
          setAppointments([]);
          setPendingAppointments([]);
        } else if (appointmentsResponse.data && Array.isArray(appointmentsResponse.data)) {
          setAppointments(appointmentsResponse.data);

          // Filter pending appointments for doctors
          if (user.role === UserRole.DOCTOR) {
            const pending = appointmentsResponse.data.filter(
              apt => apt.status === AppointmentStatus.PENDING
            );
            setPendingAppointments(pending);
          }

          // Fetch doctor and patient data for appointments
          const doctorIds = new Set<string>();
          const patientIds = new Set<string>();

          appointmentsResponse.data.forEach((appointment) => {
            doctorIds.add(appointment.doctorId);
            patientIds.add(appointment.patientId);
          });

          // Fetch doctors data
          const doctorsMap: Record<string, Doctor> = {};
          const patientsMap: Record<string, Patient> = {};

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

          setDoctors(doctorsMap);
          setPatients(patientsMap);
        } else {
          // Fallback to empty array if data is not an array
          setAppointments([]);
          setPendingAppointments([]);
        }
      } catch (err) {
        setError('Failed to fetch dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

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
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}

        {user && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              Welcome, {user.role === UserRole.DOCTOR ? 'Dr.' : ''} {profile ? (profile as any).firstName : user.email?.split('@')[0]} {profile ? (profile as any).lastName : ''}
            </h2>
            <p className="text-gray-600 mb-4">
              Role: <span className="font-medium capitalize">{user.role.toLowerCase()}</span>
            </p>

            {/* Role-specific quick actions */}
            {user.role === UserRole.PATIENT && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Find Doctors</h3>
                  <p className="text-blue-600 text-sm mb-3">Browse and find the right doctor for you</p>
                  <Link
                    href="/doctors"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    Browse Doctors
                  </Link>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Book Appointment</h3>
                  <p className="text-green-600 text-sm mb-3">Schedule your next appointment</p>
                  <Link
                    href="/doctors"
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
                  >
                    Book Now
                  </Link>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">My Profile</h3>
                  <p className="text-purple-600 text-sm mb-3">Update your personal information</p>
                  <Link
                    href="/profile"
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors text-sm"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            )}

            {user.role === UserRole.DOCTOR && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-indigo-800 mb-2">Availability</h3>
                  <p className="text-indigo-600 text-sm mb-3">Set your working hours and availability</p>
                  <Link
                    href={profile ? `/doctors/${(profile as Doctor).id}/availability` : '/profile'}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm"
                  >
                    Manage Hours
                  </Link>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Appointments</h3>
                  <p className="text-green-600 text-sm mb-3">View and manage your appointments</p>
                  <Link
                    href="/appointments"
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
                  >
                    View Schedule
                  </Link>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-orange-800 mb-2">My Patients</h3>
                  <p className="text-orange-600 text-sm mb-3">View patients you have appointments with</p>
                  <Link
                    href="/patients"
                    className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors text-sm"
                  >
                    View Patients
                  </Link>
                </div>
                <div className="bg-teal-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-teal-800 mb-2">My Profile</h3>
                  <p className="text-teal-600 text-sm mb-3">Update your professional information</p>
                  <Link
                    href="/profile"
                    className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors text-sm"
                  >
                    Edit Profile
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pending Appointments Notification for Doctors */}
        {user?.role === UserRole.DOCTOR && pendingAppointments.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-orange-800">
                    {pendingAppointments.length} Pending Appointment{pendingAppointments.length !== 1 ? 's' : ''}
                  </h3>
                  <p className="text-orange-700">
                    You have new appointment requests that need your approval.
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <Link
                  href="/appointments?status=PENDING"
                  className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
                >
                  Review Requests
                </Link>
              </div>
            </div>

            {/* Show first few pending appointments */}
            <div className="mt-4">
              <div className="space-y-2">
                {pendingAppointments.slice(0, 3).map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between bg-white p-3 rounded border border-orange-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(appointment.date).toLocaleDateString()} at {appointment.startTime}
                        </p>
                        <p className="text-xs text-gray-600">
                          Reason: {appointment.reason || 'No reason provided'}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/appointments/${appointment.id}`}
                      className="text-orange-600 hover:text-orange-800 text-sm font-medium"
                    >
                      Review
                    </Link>
                  </div>
                ))}
                {pendingAppointments.length > 3 && (
                  <p className="text-sm text-orange-600 text-center">
                    And {pendingAppointments.length - 3} more...
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>

          {!Array.isArray(appointments) || appointments.length === 0 ? (
            <p className="text-gray-600">No upcoming appointments found.</p>
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
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.isArray(appointments) && appointments.map((appointment) => (
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
                            appointment.status === AppointmentStatus.PENDING
                              ? 'bg-orange-100 text-orange-800'
                              : appointment.status === AppointmentStatus.SCHEDULED
                              ? 'bg-yellow-100 text-yellow-800'
                              : appointment.status === AppointmentStatus.CONFIRMED
                              ? 'bg-green-100 text-green-800'
                              : appointment.status === AppointmentStatus.CANCELLED
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {appointment.status === AppointmentStatus.PENDING ? 'Pending Approval' : appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/appointments/${appointment.id}`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          View
                        </Link>
                        {appointment.status === AppointmentStatus.SCHEDULED && (
                          <Link
                            href={`/appointments/${appointment.id}/cancel`}
                            className="text-red-600 hover:text-red-900"
                          >
                            Cancel
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6">
            <Link
              href="/appointments"
              className="text-blue-600 hover:underline"
            >
              View All Appointments
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
