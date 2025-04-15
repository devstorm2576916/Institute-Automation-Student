import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const FacultyDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get userId from localStorage
  const { data: userData } = JSON.parse(localStorage.getItem("currentUser"));
  const { userId } = userData.user;

  const fetchFacultyCourses = async () => {
    try {
        console.log(userId);
      const response = await axios.get(`http://localhost:8000/api/facultyCourse/courses/${userId}` );

      if (response.data.success) {
        setCourses(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching faculty courses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchFacultyCourses();
    }
  }, [userId]);

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-4">Your Courses</h2>

      {loading ? (
        <p>Loading courses...</p>
      ) : courses.length === 0 ? (
        <p>No courses assigned.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {courses.map((course) => (
            <Link
              key={course._id}
              to={`/facultyregistration/${course.courseCode}`}
              className="block p-4 border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold">{course.courseName}</h3>
              <p className="text-sm text-gray-600">{course.courseCode}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;
