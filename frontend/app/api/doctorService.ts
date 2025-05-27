import { get, post, put, del, ApiResponse } from './client';
import { Doctor, CreateDoctorDto, UpdateDoctorDto, Specialization, Capability } from '../types/doctor';
import { mockDoctors } from './mockData';

// Helper function to handle API calls with mock data fallback
const withMockFallback = async <T>(
  apiCall: Promise<ApiResponse<T>>,
  mockData: T,
  errorMessage: string
): Promise<T> => {
  const response = await apiCall;

  if (response.error || !response.data) {
    console.log(errorMessage, response.error);
    return mockData;
  }

  return response.data;
};

export const doctorService = {
  // Doctor endpoints
  getDoctors: async (): Promise<ApiResponse<Doctor[]>> => {
    try {
      const apiResponse = await get<Doctor[]>('/api/doctors');

      // If the API call fails or returns an error, use mock data
      if (apiResponse.error || !apiResponse.data) {
        console.log('Using mock data for doctors:', apiResponse.error);
        return { data: mockDoctors };
      }

      return apiResponse;
    } catch (err) {
      console.error('Error fetching doctors:', err);

      // Use mock data as fallback
      console.log('Using mock data for doctors after error:', err);
      return { data: mockDoctors };
    }
  },
  getDoctorById: async (id: string): Promise<ApiResponse<Doctor>> => {
    try {
      const apiResponse = await get<Doctor>(`/api/doctors/${id}`);

      // If the API call fails or returns an error, use mock data
      if (apiResponse.error || !apiResponse.data) {
        const doctor = mockDoctors.find(d => d.id === id);
        if (!doctor) {
          return { error: `Doctor with ID ${id} not found` };
        }
        console.log(`Using mock data for doctor ${id}:`, doctor);
        return { data: doctor };
      }

      return apiResponse;
    } catch (err) {
      console.error(`Error fetching doctor ${id}:`, err);

      // Try to use mock data as fallback
      const doctor = mockDoctors.find(d => d.id === id);
      if (!doctor) {
        return { error: `Doctor with ID ${id} not found` };
      }

      console.log(`Using mock data for doctor ${id} after error:`, doctor);
      return { data: doctor };
    }
  },
  createDoctor: (doctor: CreateDoctorDto) => post<Doctor>('/api/doctors', doctor),
  updateDoctor: (id: string, doctor: UpdateDoctorDto) => put<Doctor>(`/api/doctors/${id}`, doctor),

  // Profile endpoints
  getMyProfile: async (): Promise<ApiResponse<Doctor>> => {
    try {
      const apiResponse = await get<Doctor>('/api/doctors/me');

      // If the API call fails or returns an error, use mock data
      if (apiResponse.error || !apiResponse.data) {
        // Create a mock profile based on the first doctor in mock data
        const mockProfile = mockDoctors[0];
        console.log('Using mock data for doctor profile:', mockProfile);
        return { data: mockProfile };
      }

      return apiResponse;
    } catch (err) {
      console.error('Error fetching doctor profile:', err);

      // Use mock data as fallback
      const mockProfile = mockDoctors[0];
      console.log('Using mock data for doctor profile after error:', mockProfile);
      return { data: mockProfile };
    }
  },

  updateMyProfile: async (updateData: UpdateDoctorDto): Promise<ApiResponse<Doctor>> => {
    try {
      const apiResponse = await put<Doctor>('/api/doctors/me', updateData);

      // If the API call fails or returns an error, simulate success with mock data
      if (apiResponse.error || !apiResponse.data) {
        // Simulate updating the profile by merging with mock data
        const updatedProfile = { ...mockDoctors[0], ...updateData };
        console.log('Using mock data for doctor profile update:', updatedProfile);
        return { data: updatedProfile };
      }

      return apiResponse;
    } catch (err) {
      console.error('Error updating doctor profile:', err);

      // Simulate success with mock data
      const updatedProfile = { ...mockDoctors[0], ...updateData };
      console.log('Using mock data for doctor profile update after error:', updatedProfile);
      return { data: updatedProfile };
    }
  },

  // Specialization endpoints
  getSpecializations: () => get<Specialization[]>('/api/specializations'),
  getSpecializationById: (id: string) => get<Specialization>(`/api/specializations/${id}`),
  createSpecialization: (specialization: { name: string; description?: string; icon?: string }) =>
    post<Specialization>('/api/specializations', specialization),
  updateSpecialization: (id: string, specialization: { name?: string; description?: string; icon?: string }) =>
    put<Specialization>(`/api/specializations/${id}`, specialization),
  deleteSpecialization: (id: string) => del(`/api/specializations/${id}`),
  addSpecializationToDoctor: (doctorId: string, specializationId: string) =>
    post(`/api/doctors/${doctorId}/specializations`, { specializationId }),
  removeSpecializationFromDoctor: (doctorId: string, specializationId: string) =>
    del(`/api/doctors/${doctorId}/specializations/${specializationId}`),

  // Capability endpoints
  getCapabilities: () => get<Capability[]>('/api/capabilities'),
  getCapabilityById: (id: string) => get<Capability>(`/api/capabilities/${id}`),
  createCapability: (capability: { name: string; description?: string }) =>
    post<Capability>('/api/capabilities', capability),
  updateCapability: (id: string, capability: { name?: string; description?: string }) =>
    put<Capability>(`/api/capabilities/${id}`, capability),
  deleteCapability: (id: string) => del(`/api/capabilities/${id}`),
  addCapabilityToDoctor: (doctorId: string, capabilityId: string) =>
    post(`/api/doctors/${doctorId}/capabilities`, { capabilityId }),
  removeCapabilityFromDoctor: (doctorId: string, capabilityId: string) =>
    del(`/api/doctors/${doctorId}/capabilities/${capabilityId}`),
};
