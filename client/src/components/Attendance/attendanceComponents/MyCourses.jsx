import Course from "./Course";
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { RoleContext } from "../../../context/Rolecontext";
import SearchableStudentDropdown from "./SearchableStudentDropdown";
import AttendanceApprovalDashboard from "./AttendanceApprovalDashboard";
import SiteAlert from "./siteAlert";

function MyCourses() {
    const navigateTo = useNavigate();
    const { role } = useContext(RoleContext);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [overall, setOverall] = useState(true); // true means safe, false means alert

    const [selectedStudent, setSelectedStudent] = useState("");
    const [showStats, setShowStats] = useState(false);

    const showStudentStats = (rollNo) => {
        console.log("#$#$")
        console.log(rollNo)
        setSelectedStudent(rollNo);
        fetchStudentCourses(rollNo); // Use the parameter directly
        setShowStats(true);
    };

    const fetchStudentCourses = async (rollNo) => {
        try {
            const response = await fetch("http://localhost:8000/api/attendancelanding/student", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "rollno": rollNo
                }
            });
    
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }
    
            const data = await response.json();
    
            const formattedCourses = data.attendance.map(course => ({
                courseId: course.courseCode,
                courseName: course.courseName,
                attendance: `${course.percentage}%`,
                percentage: course.percentage
            }));
            
            setCourses(formattedCourses);
            //turn formattedCourses;
        } catch (error) {
            console.error("Error fetching student courses:", error);
            throw error; // Re-throw for caller to handle
        }
    };

    useEffect(() => {
        // Set user data in localStorage for testing
        if (role === "student") {
            localStorage.setItem("currentUser", JSON.stringify({ user: { rollNo: "2" } }));
        } else if (role === "faculty") {
            localStorage.setItem("currentUser", JSON.stringify({ user: { userId: "F1" } }));
        }
    }, [role]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);

                if (role === "student") {
                    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
                    const rollNo = currentUser?.user?.rollNo;

                    if (!rollNo) {
                        throw new Error("Roll number not found in localStorage.");
                    }

                    const response = await fetch("http://localhost:8000/api/attendancelanding/student", {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "rollno": rollNo
                        }
                    });

                    if (!response.ok) {
                        throw new Error(`Server responded with status: ${response.status}`);
                    }

                    const data = await response.json();

                    const formattedCourses = data.attendance.map(course => ({
                        courseId: course.courseCode,
                        courseName: course.courseName,
                        attendance: `${course.percentage}%`,
                        percentage: course.percentage
                    }));

                    // Check for any course with attendance below 75%
                    const hasLowAttendance = formattedCourses.some(course => course.percentage < 75);
                    setOverall(!hasLowAttendance);

                    setCourses(formattedCourses);
                } else if (role === "faculty") {
                    // Fetch faculty courses from the backend
                    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
                    const userId = currentUser?.user?.userId;

                    if (!userId) {
                        throw new Error("Faculty ID not found in localStorage.");
                    }

                    const response = await fetch("http://localhost:8000/api/attendancelanding/faculty", {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "userid": userId
                        }
                    });

                    if (!response.ok) {
                        throw new Error(`Server responded with status: ${response.status}`);
                    }

                    const data = await response.json();

                    if (!data.success) {
                        throw new Error(data.message || "Failed to fetch faculty courses");
                    }

                    // Format the courses for display
                    const formattedCourses = data.data.map(course => ({
                        courseId: course.courseCode,
                        courseName: course.courseName || `Course ${course.courseCode}`,
                        averageAttendance: `${course.attendancePercentage}%`,
                        totalStudents: course.totalStudents
                    }));
                    console.log(formattedCourses);
                    setCourses(formattedCourses);
                }
            } catch (error) {
                console.error("Error fetching courses:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [role]);

    const handleStudentChange = async (e) => {
        const rollNumber = e.target.value;
        setSelectedStudent(rollNumber);

        if (rollNumber) {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:8000/api/attendancelanding/${rollNumber}`);

                if (!response.ok) {
                    throw new Error(`Server responded with status: ${response.status}`);
                }

                const data = await response.json();

                const formattedCourses = data.attendance.map(course => ({
                    courseId: course.courseCode,
                    courseName: course.courseName,
                    attendance: `${course.percentage}%`,
                    percentage: course.percentage
                }));

                const hasLowAttendance = formattedCourses.some(course => course.percentage < 75);
                setOverall(!hasLowAttendance);

                setCourses(formattedCourses);
                setShowStats(true);
            } catch (error) {
                console.error("Error fetching student data:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        } else {
            setShowStats(false);
        }
    };

    return (
        <div className="courses" id="my_courses">
            {role === "student" && <div className="text-wrapper-2">My Courses</div>}
            {role === "student" && !overall && <SiteAlert />}
            {role === "faculty" && <div className="text-wrapper-2">My Courses</div>}
            {role === "acadAdmin" && <AttendanceApprovalDashboard />}
            {role === "acadAdmin" && <h1 className="text-2xl font-bold text-gray-800 ml-5">Search Student Attendance:</h1>}
            {role === "acadAdmin" && (
                <SearchableStudentDropdown 
                onStudentSelect={showStudentStats}  // Add this prop
              />
            )}

            {loading ? (
                <p>Loading courses...</p>
            ) : error ? (
                <p>Error loading courses: {error}</p>
            ) : courses.length > 0 ? (
                role === "student" || (role === "acadAdmin" && showStats) ? (
                    <Course courses={courses} />
                ) : role === "faculty" ? (
                    <Course courses={courses} />
                ) : (
                    <p>No courses available for your role.</p>
                )
            ) : (
                <p>No courses found.</p>
            )}
        </div>
    );
}

export default MyCourses;