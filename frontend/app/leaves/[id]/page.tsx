'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doctorService } from '../../api/doctorService';
import { leaveService } from '../../api/leaveService';
import { Doctor } from '../../types/doctor';
import { Leave, LeaveStatus } from '../../types/leave';
import Link from 'next/link';
import { use } from 'react';

export default function DoctorLeavesPage({ params }: { params: { id: string } }) {
  // Use React.use() to unwrap the params object
  const { id } = use(params);

  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const doctorResponse = await doctorService.getDoctorById(id);
        console.log('Doctor data:', doctorResponse);

        if (doctorResponse.error) {
          setError(doctorResponse.error);
          return;
        }

        // For now, we'll use mock data for leaves since the API isn't implemented
        const mockLeaves: Leave[] = [
          {
            id: '1',
            doctorId: id,
            startDate: '2023-07-01',
            endDate: '2023-07-07',
            reason: 'Vacation',
            status: LeaveStatus.APPROVED,
            requestedAt: '2023-06-01',
            approvedAt: '2023-06-02',
            approvedBy: 'admin',
            rejectedAt: null,
            rejectedBy: null,
            rejectionReason: null,
          },
          {
            id: '2',
            doctorId: id,
            startDate: '2023-08-15',
            endDate: '2023-08-20',
            reason: 'Conference',
            status: LeaveStatus.PENDING,
            requestedAt: '2023-06-05',
            approvedAt: null,
            approvedBy: null,
            rejectedAt: null,
            rejectedBy: null,
            rejectionReason: null,
          }
        ];

        setDoctor(doctorResponse.data || null);
        setLeaves(mockLeaves);
      } catch (err) {
        setError('Failed to fetch data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadgeClass = (status: LeaveStatus): string => {
    switch (status) {
      case LeaveStatus.APPROVED:
        return 'bg-green-100 text-green-800';
      case LeaveStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleApproveLeave = async (leaveId: string) => {
    try {
      // Update the leave status in our mock data
      const updatedLeaves = leaves.map(leave =>
        leave.id === leaveId
          ? {
              ...leave,
              status: LeaveStatus.APPROVED,
              approvedAt: new Date().toISOString(),
              approvedBy: 'admin'
            }
          : leave
      );

      setLeaves(updatedLeaves);
    } catch (err) {
      setError('Failed to approve leave');
      console.error(err);
    }
  };

  const handleRejectLeave = async (leaveId: string) => {
    try {
      // Update the leave status in our mock data
      const updatedLeaves = leaves.map(leave =>
        leave.id === leaveId
          ? {
              ...leave,
              status: LeaveStatus.REJECTED,
              rejectedAt: new Date().toISOString(),
              rejectedBy: 'admin',
              rejectionReason: 'Not approved at this time'
            }
          : leave
      );

      setLeaves(updatedLeaves);
    } catch (err) {
      setError('Failed to reject leave');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading leaves...</div>;
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
        <Link href="/leaves" className="text-blue-600 hover:underline">
          &larr; Back to Leaves
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Dr. {doctor.firstName} {doctor.lastName}&apos;s Leaves
        </h1>
        <Link
          href={`/leaves/${doctor.id}/new`}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Request Leave
        </Link>
      </div>

      {leaves.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>No leaves found for this doctor.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Range
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requested At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaves.map((leave) => (
                <tr key={leave.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{leave.reason || 'No reason provided'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                        leave.status
                      )}`}
                    >
                      {leave.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(leave.requestedAt)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {leave.status === LeaveStatus.PENDING && (
                      <>
                        <button
                          onClick={() => handleApproveLeave(leave.id)}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectLeave(leave.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
