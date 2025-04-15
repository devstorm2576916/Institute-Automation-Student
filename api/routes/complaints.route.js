import express from "express";
import ComplaintsController from "../controllers/complaints.controller.js";
import { validateAccessToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get('/', validateAccessToken, ComplaintsController.getUserComplaints);
router.get('/admin',validateAccessToken, ComplaintsController.getAllComplaints);
router.post('/create',validateAccessToken, ComplaintsController.createComplaint);
router.delete('/delete',validateAccessToken, ComplaintsController.deleteComplaint);
router.patch('/admin/updateStatus', validateAccessToken,ComplaintsController.updateStatus);
router.patch('/admin/assign',validateAccessToken, ComplaintsController.assignComplaint);
// router.post('/admin/supportStaff',validateAccessToken, ComplaintsController.createSupportStaff);
// router.delete('/admin/supportStaff',validateAccessToken, ComplaintsController.deleteSupportStaff);
// router.get('/admin/supportStaff',validateAccessToken, ComplaintsController.getAllSupportStaff);

export default router;