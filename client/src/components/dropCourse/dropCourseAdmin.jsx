import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import newRequest from '../../utils/newRequest';
import { FaCheck, FaTimes, FaClock } from 'react-icons/fa';

export default function AdminDropRequests() {
  const queryClient = useQueryClient();
  // Fetch all drop requests (no filter, all statuses)
  const { isLoading, error, data: dropRequests = [] } = useQuery({
    queryKey: ['adminDropRequests'],
    queryFn: () =>
      newRequest.get('/acadadmin/drop-requests').then((res) => res.data),
  });

  // Mutation for updating drop request status
  const updateRequestStatus = useMutation({
    mutationFn: ({ requestId, status, remarks }) =>
      newRequest.patch(`/acadadmin/drop-requests/${requestId}`, { status, remarks }),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminDropRequests']);
    },
  });

  const handleStatusUpdate = (requestId, newStatus) => {
    const remarks = prompt("Enter remarks for this decision:");
    if (remarks !== null) {
      updateRequestStatus.mutate({ requestId, status: newStatus, remarks });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'text-yellow-500';
      case 'Approved': return 'text-green-500';
      case 'Rejected': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Course Drop Requests</h1>
      {isLoading ? (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Loading requests...</p>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">
          Error loading requests: {error.message}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dropRequests.map((request) => (
                <tr key={request._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{request.studentName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{request.rollNo}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{request.courseName}</div>
                  <div className="text-sm text-gray-500">{request.courseId}</div>
                </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(request.requestDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                      {request.status === 'Pending' ? <FaClock className="mr-1" /> : 
                       request.status === 'Approved' ? <FaCheck className="mr-1" /> : 
                       <FaTimes className="mr-1" />}
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {request.status === 'Pending' ? (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(request._id, 'Approved')}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(request._id, 'Rejected')}
                          className="text-red-600 hover:text-red-900"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-500">No actions available</span>
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
