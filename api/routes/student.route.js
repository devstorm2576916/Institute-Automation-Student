import express from "express";
import { 
    getStudent, 
    getStudentCourses,
    dropCourse,
    getStudentBonafideDetails, 
    createBonafideApplication,
    getBonafideApplications,
    getStudentPassportDetails,
    submitPassportApplication,
    getPassportApplications,
    getCourseAnnouncements,
    createCourseDropRequest,
    getStudentDropRequests,
    cancelDropRequest,
    getCompletedCourses,
    updateStudentProfile,
    getAvailableCourses,
    submitCourseApprovalRequest,
    getPendingRequests,
} from "../controllers/student.controller.js";

//courses routes
const router = express.Router();
router.get("/:id", getStudent);
router.get("/:id/courses", getStudentCourses);

router.delete("/:id/courses/:courseId", dropCourse);
router.get('/courses/:courseId', getCourseAnnouncements);
router.get("/:id/completed-courses", getCompletedCourses); 


// Course drop request routes
router.post("/:id/drop-requests", createCourseDropRequest);
router.get("/:id/drop-requests", getStudentDropRequests);
router.delete("/:id/drop-requests/:requestId", cancelDropRequest);

router.delete("/:id/courses/:courseId",dropCourse);
router.put("/:id/profile", updateStudentProfile);


// Bonafide routes
router.get("/:id/bonafide", getStudentBonafideDetails);
router.post("/:id/bonafide/apply", createBonafideApplication);
router.get("/:id/bonafide/applications", getBonafideApplications);

// Passport routes
router.get('/:id/passport', getStudentPassportDetails);
router.post('/:id/passport/apply', submitPassportApplication);
router.get('/:id/passport/applications', getPassportApplications);


// Course approval request routes

// Fetch available courses
router.get("/:id/available-courses", getAvailableCourses);

// Submit a course approval request
router.post("/:id/course-approval", submitCourseApprovalRequest);

// Fetch pending requests
router.get("/:id/pending-requests", getPendingRequests);

export default router;
