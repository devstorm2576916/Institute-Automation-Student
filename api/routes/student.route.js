import express from "express";
import { 
    getStudent, 
    getStudentBonafideDetails, 
    createBonafideApplication,
    getBonafideApplications,
    getStudentPassportDetails,
    submitPassportApplication,
    getPassportApplications,
    updateStudentProfile
} from "../controllers/student.controller.js";

const router = express.Router();

// Basic student routes
router.get("/:id", getStudent);
router.put("/:id/profile", updateStudentProfile);

// Bonafide routes
router.get("/:id/bonafide", getStudentBonafideDetails);
router.post("/:id/bonafide/apply", createBonafideApplication);
router.get("/:id/bonafide/applications", getBonafideApplications);

// Passport routes
router.get('/:id/passport', getStudentPassportDetails);
router.post('/:id/passport/apply', submitPassportApplication);
router.get('/:id/passport/applications', getPassportApplications);

export default router;