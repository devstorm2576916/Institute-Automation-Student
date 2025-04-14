import { useState } from "react";
import { FaRegClock } from "react-icons/fa";
import { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import newRequest from '../../utils/newRequest';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from "react-router-dom";

export default function DropCourse() {
  // Example student object with current courses and pending drop requests
  const [studentCourses, setStudentCourses] = useState([
    {
      id: "CS101",
      name: "Introduction to Computer Science",
      status: "enrolled" // possible values: "enrolled", "pending"
    },
    {
      id: "MATH202",
      name: "Calculus II",
      status: "enrolled"
    },
    {
      id: "ENG105",
      name: "Academic Writing",
      status: "pending" // example of a course with pending drop request
    }
  ]);
  
  // Function to handle requesting to drop a course
  const handleRequestDropCourse = (courseId) => {
    if (window.confirm("Are you sure you want to request dropping this course?")) {
      // Update the course status to pending
      setStudentCourses(
        studentCourses.map(course => 
          course.id === courseId 
            ? {...course, status: "pending"} 
            : course
        )
      );
      
      // In a real app, you would make an API call to create a drop request
      alert("Drop request submitted. You will be notified when it's processed.");
    }
  };
  
  // Function to handle canceling a drop request
  const handleCancelDropRequest = (courseId) => {
    if (window.confirm("Are you sure you want to cancel your drop request?")) {
      // Update the course status back to enrolled
      setStudentCourses(
        studentCourses.map(course => 
          course.id === courseId 
            ? {...course, status: "enrolled"} 
            : course
        )
      );
      
      // In a real app, you would make an API call to cancel the request
      alert("Drop request canceled.");
  // Get userId from localStorage
  const { data: userData } = JSON.parse(localStorage.getItem("currentUser"));
  const { userId } = userData.user;
  
  const queryClient = useQueryClient();

  // Fetch student courses from backend
  const { isLoading, error, data: studentCourses = [] } = useQuery({
    queryKey: ["dropCourses"],
    queryFn: () =>
      newRequest.get(`/student/${userId}/courses`).then((res) => {
        console.log("Course data received:", res.data);
        return res.data.courses || [];
      }),
  });

  // Mutation for dropping a course
  const dropCourseMutation = useMutation({
    mutationFn: (courseId) => {
      return newRequest.delete(`/student/${userId}/courses/${courseId}`);
    },
    onSuccess: () => {
      // Invalidate and refetch courses after successful drop
      queryClient.invalidateQueries({ queryKey: ["dropCourses"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] }); // Also invalidate courses in MyCourses page
    },
  });

  // Function to handle dropping a course
  const handleDropCourse = (courseId) => {
    // Show confirmation dialog
    if (window.confirm("Are you sure you want to drop this course? This action cannot be undone.")) {
      dropCourseMutation.mutate(courseId);
    }
  };

  const enrolledCourses = studentCourses.filter(course => course.status === "enrolled");
  const pendingCourses = studentCourses.filter(course => course.status === "pending");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Drop Courses</h1>
      
      {isLoading ? (
        <div className="bg-gray-100 p-4 rounded-lg text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-2"></div>
          <p className="text-gray-700">Loading your courses...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 p-4 rounded-lg text-center">
          <p className="text-red-700">{error.message || "Failed to fetch courses"}</p>
        </div>
      ) : studentCourses.length === 0 ? (
        <div className="bg-gray-100 p-4 rounded-lg text-center">
          <p className="text-gray-700 mb-4">You are not enrolled in any courses.</p>
          <Link
            to="/registration"
            className="bg-pink-500 text-white py-2 px-4 rounded-md font-medium hover:bg-pink-600 transition duration-300"
          >
            Go to Course Registration
          </Link>
        </div>
      ) : (
        <div className="flex flex-col space-y-2">
          {studentCourses.map((course) => (
            <div
              key={course.id}
              className="flex items-center justify-between bg-white p-4 rounded-lg shadow border border-gray-200"
            >
              {/* Course Code and Name */}
              <div className="flex items-center space-x-4">
                <span className="font-bold text-pink-500">{course.id}</span>
                <span className="text-gray-800">{course.name}</span>
              </div>
              
              {/* Drop Course Button */}
              <button
                onClick={() => handleDropCourse(course.id)}
                disabled={dropCourseMutation.isPending}
                className="flex items-center justify-center gap-2 bg-white text-red-500 border border-red-500 py-1 px-3 rounded-md font-medium hover:bg-red-50 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {dropCourseMutation.isPending ? (
                  <span className="animate-pulse">Processing...</span>
                ) : (
                  <>
                    <FaTrash className="text-sm" />
                    Drop
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Back to My Courses link */}
      <div className="mt-8 text-center">
        <Link
          to="/courses"
          className="text-pink-600 hover:text-pink-700"
        >
          Back to My Courses
        </Link>
      </div>
    </div>
  );
}
