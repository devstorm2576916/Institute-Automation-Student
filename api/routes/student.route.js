import express from "express";
import { getStudent, getStudentCourses,dropCourse} from "../controllers/student.controller.js";

const router = express.Router();

router.get("/:id", getStudent);
// In your Express router file
router.get("/:id/courses", getStudentCourses);

// Add this route to your student.route.js file
router.delete("/:id/courses/:courseId", dropCourse);


export default router;