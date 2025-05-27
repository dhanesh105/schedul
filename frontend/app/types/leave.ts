export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface Leave {
  id: string;
  doctorId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  requestedAt: string;
  approvedBy: string;
  approvedAt: string;
  rejectionReason: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeaveDto {
  doctorId: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface UpdateLeaveDto {
  startDate?: string;
  endDate?: string;
  reason?: string;
  status?: LeaveStatus;
  rejectionReason?: string;
}
