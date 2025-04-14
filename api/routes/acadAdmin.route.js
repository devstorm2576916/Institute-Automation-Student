import express from 'express';
import {
    getAllApplications,
    getApplicationById,
    updateApplicationStatus,
    filterApplications,
    addComment,
    getDropRequests,
    updateDropRequestStatus,
} from '../controllers/acadAdmin.controller.js';

const router = express.Router();

// Document management routes
router.get('/documents/applications', getAllApplications);
router.get('/documents/applications/filter', filterApplications);
router.get('/documents/applications/:id', getApplicationById);
router.patch('/documents/applications/:id/status', updateApplicationStatus);
router.post('/documents/applications/:id/comment', addComment);

// Course drop request routes (ADMIN)
router.get('/drop-requests', getDropRequests); // Get all drop requests (any status)
router.get('/drop-requests/:requestId', updateDropRequestStatus); // Get a specific drop request
router.patch('/drop-requests/:requestId', updateDropRequestStatus); // Update status/remarks

export default router;
