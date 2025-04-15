// feedback.route.js
import express from "express";
import { 
    getFeedback, 
    checkFeedbackStatus,
    submitFeedback,
    getCourseFacultyDetails,
    getCourseDetails
} from "../controllers/feedback.controller.js";

const router = express.Router();

router.get("/faculty/:facultyId/:courseCode", getFeedback);
router.get("/status/:userId/:courseCode/:facultyId", checkFeedbackStatus);
router.post("/submit", submitFeedback);
router.get("/course/:courseCode/faculty", getCourseFacultyDetails);
router.get("/course/:courseCode/details", getCourseDetails);

export default router;
