import React from "react";
import styles from "./ProfilePage.module.css"; // Import CSS file

const StudentProfile = () => {
  const student = {
    rollNumber: "220101125",
    name: "Priyanshu Pratyay",
    photo: "/tnmy.png", // Place a student image in `public/` folder
    hostel: "Brahmaputra Hostel",
    branch: "Computer Science & Engineering",
    yearOfJoining: 2021,
    programme: "B.Tech",
    facultyAdvisors: ["Dr. Aryabartta Sahu", "Prof. XYZ"],
    courses: [
      { code: "CS101", name: "Data Structures", creditAudit: "Credit", year: 2023, session: "Autumn", status: "Approved", grade: "A" },
      { code: "CS202", name: "Operating Systems", creditAudit: "Credit", year: 2024, session: "Spring", status: "Pending", grade: "NA" },
       { code: "CS202", name: "Operating Systems", creditAudit: "Credit", year: 2024, session: "Spring", status: "Pending", grade: "NA" }
    ],
  };

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <img src={student.photo} alt="Student" className={styles.profilePhoto} />
        <div className={styles.profileInfo}>
            <h1>{student.name}</h1>
            <p><strong>Roll No:</strong> <span>{student.rollNumber}</span></p>
            <p><strong>Hostel:</strong> <span>{student.hostel}</span></p>
            <p><strong>Branch:</strong> <span>{student.branch}</span></p>
            <p><strong>Year of Joining:</strong> <span>{student.yearOfJoining}</span></p>
            <p><strong>Programme:</strong> <span>{student.programme}</span></p>
        </div>
      </div>

      {/* Faculty Advisors */}
      <div className={styles.facultySection}>
        <h2>Faculty Advisor(s)</h2>
        <ul>
          {student.facultyAdvisors.map((advisor, index) => (
            <li key={index}>{advisor}</li>
          ))}
        </ul>
      </div>

      {/* Courses Table */}
      <div className={styles.courseSection}>
        <h2>Enrolled Courses</h2>
        <table>
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Course Name</th>
              <th>Credit/Audit</th>
              <th>Year</th>
              <th>Session</th>
              <th>Approval Status</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {student.courses.map((course, index) => (
              <tr key={index}>
                <td>{course.code}</td>
                <td>{course.name}</td>
                <td>{course.creditAudit}</td>
                <td>{course.year}</td>
                <td>{course.session}</td>
                <td>{course.status}</td>
                <td>{course.grade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentProfile;
