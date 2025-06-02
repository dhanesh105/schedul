'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth';
import { doctorService } from '../api/doctorService';
import { Doctor } from '../types/doctor';
import Link from 'next/link';

export default function DoctorsPage() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await doctorService.getDoctors();
        console.log('Doctors response:', response);

        if (response.error) {
          setError(response.error);
        } else if (response.data) {
          setDoctors(response.data);
        } else {
          setError('No data received');
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {user?.role === UserRole.PATIENT ? 'Find Doctors' : 'Doctors'}
          </h1>
          {user?.role === UserRole.PATIENT && (
            <p className="text-gray-600 mt-2">Browse available doctors and view their schedules</p>
          )}
        </div>
        {/* Only show Add New Doctor button for doctors/admins */}
        {user?.role === UserRole.DOCTOR && (
          <Link
            href="/doctors/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Add New Doctor
          </Link>
        )}
      </div>

      {!Array.isArray(doctors) || doctors.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>
            {user?.role === UserRole.PATIENT
              ? 'No doctors available at the moment. Please check back later.'
              : 'No doctors found. Add a new doctor to get started.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">
                  Dr. {doctor.firstName} {doctor.lastName}
                </h2>
                <p className="text-gray-600 mb-4">{doctor.email}</p>

                {doctor.specializations && doctor.specializations.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Specializations</h3>
                    <div className="flex flex-wrap gap-2">
                      {doctor.specializations.map((spec) => (
                        <span
                          key={spec.id}
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                        >
                          {spec.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end mt-4">
                  {user?.role === UserRole.PATIENT ? (
                    // Patient view - single More Info button
                    <Link
                      href={`/doctors/${doctor.id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>More Info</span>
                    </Link>
                  ) : (
                    // Doctor view - show management options only for own profile
                    <div className="flex space-x-2">
                      <Link
                        href={`/doctors/${doctor.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View Details
                      </Link>
                      {/* Only show edit button if the current user is this doctor */}
                      {user?.role === UserRole.DOCTOR && user?.id === doctor.userId && (
                        <Link
                          href={`/doctors/${doctor.id}/edit`}
                          className="text-gray-600 hover:text-gray-800 text-sm"
                        >
                          Edit
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
