import express from "express";
import { getStudent, getStudentCourses } from "../controllers/student.controller.js";

const router = express.Router();

router.get("/:id", getStudent);
// In your Express router file
router.get("/:id/courses", getStudentCourses);

export default router;