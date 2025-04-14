import { useState } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";

export default function AdminDropCourseApproval() {
  // Example pending drop requests
  // In a real application, this would come from an API or context
  const [pendingRequests, setPendingRequests] = useState([
    {
      id: "req-1",
      studentId: "ST12345",
      studentName: "Jane Smith",
      courseId: "CS101",
      courseName: "Introduction to Computer Science",
      requestDate: "2025-04-12"
    },
    {
      id: "req-2",
      studentId: "ST67890",
      studentName: "John Doe",
      courseId: "MATH202",
      courseName: "Calculus II",
      requestDate: "2025-04-13"
    },
    {
      id: "req-3",
      studentId: "ST54321",
      studentName: "Alice Johnson",
      courseId: "ENG105",
      courseName: "Academic Writing",
      requestDate: "2025-04-14"
    }
  ]);

  // Function to handle approving a drop request
  const handleApproveRequest = (requestId) => {
    // In a real app, you would make an API call to approve the request
    // and update the database
    setPendingRequests(pendingRequests.filter(request => request.id !== requestId));
    // Show success message
    alert("Course drop request approved successfully");
  };

  // Function to handle rejecting a drop request
  const handleRejectRequest = (requestId) => {
    if (window.confirm("Are you sure you want to reject this drop request?")) {
      // In a real app, you would make an API call to reject the request
      // and update the database
      setPendingRequests(pendingRequests.filter(request => request.id !== requestId));
      // Show rejection message
      alert("Course drop request rejected");
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Drop Course Approval Dashboard</h1>
        <p className="text-gray-600">Review and manage student course drop requests</p>
      </div>

      {pendingRequests.length === 0 ? (
        <div className="bg-gray-100 p-6 rounded-lg text-center">
          <p className="text-gray-700">No pending drop requests to review.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingRequests.map((request) => (
                <tr key={request.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{request.studentName}</div>
                    <div className="text-sm text-gray-500">ID: {request.studentId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{request.courseName}</div>
                    <div className="text-sm text-pink-500 font-medium">{request.courseId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.requestDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApproveRequest(request.id)}
                        className="flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-md border border-green-300 hover:bg-green-100 transition duration-300"
                      >
                        <FaCheck className="mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        className="flex items-center px-3 py-1 bg-red-50 text-red-700 rounded-md border border-red-300 hover:bg-red-100 transition duration-300"
                      >
                        <FaTimes className="mr-1" />
                        Reject
                      </button>
                    </div>
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