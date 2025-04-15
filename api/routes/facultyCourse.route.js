import express from 'express';
import {getStudentsByCourse, getFacultyCourses } from "../controllers/facultyCourse.controller.js"

const router = express.Router();



router.get('/courses/:id', getFacultyCourses);
router.get('/course-registrations/:courseCode', getStudentsByCourse);
export default router;
