import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Unauthorized from './unauth';
import { RoleContext } from '../../context/Rolecontext';
import CourseAnnouncements from './studentAnnouncements';
import FacultyCourseAnnouncements from './facultyAnnouncements';

const AnnouncementWrapper = () => {
  const { role } = useContext(RoleContext);
  const navigate = useNavigate();

  switch (role) {
    case 'student':
      return <CourseAnnouncements />;
    case 'faculty':
      return <FacultyCourseAnnouncements />;    
    default:
      return <Unauthorized role={role} />;
  }
};

export default AnnouncementWrapper;