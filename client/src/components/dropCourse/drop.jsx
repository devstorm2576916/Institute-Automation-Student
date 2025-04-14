import { useState } from "react";
import { FaRegClock } from "react-icons/fa";

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
    }
  };

  const enrolledCourses = studentCourses.filter(course => course.status === "enrolled");
  const pendingCourses = studentCourses.filter(course => course.status === "pending");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Drop Courses</h1>
      
      {/* Enrolled Courses Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Currently Enrolled Courses</h2>
        {enrolledCourses.length === 0 ? (
          <div className="bg-gray-100 p-4 rounded-lg text-center">
            <p className="text-gray-700">You are not enrolled in any courses.</p>
          </div>
        ) : (
          <div className="flex flex-col space-y-2">
            {enrolledCourses.map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between bg-white p-4 rounded-lg shadow border border-gray-200"
              >
                {/* Course Code and Name */}
                <div className="flex items-center space-x-4">
                  <span className="font-bold text-pink-500">{course.id}</span>
                  <span className="text-gray-800">{course.name}</span>
                </div>
                
                {/* Request Drop Button */}
                <button
                  onClick={() => handleRequestDropCourse(course.id)}
                  className="flex items-center justify-center gap-2 bg-white text-red-500 border border-red-500 py-1 px-3 rounded-md font-medium hover:bg-red-50 transition duration-300"
                >
                  Request Drop
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Pending Drop Requests Section */}
      {pendingCourses.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Pending Drop Requests</h2>
          <div className="flex flex-col space-y-2">
            {pendingCourses.map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between bg-yellow-50 p-4 rounded-lg shadow border border-yellow-200"
              >
                {/* Course Code and Name */}
                <div className="flex items-center space-x-4">
                  <span className="font-bold text-pink-500">{course.id}</span>
                  <span className="text-gray-800">{course.name}</span>
                  <span className="flex items-center text-yellow-600 text-sm">
                    <FaRegClock className="mr-1" /> Pending approval
                  </span>
                </div>
                
                {/* Cancel Request Button */}
                <button
                  onClick={() => handleCancelDropRequest(course.id)}
                  className="flex items-center justify-center gap-2 bg-white text-gray-500 border border-gray-300 py-1 px-3 rounded-md font-medium hover:bg-gray-50 transition duration-300"
                >
                  Cancel Request
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}