// // backend/src/services/admin/stats.admin.service.js
// import User from '../../models/User.js';
// import Payment from '../../models/Payment.js';
// import Transfer from '../../models/Transfer.js';
// import moment from 'moment';

// // Helper to get the start of the current week (Monday as the first day)
// const getStartOfWeek = () => {
//     return moment().startOf('isoWeek').toDate();
// };

// // Helper to get date ranges
// const getTodayRange = () => {
//     const startOfToday = moment().startOf('day').toDate();
//     const endOfToday = moment().endOf('day').toDate();
//     return { start: startOfToday, end: endOfToday };
// };

// const getYesterdayRange = () => {
//     const startOfYesterday = moment().subtract(1, 'days').startOf('day').toDate();
//     const endOfYesterday = moment().subtract(1, 'days').endOf('day').toDate();
//     return { start: startOfYesterday, end: endOfYesterday };
// };

// const getCurrentMonthRange = () => {
//     const startOfMonth = moment().startOf('month').toDate();
//     const endOfMonth = moment().endOf('month').toDate();
//     return { start: startOfMonth, end: endOfMonth };
// };

// const getPreviousMonthRange = () => {
//     const startOfPreviousMonth = moment().subtract(1, 'month').startOf('month').toDate();
//     const endOfPreviousMonth = moment().subtract(1, 'month').endOf('month').toDate();
//     return { start: startOfPreviousMonth, end: endOfPreviousMonth };
// };

// const getThirtyDayRange = () => {
//     const endOfToday = moment().endOf('day').toDate();
//     const startOfPeriod = moment().subtract(29, 'days').startOf('day').toDate(); // Last 30 days including today
//     return { start: startOfPeriod, end: endOfToday };
// };

// const getPreviousThirtyDayRange = () => {
//     const endOfPreviousPeriod = moment().subtract(30, 'days').endOf('day').toDate();
//     const startOfPreviousPeriod = moment().subtract(59, 'days').startOf('day').toDate(); // 30 days before the current 30-day period
//     return { start: startOfPreviousPeriod, end: endOfPreviousPeriod };
// };

// const getCorridorAnalysisPeriod = () => {
//     // Analyze corridors over the last 90 days
//     const endOfPeriod = moment().endOf('day').toDate();
//     const startOfPeriod = moment().subtract(89, 'days').startOf('day').toDate();
//     return { start: startOfPeriod, end: endOfPeriod };
// };



// const getDashboardOverviewStats = async () => {
//     try {
//         // --- User Stats ---
//         const totalUsers = await User.countDocuments();
//         const startOfWeek = getStartOfWeek();
//         const usersAtStartOfWeek = await User.countDocuments({ createdAt: { $lt: startOfWeek } });
//         const newUsersThisWeekCount = totalUsers - usersAtStartOfWeek;
//         let growthPercentageThisWeek = 0;
//         if (usersAtStartOfWeek > 0) {
//             growthPercentageThisWeek = (newUsersThisWeekCount / usersAtStartOfWeek) * 100;
//         } else if (newUsersThisWeekCount > 0) {
//             growthPercentageThisWeek = 100.0;
//         }

//         // --- "Add Money" (Payment) Stats ---
//         const todayDateRange = getTodayRange(); // Use consistent naming
//         const yesterdayDateRange = getYesterdayRange(); // Use consistent naming

//         const todaysAddMoneyCount = await Payment.countDocuments({
//             createdAt: { $gte: todayDateRange.start, $lte: todayDateRange.end },
//         });
//         const yesterdaysAddMoneyCount = await Payment.countDocuments({
//             createdAt: { $gte: yesterdayDateRange.start, $lte: yesterdayDateRange.end },
//         });
//         let addMoneyChangePercentage = 0;
//         if (yesterdaysAddMoneyCount > 0) {
//             addMoneyChangePercentage = ((todaysAddMoneyCount - yesterdaysAddMoneyCount) / yesterdaysAddMoneyCount) * 100;
//         } else if (todaysAddMoneyCount > 0) {
//             addMoneyChangePercentage = 100.0;
//         }

//         // --- "Send Money" (Transfer Initiation) Stats ---
//         const todaysSendMoneyCount = await Transfer.countDocuments({
//             createdAt: { $gte: todayDateRange.start, $lte: todayDateRange.end },
//             // status: { $ne: 'canceled' } // Optional: filter out immediately canceled
//         });
//         const yesterdaysSendMoneyCount = await Transfer.countDocuments({
//             createdAt: { $gte: yesterdayDateRange.start, $lte: yesterdayDateRange.end },
//             // status: { $ne: 'canceled' } // Optional: filter out immediately canceled
//         });
//         let sendMoneyChangePercentage = 0;
//         if (yesterdaysSendMoneyCount > 0) {
//             sendMoneyChangePercentage = ((todaysSendMoneyCount - yesterdaysSendMoneyCount) / yesterdaysSendMoneyCount) * 100;
//         } else if (todaysSendMoneyCount > 0) {
//             sendMoneyChangePercentage = 100.0;
//         }

//         // --- "Completed Transfers" Stats ---
//         const currentMonthDateRange = getCurrentMonthRange(); // Use consistent naming
//         const previousMonthDateRange = getPreviousMonthRange(); // Use consistent naming

//         const completedTransfersThisMonth = await Transfer.countDocuments({
//             status: 'completed',
//             updatedAt: { $gte: currentMonthDateRange.start, $lte: currentMonthDateRange.end }
//         });
//         const completedTransfersLastMonth = await Transfer.countDocuments({
//             status: 'completed',
//             updatedAt: { $gte: previousMonthDateRange.start, $lte: previousMonthDateRange.end }
//         });
//         let completedTransfersChangeCount = completedTransfersThisMonth - completedTransfersLastMonth;

//         // --- Transfer Volume Stats (Last 30 Days) ---
//         const currentVolumePeriod = getThirtyDayRange();
//         const previousVolumePeriod = getPreviousThirtyDayRange();

//         const currentPeriodVolumeResult = await Transfer.aggregate([
//             {
//                 $match: {
//                     status: 'completed',
//                     updatedAt: { $gte: currentVolumePeriod.start, $lte: currentVolumePeriod.end }
//                 }
//             },
//             {
//                 $group: {
//                     _id: null,
//                     totalVolume: { $sum: "$sendAmount" }
//                 }
//             }
//         ]);
//         const totalVolumeLast30Days = currentPeriodVolumeResult.length > 0 ? currentPeriodVolumeResult[0].totalVolume : 0;

//         const previousPeriodVolumeResult = await Transfer.aggregate([
//             {
//                 $match: {
//                     status: 'completed',
//                     updatedAt: { $gte: previousVolumePeriod.start, $lte: previousVolumePeriod.end }
//                 }
//             },
//             {
//                 $group: {
//                     _id: null,
//                     totalVolume: { $sum: "$sendAmount" }
//                 }
//             }
//         ]);
//         const totalVolumePrevious30Days = previousPeriodVolumeResult.length > 0 ? previousPeriodVolumeResult[0].totalVolume : 0;
//         let volumeGrowthPercentage = 0;
//         if (totalVolumePrevious30Days > 0) {
//             volumeGrowthPercentage = ((totalVolumeLast30Days - totalVolumePrevious30Days) / totalVolumePrevious30Days) * 100;
//         } else if (totalVolumeLast30Days > 0) {
//             volumeGrowthPercentage = 100.0;
//         }

//         // --- Popular Corridors Stats (e.g., Last 90 Days) ---
//         const corridorPeriod = getCorridorAnalysisPeriod();
//         const popularCorridorsPipeline = [
//             {
//                 $match: {
//                     status: 'completed',
//                     updatedAt: { $gte: corridorPeriod.start, $lte: corridorPeriod.end }
//                 }
//             },
//             {
//                 $lookup: {
//                     from: 'currencies',
//                     localField: 'sendCurrency',
//                     foreignField: '_id',
//                     as: 'sendCurrencyDoc'
//                 }
//             },
//             { $unwind: '$sendCurrencyDoc' },
//             {
//                 $lookup: {
//                     from: 'currencies',
//                     localField: 'receiveCurrency',
//                     foreignField: '_id',
//                     as: 'receiveCurrencyDoc'
//                 }
//             },
//             { $unwind: '$receiveCurrencyDoc' },
//             {
//                 $group: {
//                     _id: {
//                         send: '$sendCurrencyDoc.code',
//                         receive: '$receiveCurrencyDoc.code'
//                     },
//                     count: { $sum: 1 }
//                 }
//             },
//             {
//                 $project: {
//                     _id: 0,
//                     sendCurrencyCode: '$_id.send',
//                     receiveCurrencyCode: '$_id.receive',
//                     count: '$count'
//                 }
//             },
//             { $sort: { count: -1 } },
//             { $limit: 4 }
//         ];
//         const topCorridorsRaw = await Transfer.aggregate(popularCorridorsPipeline);

//         const totalCompletedTransfersInCorridorPeriod = await Transfer.countDocuments({
//             status: 'completed',
//             updatedAt: { $gte: corridorPeriod.start, $lte: corridorPeriod.end }
//         });

//         const popularCorridors = topCorridorsRaw.map(corridor => ({
//             ...corridor,
//             percentage: totalCompletedTransfersInCorridorPeriod > 0
//                 ? parseFloat(((corridor.count / totalCompletedTransfersInCorridorPeriod) * 100).toFixed(1))
//                 : 0
//         }));


//         // --- NEW: KYC Status Counts ---
//         const kycPendingCount = await User.countDocuments({ 'kyc.status': 'pending' });
//         const kycVerifiedCount = await User.countDocuments({ 'kyc.status': 'verified' });
//         const kycSkippedCount = await User.countDocuments({ 'kyc.status': 'skipped' }); // Assuming 'skipped' is a status you track



//         return {
//             totalUsers,
//             growthPercentageThisWeek: parseFloat(growthPercentageThisWeek.toFixed(1)),
//             todaysAddMoneyCount,
//             addMoneyChangePercentage: parseFloat(addMoneyChangePercentage.toFixed(1)),
//             todaysSendMoneyCount,
//             sendMoneyChangePercentage: parseFloat(sendMoneyChangePercentage.toFixed(1)),
//             completedTransfersThisMonth,
//             completedTransfersChangeCount,
//             totalVolumeLast30Days: parseFloat(totalVolumeLast30Days.toFixed(2)),
//             volumeGrowthPercentage: parseFloat(volumeGrowthPercentage.toFixed(1)),
//             popularCorridors,
//             kycPendingCount,
//             kycVerifiedCount,
//             kycSkippedCount,
//         };
//     } catch (error) {
//         console.error("Error in getDashboardOverviewStats service:", error);
//         // It's better to throw a more generic error or let the controller handle AppError if used.
//         // For this service, a generic error is fine.
//         throw new Error("Failed to fetch dashboard overview statistics.");
//     }
// };

// // --- NEW: Function to get aggregated chart data ---
// const getVolumeChartData = async (type, range) => {
//     console.log(`Service: getVolumeChartData - Type: ${type}, Range: ${range}`);
//     let model;
//     let amountField;
//     let dateField = 'createdAt'; // Default to createdAt
//     let matchStage = {}; // Initial match stage

//     if (type === 'payments') {
//         model = Payment;
//         amountField = '$amountToAdd'; // Or '$amountToPay' if preferred
//         // Optionally add status filter for payments if needed
//          // matchStage = { status: { $in: ['completed', 'in progress'] } };
//     } else if (type === 'transfers') {
//         model = Transfer;
//         amountField = '$sendAmount';
//         // Filter for completed transfers for volume calculation
//         matchStage = { status: 'completed' };
//          // Use updatedAt for transfers as completion time is more relevant for volume
//          dateField = 'updatedAt';
//     } else {
//         throw new Error('Invalid chart type specified.');
//     }

//     let startDate;
//     let groupByFormat;
//     let dateProjectFormat;

//     const now = moment();

//     if (range === 'month') {
//         // Last 30 days (including today)
//         startDate = now.clone().subtract(29, 'days').startOf('day').toDate();
//         groupByFormat = '%Y-%m-%d'; // Group by Day
//         dateProjectFormat = '%Y-%m-%d';
//     } else if (range === 'year') {
//         // Last 12 months (including current month)
//         startDate = now.clone().subtract(11, 'months').startOf('month').toDate();
//         groupByFormat = '%Y-%m'; // Group by Month
//         dateProjectFormat = '%Y-%m-01'; // Represent month as first day for consistency
//     } else {
//         throw new Error('Invalid chart range specified.');
//     }

//     console.log(`Service: getVolumeChartData - Aggregating from date: ${startDate}`);

//     // Add date range to the match stage
//     matchStage[dateField] = { $gte: startDate };

//     const pipeline = [
//         { $match: matchStage },
//         {
//             $group: {
//                 _id: {
//                     // Group by Year-Month or Year-Month-Day based on range
//                     $dateToString: { format: groupByFormat, date: `$${dateField}` }
//                 },
//                 totalVolume: { $sum: amountField }
//             }
//         },
//         {
//             $project: {
//                 _id: 0,
//                 // Format date consistently for the chart's X-axis
//                 date: {
//                      $dateToString: { format: dateProjectFormat, date: { $toDate: "$_id" } }
//                 },
//                 // Ensure volume is a number, default to 0 if sum is null (no data for period)
//                 volume: { $ifNull: ["$totalVolume", 0] }
//             }
//         },
//         { $sort: { date: 1 } } // Sort by date ascending
//     ];

//     try {
//         const results = await model.aggregate(pipeline);
//         console.log(`Service: getVolumeChartData - Aggregation results count: ${results.length}`);

//          // --- Fill missing dates/months with 0 volume ---
//          const filledData = [];
//          let currentDate = moment(startDate);
//          const endDate = moment().endOf(range === 'month' ? 'day' : 'month'); // End of today or this month

//          const resultsMap = new Map(results.map(item => [moment(item.date).format(range === 'month' ? 'YYYY-MM-DD' : 'YYYY-MM'), item.volume]));

//          while (currentDate <= endDate) {
//             const formattedDateKey = currentDate.format(range === 'month' ? 'YYYY-MM-DD' : 'YYYY-MM');
//             const formattedDateOutput = currentDate.format('YYYY-MM-DD'); // Always use YYYY-MM-DD for recharts dataKey

//             filledData.push({
//                 date: formattedDateOutput,
//                 volume: resultsMap.get(formattedDateKey) || 0
//             });

//             if (range === 'month') {
//                 currentDate.add(1, 'day');
//             } else {
//                 currentDate.add(1, 'month');
//             }
//          }
//          // Return only the most recent entries if needed, e.g., last 30 days or 12 months rigorously
//           const finalData = filledData.slice(-(range === 'month' ? 30 : 12));


//          console.log(`Service: getVolumeChartData - Returning ${finalData.length} data points.`);
//         return finalData;

//     } catch (error) {
//         console.error(`Service: getVolumeChartData - Error aggregating data:`, error);
//         throw new Error(`Failed to aggregate chart data for ${type}.`);
//     }
// };


// export default {
//     getDashboardOverviewStats,
//     getVolumeChartData, // <-- Export the new function
// };

// // backend/src/services/admin/stats.admin.service.js
// import User from '../../models/User.js';
// import Payment from '../../models/Payment.js';
// import Transfer from '../../models/Transfer.js';
// import Account from '../../models/Account.js'; // <-- ADD THIS IMPORT
// import Currency from '../../models/Currency.js'; // <-- ADD THIS IMPORT (though Account populates it)
// import moment from 'moment';

// // Helper to get the start of the current week (Monday as the first day)
// const getStartOfWeek = () => {
//     return moment().startOf('isoWeek').toDate();
// };

// // Helper to get date ranges
// const getTodayRange = () => {
//     const startOfToday = moment().startOf('day').toDate();
//     const endOfToday = moment().endOf('day').toDate();
//     return { start: startOfToday, end: endOfToday };
// };

// const getYesterdayRange = () => {
//     const startOfYesterday = moment().subtract(1, 'days').startOf('day').toDate();
//     const endOfYesterday = moment().subtract(1, 'days').endOf('day').toDate();
//     return { start: startOfYesterday, end: endOfYesterday };
// };

// const getCurrentMonthRange = () => {
//     const startOfMonth = moment().startOf('month').toDate();
//     const endOfMonth = moment().endOf('month').toDate();
//     return { start: startOfMonth, end: endOfMonth };
// };

// const getPreviousMonthRange = () => {
//     const startOfPreviousMonth = moment().subtract(1, 'month').startOf('month').toDate();
//     const endOfPreviousMonth = moment().subtract(1, 'month').endOf('month').toDate();
//     return { start: startOfPreviousMonth, end: endOfPreviousMonth };
// };


// const getCorridorAnalysisPeriod = () => {
//     // Analyze corridors over the last 90 days
//     const endOfPeriod = moment().endOf('day').toDate();
//     const startOfPeriod = moment().subtract(89, 'days').startOf('day').toDate();
//     return { start: startOfPeriod, end: endOfPeriod };
// };



// const getDashboardOverviewStats = async () => {
//     try {
//         // --- User Stats ---
//         const totalUsers = await User.countDocuments();
//         const startOfWeek = getStartOfWeek();
//         const usersAtStartOfWeek = await User.countDocuments({ createdAt: { $lt: startOfWeek } });
//         const newUsersThisWeekCount = totalUsers - usersAtStartOfWeek;
//         let growthPercentageThisWeek = 0;
//         if (usersAtStartOfWeek > 0) {
//             growthPercentageThisWeek = (newUsersThisWeekCount / usersAtStartOfWeek) * 100;
//         } else if (newUsersThisWeekCount > 0) {
//             growthPercentageThisWeek = 100.0; // Infinite growth if starting from 0
//         }

//         // --- "Add Money" (Payment) Stats ---
//         const todayDateRange = getTodayRange();
//         const yesterdayDateRange = getYesterdayRange();

//         const todaysAddMoneyCount = await Payment.countDocuments({
//             createdAt: { $gte: todayDateRange.start, $lte: todayDateRange.end },
//         });
//         const yesterdaysAddMoneyCount = await Payment.countDocuments({
//             createdAt: { $gte: yesterdayDateRange.start, $lte: yesterdayDateRange.end },
//         });
//         let addMoneyChangePercentage = 0;
//         if (yesterdaysAddMoneyCount > 0) {
//             addMoneyChangePercentage = ((todaysAddMoneyCount - yesterdaysAddMoneyCount) / yesterdaysAddMoneyCount) * 100;
//         } else if (todaysAddMoneyCount > 0) {
//             addMoneyChangePercentage = 100.0; // Infinite growth
//         }

//         // --- "Send Money" (Transfer Initiation) Stats ---
//         const todaysSendMoneyCount = await Transfer.countDocuments({
//             createdAt: { $gte: todayDateRange.start, $lte: todayDateRange.end },
//         });
//         const yesterdaysSendMoneyCount = await Transfer.countDocuments({
//             createdAt: { $gte: yesterdayDateRange.start, $lte: yesterdayDateRange.end },
//         });
//         let sendMoneyChangePercentage = 0;
//         if (yesterdaysSendMoneyCount > 0) {
//             sendMoneyChangePercentage = ((todaysSendMoneyCount - yesterdaysSendMoneyCount) / yesterdaysSendMoneyCount) * 100;
//         } else if (todaysSendMoneyCount > 0) {
//             sendMoneyChangePercentage = 100.0; // Infinite growth
//         }

//         // --- "Completed Transfers" Stats ---
//         const currentMonthDateRange = getCurrentMonthRange();
//         const previousMonthDateRange = getPreviousMonthRange();

//         const completedTransfersThisMonth = await Transfer.countDocuments({
//             status: 'completed',
//             updatedAt: { $gte: currentMonthDateRange.start, $lte: currentMonthDateRange.end }
//         });
//         const completedTransfersLastMonth = await Transfer.countDocuments({
//             status: 'completed',
//             updatedAt: { $gte: previousMonthDateRange.start, $lte: previousMonthDateRange.end }
//         });
//         let completedTransfersChangeCount = completedTransfersThisMonth - completedTransfersLastMonth;

//         // --- Popular Corridors Stats (e.g., Last 90 Days) ---
//         const corridorPeriod = getCorridorAnalysisPeriod();
//         const popularCorridorsPipeline = [
//             {
//                 $match: {
//                     status: 'completed',
//                     updatedAt: { $gte: corridorPeriod.start, $lte: corridorPeriod.end }
//                 }
//             },
//             {
//                 $lookup: {
//                     from: 'currencies',
//                     localField: 'sendCurrency',
//                     foreignField: '_id',
//                     as: 'sendCurrencyDoc'
//                 }
//             },
//             { $unwind: { path: '$sendCurrencyDoc', preserveNullAndEmptyArrays: true } }, // Preserve if lookup fails
//             {
//                 $lookup: {
//                     from: 'currencies',
//                     localField: 'receiveCurrency',
//                     foreignField: '_id',
//                     as: 'receiveCurrencyDoc'
//                 }
//             },
//             { $unwind: { path: '$receiveCurrencyDoc', preserveNullAndEmptyArrays: true } }, // Preserve if lookup fails
//             {
//                 $group: {
//                     _id: {
//                         send: '$sendCurrencyDoc.code',
//                         receive: '$receiveCurrencyDoc.code'
//                     },
//                     count: { $sum: 1 }
//                 }
//             },
//             {
//                 $project: {
//                     _id: 0,
//                     sendCurrencyCode: { $ifNull: ['$_id.send', 'N/A'] },
//                     receiveCurrencyCode: { $ifNull: ['$_id.receive', 'N/A'] },
//                     count: '$count'
//                 }
//             },
//             { $sort: { count: -1 } },
//             { $limit: 4 }
//         ];
//         const topCorridorsRaw = await Transfer.aggregate(popularCorridorsPipeline);

//         const totalCompletedTransfersInCorridorPeriod = await Transfer.countDocuments({
//             status: 'completed',
//             updatedAt: { $gte: corridorPeriod.start, $lte: corridorPeriod.end }
//         });

//         const popularCorridors = topCorridorsRaw.map(corridor => ({
//             ...corridor,
//             percentage: totalCompletedTransfersInCorridorPeriod > 0
//                 ? parseFloat(((corridor.count / totalCompletedTransfersInCorridorPeriod) * 100).toFixed(1))
//                 : 0
//         }));


//         // --- KYC Status Counts ---
//         const kycNotStartedCount = await User.countDocuments({ 'kyc.status': 'not_started' });
//         const kycPendingCount = await User.countDocuments({ 'kyc.status': 'pending' });
//         const kycVerifiedCount = await User.countDocuments({ 'kyc.status': 'verified' });
//         const kycRejectedCount = await User.countDocuments({ 'kyc.status': 'rejected' });
//         const kycSkippedCount = await User.countDocuments({ 'kyc.status': 'skipped' });


//         return {
//             totalUsers,
//             growthPercentageThisWeek: parseFloat(growthPercentageThisWeek.toFixed(1)),
//             todaysAddMoneyCount,
//             addMoneyChangePercentage: parseFloat(addMoneyChangePercentage.toFixed(1)),
//             todaysSendMoneyCount,
//             sendMoneyChangePercentage: parseFloat(sendMoneyChangePercentage.toFixed(1)),
//             completedTransfersThisMonth,
//             completedTransfersChangeCount,
//             popularCorridors,
//             kycNotStartedCount,
//             kycPendingCount,
//             kycVerifiedCount,
//             kycRejectedCount,
//             kycSkippedCount,
//         };
//     } catch (error) {
//         console.error("Error in getDashboardOverviewStats service:", error);
//         throw new Error("Failed to fetch dashboard overview statistics.");
//     }
// };

// const getVolumeChartData = async (type, range) => {
//     console.log(`Service: getVolumeChartData - Type: ${type}, Range: ${range}`);
//     let model;
//     let amountField;
//     let dateField = 'createdAt'; // Default to createdAt
//     let matchStage = {}; // Initial match stage for type-specific filters (e.g., status)

//     if (type === 'payments') {
//         model = Payment;
//         amountField = '$amountToAdd'; // Or '$amountToPay' if preferred
//         // Optionally filter payments by status, e.g., only completed
//         // matchStage = { status: 'completed' };
//     } else if (type === 'transfers') {
//         model = Transfer;
//         amountField = '$sendAmount';
//         matchStage = { status: 'completed' }; // Volume for completed transfers
//         dateField = 'updatedAt'; // Completion time is more relevant for transfer volume
//     } else {
//         throw new Error('Invalid chart type specified.');
//     }

//     let startDate;
//     let groupByFormat;
//     let dateProjectFormat; // The format we want the 'date' field in the final output (e.g., YYYY-MM-DD)
//     let earliestYearDetectedForLogging; // For logging purposes for 'all' range

//     const now = moment();

//     if (range === 'month') {
//         // Last 30 days (including today)
//         startDate = now.clone().subtract(29, 'days').startOf('day').toDate();
//         groupByFormat = '%Y-%m-%d'; // Group by Day
//         dateProjectFormat = '%Y-%m-%d';
//     } else if (range === 'year') {
//         // Last 12 months (including current month)
//         startDate = now.clone().subtract(11, 'months').startOf('month').toDate();
//         groupByFormat = '%Y-%m'; // Group by Month
//         dateProjectFormat = '%Y-%m-01'; // Represent month as its first day for consistency
//     } else if (range === 'all') {
//         // Find the earliest relevant record to determine the start year
//         const earliestRecord = await model.findOne({ ...matchStage }) // Include existing matchStage filters
//                                           .sort({ [dateField]: 1 }) // Sort by the relevant date field
//                                           .limit(1)
//                                           .lean(); // Use lean for performance

//         if (earliestRecord && earliestRecord[dateField]) {
//             const year = moment(earliestRecord[dateField]).year();
//             earliestYearDetectedForLogging = year;
//             startDate = moment().year(year).startOf('year').toDate(); // Start from the beginning of the earliest year
//         } else {
//             // No records found, default to the start of the current year
//             earliestYearDetectedForLogging = now.year();
//             startDate = now.clone().startOf('year').toDate();
//         }
//         groupByFormat = '%Y'; // Group by Year. This makes _id in $group just the year string (e.g., "2025")
//         dateProjectFormat = '%Y-01-01'; // We want the final date output to be the first day of the year
//         console.log(`Service: Chart (all) - Determined start year for ${type}: ${earliestYearDetectedForLogging}, StartDate for aggregation: ${startDate}`);
//     } else {
//         throw new Error('Invalid chart range specified.');
//     }

//     console.log(`Service: getVolumeChartData - Aggregating from date: ${startDate} for range: ${range}`);

//     // Combine base matchStage with the date range filter
//     const finalMatchStage = { ...matchStage, [dateField]: { $gte: startDate } };

//     let projectStageDateConversion;
//     if (range === 'all') {
//         // When _id from $group is just a year string (e.g., "2025" from groupByFormat '%Y'),
//         // we need to concatenate "-01-01" to make it a full date string that $toDate can parse.
//         projectStageDateConversion = { $toDate: { $concat: ["$_id", "-01-01"] } };
//     } else {
//         // For 'month' and 'year', _id from $group is already in a format $toDate can handle
//         // (e.g., "YYYY-MM-DD" or "YYYY-MM", MongoDB $toDate can infer day for "YYYY-MM").
//         projectStageDateConversion = { $toDate: "$_id" };
//     }

//     const pipeline = [
//         { $match: finalMatchStage },
//         {
//             $group: {
//                 _id: { $dateToString: { format: groupByFormat, date: `$${dateField}` } },
//                 totalVolume: { $sum: amountField }
//             }
//         },
//         {
//             $project: {
//                 _id: 0,
//                 // Convert the grouped _id (which is a string representation of date/month/year)
//                 // back to a Date object, then format it to the desired dateProjectFormat string.
//                 date: { $dateToString: { format: dateProjectFormat, date: projectStageDateConversion } },
//                 volume: { $ifNull: ["$totalVolume", 0] } // Ensure volume is a number, default to 0
//             }
//         },
//         { $sort: { date: 1 } } // Sort by date ascending
//     ];

//     try {
//         const results = await model.aggregate(pipeline);
//         console.log(`Service: getVolumeChartData - Aggregation results count: ${results.length}`);

//         // --- Fill missing dates/months/years with 0 volume ---
//         const filledData = [];
//         // currentDate should start from the calculated startDate for filling purposes
//         let currentDate = moment(startDate);
//         // endDate is effectively 'now', adjusted to the end of the period unit (day, month, or year)
//         const endDate = moment().endOf(range === 'all' ? 'year' : (range === 'month' ? 'day' : 'month'));

//         // Create a map for quick lookup of aggregated volumes
//         const resultsMap = new Map(results.map(item => {
//             // item.date is already in the `dateProjectFormat` (YYYY-MM-DD, YYYY-MM-01, or YYYY-01-01)
//             const itemMomentDate = moment(item.date, 'YYYY-MM-DD'); // Parse consistently
//             let key;
//             if (range === 'month') key = itemMomentDate.format('YYYY-MM-DD');
//             else if (range === 'year') key = itemMomentDate.format('YYYY-MM'); // Key for year range is YYYY-MM
//             else key = itemMomentDate.format('YYYY'); // Key for 'all' range is YYYY
//             return [key, item.volume];
//         }));

//         while (currentDate <= endDate) {
//             let formattedDateKey; // Key for looking up in resultsMap
//             let formattedDateOutput; // Date string for the final chart data

//             if (range === 'month') {
//                 formattedDateKey = currentDate.format('YYYY-MM-DD');
//                 formattedDateOutput = currentDate.format('YYYY-MM-DD');
//             } else if (range === 'year') {
//                 formattedDateKey = currentDate.format('YYYY-MM');
//                 formattedDateOutput = currentDate.format('YYYY-MM-01'); // Output as first day of month
//             } else { // 'all' range
//                 formattedDateKey = currentDate.format('YYYY');
//                 formattedDateOutput = currentDate.format('YYYY-01-01'); // Output as first day of year
//             }

//             filledData.push({
//                 date: formattedDateOutput,
//                 volume: resultsMap.get(formattedDateKey) || 0
//             });

//             // Increment currentDate based on the range
//             if (range === 'month') currentDate.add(1, 'day');
//             else if (range === 'year') currentDate.add(1, 'month');
//             else currentDate.add(1, 'year');
//         }

//         // Slice to ensure exact number of data points for 'month' and 'year' if filling logic overshoots
//         let finalData = filledData;
//         if (range === 'month') {
//             finalData = filledData.slice(-30); // Rigorously last 30 days
//         } else if (range === 'year') {
//             finalData = filledData.slice(-12); // Rigorously last 12 months
//         }
//         // For 'all' range, finalData contains all years from earliest detected year up to current year.

//         console.log(`Service: getVolumeChartData - Returning ${finalData.length} data points for ${type}/${range}.`);
//         return finalData;

//     } catch (error) {
//         console.error(`Service: getVolumeChartData - Error aggregating data for ${type}/${range}:`, error);
//         // Rethrow a more specific error or the original error to be handled by the controller
//         throw new Error(`Failed to aggregate chart data for ${type}. Original error: ${error.message}`);
//     }
// };


// // --- NEW: Function to get balance distribution by currency ---
// const getBalanceDistribution = async () => {
//     try {
//         console.log("Service: getBalanceDistribution - Fetching account balances by currency.");
//         // Fetch all accounts and populate their currency details (code and currencyName)
//         // We only need accounts with a balance greater than 0 for the chart
//         const accounts = await Account.find({ balance: { $gt: 0 } })
//             .populate({
//                 path: 'currency',
//                 select: 'code currencyName -_id' // Select only code and currencyName, exclude _id from currency
//             })
//             .lean(); // Use .lean() for better performance as we don't need Mongoose documents

//         if (!accounts || accounts.length === 0) {
//             console.log("Service: getBalanceDistribution - No accounts with positive balances found.");
//             return []; // Return empty array if no accounts or no balances
//         }

//         // Aggregate balances by currency code
//         const balanceByCurrency = accounts.reduce((acc, account) => {
//             if (account.currency && account.currency.code && account.balance > 0) {
//                 const code = account.currency.code;
//                 const name = account.currency.currencyName;
//                 if (!acc[code]) {
//                     acc[code] = {
//                         currencyCode: code,
//                         currencyName: name,
//                         totalBalance: 0,
//                     };
//                 }
//                 acc[code].totalBalance += account.balance;
//             }
//             return acc;
//         }, {});

//         // Convert the aggregated object to an array
//         const distributionData = Object.values(balanceByCurrency);

//         // Sort by totalBalance descending to show larger balances first (optional)
//         distributionData.sort((a, b) => b.totalBalance - a.totalBalance);

//         console.log(`Service: getBalanceDistribution - Found ${distributionData.length} currencies with balances.`);
//         return distributionData;

//     } catch (error) {
//         console.error("Service: getBalanceDistribution - Error fetching balance distribution:", error);
//         throw new Error("Failed to retrieve balance distribution data.");
//     }
// };
// // --- END NEW ---

// export default {
//     getDashboardOverviewStats,
//     getVolumeChartData,
//     getBalanceDistribution, // <-- Export new function
// };



// // backend/src/services/admin/stats.admin.service.js
// import User from '../../models/User.js';
// import Payment from '../../models/Payment.js';
// import Transfer from '../../models/Transfer.js';
// import Account from '../../models/Account.js';
// import Currency from '../../models/Currency.js';
// import moment from 'moment';
// import mongoose from 'mongoose';


// // Helper to get the start of the current week (Monday as the first day)
// const getStartOfWeek = () => {
//     return moment().startOf('isoWeek').toDate();
// };

// // Helper to get date ranges
// const getTodayRange = () => {
//     const startOfToday = moment().startOf('day').toDate();
//     const endOfToday = moment().endOf('day').toDate();
//     return { start: startOfToday, end: endOfToday };
// };

// const getYesterdayRange = () => {
//     const startOfYesterday = moment().subtract(1, 'days').startOf('day').toDate();
//     const endOfYesterday = moment().subtract(1, 'days').endOf('day').toDate();
//     return { start: startOfYesterday, end: endOfYesterday };
// };

// const getCurrentMonthRange = () => {
//     const startOfMonth = moment().startOf('month').toDate();
//     const endOfMonth = moment().endOf('month').toDate();
//     return { start: startOfMonth, end: endOfMonth };
// };

// const getPreviousMonthRange = () => {
//     const startOfPreviousMonth = moment().subtract(1, 'month').startOf('month').toDate();
//     const endOfPreviousMonth = moment().subtract(1, 'month').endOf('month').toDate();
//     return { start: startOfPreviousMonth, end: endOfPreviousMonth };
// };


// const getCorridorAnalysisPeriod = () => {
//     // Analyze corridors over the last 90 days
//     const endOfPeriod = moment().endOf('day').toDate();
//     const startOfPeriod = moment().subtract(89, 'days').startOf('day').toDate();
//     return { start: startOfPeriod, end: endOfPeriod };
// };



// const getDashboardOverviewStats = async () => {
//     try {
//         // --- User Stats ---
//         const totalUsers = await User.countDocuments();
//         const startOfWeek = getStartOfWeek();
//         const usersAtStartOfWeek = await User.countDocuments({ createdAt: { $lt: startOfWeek } });
//         const newUsersThisWeekCount = totalUsers - usersAtStartOfWeek;
//         let growthPercentageThisWeek = 0;
//         if (usersAtStartOfWeek > 0) {
//             growthPercentageThisWeek = (newUsersThisWeekCount / usersAtStartOfWeek) * 100;
//         } else if (newUsersThisWeekCount > 0) {
//             growthPercentageThisWeek = 100.0; // Infinite growth if starting from 0
//         }

//         // --- "Add Money" (Payment) Stats ---
//         const todayDateRange = getTodayRange();
//         const yesterdayDateRange = getYesterdayRange();

//         // Using completedAt for completed payments count
//         const todaysAddMoneyCount = await Payment.countDocuments({
//             status: 'completed', // Count only completed payments
//             completedAt: { $gte: todayDateRange.start, $lte: todayDateRange.end },
//         });
//         const yesterdaysAddMoneyCount = await Payment.countDocuments({
//             status: 'completed', // Count only completed payments
//             completedAt: { $gte: yesterdayDateRange.start, $lte: yesterdayDateRange.end },
//         });
//         let addMoneyChangePercentage = 0;
//         if (yesterdaysAddMoneyCount > 0) {
//             addMoneyChangePercentage = ((todaysAddMoneyCount - yesterdaysAddMoneyCount) / yesterdaysAddMoneyCount) * 100;
//         } else if (todaysAddMoneyCount > 0) {
//             addMoneyChangePercentage = 100.0; // Infinite growth
//         }

//         // --- "Send Money" (Transfer Initiation vs Completion) Stats ---
//         const todaysSendMoneyCount = await Transfer.countDocuments({
//             createdAt: { $gte: todayDateRange.start, $lte: todayDateRange.end }, // Based on creation
//         });
//         const yesterdaysSendMoneyCount = await Transfer.countDocuments({
//             createdAt: { $gte: yesterdayDateRange.start, $lte: yesterdayDateRange.end }, // Based on creation
//         });
//         let sendMoneyChangePercentage = 0;
//         if (yesterdaysSendMoneyCount > 0) {
//             sendMoneyChangePercentage = ((todaysSendMoneyCount - yesterdaysSendMoneyCount) / yesterdaysSendMoneyCount) * 100;
//         } else if (todaysSendMoneyCount > 0) {
//             sendMoneyChangePercentage = 100.0; // Infinite growth
//         }

//         // --- "Completed Transfers" Stats ---
//         const currentMonthDateRange = getCurrentMonthRange();
//         const previousMonthDateRange = getPreviousMonthRange();

//         const completedTransfersThisMonth = await Transfer.countDocuments({
//             status: 'completed',
//             updatedAt: { $gte: currentMonthDateRange.start, $lte: currentMonthDateRange.end }
//         });
//         const completedTransfersLastMonth = await Transfer.countDocuments({
//             status: 'completed',
//             updatedAt: { $gte: previousMonthDateRange.start, $lte: previousMonthDateRange.end }
//         });
//         let completedTransfersChangeCount = completedTransfersThisMonth - completedTransfersLastMonth;

//         // --- Popular Corridors Stats (e.g., Last 90 Days) ---
//         const corridorPeriod = getCorridorAnalysisPeriod();
//         const popularCorridorsPipeline = [
//             {
//                 $match: {
//                     status: 'completed',
//                     updatedAt: { $gte: corridorPeriod.start, $lte: corridorPeriod.end }
//                 }
//             },
//             {
//                 $lookup: {
//                     from: 'currencies',
//                     localField: 'sendCurrency',
//                     foreignField: '_id',
//                     as: 'sendCurrencyDoc'
//                 }
//             },
//             { $unwind: { path: '$sendCurrencyDoc', preserveNullAndEmptyArrays: true } },
//             {
//                 $lookup: {
//                     from: 'currencies',
//                     localField: 'receiveCurrency',
//                     foreignField: '_id',
//                     as: 'receiveCurrencyDoc'
//                 }
//             },
//             { $unwind: { path: '$receiveCurrencyDoc', preserveNullAndEmptyArrays: true } },
//             {
//                 $group: {
//                     _id: {
//                         send: '$sendCurrencyDoc.code',
//                         receive: '$receiveCurrencyDoc.code'
//                     },
//                     count: { $sum: 1 }
//                 }
//             },
//             {
//                 $project: {
//                     _id: 0,
//                     sendCurrencyCode: { $ifNull: ['$_id.send', 'N/A'] },
//                     receiveCurrencyCode: { $ifNull: ['$_id.receive', 'N/A'] },
//                     count: '$count'
//                 }
//             },
//             { $sort: { count: -1 } },
//             { $limit: 4 }
//         ];
//         const topCorridorsRaw = await Transfer.aggregate(popularCorridorsPipeline);

//         const totalCompletedTransfersInCorridorPeriod = await Transfer.countDocuments({
//             status: 'completed',
//             updatedAt: { $gte: corridorPeriod.start, $lte: corridorPeriod.end }
//         });

//         const popularCorridors = topCorridorsRaw.map(corridor => ({
//             ...corridor,
//             percentage: totalCompletedTransfersInCorridorPeriod > 0
//                 ? parseFloat(((corridor.count / totalCompletedTransfersInCorridorPeriod) * 100).toFixed(1))
//                 : 0
//         }));


//         // --- KYC Status Counts ---
//         const kycNotStartedCount = await User.countDocuments({ 'kyc.status': 'not_started' });
//         const kycPendingCount = await User.countDocuments({ 'kyc.status': 'pending' });
//         const kycVerifiedCount = await User.countDocuments({ 'kyc.status': 'verified' });
//         const kycRejectedCount = await User.countDocuments({ 'kyc.status': 'rejected' });
//         const kycSkippedCount = await User.countDocuments({ 'kyc.status': 'skipped' });


//         return {
//             totalUsers,
//             growthPercentageThisWeek: parseFloat(growthPercentageThisWeek.toFixed(1)),
//             todaysAddMoneyCount,
//             addMoneyChangePercentage: parseFloat(addMoneyChangePercentage.toFixed(1)),
//             todaysSendMoneyCount,
//             sendMoneyChangePercentage: parseFloat(sendMoneyChangePercentage.toFixed(1)),
//             completedTransfersThisMonth,
//             completedTransfersChangeCount,
//             popularCorridors,
//             kycNotStartedCount,
//             kycPendingCount,
//             kycVerifiedCount,
//             kycRejectedCount,
//             kycSkippedCount,
//         };
//     } catch (error) {
//         console.error("Error in getDashboardOverviewStats service:", error);
//         throw new Error("Failed to fetch dashboard overview statistics.");
//     }
// };

// const getVolumeChartData = async (type, range) => {
//     console.log(`Service: getVolumeChartData - Type: ${type}, Range: ${range}`);
//     let model;
//     let amountField;
//     let dateField;
//     let currencyFieldRef;
//     let matchStage = { status: 'completed' };

//     if (type === 'payments') {
//         model = Payment;
//         amountField = '$amountToAdd';
//         dateField = 'completedAt';
//         currencyFieldRef = 'balanceCurrency'; // Currency of the account being funded
//         console.log(`getVolumeChartData: PAYMENTS - Aggregating on Payment model, amount: ${amountField}, date: ${dateField}, currencyRef: ${currencyFieldRef}`);
//     } else if (type === 'transfers') {
//         model = Transfer;
//         amountField = '$sendAmount';
//         dateField = 'updatedAt'; // Assuming updatedAt reflects completion for transfers
//         currencyFieldRef = 'sendCurrency'; // Currency sent from the source account
//         console.log(`getVolumeChartData: TRANSFERS - Aggregating on Transfer model, amount: ${amountField}, date: ${dateField}, currencyRef: ${currencyFieldRef}`);
//     } else {
//         throw new Error('Invalid chart type specified.');
//     }

//     if (range === 'by_currency') {
//         console.log(`getVolumeChartData: Aggregating by currency for ${type}`);
//         const pipeline = [
//             { $match: { ...matchStage, [currencyFieldRef]: { $exists: true, $ne: null } } },
//             {
//                 $group: {
//                     _id: `$${currencyFieldRef}`,
//                     totalVolume: { $sum: amountField }
//                 }
//             },
//             {
//                 $lookup: {
//                     from: 'currencies',
//                     localField: '_id',
//                     foreignField: '_id',
//                     as: 'currencyDoc'
//                 }
//             },
//             { $unwind: { path: '$currencyDoc', preserveNullAndEmptyArrays: true } },
//             {
//                 $project: {
//                     _id: 0,
//                     currencyCode: { $ifNull: ['$currencyDoc.code', 'N/A'] },
//                     currencyName: { $ifNull: ['$currencyDoc.currencyName', 'Unknown Currency'] },
//                     volume: '$totalVolume'
//                 }
//             },
//             { $sort: { volume: -1 } }
//         ];
//         try {
//             const results = await model.aggregate(pipeline);
//             console.log(`Service: getVolumeChartData (by_currency) for ${type} - Results:`, JSON.stringify(results, null, 2));
//             return results.map(item => ({ ...item, category: item.currencyCode }));
//         } catch (error) {
//             console.error(`Service: getVolumeChartData (by_currency) - Error aggregating data for ${type}:`, error);
//             throw new Error(`Failed to aggregate chart data by currency for ${type}. Original error: ${error.message}`);
//         }

//     } else { // Handle 'month', 'year', 'all' ranges (time-series)
//         let startDate;
//         let groupByFormat;
//         let dateProjectFormat;
//         let earliestYearDetectedForLogging;

//         const now = moment();

//         if (range === 'month') {
//             startDate = now.clone().subtract(29, 'days').startOf('day').toDate();
//             groupByFormat = '%Y-%m-%d';
//             dateProjectFormat = '%Y-%m-%d';
//         } else if (range === 'year') {
//             startDate = now.clone().subtract(11, 'months').startOf('month').toDate();
//             groupByFormat = '%Y-%m';
//             dateProjectFormat = '%Y-%m-01';
//         } else if (range === 'all') {
//             const earliestRecord = await model.findOne({ ...matchStage, [dateField]: { $ne: null } })
//                                               .sort({ [dateField]: 1 })
//                                               .limit(1)
//                                               .lean();

//             if (earliestRecord && earliestRecord[dateField]) {
//                 const year = moment(earliestRecord[dateField]).year();
//                 earliestYearDetectedForLogging = year;
//                 startDate = moment().year(year).startOf('year').toDate();
//             } else {
//                 earliestYearDetectedForLogging = now.year();
//                 startDate = now.clone().startOf('year').toDate();
//             }
//             groupByFormat = '%Y';
//             dateProjectFormat = '%Y-01-01';
//             console.log(`Service: Chart (all) - Determined start year for ${type}: ${earliestYearDetectedForLogging}, StartDate for aggregation: ${startDate}`);
//         } else {
//             throw new Error('Invalid chart range specified.');
//         }

//         console.log(`Service: getVolumeChartData - Aggregating from date: ${startDate} for range: ${range}, using dateField: ${dateField}`);

//         const finalMatchStage = { ...matchStage, [dateField]: { $gte: startDate, $ne: null } };

//         let projectStageDateConversion;
//         if (range === 'all') {
//             projectStageDateConversion = { $toDate: { $concat: ["$_id", "-01-01"] } };
//         } else {
//             projectStageDateConversion = { $toDate: "$_id" };
//         }

//         const pipeline = [
//             { $match: finalMatchStage },
//             {
//                 $group: {
//                     _id: { $dateToString: { format: groupByFormat, date: `$${dateField}` } },
//                     totalVolume: { $sum: amountField }
//                 }
//             },
//             {
//                 $project: {
//                     _id: 0,
//                     date: { $dateToString: { format: dateProjectFormat, date: projectStageDateConversion } },
//                     volume: { $ifNull: ["$totalVolume", 0] }
//                 }
//             },
//             { $sort: { date: 1 } }
//         ];

//         try {
//             const results = await model.aggregate(pipeline);
//             console.log(`Service: getVolumeChartData for ${type}/${range} - Aggregation results count: ${results.length}`);
//             // console.log(`Service: getVolumeChartData for ${type}/${range} - Results:`, JSON.stringify(results, null, 2));


//             const filledData = [];
//             let currentDate = moment(startDate);
//             const endDate = moment().endOf(range === 'all' ? 'year' : (range === 'month' ? 'day' : 'month'));

//             const resultsMap = new Map(results.map(item => {
//                 const itemMomentDate = moment(item.date, 'YYYY-MM-DD');
//                 let key;
//                 if (range === 'month') key = itemMomentDate.format('YYYY-MM-DD');
//                 else if (range === 'year') key = itemMomentDate.format('YYYY-MM');
//                 else key = itemMomentDate.format('YYYY');
//                 return [key, item.volume];
//             }));

//             while (currentDate <= endDate) {
//                 let formattedDateKey;
//                 let formattedDateOutput;

//                 if (range === 'month') {
//                     formattedDateKey = currentDate.format('YYYY-MM-DD');
//                     formattedDateOutput = currentDate.format('YYYY-MM-DD');
//                 } else if (range === 'year') {
//                     formattedDateKey = currentDate.format('YYYY-MM');
//                     formattedDateOutput = currentDate.format('YYYY-MM-01');
//                 } else { // 'all' range
//                     formattedDateKey = currentDate.format('YYYY');
//                     formattedDateOutput = currentDate.format('YYYY-01-01');
//                 }

//                 filledData.push({
//                     date: formattedDateOutput,
//                     volume: resultsMap.get(formattedDateKey) || 0
//                 });

//                 if (range === 'month') currentDate.add(1, 'day');
//                 else if (range === 'year') currentDate.add(1, 'month');
//                 else currentDate.add(1, 'year');
//             }

//             let finalData = filledData;
//             if (range === 'month') {
//                 finalData = filledData.slice(-30);
//             } else if (range === 'year') {
//                 finalData = filledData.slice(-12);
//             }

//             console.log(`Service: getVolumeChartData - Returning ${finalData.length} data points for ${type}/${range}.`);
//             return finalData.map(item => ({ ...item, category: item.date }));
//         } catch (error) {
//             console.error(`Service: getVolumeChartData - Error aggregating data for ${type}/${range}:`, error);
//             throw new Error(`Failed to aggregate chart data for ${type}. Original error: ${error.message}`);
//         }
//     }
// };


// const getBalanceDistribution = async () => {
//     try {
//         console.log("Service: getBalanceDistribution - Recalculating balances by currency.");
//         const allCurrencies = await Currency.find().lean();
//         if (!allCurrencies || allCurrencies.length === 0) {
//             console.log("Service: getBalanceDistribution - No currencies defined.");
//             return [];
//         }

//         const distributionData = [];

//         for (const currency of allCurrencies) {
//             const currencyId = currency._id;
//             console.log(`getBalanceDistribution: Processing currency ${currency.code} (ID: ${currencyId})`);

//             // Calculate total "Add Money" (completed payments) for this currency
//             const totalAddedResult = await Payment.aggregate([
//                 {
//                     $match: {
//                         balanceCurrency: currencyId,
//                         status: 'completed',
//                         completedAt: { $ne: null }
//                     }
//                 },
//                 {
//                     $group: {
//                         _id: null,
//                         total: { $sum: '$amountToAdd' }
//                     }
//                 }
//             ]);
//             const totalAdded = totalAddedResult.length > 0 ? totalAddedResult[0].total : 0;
//             console.log(`getBalanceDistribution: Currency ${currency.code} - Total Added: ${totalAdded}`);


//             // Calculate total "Send Money" (completed transfers) from this currency
//             // IMPORTANT: This should sum transfers where 'sendCurrency' is this currency.
//             const totalSentResult = await Transfer.aggregate([
//                 {
//                     $match: {
//                         sendCurrency: currencyId, // Money SENT IN this currency
//                         status: 'completed',
//                         updatedAt: { $ne: null }
//                     }
//                 },
//                 {
//                     $group: {
//                         _id: null,
//                         total: { $sum: '$sendAmount' }
//                     }
//                 }
//             ]);
//             const totalSent = totalSentResult.length > 0 ? totalSentResult[0].total : 0;
//             console.log(`getBalanceDistribution: Currency ${currency.code} - Total Sent: ${totalSent}`);


//             const effectiveBalance = totalAdded - totalSent;
//             console.log(`getBalanceDistribution: Currency ${currency.code} - Effective Balance: ${effectiveBalance}`);


//             if (totalAdded !== 0 || totalSent !== 0) { // Only include if there was activity
//                 distributionData.push({
//                     currencyCode: currency.code,
//                     currencyName: currency.currencyName,
//                     totalBalance: effectiveBalance,
//                 });
//             }
//         }

//         distributionData.sort((a, b) => b.totalBalance - a.totalBalance);

//         console.log(`Service: getBalanceDistribution - Final Distribution Data:`, JSON.stringify(distributionData, null, 2));
//         return distributionData;

//     } catch (error) {
//         console.error("Service: getBalanceDistribution - Error fetching balance distribution:", error);
//         throw new Error("Failed to retrieve balance distribution data.");
//     }
// };


// export default {
//     getDashboardOverviewStats,
//     getVolumeChartData,
//     getBalanceDistribution,
// };


// backend/src/services/admin/stats.admin.service.js
import User from '../../models/User.js';
import Payment from '../../models/Payment.js';
import Transfer from '../../models/Transfer.js';
import Account from '../../models/Account.js';
import Currency from '../../models/Currency.js';
import moment from 'moment';
import mongoose from 'mongoose';


// Helper to get the start of the current week (Monday as the first day)
const getStartOfWeek = () => {
    return moment().startOf('isoWeek').toDate();
};

// Helper to get date ranges
const getTodayRange = () => {
    const startOfToday = moment().startOf('day').toDate();
    const endOfToday = moment().endOf('day').toDate();
    return { start: startOfToday, end: endOfToday };
};

const getYesterdayRange = () => {
    const startOfYesterday = moment().subtract(1, 'days').startOf('day').toDate();
    const endOfYesterday = moment().subtract(1, 'days').endOf('day').toDate();
    return { start: startOfYesterday, end: endOfYesterday };
};

const getCurrentMonthRange = () => {
    const startOfMonth = moment().startOf('month').toDate();
    const endOfMonth = moment().endOf('month').toDate();
    return { start: startOfMonth, end: endOfMonth };
};

const getPreviousMonthRange = () => {
    const startOfPreviousMonth = moment().subtract(1, 'month').startOf('month').toDate();
    const endOfPreviousMonth = moment().subtract(1, 'month').endOf('month').toDate();
    return { start: startOfPreviousMonth, end: endOfPreviousMonth };
};


const getCorridorAnalysisPeriod = () => {
    // Analyze corridors over the last 90 days
    const endOfPeriod = moment().endOf('day').toDate();
    const startOfPeriod = moment().subtract(89, 'days').startOf('day').toDate();
    return { start: startOfPeriod, end: endOfPeriod };
};



const getDashboardOverviewStats = async () => {
    try {
        // --- User Stats ---
        const totalUsers = await User.countDocuments();
        const startOfWeek = moment().startOf('isoWeek').toDate(); // Helper function not shown, but assumed
        const usersAtStartOfWeek = await User.countDocuments({ createdAt: { $lt: startOfWeek } });
        const newUsersThisWeekCount = totalUsers - usersAtStartOfWeek;
        let growthPercentageThisWeek = 0;
        if (usersAtStartOfWeek > 0) {
            growthPercentageThisWeek = (newUsersThisWeekCount / usersAtStartOfWeek) * 100;
        } else if (newUsersThisWeekCount > 0) {
            growthPercentageThisWeek = 100.0; // Infinite growth if starting from 0
        }

         // --- "Add Money" (Payment) Stats ---
        const todayDateRange = { start: moment().startOf('day').toDate(), end: moment().endOf('day').toDate() }; // Simplified
        const yesterdayDateRange = { start: moment().subtract(1, 'days').startOf('day').toDate(), end: moment().subtract(1, 'days').endOf('day').toDate() }; // Simplified
        const todaysAddMoneyCount = await Payment.countDocuments({
            status: 'completed',
            completedAt: { $gte: todayDateRange.start, $lte: todayDateRange.end },
        });
        const yesterdaysAddMoneyCount = await Payment.countDocuments({
            status: 'completed',
            completedAt: { $gte: yesterdayDateRange.start, $lte: yesterdayDateRange.end },
        });
        let addMoneyChangePercentage = 0;
        if (yesterdaysAddMoneyCount > 0) {
            addMoneyChangePercentage = ((todaysAddMoneyCount - yesterdaysAddMoneyCount) / yesterdaysAddMoneyCount) * 100;
        } else if (todaysAddMoneyCount > 0) {
            addMoneyChangePercentage = 100.0;
        }

          // --- "Send Money" (Transfer Initiation) Stats ---
        const todaysSendMoneyCount = await Transfer.countDocuments({
            createdAt: { $gte: todayDateRange.start, $lte: todayDateRange.end },
        });
        const yesterdaysSendMoneyCount = await Transfer.countDocuments({
            createdAt: { $gte: yesterdayDateRange.start, $lte: yesterdayDateRange.end },
        });
        let sendMoneyChangePercentage = 0;
        if (yesterdaysSendMoneyCount > 0) {
            sendMoneyChangePercentage = ((todaysSendMoneyCount - yesterdaysSendMoneyCount) / yesterdaysSendMoneyCount) * 100;
        } else if (todaysSendMoneyCount > 0) {
            sendMoneyChangePercentage = 100.0;
        }

          // --- "Completed Transfers" Stats ---
        const currentMonthDateRange = { start: moment().startOf('month').toDate(), end: moment().endOf('month').toDate() }; // Simplified
        const previousMonthDateRange = { start: moment().subtract(1, 'month').startOf('month').toDate(), end: moment().subtract(1, 'month').endOf('month').toDate() }; // Simplified

        const completedTransfersThisMonth = await Transfer.countDocuments({
            status: 'completed',
            updatedAt: { $gte: currentMonthDateRange.start, $lte: currentMonthDateRange.end }
        });
        const completedTransfersLastMonth = await Transfer.countDocuments({
            status: 'completed',
            updatedAt: { $gte: previousMonthDateRange.start, $lte: previousMonthDateRange.end }
        });
        let completedTransfersChangeCount = completedTransfersThisMonth - completedTransfersLastMonth;

          // --- Popular Corridors Stats ---
        const corridorPeriod = { start: moment().subtract(89, 'days').startOf('day').toDate(), end: moment().endOf('day').toDate() }; // Simplified
        const popularCorridorsPipeline = [
            { $match: { status: 'completed', updatedAt: { $gte: corridorPeriod.start, $lte: corridorPeriod.end } } },
            { $lookup: { from: 'currencies', localField: 'sendCurrency', foreignField: '_id', as: 'sendCurrencyDoc' } },
            { $unwind: { path: '$sendCurrencyDoc', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'currencies', localField: 'receiveCurrency', foreignField: '_id', as: 'receiveCurrencyDoc' } },
            { $unwind: { path: '$receiveCurrencyDoc', preserveNullAndEmptyArrays: true } },
            { $group: { _id: { send: '$sendCurrencyDoc.code', receive: '$receiveCurrencyDoc.code' }, count: { $sum: 1 } } },
            { $project: { _id: 0, sendCurrencyCode: { $ifNull: ['$_id.send', 'N/A'] }, receiveCurrencyCode: { $ifNull: ['$_id.receive', 'N/A'] }, count: '$count' } },
            { $sort: { count: -1 } },
            { $limit: 4 }
        ];
        const topCorridorsRaw = await Transfer.aggregate(popularCorridorsPipeline);
        const totalCompletedTransfersInCorridorPeriod = await Transfer.countDocuments({
            status: 'completed',
            updatedAt: { $gte: corridorPeriod.start, $lte: corridorPeriod.end }
        });
        const popularCorridors = topCorridorsRaw.map(corridor => ({
            ...corridor,
            percentage: totalCompletedTransfersInCorridorPeriod > 0 ? parseFloat(((corridor.count / totalCompletedTransfersInCorridorPeriod) * 100).toFixed(1)) : 0
        }));


        // --- KYC Status Counts ---
        const kycNotStartedCount = await User.countDocuments({ 'kyc.status': 'not_started' });
        const kycPendingCount = await User.countDocuments({ 'kyc.status': 'pending' });
        const kycVerifiedCount = await User.countDocuments({ 'kyc.status': 'verified' });
        const kycRejectedCount = await User.countDocuments({ 'kyc.status': 'rejected' });
        const kycSkippedCount = await User.countDocuments({ 'kyc.status': 'skipped' });

        return {
            totalUsers,
            growthPercentageThisWeek: parseFloat(growthPercentageThisWeek.toFixed(1)),
            todaysAddMoneyCount,
            addMoneyChangePercentage: parseFloat(addMoneyChangePercentage.toFixed(1)),
            todaysSendMoneyCount,
            sendMoneyChangePercentage: parseFloat(sendMoneyChangePercentage.toFixed(1)),
            completedTransfersThisMonth,
            completedTransfersChangeCount,
            popularCorridors,
            kycNotStartedCount,
            kycPendingCount,
            kycVerifiedCount,
            kycRejectedCount,
            kycSkippedCount,
        };
    } catch (error) {
        console.error("Error in getDashboardOverviewStats service:", error);
        throw new Error("Failed to fetch dashboard overview statistics.");
    }
};

const getVolumeChartData = async (type, range) => {
    console.log(`Service: getVolumeChartData - Type: ${type}, Range: ${range}`);
    let model;
    let amountField;
    let dateField;
    let currencyFieldRef;
    let matchStage = { status: 'completed' };

    if (type === 'payments') {
        model = Payment;
        amountField = '$amountToAdd';
        dateField = 'completedAt';
        currencyFieldRef = 'balanceCurrency'; // Currency of the account being funded
        console.log(`getVolumeChartData: PAYMENTS - Aggregating on Payment model, amount: ${amountField}, date: ${dateField}, currencyRef: ${currencyFieldRef}`);
    } else if (type === 'transfers') {
        model = Transfer;
        amountField = '$sendAmount';
        dateField = 'updatedAt'; // Assuming updatedAt reflects completion for transfers
        currencyFieldRef = 'sendCurrency'; // Currency sent from the source account
        console.log(`getVolumeChartData: TRANSFERS - Aggregating on Transfer model, amount: ${amountField}, date: ${dateField}, currencyRef: ${currencyFieldRef}`);
    } else {
        throw new Error('Invalid chart type specified.');
    }

    if (range === 'by_currency') {
        console.log(`getVolumeChartData: Aggregating by currency for ${type}`);
        const pipeline = [
            { $match: { ...matchStage, [currencyFieldRef]: { $exists: true, $ne: null } } },
            {
                $group: {
                    _id: `$${currencyFieldRef}`,
                    totalVolume: { $sum: amountField }
                }
            },
            {
                $lookup: {
                    from: 'currencies',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'currencyDoc'
                }
            },
            { $unwind: { path: '$currencyDoc', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 0,
                    currencyCode: { $ifNull: ['$currencyDoc.code', 'N/A'] },
                    currencyName: { $ifNull: ['$currencyDoc.currencyName', 'Unknown Currency'] },
                    volume: '$totalVolume'
                }
            },
            { $sort: { volume: -1 } }
        ];
        try {
            const results = await model.aggregate(pipeline);
            console.log(`Service: getVolumeChartData (by_currency) for ${type} - Results:`, JSON.stringify(results, null, 2));
            return results.map(item => ({ ...item, category: item.currencyCode }));
        } catch (error) {
            console.error(`Service: getVolumeChartData (by_currency) - Error aggregating data for ${type}:`, error);
            throw new Error(`Failed to aggregate chart data by currency for ${type}. Original error: ${error.message}`);
        }

    } else { // Handle 'month', 'year', 'all' ranges (time-series)
        let startDate;
        let groupByFormat;
        let dateProjectFormat;
        let earliestYearDetectedForLogging;

        const now = moment();

        if (range === 'month') {
            startDate = now.clone().subtract(29, 'days').startOf('day').toDate();
            groupByFormat = '%Y-%m-%d';
            dateProjectFormat = '%Y-%m-%d';
        } else if (range === 'year') {
            startDate = now.clone().subtract(11, 'months').startOf('month').toDate();
            groupByFormat = '%Y-%m';
            dateProjectFormat = '%Y-%m-01';
        } else if (range === 'all') {
            const earliestRecord = await model.findOne({ ...matchStage, [dateField]: { $ne: null } })
                                              .sort({ [dateField]: 1 })
                                              .limit(1)
                                              .lean();

            if (earliestRecord && earliestRecord[dateField]) {
                const year = moment(earliestRecord[dateField]).year();
                earliestYearDetectedForLogging = year;
                startDate = moment().year(year).startOf('year').toDate();
            } else {
                earliestYearDetectedForLogging = now.year();
                startDate = now.clone().startOf('year').toDate();
            }
            groupByFormat = '%Y';
            dateProjectFormat = '%Y-01-01';
            console.log(`Service: Chart (all) - Determined start year for ${type}: ${earliestYearDetectedForLogging}, StartDate for aggregation: ${startDate}`);
        } else {
            throw new Error('Invalid chart range specified.');
        }

        console.log(`Service: getVolumeChartData - Aggregating from date: ${startDate} for range: ${range}, using dateField: ${dateField}`);

        const finalMatchStage = { ...matchStage, [dateField]: { $gte: startDate, $ne: null } };

        let projectStageDateConversion;
        if (range === 'all') {
            projectStageDateConversion = { $toDate: { $concat: ["$_id", "-01-01"] } };
        } else {
            projectStageDateConversion = { $toDate: "$_id" };
        }

        const pipeline = [
            { $match: finalMatchStage },
            {
                $group: {
                    _id: { $dateToString: { format: groupByFormat, date: `$${dateField}` } },
                    totalVolume: { $sum: amountField }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: { $dateToString: { format: dateProjectFormat, date: projectStageDateConversion } },
                    volume: { $ifNull: ["$totalVolume", 0] }
                }
            },
            { $sort: { date: 1 } }
        ];

        try {
            const results = await model.aggregate(pipeline);
            console.log(`Service: getVolumeChartData for ${type}/${range} - Aggregation results count: ${results.length}`);
            // console.log(`Service: getVolumeChartData for ${type}/${range} - Results:`, JSON.stringify(results, null, 2));


            const filledData = [];
            let currentDate = moment(startDate);
            const endDate = moment().endOf(range === 'all' ? 'year' : (range === 'month' ? 'day' : 'month'));

            const resultsMap = new Map(results.map(item => {
                const itemMomentDate = moment(item.date, 'YYYY-MM-DD');
                let key;
                if (range === 'month') key = itemMomentDate.format('YYYY-MM-DD');
                else if (range === 'year') key = itemMomentDate.format('YYYY-MM');
                else key = itemMomentDate.format('YYYY');
                return [key, item.volume];
            }));

            while (currentDate <= endDate) {
                let formattedDateKey;
                let formattedDateOutput;

                if (range === 'month') {
                    formattedDateKey = currentDate.format('YYYY-MM-DD');
                    formattedDateOutput = currentDate.format('YYYY-MM-DD');
                } else if (range === 'year') {
                    formattedDateKey = currentDate.format('YYYY-MM');
                    formattedDateOutput = currentDate.format('YYYY-MM-01');
                } else { // 'all' range
                    formattedDateKey = currentDate.format('YYYY');
                    formattedDateOutput = currentDate.format('YYYY-01-01');
                }

                filledData.push({
                    date: formattedDateOutput,
                    volume: resultsMap.get(formattedDateKey) || 0
                });

                if (range === 'month') currentDate.add(1, 'day');
                else if (range === 'year') currentDate.add(1, 'month');
                else currentDate.add(1, 'year');
            }

            let finalData = filledData;
            if (range === 'month') {
                finalData = filledData.slice(-30);
            } else if (range === 'year') {
                finalData = filledData.slice(-12);
            }

            console.log(`Service: getVolumeChartData - Returning ${finalData.length} data points for ${type}/${range}.`);
            return finalData.map(item => ({ ...item, category: item.date }));
        } catch (error) {
            console.error(`Service: getVolumeChartData - Error aggregating data for ${type}/${range}:`, error);
            throw new Error(`Failed to aggregate chart data for ${type}. Original error: ${error.message}`);
        }
    }
};


const getBalanceDistribution = async () => {
    try {
        console.log("Service: getBalanceDistribution - Recalculating balances by currency.");
        const allCurrencies = await Currency.find().lean();
        if (!allCurrencies || allCurrencies.length === 0) {
            console.log("Service: getBalanceDistribution - No currencies defined.");
            return [];
        }

        const distributionData = [];

        for (const currency of allCurrencies) {
            const currencyId = currency._id;
            // console.log(`getBalanceDistribution: Processing currency ${currency.code} (ID: ${currencyId})`);

            // Calculate total "Add Money" (completed payments) for this currency
            const totalAddedResult = await Payment.aggregate([
                {
                    $match: {
                        balanceCurrency: currencyId,
                        status: 'completed',
                        // NOTE: The check for `completedAt: { $ne: null }` was removed here
                        // to align with how VolumeChart (By Currency) sums completed payments.
                    }
                },
                {
                    $group: {
                        _id: null, // Grouping all matched documents together
                        total: { $sum: '$amountToAdd' }
                    }
                }
            ]);
            const totalAdded = totalAddedResult.length > 0 ? totalAddedResult[0].total : 0;
            // console.log(`getBalanceDistribution: Currency ${currency.code} - Total Added: ${totalAdded}`);

            // Calculate total "Send Money" (completed transfers) from this currency
            const totalSentResult = await Transfer.aggregate([
                {
                    $match: {
                        sendCurrency: currencyId, // Money SENT IN this currency
                        status: 'completed',
                        // NOTE: The check for `updatedAt: { $ne: null }` was removed here
                        // to align with how VolumeChart (By Currency) sums completed transfers.
                    }
                },
                {
                    $group: {
                        _id: null, // Grouping all matched documents together
                        total: { $sum: '$sendAmount' }
                    }
                }
            ]);
            const totalSent = totalSentResult.length > 0 ? totalSentResult[0].total : 0;
            // console.log(`getBalanceDistribution: Currency ${currency.code} - Total Sent: ${totalSent}`);

            const effectiveBalance = totalAdded - totalSent;
            // console.log(`getBalanceDistribution: Currency ${currency.code} - Effective Balance: ${effectiveBalance}`);

            // Only include currencies that have had some activity or have a non-zero balance
            if (totalAdded !== 0 || totalSent !== 0 || effectiveBalance !== 0) {
                distributionData.push({
                    currencyCode: currency.code,
                    currencyName: currency.currencyName,
                    totalBalance: effectiveBalance, // This is the net calculated balance
                });
            }
        }

        distributionData.sort((a, b) => b.totalBalance - a.totalBalance);

        // console.log(`Service: getBalanceDistribution - Final Distribution Data:`, JSON.stringify(distributionData, null, 2));
        return distributionData;

    } catch (error) {
        console.error("Service: getBalanceDistribution - Error fetching balance distribution:", error);
        throw new Error("Failed to retrieve balance distribution data.");
    }
};


export default {
    getDashboardOverviewStats,
    getVolumeChartData,
    getBalanceDistribution,
};