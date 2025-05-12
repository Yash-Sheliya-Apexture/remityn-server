// // backend/src/services/admin/activity.admin.service.js
// import User from '../../models/User.js';
// import Payment from '../../models/Payment.js';
// import Transfer from '../../models/Transfer.js';
// import moment from 'moment';

// const getRecentActivities = async (limit = 10, page = 1, startDate = null, endDate = null, activityTypeFilter = null) => {
//     try {
//         const activities = [];
//         const skip = (page - 1) * limit;

//         // Construct date query if dates are provided
//         let dateQuery = {};
//         if (startDate && endDate) {
//             // Ensure endDate is end of day for inclusive range
//             dateQuery = {
//                 createdAt: { // Default field for general activities
//                     $gte: moment(startDate).startOf('day').toDate(),
//                     $lte: moment(endDate).endOf('day').toDate()
//                 }
//             };
//         } else if (startDate) { // If only start date, get activities from that date onwards
//              dateQuery = { createdAt: { $gte: moment(startDate).startOf('day').toDate() }};
//         } else if (endDate) { // If only end date, get activities up to that date
//              dateQuery = { createdAt: { $lte: moment(endDate).endOf('day').toDate() }};
//         }
//         // If no dates, fetch most recent as before (no dateQuery applied initially to all)

//         const initialFetchLimit = limit * 4; // Fetch more to ensure enough variety after merging

//         // 1. New User Registrations
//         if (!activityTypeFilter || activityTypeFilter === 'NEW_USER') {
//             const userQuery = { ...dateQuery }; // Apply date filter
//             const newUsers = await User.find(userQuery)
//                 .sort({ createdAt: -1 })
//                 .limit(initialFetchLimit)
//                 .select('fullName email createdAt role')
//                 .lean();

//             newUsers.forEach(user => {
//                 activities.push({
//                     type: 'NEW_USER',
//                     timestamp: user.createdAt,
//                     message: `New user registered: ${user.fullName || user.email}.`,
//                     itemId: user._id.toString(),
//                     user: { name: user.fullName || user.email, role: user.role }
//                 });
//             });
//         }

//         // 2. New "Add Money" Payments
//         if (!activityTypeFilter || activityTypeFilter === 'NEW_PAYMENT') {
//             const paymentQuery = { ...dateQuery }; // Apply date filter
//             const recentPayments = await Payment.find(paymentQuery)
//                 .sort({ createdAt: -1 })
//                 .limit(initialFetchLimit)
//                 .populate('user', 'fullName email')
//                 .populate('payInCurrency', 'code')
//                 .populate('balanceCurrency', 'code')
//                 .select('user amountToPay payInCurrency balanceCurrency amountToAdd status createdAt')
//                 .lean();

//             recentPayments.forEach(payment => {
//                 activities.push({
//                     type: 'NEW_PAYMENT',
//                     timestamp: payment.createdAt,
//                     message: `${payment.user?.fullName || payment.user?.email || 'A user'} initiated an Add Money payment of ${payment.amountToPay.toFixed(2)} ${payment.payInCurrency?.code} to add ${payment.amountToAdd.toFixed(2)} ${payment.balanceCurrency?.code}. Status: ${payment.status}.`,
//                     itemId: payment._id.toString(),
//                     user: { name: payment.user?.fullName || payment.user?.email },
//                     details: { amount: payment.amountToPay, currency: payment.payInCurrency?.code, status: payment.status }
//                 });
//             });
//         }

//         // 3. New Transfers Initiated
//         if (!activityTypeFilter || activityTypeFilter === 'NEW_TRANSFER') {
//             const transferQuery = { ...dateQuery }; // Apply date filter
//             const recentTransfers = await Transfer.find(transferQuery)
//                 .sort({ createdAt: -1 })
//                 .limit(initialFetchLimit)
//                 .populate('user', 'fullName email')
//                 .populate('sendCurrency', 'code')
//                 .populate('receiveCurrency', 'code')
//                 .select('user sendAmount sendCurrency receiveAmount receiveCurrency status createdAt')
//                 .lean();

//             recentTransfers.forEach(transfer => {
//                 activities.push({
//                     type: 'NEW_TRANSFER',
//                     timestamp: transfer.createdAt,
//                     message: `${transfer.user?.fullName || transfer.user?.email || 'A user'} initiated a transfer of ${transfer.sendAmount.toFixed(2)} ${transfer.sendCurrency?.code} to receive ${transfer.receiveAmount.toFixed(2)} ${transfer.receiveCurrency?.code}. Status: ${transfer.status}.`,
//                     itemId: transfer._id.toString(),
//                     user: { name: transfer.user?.fullName || transfer.user?.email },
//                     details: { sendAmount: transfer.sendAmount, sendCurrency: transfer.sendCurrency?.code, status: transfer.status }
//                 });
//             });
//         }

//         // 4. KYC Pending Review
//         if (!activityTypeFilter || activityTypeFilter === 'KYC_PENDING') {
//             // For KYC, the relevant date is `kyc.submittedAt` or when status became 'pending'
//             // If dateQuery is present, we need to apply it to `kyc.submittedAt`
//             let kycQuery = { 'kyc.status': 'pending' };
//             if (startDate && endDate) {
//                 kycQuery['kyc.submittedAt'] = {
//                     $gte: moment(startDate).startOf('day').toDate(),
//                     $lte: moment(endDate).endOf('day').toDate()
//                 };
//             } else if (startDate) {
//                 kycQuery['kyc.submittedAt'] = { $gte: moment(startDate).startOf('day').toDate() };
//             } else if (endDate) {
//                 kycQuery['kyc.submittedAt'] = { $lte: moment(endDate).endOf('day').toDate() };
//             }
//             // If no date filter, it fetches all pending KYC sorted by submission time.

//             const kycPendingUsers = await User.find(kycQuery)
//                 .sort({ 'kyc.submittedAt': -1 }) // Sort by submission time
//                 .limit(initialFetchLimit)
//                 .select('fullName email kyc.status kyc.submittedAt kyc.firstName kyc.lastName') // Select relevant KYC fields
//                 .lean();

//             kycPendingUsers.forEach(user => {
//                 if (user.kyc && user.kyc.submittedAt) {
//                     activities.push({
//                         type: 'KYC_PENDING',
//                         timestamp: user.kyc.submittedAt,
//                         message: `KYC submitted for review: ${user.fullName || `${user.kyc.firstName || ''} ${user.kyc.lastName || ''}`.trim() || user.email}.`,
//                         itemId: user._id.toString(),
//                         user: { name: user.fullName || `${user.kyc.firstName || ''} ${user.kyc.lastName || ''}`.trim() || user.email }
//                     });
//                 }
//             });
//         }

//         // Sort all collected activities by timestamp in descending order
//         activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

//         const paginatedActivities = activities.slice(skip, skip + limit);

//         return {
//             activities: paginatedActivities,
//             total: activities.length, // Total from merged set for this query
//             page,
//             limit,
//             totalPages: Math.ceil(activities.length / limit)
//         };

//     } catch (error) {
//         console.error("Error in getRecentActivities service:", error);
//         throw new Error("Failed to fetch recent activities.");
//     }
// };

// export default {
//     getRecentActivities,
// };

// backend/src/services/admin/activity.admin.service.js
import User from '../../models/User.js';
import Payment from '../../models/Payment.js';
import Transfer from '../../models/Transfer.js';
import moment from 'moment';

const getRecentActivities = async (limit = 10, page = 1, startDate = null, endDate = null, activityTypeFilter = null) => {
    try {
        const activities = [];
        const skip = (page - 1) * limit;

        // Construct date query for general activities (createdAt based)
        let generalDateQuery = {};
        if (startDate && endDate) {
            generalDateQuery = {
                createdAt: {
                    $gte: moment(startDate).startOf('day').toDate(),
                    $lte: moment(endDate).endOf('day').toDate()
                }
            };
        } else if (startDate) {
             generalDateQuery = { createdAt: { $gte: moment(startDate).startOf('day').toDate() }};
        } else if (endDate) {
             generalDateQuery = { createdAt: { $lte: moment(endDate).endOf('day').toDate() }};
        }
        
        const initialFetchLimit = limit * 5; // Fetch more to ensure enough variety after merging, increased slightly for more KYC types

        // 1. New User Registrations
        if (!activityTypeFilter || activityTypeFilter === 'NEW_USER') {
            const userQuery = { ...generalDateQuery };
            const newUsers = await User.find(userQuery)
                .sort({ createdAt: -1 })
                .limit(initialFetchLimit)
                .select('fullName email createdAt role')
                .lean();

            newUsers.forEach(user => {
                activities.push({
                    type: 'NEW_USER',
                    timestamp: user.createdAt,
                    message: `New user registered: ${user.fullName || user.email}.`,
                    itemId: user._id.toString(),
                    user: { name: user.fullName || user.email, role: user.role }
                });
            });
        }

        // 2. New "Add Money" Payments
        if (!activityTypeFilter || activityTypeFilter === 'NEW_PAYMENT') {
            const paymentQuery = { ...generalDateQuery };
            const recentPayments = await Payment.find(paymentQuery)
                .sort({ createdAt: -1 })
                .limit(initialFetchLimit)
                .populate('user', 'fullName email')
                .populate('payInCurrency', 'code')
                .populate('balanceCurrency', 'code')
                .select('user amountToPay payInCurrency balanceCurrency amountToAdd status createdAt')
                .lean();

            recentPayments.forEach(payment => {
                activities.push({
                    type: 'NEW_PAYMENT',
                    timestamp: payment.createdAt,
                    message: `${payment.user?.fullName || payment.user?.email || 'A user'} initiated an Add Money payment of ${payment.amountToPay.toFixed(2)} ${payment.payInCurrency?.code} to add ${payment.amountToAdd.toFixed(2)} ${payment.balanceCurrency?.code}. Status: ${payment.status}.`,
                    itemId: payment._id.toString(),
                    user: { name: payment.user?.fullName || payment.user?.email },
                    details: { amount: payment.amountToPay, currency: payment.payInCurrency?.code, status: payment.status }
                });
            });
        }

        // 3. New Transfers Initiated
        if (!activityTypeFilter || activityTypeFilter === 'NEW_TRANSFER') {
            const transferQuery = { ...generalDateQuery };
            const recentTransfers = await Transfer.find(transferQuery)
                .sort({ createdAt: -1 })
                .limit(initialFetchLimit)
                .populate('user', 'fullName email')
                .populate('sendCurrency', 'code')
                .populate('receiveCurrency', 'code')
                .select('user sendAmount sendCurrency receiveAmount receiveCurrency status createdAt')
                .lean();

            recentTransfers.forEach(transfer => {
                activities.push({
                    type: 'NEW_TRANSFER',
                    timestamp: transfer.createdAt,
                    message: `${transfer.user?.fullName || transfer.user?.email || 'A user'} initiated a transfer of ${transfer.sendAmount.toFixed(2)} ${transfer.sendCurrency?.code} to receive ${transfer.receiveAmount.toFixed(2)} ${transfer.receiveCurrency?.code}. Status: ${transfer.status}.`,
                    itemId: transfer._id.toString(),
                    user: { name: transfer.user?.fullName || transfer.user?.email },
                    details: { sendAmount: transfer.sendAmount, sendCurrency: transfer.sendCurrency?.code, status: transfer.status }
                });
            });
        }
        
        // Helper function to create date query for specific KYC date fields
        const createKycDateSubQuery = (dateField) => {
            if (!startDate && !endDate) return {}; // No date filtering

            const kycDateFieldQuery = {};
            if (startDate && endDate) {
                kycDateFieldQuery[dateField] = {
                    $gte: moment(startDate).startOf('day').toDate(),
                    $lte: moment(endDate).endOf('day').toDate()
                };
            } else if (startDate) {
                kycDateFieldQuery[dateField] = { $gte: moment(startDate).startOf('day').toDate() };
            } else if (endDate) {
                kycDateFieldQuery[dateField] = { $lte: moment(endDate).endOf('day').toDate() };
            }
            return kycDateFieldQuery;
        };

        // 4. KYC Pending Review
        if (!activityTypeFilter || activityTypeFilter === 'KYC_PENDING') {
            const kycQuery = { 
                'kyc.status': 'pending', 
                ...createKycDateSubQuery('kyc.submittedAt') 
            };
            
            const kycPendingUsers = await User.find(kycQuery)
                .sort({ 'kyc.submittedAt': -1 })
                .limit(initialFetchLimit)
                .select('fullName email kyc.status kyc.submittedAt kyc.firstName kyc.lastName')
                .lean();

            kycPendingUsers.forEach(user => {
                if (user.kyc && user.kyc.submittedAt) {
                    const userName = user.fullName || `${user.kyc.firstName || ''} ${user.kyc.lastName || ''}`.trim() || user.email;
                    activities.push({
                        type: 'KYC_PENDING',
                        timestamp: user.kyc.submittedAt,
                        message: `KYC submitted for review: ${userName}.`,
                        itemId: user._id.toString(),
                        user: { name: userName }
                    });
                }
            });
        }

        // 5. KYC Verified
        if (!activityTypeFilter || activityTypeFilter === 'KYC_VERIFIED') {
            const kycQuery = { 
                'kyc.status': 'verified', 
                ...createKycDateSubQuery('kyc.verifiedAt') // Assumes kyc.verifiedAt field exists
            };

            const kycVerifiedUsers = await User.find(kycQuery)
                .sort({ 'kyc.verifiedAt': -1 }) // Sort by verification time
                .limit(initialFetchLimit)
                .select('fullName email kyc.status kyc.verifiedAt kyc.firstName kyc.lastName') // Ensure kyc.verifiedAt is selected
                .lean();

            kycVerifiedUsers.forEach(user => {
                if (user.kyc && user.kyc.verifiedAt) { // Check for verifiedAt timestamp
                    const userName = user.fullName || `${user.kyc.firstName || ''} ${user.kyc.lastName || ''}`.trim() || user.email;
                    activities.push({
                        type: 'KYC_VERIFIED',
                        timestamp: user.kyc.verifiedAt,
                        message: `KYC verified for: ${userName}.`,
                        itemId: user._id.toString(),
                        user: { name: userName }
                    });
                }
            });
        }

        // 6. KYC Rejected
        if (!activityTypeFilter || activityTypeFilter === 'KYC_REJECTED') {
            const kycQuery = { 
                'kyc.status': 'rejected', 
                ...createKycDateSubQuery('kyc.rejectedAt') // Assumes kyc.rejectedAt field exists
            };

            const kycRejectedUsers = await User.find(kycQuery)
                .sort({ 'kyc.rejectedAt': -1 }) // Sort by rejection time
                .limit(initialFetchLimit)
                .select('fullName email kyc.status kyc.rejectedAt kyc.rejectionReason kyc.firstName kyc.lastName') // Ensure kyc.rejectedAt and kyc.rejectionReason are selected
                .lean();

            kycRejectedUsers.forEach(user => {
                if (user.kyc && user.kyc.rejectedAt) { // Check for rejectedAt timestamp
                    const userName = user.fullName || `${user.kyc.firstName || ''} ${user.kyc.lastName || ''}`.trim() || user.email;
                    let message = `KYC rejected for: ${userName}.`;
                    if (user.kyc.rejectionReason) {
                        message += ` Reason: ${user.kyc.rejectionReason}.`;
                    }
                    activities.push({
                        type: 'KYC_REJECTED',
                        timestamp: user.kyc.rejectedAt,
                        message: message,
                        itemId: user._id.toString(),
                        user: { name: userName },
                        details: { reason: user.kyc.rejectionReason }
                    });
                }
            });
        }

        // Sort all collected activities by timestamp in descending order
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        const totalFetchedActivities = activities.length;
        const paginatedActivities = activities.slice(skip, skip + limit);

        return {
            activities: paginatedActivities,
            total: totalFetchedActivities, 
            page,
            limit,
            totalPages: Math.ceil(totalFetchedActivities / limit)
        };

    } catch (error) {
        console.error("Error in getRecentActivities service:", error);
        throw new Error("Failed to fetch recent activities.");
    }
};

export default {
    getRecentActivities,
};