'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { doctorService } from '../../api/doctorService';
import { CreateDoctorDto, Gender } from '../../types/doctor';
import { Specialization, Capability } from '../../types/doctor';

export default function NewDoctorPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateDoctorDto>({
    firstName: '',
    lastName: '',
    gender: Gender.MALE,
    email: '',
    phone: '',
    registrationNumber: '',
    qualifications: [],
    biography: '',
    specializationIds: [],
    capabilityIds: [],
  });

  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [qualification, setQualification] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [specializationsResponse, capabilitiesResponse] = await Promise.all([
          doctorService.getSpecializations(),
          doctorService.getCapabilities(),
        ]);

        if (specializationsResponse.data) {
          setSpecializations(specializationsResponse.data);
        }

        if (capabilitiesResponse.data) {
          setCapabilities(capabilitiesResponse.data);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load specializations and capabilities');
      }
    };

    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSpecializationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      specializationIds: checked
        ? [...(prev.specializationIds || []), value]
        : (prev.specializationIds || []).filter((id) => id !== value),
    }));
  };

  const handleCapabilityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      capabilityIds: checked
        ? [...(prev.capabilityIds || []), value]
        : (prev.capabilityIds || []).filter((id) => id !== value),
    }));
  };

  const addQualification = () => {
    if (qualification.trim()) {
      setFormData((prev) => ({
        ...prev,
        qualifications: [...(prev.qualifications || []), qualification.trim()],
      }));
      setQualification('');
    }
  };

  const removeQualification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      qualifications: (prev.qualifications || []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await doctorService.createDoctor(formData);
      if (response.error) {
        setError(response.error);
      } else {
        router.push('/doctors');
      }
    } catch (err) {
      console.error('Failed to create doctor:', err);
      setError('Failed to create doctor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8">
      <div className="mb-6">
        <a href="/doctors" className="text-blue-600 hover:underline">
          &larr; Back to Doctors
        </a>
      </div>

      <h1 className="text-3xl font-bold mb-6">Add New Doctor</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
              Gender *
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={Gender.MALE}>Male</option>
              <option value={Gender.FEMALE}>Female</option>
              <option value={Gender.OTHER}>Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Registration Number *
            </label>
            <input
              type="text"
              id="registrationNumber"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="biography" className="block text-sm font-medium text-gray-700 mb-1">
            Biography
          </label>
          <textarea
            id="biography"
            name="biography"
            value={formData.biography}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Qualifications</label>
          <div className="flex">
            <input
              type="text"
              value={qualification}
              onChange={(e) => setQualification(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add a qualification"
            />
            <button
              type="button"
              onClick={addQualification}
              className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
          {formData.qualifications && formData.qualifications.length > 0 && (
            <div className="mt-2">
              <ul className="space-y-1">
                {formData.qualifications.map((qual, index) => (
                  <li key={index} className="flex items-center">
                    <span className="flex-1">{qual}</span>
                    <button
                      type="button"
                      onClick={() => removeQualification(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specializations</label>
            <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md p-3">
              {specializations.length === 0 ? (
                <p className="text-gray-500">No specializations available</p>
              ) : (
                specializations.map((spec) => (
                  <div key={spec.id} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={`spec-${spec.id}`}
                      value={spec.id}
                      checked={formData.specializationIds?.includes(spec.id) || false}
                      onChange={handleSpecializationChange}
                      className="mr-2"
                    />
                    <label htmlFor={`spec-${spec.id}`}>{spec.name}</label>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capabilities</label>
            <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md p-3">
              {capabilities.length === 0 ? (
                <p className="text-gray-500">No capabilities available</p>
              ) : (
                capabilities.map((cap) => (
                  <div key={cap.id} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={`cap-${cap.id}`}
                      value={cap.id}
                      checked={formData.capabilityIds?.includes(cap.id) || false}
                      onChange={handleCapabilityChange}
                      className="mr-2"
                    />
                    <label htmlFor={`cap-${cap.id}`}>{cap.name}</label>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => router.push('/doctors')}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors mr-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {loading ? 'Saving...' : 'Save Doctor'}
          </button>
        </div>
      </form>
    </div>
  );
}
