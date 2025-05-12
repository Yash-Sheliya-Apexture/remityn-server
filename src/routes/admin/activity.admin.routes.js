// backend/src/routes/admin/activity.admin.routes.js
import express from 'express';
import activityAdminController from '../../controllers/admin/activity.admin.controller.js';
// Auth middleware (protect, admin) will be applied in server.js

const router = express.Router();

// GET /api/admin/activity
router.get('/', activityAdminController.getRecentActivities);

export default router;