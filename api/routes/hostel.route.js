import express from "express";
import { studentLeave, getStudentLeave, getAllLeaves, updateAnyLeave } from "../controllers/hostel.controller.js";
import { hostelTransfer,getStudentTransfer, getAllTransferRequests, updateTransferRequest} from "../controllers/hostel.controller.js";

const router = express.Router();

router.post("/leave",studentLeave);
router.get("/:id/leaves", getStudentLeave);
router.get("/leaves", getAllLeaves);
router.put("/leaves/:id", updateAnyLeave);

router.post("/transfer", hostelTransfer);
router.get("/:id/transfer-requests", getStudentTransfer);
router.get("/transfer-requests", getAllTransferRequests);
router.put("/transfer-requests/:id", updateTransferRequest);

export default router;