import React from "react";
import styles from "./ProfilePage.module.css";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
const StudentProfile = () =>{

    const {data:userData} = JSON.parse(localStorage.getItem("currentUser"));
    const {email, userId} = userData.user;
    console.log(email);
    console.log(userData);
    const { isLoading, error, data } = useQuery({
        queryKey: [`${userId}`],
        queryFn: () =>
            newRequest.get(`/student/${userId}`).then((res) => {
                return res.data;
            }),
    });

    const { isLoadingCourses, errorCourses, data: studentCourses = [] } = useQuery({
        queryKey: ["completed-courses"],
        queryFn: () =>
          newRequest.get(`/student/${userId}/completed-courses`).then((res) => {
            console.log("Course data received:", res.data);
            return res.data.courses || [];
          }),
      });

    console.log(data)
    console.log("courses: ", studentCourses)
    const student = {
        rollNumber: data?.rollNo,
        name: data?.userId?.name,
        photo: data?.userId?.profilePhoto || "/student.jpg", // Place a placeholder student image in `public/` folder
        signphoto: data?.userId?.signature || "/sign.jpg",
        hostel: data?.hostel,
        email: data?.email,
        Bloodgr: data?.userId?.bloodGroup,
        contactno: data?.userId?.contactNo,
        dob: data?.userId?.dateOfBirth,
        roomNo: data?.roomNo,
        semester: data?.semester,
        branch: data?.department,
        yearOfJoining: data?.batch.substr(0, 4),
        programme: data?.program,
        // facultyAdvisors: ["Dr. Aryabartta Sahu", "Prof. XYZ"],
        courses: studentCourses,
      };
    return (
        <>
          {isLoading? <p>Loading...</p> : error ? <p>Error: {error.message}</p> : 
            <div className={styles.profileContainer}>
                <img src={student.photo} alt="Student" className={styles.profilePhoto} />
                <img src={student.signphoto} alt="Student" className={styles.signPhoto} />
            <div className={styles.profileHeader}>
            <div/>
                <div className={styles.profileInfo}>
                    <h1>{student.name}</h1>
                    <p><strong>Roll No:</strong> <span>{student.rollNumber}</span></p>
                    <p><strong>Hostel:</strong> <span>{student.hostel}</span></p>
                    <p><strong>Semester:</strong> <span>{student.semester}</span></p>
                    <p><strong>Room Number:</strong> <span>{student.roomNo}</span></p>
                    <p><strong>Email:</strong> <span>{student.email}</span></p>
                    <p><strong>Blood Group:</strong> <span>{student.Bloodgr}</span></p>
                    <p><strong>Contact Number:</strong> <span>{student.contactno}</span></p>
                    <p><strong>DOB:</strong> <span>{student.dob}</span></p>
                    <p><strong>Branch:</strong> <span>{student.branch}</span></p>
                    <p><strong>Year of Joining:</strong> <span>{student.yearOfJoining}</span></p>
                    <p><strong>Programme:</strong> <span>{student.programme}</span></p>
                </div>
            </div>

            {/* Faculty Advisors */}
            {/* <div className={styles.facultySection}>
                <h2>Faculty Advisor(s)</h2>
                <ul>
                {student.facultyAdvisors.map((advisor, index) => (
                    <li key={index}>{advisor}</li>
                ))}
                </ul>
            </div> */}

            {/* Courses Table */}
            {isLoadingCourses? <p>Loading...</p> : errorCourses ? <p>Error: {error.message}</p> : 
            <div className={styles.courseSection}>
                <h2>Completed Courses</h2>
                <table>
                <thead>
                    <tr>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Department</th>
                    <th>Credit/Audit</th>
                    <th>Semester</th>
                    <th>Credits</th>
                    <th>Grade</th>
                    </tr>
                </thead>
                <tbody>
                    {student.courses.map((course, index) => (
                    <tr key={index}>
                        <td>{course.courseCode}</td>
                        <td>{course.courseName}</td>
                        <td>{course.department}</td>
                        <td>{course.creditOrAudit}</td>
                        <td>{course.semester}</td>
                        <td>{course.credits}</td>
                        <td>{course.grade}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>}
            </div>
        }
        </>
    );
}

export default StudentProfile;
