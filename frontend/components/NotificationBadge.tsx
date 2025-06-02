'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../app/context/AuthContext';
import { UserRole } from '../app/types/auth';
import { notificationService } from '../app/api/notificationService';
import Link from 'next/link';

export default function NotificationBadge() {
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPendingCount = async () => {
      if (!user || user.role !== UserRole.DOCTOR) return;

      try {
        setLoading(true);
        const count = await notificationService.getPendingAppointmentRequests(user.id);
        setPendingCount(count);
      } catch (error) {
        console.error('Error fetching pending appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingCount();

    // Refresh every 30 seconds
    const interval = setInterval(fetchPendingCount, 30000);

    return () => clearInterval(interval);
  }, [user]);

  // Only show for doctors
  if (!user || user.role !== UserRole.DOCTOR) {
    return null;
  }

  return (
    <Link
      href="/appointments?status=PENDING"
      className="relative inline-flex items-center p-2 text-gray-600 hover:text-gray-900 transition-colors"
      title={`${pendingCount} pending appointment${pendingCount !== 1 ? 's' : ''}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-6 h-6"
      >
        <path
          fillRule="evenodd"
          d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.243.75.75 0 01-.298-1.206A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z"
          clipRule="evenodd"
        />
      </svg>
      
      {pendingCount > 0 && (
        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full min-w-[1.25rem] h-5">
          {pendingCount > 99 ? '99+' : pendingCount}
        </span>
      )}
    </Link>
  );
}
