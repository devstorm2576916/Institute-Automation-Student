import express from "express";
import { getCourseAnnouncements, addCourseAnnouncement, deleteCourseAnnouncement, updateCourseAnnouncement } from "../controllers/announcements.controller.js";
import { getCourseStudents, getFaculty, getFacultyCourses } from "../controllers/faculty.controller.js";


const router = express.Router();

// router.get('/', getByIds);
router.get('/:id', getFaculty);
router.get('/:id/courses', getFacultyCourses);
router.get('/courses/:courseId/announcements', getCourseAnnouncements);

router.post('/courses/:courseId/announcements/add', addCourseAnnouncement);
router.put('/courses/:courseId/announcements/:announcementId/update', updateCourseAnnouncement);
router.delete('/courses/:courseId/announcements/:announcementId/delete', deleteCourseAnnouncement);

router.get('/courses/:courseId/students', getCourseStudents);

export default router;