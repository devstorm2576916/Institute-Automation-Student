import express from "express";
import {
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  filterApplications,
  addComment,
  addFeeStructure,
  getFeeBreakdown,
  toggleFeeBreakdownStatus,
  updateFeeBreakdown,
  getStudentsWithDocumentAccess,
  updateStudentDocumentAccess,
  bulkUpdateDocumentAccess,
} from "../controllers/acadAdmin.controller.js";

const router = express.Router();

// Document management routes
router.get("/documents/applications", getAllApplications);
router.get("/documents/applications/filter", filterApplications);
router.get("/documents/applications/:id", getApplicationById);
router.patch("/documents/applications/:id/status", updateApplicationStatus);
router.post("/documents/applications/:id/comment", addComment);

// Fee management routes
router.post("/feeControl/addFee", addFeeStructure);
router.get("/feeControl/getFeeBreakdown", getFeeBreakdown);
router.patch("/feeControl/toggleStatus/:id", toggleFeeBreakdownStatus);
router.put("/feeControl/updateFee/:id", updateFeeBreakdown);

// Document access control routes
router.get("/students/document-access", getStudentsWithDocumentAccess);
router.patch("/students/:id/document-access", updateStudentDocumentAccess);
router.post("/students/bulk-document-access", bulkUpdateDocumentAccess);

export default router;
