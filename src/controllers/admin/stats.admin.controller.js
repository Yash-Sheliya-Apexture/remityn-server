// // backend/src/controllers/admin/stats.admin.controller.js
// import statsAdminService from '../../services/admin/stats.admin.service.js';
// import AppError from '../../utils/AppError.js'; // If you use it for specific error handling

// const getDashboardOverview = async (req, res, next) => {
//   try {
//     const stats = await statsAdminService.getDashboardOverviewStats();
//     res.status(200).json({
//       success: true,
//       data: stats,
//     });
//   } catch (error) {
//     // Pass error to the global error handler
//     next(error);
//   }
// };

// // --- NEW: Controller for chart data ---
// const getVolumeChartData = async (req, res, next) => {
//   try {
//       const { type, range } = req.query; // Get type (payments/transfers) and range (month/year) from query params

//       // --- MODIFIED VALIDATION ---
//       if (!type || !range || !['payments', 'transfers'].includes(type) || !['month', 'year', 'all'].includes(range)) {
//            return res.status(400).json({ success: false, message: 'Invalid or missing chart type or range parameters. Range must be month, year, or all.' });
//       }
//       // --- END MODIFIED VALIDATION ---
      
//       const chartData = await statsAdminService.getVolumeChartData(type, range);
//       res.status(200).json({ success: true, data: chartData });

//   } catch (error) {
//        console.error("Controller: getVolumeChartData - Error:", error);
//        // Don't expose internal errors directly in production
//        res.status(500).json({ success: false, message: 'Failed to retrieve chart data.' });
//        // Or use next(error) if your global handler is configured well
//        // next(error);
//   }
// };
// // --- END NEW ---



// // --- NEW: Controller for balance distribution chart data ---
// const getBalanceDistributionStats = async (req, res, next) => {
//   try {
//     const balanceData = await statsAdminService.getBalanceDistribution();
//     res.status(200).json({
//       success: true,
//       data: balanceData,
//     });
//   } catch (error) {
//     console.error("Controller: getBalanceDistributionStats - Error:", error);
//     // Pass to global error handler or send specific response
//     next(error); // Recommended
//     // res.status(500).json({ success: false, message: 'Failed to retrieve balance distribution data.' });
//   }
// };
// // --- END NEW ---



// export default {
//   getDashboardOverview,
//   getVolumeChartData, // <-- Export the new function
//   getBalanceDistributionStats, // <-- Export new function
// };

// backend/src/controllers/admin/stats.admin.controller.js
import statsAdminService from '../../services/admin/stats.admin.service.js';
import AppError from '../../utils/AppError.js'; // If you use it for specific error handling

const getDashboardOverview = async (req, res, next) => {
  try {
    const stats = await statsAdminService.getDashboardOverviewStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    // Pass error to the global error handler
    next(error);
  }
};

// --- NEW: Controller for chart data ---
const getVolumeChartData = async (req, res, next) => {
  try {
      const { type, range } = req.query; // Get type (payments/transfers) and range (month/year/all/by_currency) from query params

      // --- MODIFIED VALIDATION ---
      if (!type || !range || !['payments', 'transfers'].includes(type) || !['month', 'year', 'all', 'by_currency'].includes(range)) {
           return res.status(400).json({ success: false, message: 'Invalid or missing chart type or range parameters. Range must be month, year, all, or by_currency.' });
      }
      // --- END MODIFIED VALIDATION ---
      
      const chartData = await statsAdminService.getVolumeChartData(type, range);
      res.status(200).json({ success: true, data: chartData });

  } catch (error) {
       console.error("Controller: getVolumeChartData - Error:", error);
       // Don't expose internal errors directly in production
       res.status(500).json({ success: false, message: 'Failed to retrieve chart data.' });
       // Or use next(error) if your global handler is configured well
       // next(error);
  }
};
// --- END NEW ---



// --- NEW: Controller for balance distribution chart data ---
const getBalanceDistributionStats = async (req, res, next) => {
  try {
    const balanceData = await statsAdminService.getBalanceDistribution();
    res.status(200).json({
      success: true,
      data: balanceData,
    });
  } catch (error) {
    console.error("Controller: getBalanceDistributionStats - Error:", error);
    // Pass to global error handler or send specific response
    next(error); // Recommended
    // res.status(500).json({ success: false, message: 'Failed to retrieve balance distribution data.' });
  }
};
// --- END NEW ---



export default {
  getDashboardOverview,
  getVolumeChartData, // <-- Export the new function
  getBalanceDistributionStats, // <-- Export new function
};