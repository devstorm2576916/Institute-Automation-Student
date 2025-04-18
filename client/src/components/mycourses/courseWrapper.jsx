import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import FacultyCourses from './facultyCourse';
import MyCourses from './myCourse';
import Unauthorized from './unauthorized';
import { RoleContext } from '../../context/Rolecontext';

const CourseWrapper = () => {
  const { role } = useContext(RoleContext);
  const navigate = useNavigate();

  switch (role) {
    case 'student':
      return <MyCourses />;
    case 'faculty':
      return <FacultyCourses />;
    default:
      return <Unauthorized role={role} />;
  }
};

export default CourseWrapper;