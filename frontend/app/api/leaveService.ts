import { get, post, put, del } from './client';
import { Leave, CreateLeaveDto, UpdateLeaveDto, LeaveStatus } from '../types/leave';

export const leaveService = {
  getLeaves: (doctorId: string, status?: LeaveStatus, startDate?: string, endDate?: string) => {
    let endpoint = `/api/doctors/${doctorId}/leaves`;
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
    
    return get<Leave[]>(endpoint);
  },
  
  createLeave: (doctorId: string, leave: CreateLeaveDto) => 
    post<Leave>(`/api/doctors/${doctorId}/leaves`, leave),
  
  updateLeave: (doctorId: string, leaveId: string, leave: UpdateLeaveDto) => 
    put<Leave>(`/api/doctors/${doctorId}/leaves/${leaveId}`, leave),
  
  deleteLeave: (doctorId: string, leaveId: string) => 
    del(`/api/doctors/${doctorId}/leaves/${leaveId}`),
  
  approveLeave: (doctorId: string, leaveId: string, approvedBy: string) => 
    put<Leave>(`/api/doctors/${doctorId}/leaves/${leaveId}/approve`, { approvedBy }),
  
  rejectLeave: (doctorId: string, leaveId: string, rejectionReason: string, approvedBy: string) => 
    put<Leave>(`/api/doctors/${doctorId}/leaves/${leaveId}/reject`, { rejectionReason, approvedBy }),
};
