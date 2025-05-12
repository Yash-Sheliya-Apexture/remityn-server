// import InboxMessage from '../models/InboxMessage.js';
// import emailService from '../utils/emailService.js';
// import config from '../config/index.js';
// import mongoose from 'mongoose';

// /**
//  * Creates an in-app message for a user.
//  */
// async function createInboxMessage({ userId, subject, body, sender = 'System', type = 'general', relatedData = {} }) {
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//         console.warn('[NotificationService] Invalid user ID for inbox message:', userId);
//         return null;
//     }

//     try {
//         const message = await InboxMessage.create({
//             userId,
//             subject,
//             body,
//             sender,
//             // Future: Add type and relatedData to InboxMessage schema if richer notifications are needed
//         });
//         console.log(`[NotificationService] In-app message created for user ${userId}, subject: "${subject}"`);
//         return message;
//     } catch (error) {
//         console.error(`[NotificationService] Error creating in-app message for user ${userId}:`, error);
//         return null; // Non-blocking
//     }
// }


// /**
//  * Sends a welcome notification (in-app and email) to a new user.
//  * @param {object} user - The user Mongoose document (must have _id, email, fullName).
//  */
// async function sendWelcomeNotification(user) {
//     if (!user || !user._id || !user.email || !user.fullName) {
//         console.error('[NotificationService] Invalid user object for welcome notification. Required: _id, email, fullName.', user);
//         return;
//     }

//     const appName = config.email.emailFromName || 'Wise App Clone';
//     const clientLoginUrl = `${config.clientUrl}/auth/login`; // Link to login or dashboard

//     // 1. Create In-App Welcome Message
//     const inboxSubject = `🎉 Welcome to ${appName}, ${user.fullName}!`;
//     const inboxBody = `We're excited to have you on board. Explore your dashboard, complete your profile, and get started on your financial journey with us! You can log in here: ${clientLoginUrl}`;
//     try {
//         await createInboxMessage({
//             userId: user._id,
//             subject: inboxSubject,
//             body: inboxBody,
//             sender: 'System',
//             type: 'welcome'
//         });
//     } catch (error) {
//         // createInboxMessage already logs its error and returns null
//         console.error(`[NotificationService] Failed to complete welcome in-app message creation for ${user.email}.`);
//     }

//     // 2. Send Welcome Email
//     const emailSubject = `🎉 Welcome to ${appName}, ${user.fullName}!`;
//     const templateData = {
//         userName: user.fullName,
//         appName: appName,
//         loginLink: clientLoginUrl,
//         currentYear: new Date().getFullYear().toString(),
//         // appLogoUrl: 'YOUR_LOGO_URL_HERE', // Optional: if you have a logo
//         // companyWebsiteUrl: config.clientUrl, // Optional
//     };

//     try {
//         const htmlContent = await emailService.renderTemplate('welcomeUser', templateData);
//         const textContent = `Hi ${user.fullName},\n\nWelcome to ${appName}!\n\nWe're thrilled to have you join us. We are dedicated to making your experience seamless and efficient.\n\nGet started by logging in: ${clientLoginUrl}\n\n© ${new Date().getFullYear()} ${appName}. All rights reserved.`;

//         await emailService.sendEmail({
//             to: user.email,
//             subject: emailSubject,
//             html: htmlContent,
//             text: textContent,
//         });
//         // emailService.sendEmail logs success/failure
//     } catch (error) {
//         // emailService.renderTemplate might throw, or sendEmail might return null for logged errors
//         console.error(`[NotificationService] Failed to send welcome email to ${user.email}:`, error.message || 'Underlying email service error.');
//     }
// }

// export default {
//     createInboxMessage,
//     sendWelcomeNotification,
// };

// server/src/services/notification.service.js
import InboxMessage from '../models/InboxMessage.js';
import emailService from '../utils/emailService.js';
import config from '../config/index.js';
import mongoose from 'mongoose';

// --- createInboxMessage function (remains the same) ---
async function createInboxMessage({ userId, subject, body, sender = 'System', type = 'general', relatedData = {} }) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        console.warn('[NotificationService] Invalid user ID for inbox message:', userId);
        return null;
    }
    try {
        const message = await InboxMessage.create({
            userId,
            subject,
            body,
            sender,
        });
        console.log(`[NotificationService] In-app message created for user ${userId}, subject: "${subject}"`);
        return message;
    } catch (error) {
        console.error(`[NotificationService] Error creating in-app message for user ${userId}:`, error);
        return null;
    }
}

// --- sendWelcomeNotification function (remains the same) ---
async function sendWelcomeNotification(user) {
    if (!user || !user._id || !user.email || !user.fullName) {
        console.error('[NotificationService] Invalid user object for welcome notification. Required: _id, email, fullName.', user);
        return;
    }
    const appName = config.email.emailFromName || 'Wise App Clone';
    const clientLoginUrl = `${config.clientUrl}/auth/login`;

    const inboxSubject = `🎉 Welcome to ${appName}, ${user.fullName}!`;
    const inboxBody = `We're excited to have you on board. Explore your dashboard, complete your profile, and get started on your financial journey with us! You can log in here: ${clientLoginUrl}`;
    try {
        await createInboxMessage({
            userId: user._id,
            subject: inboxSubject,
            body: inboxBody,
            sender: 'System',
            type: 'welcome'
        });
    } catch (error) {
        console.error(`[NotificationService] Failed to complete welcome in-app message creation for ${user.email}.`);
    }

    const emailSubject = `🎉 Welcome to ${appName}, ${user.fullName}!`;
    const templateData = {
        userName: user.fullName,
        appName: appName,
        loginLink: clientLoginUrl,
        currentYear: new Date().getFullYear().toString(),
    };
    try {
        const htmlContent = await emailService.renderTemplate('welcomeUser', templateData);
        const textContent = `Hi ${user.fullName},\n\nWelcome to ${appName}!\n\nWe're thrilled to have you join us. ...`; // Keep your existing text content
        await emailService.sendEmail({
            to: user.email,
            subject: emailSubject,
            html: htmlContent,
            text: textContent,
        });
    } catch (error) {
        console.error(`[NotificationService] Failed to send welcome email to ${user.email}:`, error.message || 'Underlying email service error.');
    }
}


// --- NEW: Send KYC Approved Notification ---
async function sendKycApprovedNotification(user) {
    if (!user || !user._id || !user.email || !user.fullName) {
        console.error('[NotificationService] Invalid user object for KYC approved notification.', user);
        return;
    }
    const appName = config.email.emailFromName || 'Wise App Clone';
    const dashboardLink = `${config.clientUrl}/dashboard`; // Or specific profile/kyc page

    // 1. In-App Message
    const inboxSubject = `✅ Your KYC has been Approved!`;
    const inboxBody = `Congratulations, ${user.fullName}! Your KYC verification has been approved. You now have full access to all features.`;
    try {
        await createInboxMessage({
            userId: user._id,
            subject: inboxSubject,
            body: inboxBody,
            sender: 'System',
            type: 'kyc_approved'
        });
    } catch (error) {
        console.error(`[NotificationService] Failed to create KYC approved in-app message for ${user.email}.`);
    }

    // 2. Email Notification
    const emailSubject = `✅ Your KYC Verification is Approved - ${appName}`;
    const templateData = {
        userName: user.fullName,
        appName: appName,
        dashboardLink: dashboardLink,
        currentYear: new Date().getFullYear().toString(),
    };
    try {
        const htmlContent = await emailService.renderTemplate('kycApproved', templateData);
        const textContent = `Hi ${user.fullName},\n\nGreat news! Your KYC verification for your ${appName} account has been approved.\n\nYou now have full access to all features.\n\nGo to your dashboard: ${dashboardLink}\n\nThank you for choosing ${appName}!`;
        await emailService.sendEmail({
            to: user.email,
            subject: emailSubject,
            html: htmlContent,
            text: textContent,
        });
    } catch (error) {
        console.error(`[NotificationService] Failed to send KYC approved email to ${user.email}:`, error.message || 'Underlying email service error.');
    }
}

// --- NEW: Send KYC Rejected Notification ---
async function sendKycRejectedNotification(user, rejectionReason = "Please review your submission and ensure all documents are clear and valid.") {
    if (!user || !user._id || !user.email || !user.fullName) {
        console.error('[NotificationService] Invalid user object for KYC rejected notification.', user);
        return;
    }
    const appName = config.email.emailFromName || 'Wise App Clone';
    const kycUpdateLink = `${config.clientUrl}/dashboard/kyc`; // Link to where user can resubmit KYC

    // 1. In-App Message
    const inboxSubject = `⚠️ Action Required: Your KYC Submission`;
    let inboxBody = `Hi ${user.fullName}, your KYC submission requires attention. Reason: ${rejectionReason}. Please update your information.`;
    if (rejectionReason.length > 150) { // Keep inbox message concise
        inboxBody = `Hi ${user.fullName}, your KYC submission requires attention. Please check your email for details and update your information.`;
    }
    try {
        await createInboxMessage({
            userId: user._id,
            subject: inboxSubject,
            body: inboxBody,
            sender: 'System',
            type: 'kyc_rejected'
        });
    } catch (error) {
        console.error(`[NotificationService] Failed to create KYC rejected in-app message for ${user.email}.`);
    }

    // 2. Email Notification
    const emailSubject = `⚠️ Action Required: KYC Submission for ${appName}`;
    const templateData = {
        userName: user.fullName,
        appName: appName,
        rejectionReason: rejectionReason,
        kycUpdateLink: kycUpdateLink,
        currentYear: new Date().getFullYear().toString(),
    };
    try {
        const htmlContent = await emailService.renderTemplate('kycRejected', templateData);
        const textContent = `Hi ${user.fullName},\n\nWe've reviewed your KYC submission for ${appName}, and it has been rejected.\n\nReason: ${rejectionReason}\n\nPlease update your KYC information here: ${kycUpdateLink}\n\nWe appreciate your cooperation.`;
        await emailService.sendEmail({
            to: user.email,
            subject: emailSubject,
            html: htmlContent,
            text: textContent,
        });
    } catch (error) {
        console.error(`[NotificationService] Failed to send KYC rejected email to ${user.email}:`, error.message || 'Underlying email service error.');
    }
}


export default {
    createInboxMessage,
    sendWelcomeNotification,
    sendKycApprovedNotification, // Export new function
    sendKycRejectedNotification, // Export new function
};