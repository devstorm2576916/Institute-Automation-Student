import React, { useContext } from "react";
import SiteAlert from "./attendanceComponents/siteAlert";
import MyCourses from "./attendanceComponents/MyCourses";
import "./AttendanceLandingPage.css";
import { useEffect,useState } from "react";
import { RoleContext } from "../../context/Rolecontext";

function AttendanceLandingPage (){
  const { role } = useContext(RoleContext);
  return (
    <div className="landing-page">
      <div className="div">
        <div className="MyCourses"><MyCourses /></div>
        {/* <br/> */}
        {/* <Announcements /> */}
      </div>
    </div>
  );
};

export default AttendanceLandingPage;