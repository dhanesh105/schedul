import { appointmentService } from './appointmentService';
import { AppointmentStatus } from '../types/appointment';

export interface Notification {
  id: string;
  type: 'appointment_request' | 'appointment_confirmed' | 'appointment_cancelled';
  title: string;
  message: string;
  appointmentId?: string;
  isRead: boolean;
  createdAt: string;
}

class NotificationService {
  // Get pending appointment requests for doctors
  async getPendingAppointmentRequests(doctorId: string): Promise<number> {
    try {
      const response = await appointmentService.getMyAppointments(AppointmentStatus.PENDING);
      
      if (response.data) {
        // Filter appointments for this doctor
        const pendingForDoctor = response.data.filter(
          appointment => appointment.doctorId === doctorId && appointment.status === AppointmentStatus.PENDING
        );
        return pendingForDoctor.length;
      }
      
      return 0;
    } catch (error) {
      console.error('Error fetching pending appointments:', error);
      return 0;
    }
  }

  // Get all notifications for a user
  async getNotifications(userId: string): Promise<Notification[]> {
    try {
      // In a real app, this would fetch from an API
      // For now, we'll generate notifications based on pending appointments
      const response = await appointmentService.getMyAppointments(AppointmentStatus.PENDING);
      
      if (response.data) {
        const notifications: Notification[] = response.data.map(appointment => ({
          id: `notif_${appointment.id}`,
          type: 'appointment_request' as const,
          title: 'New Appointment Request',
          message: `You have a new appointment request for ${new Date(appointment.date).toLocaleDateString()} at ${appointment.startTime}`,
          appointmentId: appointment.id,
          isRead: false,
          createdAt: appointment.createdAt,
        }));
        
        return notifications;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      // In a real app, this would call an API
      console.log(`Marking notification ${notificationId} as read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Clear all notifications
  async clearAll(userId: string): Promise<void> {
    try {
      // In a real app, this would call an API
      console.log(`Clearing all notifications for user ${userId}`);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }
}

export const notificationService = new NotificationService();
