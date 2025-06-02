'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth';
import ProtectedRoute from '../../components/ProtectedRoute';
import Link from 'next/link';
import { Patient } from '../types/patient';
import { patientService } from '../api/patientService';
import { appointmentService } from '../api/appointmentService';
import { Appointment } from '../types/appointment';

export default function PatientsPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patientLastVisits, setPatientLastVisits] = useState<Record<string, string>>({});
  const [patientAppointmentCounts, setPatientAppointmentCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = async () => {
      try {
        setLoading(true);
        setError(null);

        // Step 1: Fetch doctor's appointments to get patient IDs
        const appointmentsResponse = await appointmentService.getMyAppointments();

        if (appointmentsResponse.error) {
          setError(appointmentsResponse.error);
          return;
        }

        if (!appointmentsResponse.data || !Array.isArray(appointmentsResponse.data)) {
          setPatients([]);
          setAppointments([]);
          return;
        }

        const doctorAppointments = appointmentsResponse.data;
        setAppointments(doctorAppointments);

        // Step 2: Extract unique patient IDs from appointments
        const patientIds = new Set<string>();
        doctorAppointments.forEach(appointment => {
          patientIds.add(appointment.patientId);
        });

        if (patientIds.size === 0) {
          setPatients([]);
          return;
        }

        // Step 3: Fetch patient details
        const patientsResponse = await patientService.getPatients();

        if (patientsResponse.error) {
          setError(patientsResponse.error);
          return;
        }

        if (!patientsResponse.data || !Array.isArray(patientsResponse.data)) {
          setPatients([]);
          return;
        }

        // Step 4: Filter patients to only those with appointments with this doctor
        const doctorPatients = patientsResponse.data.filter(patient =>
          patientIds.has(patient.id)
        );

        setPatients(doctorPatients);

        // Step 5: Calculate last visit dates and appointment counts for each patient
        const lastVisits: Record<string, string> = {};
        const appointmentCounts: Record<string, number> = {};

        doctorPatients.forEach(patient => {
          const allPatientAppointments = doctorAppointments
            .filter(apt => apt.patientId === patient.id);

          const completedAppointments = allPatientAppointments
            .filter(apt => apt.status === 'COMPLETED' || apt.status === 'CONFIRMED')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          // Count all appointments (including pending, scheduled, etc.)
          appointmentCounts[patient.id] = allPatientAppointments.length;

          if (completedAppointments.length > 0) {
            const lastAppointment = completedAppointments[0];
            const lastVisitDate = new Date(lastAppointment.date);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - lastVisitDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
              lastVisits[patient.id] = 'Today';
            } else if (diffDays === 1) {
              lastVisits[patient.id] = '1 day ago';
            } else if (diffDays < 30) {
              lastVisits[patient.id] = `${diffDays} days ago`;
            } else if (diffDays < 365) {
              const months = Math.floor(diffDays / 30);
              lastVisits[patient.id] = months === 1 ? '1 month ago' : `${months} months ago`;
            } else {
              const years = Math.floor(diffDays / 365);
              lastVisits[patient.id] = years === 1 ? '1 year ago' : `${years} years ago`;
            }
          } else {
            lastVisits[patient.id] = 'No completed visits';
          }
        });

        setPatientLastVisits(lastVisits);
        setPatientAppointmentCounts(appointmentCounts);

      } catch (err) {
        setError('Failed to fetch patients');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (user?.role === UserRole.DOCTOR) {
      fetchPatients();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={[UserRole.DOCTOR]}>
      <div className="py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Patients</h1>
          <div className="flex items-center space-x-4">
            {patients.length > 0 && (
              <div className="text-sm text-gray-600">
                Total: {patients.length} patient{patients.length !== 1 ? 's' : ''}
              </div>
            )}
            <button
              onClick={() => {
                if (user?.role === UserRole.DOCTOR) {
                  setLoading(true);
                  fetchPatients();
                }
              }}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {patients.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Patients</p>
                  <p className="text-2xl font-semibold text-gray-900">{patients.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Appointments</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {Object.values(patientAppointmentCounts).reduce((sum, count) => sum + count, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Recent Visits</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {Object.values(patientLastVisits).filter(visit =>
                      visit !== 'No completed visits' && visit !== 'No visits yet'
                    ).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}

        {patients.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 mx-auto text-gray-400 mb-4">
              <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
            <p className="text-gray-600">You don't have any patients with appointments yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Age
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gender
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Appointments
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Visit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-medium">
                                {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {patient.firstName} {patient.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {patient.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{patient.phone}</div>
                        <div className="text-sm text-gray-500">{patient.address}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                        {patient.gender.toLowerCase()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {patientAppointmentCounts[patient.id] || 0} appointments
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {patientLastVisits[patient.id] || 'No visits yet'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/patients/${patient.id}`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          View Details
                        </Link>
                        <Link
                          href={`/appointments?patient=${patient.id}`}
                          className="text-green-600 hover:text-green-900"
                        >
                          View Appointments
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
