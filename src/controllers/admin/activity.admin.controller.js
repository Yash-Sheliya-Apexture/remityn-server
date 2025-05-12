// backend/src/controllers/admin/activity.admin.controller.js
import activityAdminService from '../../services/admin/activity.admin.service.js';

const getRecentActivities = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 5; // Default for dashboard
        const { startDate, endDate, type } = req.query; // Get date and type filters

        // Validate date strings if provided (basic validation)
        // More robust validation can be added (e.g., using a library like Joi or validator.js)
        const sDate = startDate && moment(startDate, "YYYY-MM-DD", true).isValid() ? startDate : null;
        const eDate = endDate && moment(endDate, "YYYY-MM-DD", true).isValid() ? endDate : null;
        const activityTypeFilter = type || null;


        const result = await activityAdminService.getRecentActivities(limit, page, sDate, eDate, activityTypeFilter);
        res.status(200).json({
            success: true,
            data: result.activities,
            pagination: {
                page: result.page,
                limit: result.limit,
                totalItems: result.total,
                totalPages: result.totalPages,
                filtersApplied: { // Send back applied filters for clarity
                    startDate: sDate,
                    endDate: eDate,
                    type: activityTypeFilter
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

export default {
    getRecentActivities,
};