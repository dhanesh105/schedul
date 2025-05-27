'use client';

import { useEffect, useState } from 'react';
import { doctorService } from '../api/doctorService';
import { Doctor } from '../types/doctor';

export default function SchedulesPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
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

  if (loading) {
    return <div className="text-center py-8">Loading doctors...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded my-4">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6">Doctor Schedules</h1>

      {doctors.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>No doctors found. Add doctors first to manage their schedules.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specializations
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {doctors.map((doctor) => (
                <tr key={doctor.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      Dr. {doctor.firstName} {doctor.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{doctor.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {doctor.specializations?.map((spec) => (
                        <span
                          key={spec.id}
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                        >
                          {spec.name}
                        </span>
                      )) || 'None'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        doctor.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : doctor.status === 'INACTIVE'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {doctor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <a
                      href={`/schedules/${doctor.id}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      View Schedule
                    </a>
                    <a
                      href={`/schedules/${doctor.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit Schedule
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
