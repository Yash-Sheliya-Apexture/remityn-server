// // backend/src/routes/admin/stats.admin.routes.js
// import express from 'express';
// import statsAdminController from '../../controllers/admin/stats.admin.controller.js';
// // The authMiddleware (protect, admin) will be applied in server.js for the base path

// const router = express.Router();

// // GET /api/admin/stats/overview
// router.get(
//   '/overview',
//   statsAdminController.getDashboardOverview
// );

// // --- NEW: Route for chart data ---
// router.get('/chart-data', statsAdminController.getVolumeChartData);
// // --- END NEW ---

// export default router;

// backend/src/routes/admin/stats.admin.routes.js
import express from 'express';
import statsAdminController from '../../controllers/admin/stats.admin.controller.js';
// The authMiddleware (protect, admin) will be applied in server.js for the base path

const router = express.Router();

// GET /api/admin/stats/overview
router.get(
  '/overview',
  statsAdminController.getDashboardOverview
);

// GET /api/admin/stats/chart-data (for volume charts)
// Now accepts ?type=&range=&groupBy= (groupBy is optional, defaults to 'time')
router.get('/chart-data', statsAdminController.getVolumeChartData);

// GET /api/admin/stats/balance-distribution
router.get('/balance-distribution', statsAdminController.getBalanceDistributionStats);


export default router;