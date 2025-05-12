// server/src/utils/emailService.js
import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config/index.js'; // Ensure this path is correct (../ goes up from utils to src, then to config)

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // This will be /path/to/your/project/server/src/utils

let transporter;

try {
    transporter = nodemailer.createTransport({
        host: config.email.smtpHost,
        port: parseInt(config.email.smtpPort, 10),
        secure: parseInt(config.email.smtpPort, 10) === 465,
        auth: {
            user: config.email.smtpUser,
            pass: config.email.smtpPass,
        },
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 10000,
    });

    transporter.verify((error, success) => {
        if (error) {
            console.error('[EmailService] Error verifying transporter configuration:', error);
        } else {
            console.log('[EmailService] Mail transporter is ready to send emails.');
        }
    });

} catch (configError) {
    console.error('[EmailService] CRITICAL: Failed to initialize Nodemailer transporter due to config issue:', configError);
    transporter = null;
}


async function renderTemplate(templateName, data) {
    if (!transporter && process.env.NODE_ENV !== 'test') { // Allow tests to run without transporter
        console.warn(`[EmailService] Transporter not initialized. Cannot render template ${templateName}.`);
        throw new Error('Email service is not available.');
    }
    try {
        // CORRECTED PATH: 'email' (singular) instead of 'emails' (plural)
        const templatePath = path.join(__dirname, '..', 'templates', 'email', `${templateName}.html`);
        console.log('[EmailService] Attempting to read template from:', templatePath); // For debugging

        let html = await fs.readFile(templatePath, 'utf-8');

        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const regex = new RegExp(`{{${key}}}`, 'g');
                const value = data[key] === null || data[key] === undefined ? '' : String(data[key]);
                html = html.replace(regex, value);
            }
        }
        html = html.replace(/{{[^{}]+}}/g, '');

        html = html.replace(/{{#if (\w+)}}([\s\S]*?){{\/if}}/g, (match, conditionKey, content) => {
            return data[conditionKey] ? content : '';
        });

        return html;
    } catch (error) {
        console.error(`[EmailService] Error rendering email template ${templateName}:`, error);
        throw new Error(`Failed to render email template ${templateName}. Details: ${error.message}`);
    }
}

async function sendEmail({ to, subject, html, text }) {
    if (!transporter && process.env.NODE_ENV !== 'test') { // Allow tests to run without transporter
        console.warn(`[EmailService] Transporter not initialized. Email to ${to} with subject "${subject}" was not sent.`);
        return null;
    }
    const mailOptions = {
        from: `"${config.email.emailFromName || 'Wise App Clone'}" <${config.email.emailUser}>`,
        to,
        subject,
        html,
        text,
    };

    // If in test environment and transporter is null, log and return mock success
    if (process.env.NODE_ENV === 'test' && !transporter) {
        console.log(`[EmailService TEST MODE] Mock sending email to ${to} (Subject: "${subject}")`);
        return { messageId: 'test-message-id' };
    }


    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`[EmailService] Email sent to ${to} (Subject: "${subject}"): ${info.messageId}`);
        return info;
    } catch (error) {
        console.error(`[EmailService] Error sending email to ${to} (Subject: "${subject}"):`, error);
        return null;
    }
}

export default {
    sendEmail,
    renderTemplate,
};