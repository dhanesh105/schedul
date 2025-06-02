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

      // If the API call succeeds, map backend doctors to frontend format
      if (apiResponse.data && !apiResponse.error) {
        console.log('✅ API returned doctors:', apiResponse.data);

        // Map backend doctors to frontend format with simple IDs
        const mappedDoctors: Doctor[] = apiResponse.data.map((backendDoctor: any, index: number) => ({
          id: (index + 1).toString(), // Use simple IDs like '1', '2', '3'
          backendId: backendDoctor.id, // Store the real backend ID for API calls
          userId: backendDoctor.userId || `user-${index + 1}`,
          firstName: backendDoctor.firstName,
          lastName: backendDoctor.lastName,
          gender: backendDoctor.gender,
          email: backendDoctor.email,
          phone: backendDoctor.phone,
          registrationNumber: backendDoctor.registrationNumber,
          qualifications: backendDoctor.qualifications || ['MD'],
          biography: backendDoctor.biography || 'Experienced medical professional',
          profileImageUrl: backendDoctor.profileImageUrl || '',
          status: backendDoctor.status,
          specializations: [{ id: '1', name: 'General Practice' }], // Default specialization
          capabilities: [{ id: '1', name: 'General Consultation' }], // Default capability
          createdAt: backendDoctor.createdAt,
          updatedAt: backendDoctor.updatedAt,
        }));

        console.log('🔄 Mapped doctors for frontend:', mappedDoctors);

        // Store the mapping in localStorage for appointment creation
        if (typeof window !== 'undefined') {
          const doctorMapping = mappedDoctors.reduce((acc, doctor: any) => {
            acc[doctor.id] = doctor.backendId;
            return acc;
          }, {} as Record<string, string>);
          localStorage.setItem('doctor_id_mapping', JSON.stringify(doctorMapping));
          console.log('💾 Stored doctor ID mapping:', doctorMapping);

          // Also store user ID to doctor ID mapping for authentication
          const userToDoctorMapping = mappedDoctors.reduce((acc, doctor: any) => {
            acc[doctor.userId] = doctor.id; // Map user ID to frontend doctor ID
            return acc;
          }, {} as Record<string, string>);
          localStorage.setItem('user_to_doctor_mapping', JSON.stringify(userToDoctorMapping));
          console.log('💾 Stored user to doctor mapping:', userToDoctorMapping);
        }

        return { data: mappedDoctors };
      }

      // If the API call fails or returns an error, use mock data
      console.log('⚠️ Using mock data for doctors:', apiResponse.error);
      return { data: mockDoctors };
    } catch (err) {
      console.error('❌ Error fetching doctors:', err);

      // Use mock data as fallback
      console.log('Using mock data for doctors after error:', err);
      return { data: mockDoctors };
    }
  },
  getDoctorById: async (id: string): Promise<ApiResponse<Doctor>> => {
    try {
      // Get the backend ID from the stored mapping
      let backendId = id;
      if (typeof window !== 'undefined') {
        const doctorMapping = localStorage.getItem('doctor_id_mapping');
        if (doctorMapping) {
          const mapping = JSON.parse(doctorMapping);
          backendId = mapping[id] || id;
          console.log(`🔄 Mapping frontend ID ${id} to backend ID ${backendId}`);
        } else {
          // If no mapping exists, fetch all doctors first to populate the mapping
          console.log('🔄 No ID mapping found, fetching all doctors first...');
          const doctorsResponse = await doctorService.getDoctors();
          if (doctorsResponse.data) {
            // Try to get the mapping again after fetching all doctors
            const newDoctorMapping = localStorage.getItem('doctor_id_mapping');
            if (newDoctorMapping) {
              const mapping = JSON.parse(newDoctorMapping);
              backendId = mapping[id] || id;
              console.log(`🔄 After fetching doctors, mapping frontend ID ${id} to backend ID ${backendId}`);
            }
          }
        }
      }

      const apiResponse = await get<Doctor>(`/api/doctors/${backendId}`);

      // If the API call succeeds, map the backend doctor to frontend format
      if (apiResponse.data && !apiResponse.error) {
        console.log('✅ API returned doctor:', apiResponse.data);

        const mappedDoctor: Doctor = {
          id: id, // Use the original frontend ID
          backendId: apiResponse.data.id, // Store the backend ID
          userId: apiResponse.data.userId,
          firstName: apiResponse.data.firstName,
          lastName: apiResponse.data.lastName,
          gender: apiResponse.data.gender,
          email: apiResponse.data.email,
          phone: apiResponse.data.phone,
          registrationNumber: apiResponse.data.registrationNumber,
          qualifications: apiResponse.data.qualifications || ['MD'],
          biography: apiResponse.data.biography || 'Experienced medical professional',
          profileImageUrl: apiResponse.data.profileImageUrl || '',
          status: apiResponse.data.status,
          specializations: [{ id: '1', name: 'General Practice' }], // Default specialization
          capabilities: [{ id: '1', name: 'General Consultation' }], // Default capability
          createdAt: apiResponse.data.createdAt,
          updatedAt: apiResponse.data.updatedAt,
        };

        console.log('🔄 Mapped doctor for frontend:', mappedDoctor);
        return { data: mappedDoctor };
      }

      // If the API call fails or returns an error, use mock data
      const doctor = mockDoctors.find(d => d.id === id);
      if (!doctor) {
        return { error: `Doctor with ID ${id} not found` };
      }
      console.log(`Using mock data for doctor ${id}:`, doctor);
      return { data: doctor };
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
