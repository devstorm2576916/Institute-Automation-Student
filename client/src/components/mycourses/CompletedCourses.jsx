import { useState, useEffect } from "react";
import newRequest from '../../utils/newRequest';
import { useQuery } from '@tanstack/react-query';
import { 
  FaBookOpen,
  FaCheckCircle,
  FaCalendarAlt,
  FaRegChartBar,
  FaUniversity
} from "react-icons/fa";

function CompletedCourses() {
  const { data: userData } = JSON.parse(localStorage.getItem("currentUser"));
  const { userId } = userData.user;

  const { isLoading, error, data: completedCourses = [] } = useQuery({
    queryKey: ["completedCourses"],
    queryFn: () =>
      newRequest.get(`/student/${userId}/completed-courses`).then((res) => {
        return res.data.courses || [];
      }),
  });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">Completed Courses</h1>
      <p className="text-gray-600 mb-6">Your academic history</p>

      {isLoading ? (
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading your academic history...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 p-8 rounded-lg text-center">
          <p className="text-red-700 text-lg mb-4">
            {error.message || "Failed to fetch completed courses"}
          </p>
        </div>
      ) : completedCourses.length === 0 ? (
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <p className="text-gray-700 text-lg mb-4">No completed courses found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {completedCourses.map((course) => (
            <div
              key={course._id}
              className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
            >
              {/* Course Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-3 rounded-full">
                      <FaCheckCircle className="text-green-500 text-xl" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {course.courseName}
                      </h2>
                      <p className="text-gray-600 text-sm">{course.courseCode}</p>
                    </div>
                  </div>
                  <span className="bg-gray-100 text-gray-700 text-sm py-1 px-3 rounded-full font-medium">
                    {course.grade || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Course Details */}
              <div className="grid grid-cols-3 border-b border-gray-200">
                <div className="p-4 text-center border-r border-gray-200">
                  <p className="text-2xl font-semibold text-green-500">
                    {course.credits}
                  </p>
                  <p className="text-xs text-gray-600 font-medium uppercase">Credits</p>
                </div>
                <div className="p-4 text-center border-r border-gray-200">
                  <p className="text-2xl font-semibold text-green-500">
                    {course.semester}
                  </p>
                  <p className="text-xs text-gray-600 font-medium uppercase">Semester</p>
                </div>
                <div className="p-4 text-center">
                  <p className="text-2xl font-semibold text-green-500">
                    {course.department}
                  </p>
                  <p className="text-xs text-gray-600 font-medium uppercase">Department</p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="p-6">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FaUniversity className="text-green-400" />
                    <span>{course.creditOrAudit}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-green-400" />
                    <span>Completed: {new Date(course.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CompletedCourses;
