'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth';
import ProtectedRoute from '../../components/ProtectedRoute';
import { Doctor, Gender } from '../types/doctor';
import { Patient } from '../types/patient';
import { doctorService } from '../api/doctorService';
import { patientService } from '../api/patientService';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Doctor | Patient | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        if (user.role === UserRole.DOCTOR) {
          const response = await doctorService.getMyProfile();
          if (response.error) {
            setError(response.error);
          } else if (response.data) {
            setProfile(response.data);
            setFormData(response.data);
          }
        } else if (user.role === UserRole.PATIENT) {
          const response = await patientService.getMyProfile();
          if (response.error) {
            setError(response.error);
          } else if (response.data) {
            setProfile(response.data);
            setFormData(response.data);
          }
        }
      } catch (err) {
        setError('Failed to fetch profile data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      if (user.role === UserRole.DOCTOR) {
        const { id, userId, email, createdAt, updatedAt, ...updateData } = formData;
        const response = await doctorService.updateMyProfile(updateData);

        if (response.error) {
          setError(response.error);
        } else if (response.data) {
          setProfile(response.data);
          setSuccess('Profile updated successfully');
        }
      } else if (user.role === UserRole.PATIENT) {
        const { id, userId, email, createdAt, updatedAt, ...updateData } = formData;
        const response = await patientService.updateMyProfile(updateData);

        if (response.error) {
          setError(response.error);
        } else if (response.data) {
          setProfile(response.data);
          setSuccess('Profile updated successfully');
        }
      }
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    } finally {
      setSaving(false);
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
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>

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

        {profile && (
          <div className="space-y-6">
            {/* Profile Summary Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {formData.firstName?.charAt(0)}{formData.lastName?.charAt(0)}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {user?.role === UserRole.DOCTOR ? 'Dr. ' : ''}{formData.firstName} {formData.lastName}
                  </h2>
                  <p className="text-gray-600">{formData.email}</p>
                  <p className="text-gray-600">{formData.phone}</p>
                  {user?.role === UserRole.DOCTOR && formData.specialization && (
                    <p className="text-blue-600 font-medium">{formData.specialization}</p>
                  )}
                </div>
              </div>

              {/* Patient-specific summary */}
              {user?.role === UserRole.PATIENT && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-1">Age</h3>
                    <p className="text-blue-700">
                      {formData.dateOfBirth
                        ? new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear()
                        : 'Not specified'
                      }
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-medium text-green-900 mb-1">Gender</h3>
                    <p className="text-green-700 capitalize">{formData.gender?.toLowerCase() || 'Not specified'}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-medium text-purple-900 mb-1">Member Since</h3>
                    <p className="text-purple-700">
                      {profile.createdAt ? new Date(profile.createdAt).getFullYear() : 'Unknown'}
                    </p>
                  </div>
                </div>
              )}

              {/* Doctor-specific summary */}
              {user?.role === UserRole.DOCTOR && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <h3 className="font-medium text-indigo-900 mb-1">Registration Number</h3>
                    <p className="text-indigo-700">{formData.registrationNumber || 'Not specified'}</p>
                  </div>
                  <div className="bg-teal-50 p-4 rounded-lg">
                    <h3 className="font-medium text-teal-900 mb-1">Status</h3>
                    <p className="text-teal-700">{formData.status || 'Active'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Patient-specific information sections */}
            {user?.role === UserRole.PATIENT && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Medical Information */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2 text-red-500">
                      <path fillRule="evenodd" d="M4.125 3C3.089 3 2.25 3.84 2.25 4.875V18a3 3 0 003 3h15a3 3 0 01-3-3V4.875C17.25 3.839 16.41 3 15.375 3H4.125zM12 9.75a.75.75 0 000 1.5h.008a.75.75 0 000-1.5H12zm-.75-2.25a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H12a.75.75 0 01-.75-.75V7.5zM12 15a.75.75 0 000 1.5h.008a.75.75 0 000-1.5H12zm-.75-2.25a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H12a.75.75 0 01-.75-.75v-.008z" clipRule="evenodd" />
                    </svg>
                    Medical Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">Date of Birth</h4>
                      <p className="text-gray-600">
                        {formData.dateOfBirth
                          ? new Date(formData.dateOfBirth).toLocaleDateString()
                          : 'Not specified'
                        }
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">Address</h4>
                      <p className="text-gray-600">{formData.address || 'Not specified'}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">Medical History</h4>
                      <p className="text-gray-600">
                        {formData.medicalHistory || 'No medical history recorded'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2 text-blue-500">
                      <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M12.75 3a.75.75 0 01.75-.75 8.25 8.25 0 018.25 8.25.75.75 0 01-.75.75h-7.5V3z" clipRule="evenodd" />
                    </svg>
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <Link
                      href="/doctors"
                      className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-3 text-blue-600">
                        <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="font-medium text-blue-900">Find Doctors</p>
                        <p className="text-sm text-blue-700">Browse available doctors</p>
                      </div>
                    </Link>
                    <Link
                      href="/appointments/book"
                      className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-3 text-green-600">
                        <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="font-medium text-green-900">Book Appointment</p>
                        <p className="text-sm text-green-700">Schedule a new appointment</p>
                      </div>
                    </Link>
                    <Link
                      href="/appointments"
                      className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-3 text-purple-600">
                        <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                        <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="font-medium text-purple-900">My Appointments</p>
                        <p className="text-sm text-purple-700">View appointment history</p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Editable Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Edit Profile Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="firstName" className="block text-gray-700 font-medium mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-gray-700 font-medium mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
                <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="gender" className="block text-gray-700 font-medium mb-2">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender || Gender.MALE}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={Gender.MALE}>Male</option>
                  <option value={Gender.FEMALE}>Female</option>
                  <option value={Gender.OTHER}>Other</option>
                </select>
              </div>

              {user?.role === UserRole.DOCTOR && (
                <div>
                  <label htmlFor="specialization" className="block text-gray-700 font-medium mb-2">
                    Specialization
                  </label>
                  <input
                    type="text"
                    id="specialization"
                    name="specialization"
                    value={formData.specialization || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {user?.role === UserRole.DOCTOR && (
                <div>
                  <label htmlFor="registrationNumber" className="block text-gray-700 font-medium mb-2">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    id="registrationNumber"
                    name="registrationNumber"
                    value={formData.registrationNumber || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {user?.role === UserRole.PATIENT && (
                <div>
                  <label htmlFor="dateOfBirth" className="block text-gray-700 font-medium mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            {user?.role === UserRole.PATIENT && (
              <div className="mb-6">
                <label htmlFor="address" className="block text-gray-700 font-medium mb-2">
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
            )}

            {user?.role === UserRole.PATIENT && (
              <div className="mb-6">
                <label htmlFor="medicalHistory" className="block text-gray-700 font-medium mb-2">
                  Medical History
                </label>
                <textarea
                  id="medicalHistory"
                  name="medicalHistory"
                  value={formData.medicalHistory || ''}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
            )}

            {user?.role === UserRole.DOCTOR && (
              <div className="mb-6">
                <label htmlFor="qualifications" className="block text-gray-700 font-medium mb-2">
                  Qualifications
                </label>
                <textarea
                  id="qualifications"
                  name="qualifications"
                  value={formData.qualifications || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
            )}

            {user?.role === UserRole.DOCTOR && (
              <div className="mb-6">
                <label htmlFor="bio" className="block text-gray-700 font-medium mb-2">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio || ''}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
            )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
