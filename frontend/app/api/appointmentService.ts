import { get, post, put, del, ApiResponse } from './client';
import { Appointment, CreateAppointmentDto, UpdateAppointmentDto, AppointmentStatus } from '../types/appointment';
import { authService } from './authService';
import { UserRole } from '../types/auth';

// Local storage key for appointments
const APPOINTMENTS_STORAGE_KEY = 'schedula_appointments';

// Helper functions for local storage
const getStoredAppointments = (): Appointment[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading appointments from localStorage:', error);
    return [];
  }
};

const storeAppointments = (appointments: Appointment[]): void => {
  if (typeof window === 'undefined') {
    console.warn('⚠️ Window is undefined, cannot store to localStorage');
    return;
  }
  try {
    const dataToStore = JSON.stringify(appointments);
    console.log('💾 Storing to localStorage:', APPOINTMENTS_STORAGE_KEY, 'Data length:', dataToStore.length);
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, dataToStore);
    console.log('✅ Successfully stored to localStorage');
  } catch (error) {
    console.error('❌ Error storing appointments to localStorage:', error);
  }
};

const generateAppointmentId = (): string => {
  return 'apt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

export const appointmentService = {
  // Appointment endpoints
  getAppointments: (status?: AppointmentStatus, startDate?: string, endDate?: string) => {
    let endpoint = '/api/appointments';
    const params = [];

    if (status) {
      params.push(`status=${status}`);
    }
    if (startDate) {
      params.push(`startDate=${startDate}`);
    }
    if (endDate) {
      params.push(`endDate=${endDate}`);
    }

    if (params.length > 0) {
      endpoint += `?${params.join('&')}`;
    }

    return get<Appointment[]>(endpoint);
  },

  getAppointmentById: (id: string) => get<Appointment>(`/api/appointments/${id}`),

  createAppointment: async (appointment: CreateAppointmentDto): Promise<ApiResponse<Appointment>> => {
    console.log('🚀 createAppointment called with:', appointment);

    // Get doctor ID mapping from localStorage
    let backendDoctorId = appointment.doctorId;
    try {
      const doctorMapping = localStorage.getItem('doctor_id_mapping');
      if (doctorMapping) {
        const mapping = JSON.parse(doctorMapping);
        backendDoctorId = mapping[appointment.doctorId] || appointment.doctorId;
        console.log(`🔄 Mapped frontend doctor ID ${appointment.doctorId} to backend ID ${backendDoctorId}`);
      }
    } catch (error) {
      console.warn('⚠️ Could not get doctor ID mapping:', error);
    }

    // Create appointment object with generated ID
    const newAppointment: Appointment = {
      id: generateAppointmentId(),
      ...appointment,
      status: AppointmentStatus.SCHEDULED, // New appointments are automatically scheduled
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('🆕 New appointment object created:', newAppointment);

    // Step 1: Store in localStorage first (for immediate UI feedback)
    try {
      const existingAppointments = getStoredAppointments();
      console.log('📂 Existing appointments in storage:', existingAppointments.length);

      const updatedAppointments = [...existingAppointments, newAppointment];
      storeAppointments(updatedAppointments);
      console.log('💾 Stored appointment to localStorage');
    } catch (localStorageError) {
      console.error('❌ Error storing to localStorage:', localStorageError);
    }

    // Step 2: Send to API (for doctor visibility and persistence)
    try {
      console.log('🌐 Sending appointment to API...');

      // Create API payload with backend doctor ID
      const apiPayload = {
        ...newAppointment,
        doctorId: backendDoctorId, // Use the backend doctor ID for API
      };

      console.log('📤 API payload:', apiPayload);
      const apiResponse = await post<Appointment>('/api/appointments', apiPayload);

      if (apiResponse.data) {
        console.log('✅ API call successful:', apiResponse.data);
        // Update localStorage with the API response (in case the API modified anything)
        try {
          const existingAppointments = getStoredAppointments();
          const updatedAppointments = existingAppointments.map(apt =>
            apt.id === newAppointment.id ? { ...apiResponse.data!, doctorId: appointment.doctorId } : apt
          );
          storeAppointments(updatedAppointments);
          console.log('🔄 Updated localStorage with API response');
        } catch (updateError) {
          console.warn('⚠️ Could not update localStorage with API response:', updateError);
        }
        return { data: { ...apiResponse.data, doctorId: appointment.doctorId } }; // Return with frontend doctor ID
      } else if (apiResponse.error) {
        console.warn('⚠️ API returned error:', apiResponse.error);
        // API failed, but localStorage succeeded, so return the local appointment
        return { data: newAppointment };
      }
    } catch (apiError) {
      console.warn('⚠️ API call failed:', apiError);
      // API failed, but localStorage succeeded, so return the local appointment
    }

    // Return the locally stored appointment
    console.log('📱 Returning locally stored appointment');
    return { data: newAppointment };
  },

  updateAppointment: (id: string, appointment: UpdateAppointmentDto) =>
    put<Appointment>(`/api/appointments/${id}`, appointment),

  cancelAppointment: async (id: string): Promise<ApiResponse<Appointment>> => {
    try {
      // Try API first
      const apiResponse = await put<Appointment>(`/api/appointments/${id}/cancel`, {});
      if (apiResponse.data) {
        return apiResponse;
      }
    } catch (error) {
      console.log('API call failed, using local storage fallback');
    }

    // Fallback to local storage
    try {
      const appointments = getStoredAppointments();
      const updatedAppointments = appointments.map(apt =>
        apt.id === id
          ? { ...apt, status: AppointmentStatus.CANCELLED, updatedAt: new Date().toISOString() }
          : apt
      );
      storeAppointments(updatedAppointments);

      const updatedAppointment = updatedAppointments.find(apt => apt.id === id);
      if (updatedAppointment) {
        return { data: updatedAppointment };
      } else {
        return { error: 'Appointment not found' };
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      return { error: 'Failed to cancel appointment' };
    }
  },

  // Confirm appointment (for doctors)
  confirmAppointment: async (id: string): Promise<ApiResponse<Appointment>> => {
    try {
      // Try API first
      const apiResponse = await put<Appointment>(`/api/appointments/${id}/confirm`, {});
      if (apiResponse.data) {
        return apiResponse;
      }
    } catch (error) {
      console.log('API call failed, using local storage fallback');
    }

    // Fallback to local storage
    try {
      const appointments = getStoredAppointments();
      const updatedAppointments = appointments.map(apt =>
        apt.id === id
          ? { ...apt, status: AppointmentStatus.CONFIRMED, updatedAt: new Date().toISOString() }
          : apt
      );
      storeAppointments(updatedAppointments);

      const updatedAppointment = updatedAppointments.find(apt => apt.id === id);
      if (updatedAppointment) {
        return { data: updatedAppointment };
      } else {
        return { error: 'Appointment not found' };
      }
    } catch (error) {
      console.error('Error confirming appointment:', error);
      return { error: 'Failed to confirm appointment' };
    }
  },

  // Reject appointment (for doctors)
  rejectAppointment: async (id: string, reason?: string): Promise<ApiResponse<Appointment>> => {
    try {
      // Try API first
      const apiResponse = await put<Appointment>(`/api/appointments/${id}/reject`, { reason });
      if (apiResponse.data) {
        return apiResponse;
      }
    } catch (error) {
      console.log('API call failed, using local storage fallback');
    }

    // Fallback to local storage
    try {
      const appointments = getStoredAppointments();
      const updatedAppointments = appointments.map(apt =>
        apt.id === id
          ? {
              ...apt,
              status: AppointmentStatus.CANCELLED,
              notes: reason ? `Rejected: ${reason}` : 'Rejected by doctor',
              updatedAt: new Date().toISOString()
            }
          : apt
      );
      storeAppointments(updatedAppointments);

      const updatedAppointment = updatedAppointments.find(apt => apt.id === id);
      if (updatedAppointment) {
        return { data: updatedAppointment };
      } else {
        return { error: 'Appointment not found' };
      }
    } catch (error) {
      console.error('Error rejecting appointment:', error);
      return { error: 'Failed to reject appointment' };
    }
  },

  // Doctor appointments
  getDoctorAppointments: (doctorId: string, status?: AppointmentStatus, date?: string) => {
    let endpoint = `/api/doctors/${doctorId}/appointments`;
    const params = [];

    if (status) {
      params.push(`status=${status}`);
    }
    if (date) {
      params.push(`date=${date}`);
    }

    if (params.length > 0) {
      endpoint += `?${params.join('&')}`;
    }

    return get<Appointment[]>(endpoint);
  },

  // Patient appointments
  getPatientAppointments: (patientId: string, status?: AppointmentStatus) => {
    let endpoint = `/api/patients/${patientId}/appointments`;

    if (status) {
      endpoint += `?status=${status}`;
    }

    return get<Appointment[]>(endpoint);
  },

  // My appointments (for logged-in user) - HYBRID VERSION WITH API + LOCALSTORAGE
  getMyAppointments: async (status?: AppointmentStatus): Promise<ApiResponse<Appointment[]>> => {
    try {
      // Get current user
      const currentUser = authService.getUser();
      if (!currentUser) {
        return { error: 'User not authenticated' };
      }

      console.log('🔍 getMyAppointments - User:', currentUser.role, 'ID:', currentUser.id);

      // For doctors, we need to map their user ID to their doctor profile ID
      let effectiveUserId = currentUser.id;
      if (currentUser.role === UserRole.DOCTOR) {
        try {
          const userToDoctorMapping = localStorage.getItem('user_to_doctor_mapping');
          if (userToDoctorMapping) {
            const mapping = JSON.parse(userToDoctorMapping);
            const doctorId = mapping[currentUser.id];
            if (doctorId) {
              effectiveUserId = doctorId;
              console.log(`🔄 Mapped user ID ${currentUser.id} to doctor ID ${doctorId}`);
            } else {
              console.warn('⚠️ No doctor profile found for user ID:', currentUser.id);
            }
          }
        } catch (error) {
          console.warn('⚠️ Could not get user to doctor mapping:', error);
        }
      }

      console.log('🎯 Effective user ID for appointments:', effectiveUserId);

      let allAppointments: Appointment[] = [];

      // Step 1: Get appointments from localStorage
      const storedAppointments = getStoredAppointments();
      console.log('📂 Total stored appointments:', storedAppointments.length);

      // Step 2: Try to get appointments from API
      try {
        console.log('🌐 Fetching appointments from API...');
        let apiAppointments: Appointment[] = [];

        if (currentUser.role === UserRole.DOCTOR) {
          // For doctors, we need to find their doctor profile first
          let doctorId = effectiveUserId;

          try {
            // First, try to get the doctor profile using the user ID
            const doctorsResponse = await get<any[]>('/api/doctors');
            if (doctorsResponse.data) {
              const doctorProfile = doctorsResponse.data.find(d => d.userId === currentUser.id);
              if (doctorProfile) {
                doctorId = doctorProfile.id;
                console.log(`🔄 Found doctor profile: ${doctorId} for user ${currentUser.id}`);
              } else {
                console.warn('⚠️ No doctor profile found for user ID:', currentUser.id);
                // Try to use the first doctor as fallback for testing
                if (doctorsResponse.data.length > 0) {
                  doctorId = doctorsResponse.data[0].id;
                  console.log(`🔄 Using fallback doctor ID: ${doctorId}`);
                }
              }
            }
          } catch (error) {
            console.warn('⚠️ Could not fetch doctor profiles:', error);
          }

          // For doctors, get appointments where they are the doctor
          const apiResponse = await get<Appointment[]>(`/api/appointments/doctor/${doctorId}`);
          if (apiResponse.data) {
            // Map backend doctor IDs back to frontend IDs
            apiAppointments = apiResponse.data.map((apt: any) => {
              // Try to find the frontend doctor ID for this backend doctor ID
              let frontendDoctorId = apt.doctorId;
              try {
                const doctorMapping = localStorage.getItem('doctor_id_mapping');
                if (doctorMapping) {
                  const mapping = JSON.parse(doctorMapping);
                  // Reverse lookup: find frontend ID for backend ID
                  const frontendId = Object.keys(mapping).find(key => mapping[key] === apt.doctorId);
                  if (frontendId) {
                    frontendDoctorId = frontendId;
                  }
                }
              } catch (error) {
                console.warn('⚠️ Could not reverse map doctor ID:', error);
              }

              return { ...apt, doctorId: frontendDoctorId };
            });
            console.log('✅ API returned doctor appointments:', apiAppointments.length);
          }
        } else if (currentUser.role === UserRole.PATIENT) {
          // For patients, we need to find their patient profile first
          let patientId = currentUser.id;

          try {
            // First, try to get the patient profile using the user ID
            const patientsResponse = await get<any[]>('/api/patients');
            if (patientsResponse.data) {
              const patientProfile = patientsResponse.data.find(p => p.userId === currentUser.id);
              if (patientProfile) {
                patientId = patientProfile.id;
                console.log(`🔄 Found patient profile: ${patientId} for user ${currentUser.id}`);
              } else {
                console.warn('⚠️ No patient profile found for user ID:', currentUser.id);
                // Try to use the first patient as fallback for testing
                if (patientsResponse.data.length > 0) {
                  patientId = patientsResponse.data[0].id;
                  console.log(`🔄 Using fallback patient ID: ${patientId}`);
                }
              }
            }
          } catch (error) {
            console.warn('⚠️ Could not fetch patient profiles:', error);
          }

          // Now get appointments for this patient
          const apiResponse = await get<Appointment[]>(`/api/appointments/patient/${patientId}`);
          if (apiResponse.data) {
            // Map backend doctor IDs back to frontend IDs
            apiAppointments = apiResponse.data.map((apt: any) => {
              // Try to find the frontend doctor ID for this backend doctor ID
              let frontendDoctorId = apt.doctorId;
              try {
                const doctorMapping = localStorage.getItem('doctor_id_mapping');
                if (doctorMapping) {
                  const mapping = JSON.parse(doctorMapping);
                  // Reverse lookup: find frontend ID for backend ID
                  const frontendId = Object.keys(mapping).find(key => mapping[key] === apt.doctorId);
                  if (frontendId) {
                    frontendDoctorId = frontendId;
                  }
                }
              } catch (error) {
                console.warn('⚠️ Could not reverse map doctor ID:', error);
              }

              return { ...apt, doctorId: frontendDoctorId };
            });
            console.log('✅ API returned patient appointments:', apiAppointments.length);
          }
        }

        // Combine API and localStorage appointments, removing duplicates
        const combinedAppointments = [...apiAppointments];

        // Add localStorage appointments that aren't already in API results
        storedAppointments.forEach(localApt => {
          const isUserAppointment = (currentUser.role === UserRole.DOCTOR && localApt.doctorId === effectiveUserId) ||
                                   (currentUser.role === UserRole.PATIENT && localApt.patientId === effectiveUserId);

          if (isUserAppointment && !combinedAppointments.find(apiApt => apiApt.id === localApt.id)) {
            combinedAppointments.push(localApt);
          }
        });

        allAppointments = combinedAppointments;
        console.log('🔄 Combined API + localStorage appointments:', allAppointments.length);

      } catch (apiError) {
        console.warn('⚠️ API call failed, using localStorage only:', apiError);

        // Fallback to localStorage only
        if (currentUser.role === UserRole.DOCTOR) {
          allAppointments = storedAppointments.filter(apt => apt.doctorId === effectiveUserId);
        } else if (currentUser.role === UserRole.PATIENT) {
          allAppointments = storedAppointments.filter(apt => apt.patientId === effectiveUserId);
        }
      }

      console.log('🎯 Total appointments for user:', allAppointments.length);

      // Filter by status if provided
      const filteredAppointments = status
        ? allAppointments.filter(apt => apt.status === status)
        : allAppointments;

      console.log('✨ Final appointments after status filter:', filteredAppointments.length);
      console.log('📋 Appointments:', filteredAppointments);

      return { data: filteredAppointments };
    } catch (err) {
      console.error('❌ Error fetching appointments:', err);
      return { error: 'Failed to fetch appointments' };
    }
  },
};
