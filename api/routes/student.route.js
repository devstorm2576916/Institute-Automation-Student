import express from "express";
import { getStudent, getStudentBonafideDetails } from "../controllers/student.controller.js";

const router=express.Router();

router.get("/:id",getStudent);
router.get("/:id/bonafide", getStudentBonafideDetails);

export default router;