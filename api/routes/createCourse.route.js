// routes/createCourseRoute.js
import express from "express";
//import { Course, FacultyCourse, ProgramCourseMapping } from "../models/course.model.js";
import { createCourse } from "../controllers/createCourse.controller.js";
const router = express.Router();


router.post("/register-course", createCourse);

export default router;
