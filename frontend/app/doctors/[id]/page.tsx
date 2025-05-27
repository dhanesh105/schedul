'use client';

import { useEffect, useState } from 'react';
import { doctorService } from '../../api/doctorService';
import { Doctor } from '../../types/doctor';
import Link from 'next/link';
import { use } from 'react';

export default function DoctorDetailPage({ params }: { params: { id: string } }) {
  // Use React.use() to unwrap the params object
  const { id } = use(params);

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await doctorService.getDoctorById(id);
        console.log('Doctor data:', response);

        if (response.error) {
          setError(response.error);
          return;
        }

        setDoctor(response.data || null);
      } catch (err) {
        setError('Failed to fetch doctor details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

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

              <div className="mt-6 flex justify-center space-x-3">
                <Link
                  href={`/doctors/${doctor.id}/edit`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Edit Profile
                </Link>
                <Link
                  href={`/schedules/${doctor.id}`}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                >
                  View Schedule
                </Link>
              </div>
            </div>
          </div>

          <div className="md:w-2/3 p-6">
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
        </div>
      </div>
    </div>
  );
}
