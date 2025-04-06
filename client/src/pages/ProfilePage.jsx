import React from "react";
import StudentProfile from "../components/ProfilePage/studentProfile.jsx";
import FacultyProfile from "../components/ProfilePage/facultyProfile.jsx";
import { useContext } from "react";
import { RoleContext } from "../context/Rolecontext.jsx";
const ProfilePage = ({ }) => {

  const { role } = useContext(RoleContext);

  return role === "student" ? <StudentProfile /> : <FacultyProfile />;
};

export default ProfilePage;


