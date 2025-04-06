import React from "react";
import styles from "./ProfilePage.module.css"; // Reuse the same CSS

const FacultyProfile = () => {
  const faculty = {
    id_no: "F12345",
    name: "Dr. Priyanshu Pratyay",
    photo: "/student.jpg", // Reuse the same photo for now
    designation: "Assistant Professor",
    branch: "Computer Science & Engineering",
    yearOfJoining: 2018,
    fieldsOfInterests: ["Formal Verification", "ML for EDA"],
    education: ["Ph.D. - IIT Bombay", "M.Tech - NIT Trichy"],
    experience: ["Assistant Prof at IITG", "R&D Engineer at Intel"],
    courses: [
      { code: "CS101", name: "Data Structures", creditAudit: "Credit", year: 2023, session: "Autumn", status: "Approved" },
      { code: "CS202", name: "Operating Systems", creditAudit: "Credit", year: 2024, session: "Spring", status: "Pending" },
    ],
  };

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <img src={faculty.photo} alt="Faculty" className={styles.profilePhoto} />
        <div className={styles.profileInfo}>
          <h1>{faculty.name}</h1>
          <p><strong>ID No:</strong> <span>{faculty.id_no}</span></p>
          <p><strong>Designation:</strong> <span>{faculty.designation}</span></p>
          <p><strong>Branch:</strong> <span>{faculty.branch}</span></p>
          <p><strong>Year of Joining:</strong> <span>{faculty.yearOfJoining}</span></p>
        </div>
      </div>

      <div className={styles.facultySection}>
        <h2>Fields of Interest</h2>
        <ul>{faculty.fieldsOfInterests.map((field, idx) => <li key={idx}>{field}</li>)}</ul>
      </div>

      <div className={styles.facultySection}>
        <h2>Education</h2>
        <ul>{faculty.education.map((edu, idx) => <li key={idx}>{edu}</li>)}</ul>
      </div>

      <div className={styles.facultySection}>
        <h2>Experience</h2>
        <ul>{faculty.experience.map((exp, idx) => <li key={idx}>{exp}</li>)}</ul>
      </div>

      <div className={styles.courseSection}>
        <h2>Courses Taught</h2>
        <table>
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Course Name</th>
              <th>Credit/Audit</th>
              <th>Year</th>
              <th>Session</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {faculty.courses.map((course, index) => (
              <tr key={index}>
                <td>{course.code}</td>
                <td>{course.name}</td>
                <td>{course.creditAudit}</td>
                <td>{course.year}</td>
                <td>{course.session}</td>
                <td>{course.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FacultyProfile;
