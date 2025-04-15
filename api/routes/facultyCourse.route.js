import express from 'express';
import {getStudentsByCourse, getFacultyCourses, approveRegistrations } from "../controllers/facultyCourse.controller.js"

const router = express.Router();

router.get('/courses/:id', getFacultyCourses);
router.get('/course-registrations/:courseCode', getStudentsByCourse);
router.post('/approve-registrations', approveRegistrations);
export default router;
