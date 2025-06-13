// import User from '../models/User.js';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import config from '../config/index.js';
// import nodemailer from 'nodemailer';

// const registerUser = async (fullName, email, password) => {
//     try {
//         // Check if user with this email already exists
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             throw new Error('Email already exists.'); // User-friendly error message
//         }

//         // Hash the password before saving to database
//         const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds - adjust for security/performance trade-off
//         const newUser = new User({ fullName, email, password: hashedPassword });
//         await newUser.save();
//         return newUser; // Return the newly created user object (without password if you configure model to exclude it on toJSON)
//     } catch (error) {
//         // Log the error for debugging and monitoring
//         console.error("Error in registerUser service:", error);
//         if (error.message === 'Email already exists.') { // Re-throw specific user-friendly error
//             throw error;
//         }
//         throw new Error('Registration failed.'); // Generic error for other issues
//     }
// };

// const loginUser = async (email, password) => {
//     try {
//         // Find user by email
//         const user = await User.findOne({ email });
//         if (!user) {
//             throw new Error('Invalid credentials'); // Generic error message for security - don't reveal if email exists or not
//         }

//         // Compare provided password with hashed password from database
//         const passwordMatch = await bcrypt.compare(password, user.password);
//         if (!passwordMatch) {
//             throw new Error('Invalid credentials'); // Generic error message
//         }

//         // Generate JWT token upon successful login
//         const token = jwt.sign({ userId: user._id, role: user.role }, config.auth.jwtSecret, {
//             expiresIn: config.auth.jwtExpiration, // Token expiration time from config
//         });

//         return { user: { _id: user._id, email: user.email, fullName: user.fullName, role: user.role }, token }; // Return user info (excluding password) and token
//     } catch (error) {
//         // Log the error for debugging
//         console.error("Error in loginUser service:", error);
//         throw new Error('Login failed.'); // Generic error for login failures
//     }
// };



// const requestPasswordReset = async (email) => {
//     try {
//         const user = await User.findOne({ email });
//         if (!user) {
//             throw new Error('User with this email not found.'); // Don't reveal if email exists for security in production
//         }

//         // Generate a simpler reset token string (less cryptographically secure than crypto.randomBytes)
//         const resetToken = Date.now().toString(36) + Math.random().toString(36).substring(2);

//         // Hash the token using bcrypt before saving
//         const hashedResetToken = bcrypt.hashSync(resetToken, 10); // Synchronous hashing for simplicity

//         user.resetPasswordToken = hashedResetToken; // Store the bcrypt hashed token
//         user.resetPasswordExpires = Date.now() + 300000; // Token expires in 5 minutes
//         await user.save({ validateBeforeSave: false }); // Skip validation for these fields

//         const resetUrl = `${config.email.clientURL}/auth/reset-password/${resetToken}`; // Send the UNHASHED token in the URL

//         // Send email using nodemailer (same as before)
//         const transporter = nodemailer.createTransport({
//             host: config.email.smtpHost,
//             port: config.email.smtpPort,
//             secure: false,
//             auth: {
//                 user: config.email.smtpUser,
//                 pass: config.email.smtpPass,
//             },
//         });

//         const mailOptions = {
//             from: config.email.emailUser,
//             to: email,
//             subject: 'Password Reset Request',
//             html: `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
//                    <p>Please click on the following link, or paste this into your browser to complete the process:</p>
//                    <a href="${resetUrl}">${resetUrl}</a>
//                    <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`,
//         };

//         await transporter.sendMail(mailOptions);

//     } catch (error) {
//         console.error('Password reset request error:', error);
//         if (error.message === 'User with this email not found.') {
//             throw error;
//         }
//         throw new Error('Failed to send password reset email.');
//     }
// };

// const resetPassword = async (token, password) => {
//     try {
//         // No need to hash the token here again, compare directly with the stored bcrypt hash
//         const user = await User.findOne({
//             resetPasswordToken: { $ne: null }, // Ensure resetPasswordToken is not null
//             resetPasswordExpires: { $gt: Date.now() }, // Check if token is not expired
//         });


//         if (!user || !bcrypt.compareSync(token, user.resetPasswordToken) ) { // Compare provided token with the stored bcrypt hash
//             throw new Error('Invalid or expired password reset token.');
//         }


//         const hashedPassword = await bcrypt.hashSync(password, 10); // Hash the new password
//         user.password = hashedPassword;
//         user.resetPasswordToken = undefined; // Clear reset token fields
//         user.resetPasswordExpires = undefined;
//         await user.save();

//     } catch (error) {
//         console.error('Password reset error:', error);
//         if (error.message === 'Invalid or expired password reset token.') {
//             throw error;
//         }
//         throw new Error('Password reset failed.');
//     }
// };


// export default {
//     registerUser,
//     loginUser,
//     requestPasswordReset,
//     resetPassword,
// };



// import User from '../models/User.js';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import config from '../config/index.js';
// import nodemailer from 'nodemailer';

// const registerUser = async (fullName, email, password) => {
//     try {
//         // Check if user with this email already exists
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             throw new Error('Email already exists.'); // User-friendly error message
//         }

//         // Hash the password before saving to database
//         const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds - adjust for security/performance trade-off
//         const newUser = new User({ fullName, email, password: hashedPassword });
//         await newUser.save();
//         return newUser; // Return the newly created user object (without password if you configure model to exclude it on toJSON)
//     } catch (error) {
//         // Log the error for debugging and monitoring
//         console.error("Error in registerUser service:", error);
//         if (error.message === 'Email already exists.') { // Re-throw specific user-friendly error
//             throw error;
//         }
//         throw new Error('Registration failed. Please check your input and try again.'); // More generic error for security
//     }
// };

// const loginUser = async (email, password) => {
//     try {
//         // Find user by email
//         const user = await User.findOne({ email });
//         if (!user) {
//             throw new Error('Invalid credentials'); // Generic error message for security - don't reveal if email exists or not
//         }

//         // Compare provided password with hashed password from database
//         const passwordMatch = await bcrypt.compare(password, user.password);
//         if (!passwordMatch) {
//             throw new Error('Invalid credentials'); // Generic error message
//         }

//         // Generate JWT token upon successful login
//         const token = jwt.sign({ userId: user._id, role: user.role }, config.auth.jwtSecret, {
//             expiresIn: config.auth.jwtExpiration, // Token expiration time from config
//         });

//         return { user: { _id: user._id, email: user.email, fullName: user.fullName, role: user.role }, token }; // Return user info (excluding password) and token
//     } catch (error) {
//         // Log the error for debugging
//         console.error("Error in loginUser service:", error);
//         throw new Error('Login failed. Please check your credentials.'); // More generic error for security
//     }
// };



// const requestPasswordReset = async (email) => {
//     try {
//         const user = await User.findOne({ email });
//         if (!user) {
//             // Intentionally do not reveal if email exists for security.
//             return; // Just return success silently to prevent email enumeration
//             // throw new Error('User with this email not found.'); // Don't reveal if email exists for security in production
//         }

//         // Generate a simpler reset token string (less cryptographically secure than crypto.randomBytes)
//         const resetToken = Date.now().toString(36) + Math.random().toString(36).substring(2);

//         // Hash the token using bcrypt before saving
//         const hashedResetToken = bcrypt.hashSync(resetToken, 10); // Synchronous hashing for simplicity

//         user.resetPasswordToken = hashedResetToken; // Store the bcrypt hashed token
//         user.resetPasswordExpires = Date.now() + 300000; // Token expires in 5 minutes
//         await user.save({ validateBeforeSave: false }); // Skip validation for these fields

//         const resetUrl = `${config.email.clientURL}/auth/reset-password/${resetToken}`; // Send the UNHASHED token in the URL

//         // Send email using nodemailer (same as before)
//         const transporter = nodemailer.createTransport({
//             host: config.email.smtpHost,
//             port: config.email.smtpPort,
//             secure: false,
//             auth: {
//                 user: config.email.smtpUser,
//                 pass: config.email.smtpPass,
//             },
//         });

//         const mailOptions = {
//             from: config.email.emailUser,
//             to: email,
//             subject: 'Password Reset Request',
//             html: `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
//                    <p>Please click on the following link, or paste this into your browser to complete the process:</p>
//                    <a href="${resetUrl}">${resetUrl}</a>
//                    <p>This link will expire in 5 minutes.</p>
//                    <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`, // Added expiry notice
//         };

//         await transporter.sendMail(mailOptions);

//     } catch (error) {
//         console.error('Password reset request error:', error);
//         // Do not reveal if email exists or not - silent fail for security
//         // if (error.message === 'User with this email not found.') {
//         //     throw error;
//         // }
//         throw new Error('Failed to send password reset email. Please try again later.'); // More generic error
//     }
// };

// const resetPassword = async (token, password) => {
//     try {
//         // No need to hash the token here again, compare directly with the stored bcrypt hash
//         const user = await User.findOne({
//             resetPasswordToken: { $ne: null }, // Ensure resetPasswordToken is not null
//             resetPasswordExpires: { $gt: Date.now() }, // Check if token is not expired
//         });


//         if (!user || !bcrypt.compareSync(token, user.resetPasswordToken) ) { // Compare provided token with the stored bcrypt hash
//             throw new Error('Invalid or expired password reset token.');
//         }


//         const hashedPassword = await bcrypt.hashSync(password, 10); // Hash the new password
//         user.password = hashedPassword;
//         user.resetPasswordToken = undefined; // Clear reset token fields
//         user.resetPasswordExpires = undefined;
//         await user.save();

//     } catch (error) {
//         console.error('Password reset error:', error);
//         if (error.message === 'Invalid or expired password reset token.') {
//             throw error;
//         }
//         throw new Error('Password reset failed. Please try again.'); // More generic error
//     }
// };


// export default {
//     registerUser,
//     loginUser,
//     requestPasswordReset,
//     resetPassword,
// };



// // backend/src/services/auth.service.js

// import User from '../models/User.js';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import config from '../config/index.js';
// import nodemailer from 'nodemailer';
// import mongoose from 'mongoose'; // Import mongoose

// const registerUser = async (fullName, email, password) => {
//     try {
//         // Check if user with this email already exists
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             throw new Error('Email already exists.'); // User-friendly error message
//         }

//         // Hash the password before saving to database
//         const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds - adjust for security/performance trade-off
//         // The 'pre save' hook in User.js model will initialize kyc object here
//         const newUser = new User({ fullName, email, password: hashedPassword });
//         await newUser.save();

//         // Exclude sensitive fields in the returned object for consistency
//         const userPayload = {
//             _id: newUser._id,
//             email: newUser.email,
//             fullName: newUser.fullName,
//             role: newUser.role,
//             // Access kyc safely after save
//             kyc: {
//                 status: newUser.kyc?.status || 'not_started',
//                 rejectionReason: newUser.kyc?.rejectionReason || null,
//             },
//             createdAt: newUser.createdAt,
//             updatedAt: newUser.updatedAt,
//         };
//         // Note: Usually, registration doesn't return a token, user needs to log in.
//         // But returning the user object like this is fine.
//         return userPayload; // Return user object without password/tokens
//     } catch (error) {
//         // Log the error for debugging and monitoring
//         console.error("Error in registerUser service:", error);
//         if (error.message === 'Email already exists.') { // Re-throw specific user-friendly error
//             throw error;
//         }
//         throw new Error('Registration failed. Please check your input and try again.'); // More generic error for security
//     }
// };

// const loginUser = async (email, password) => {
//     try {
//         // Find user by email - Ensure password and KYC fields are selected
//         // Selecting kyc explicitly ensures it's retrieved. +password needed for comparison.
//         const user = await User.findOne({ email })
//         .select('+password +kyc +createdAt +updatedAt'); // Select password, kyc, and timestamps
//         if (!user) {
//             throw new Error('Invalid credentials'); // Generic error message for security
//         }

//         // Safeguard (already suggested, keep it)
//         if (!user.password) {
//             console.error(`CRITICAL: User ${email} found but password field is missing or undefined! Query or data issue.`);
//             throw new Error('Authentication process failed unexpectedly.');
//         }

//         // Compare provided password with hashed password from database
//         const passwordMatch = await bcrypt.compare(password, user.password);
//         if (!passwordMatch) {
//             throw new Error('Invalid credentials'); // Generic error message
//         }

//         // --- FIX: Ensure kyc object exists before creating payload ---
//         // The pre-save hook should create it, but this is a safety net.
//         // If `select('+kyc')` was successful, `user.kyc` should exist unless DB is inconsistent.
//         if (!user.kyc) {
//             console.warn(`User ${email} is missing the kyc subdocument after login fetch. Defaulting status.`);
//             // Provide a default structure if kyc is unexpectedly missing
//              user.kyc = { status: 'not_started', rejectionReason: null };
//              // Consider logging this as a potential data integrity issue.
//         }

//         // --- FIX: Construct the full user payload matching Frontend User type ---
//         const userPayload = {
//             _id: user._id.toString(), // Ensure ID is string
//             email: user.email,
//             fullName: user.fullName,
//             role: user.role,
//             kyc: { // Nest the kyc object
//                  status: user.kyc.status,
//                  rejectionReason: user.kyc.rejectionReason,
//                  // Add other kyc fields here if the frontend User type expects them
//             },
//             // Include timestamps if the frontend User type expects them
//             createdAt: user.createdAt.toISOString(),
//             updatedAt: user.updatedAt.toISOString(),
//         };


//         // Generate JWT token upon successful login
//         const token = jwt.sign(
//             { userId: user._id, role: user.role },
//             config.auth.jwtSecret,
//             { expiresIn: config.auth.jwtExpiration } // Token expiration time from config
//         );
//         console.log(`Login successful for ${email}. KYC Status: ${userPayload.kyc.status}`);
//         // Return the user payload (with KYC status) and the token
//         return { user: userPayload, token };

//     } catch (error) {
//         console.error(`Error in loginUser service for ${email}:`, error);
//         if (error.message === 'Invalid credentials' || error.message === 'Authentication process failed unexpectedly.') {
//             throw error;
//         }
//         throw new Error('Login failed. Please check your credentials or try again later.');
//     }
// };


// const requestPasswordReset = async (email) => {
//     try {
//         const user = await User.findOne({ email });
//         if (!user) {
//             // Intentionally do not reveal if email exists for security.
//             console.log(`Password reset requested for non-existent email: ${email}`); // Log for monitoring
//             return; // Just return success silently to prevent email enumeration
//         }

//         // Generate a simpler reset token string
//         const resetToken = Date.now().toString(36) + Math.random().toString(36).substring(2);

//         // Hash the token using bcrypt before saving
//         const hashedResetToken = bcrypt.hashSync(resetToken, 10);

//         user.resetPasswordToken = hashedResetToken;
//         user.resetPasswordExpires = Date.now() + 300000; // Token expires in 5 minutes (300,000 ms)
//         await user.save({ validateBeforeSave: false }); // Skip validation for these fields

//         const resetUrl = `${config.email.clientURL}/auth/reset-password/${resetToken}`; // Send the UNHASHED token in the URL

//         // Send email using nodemailer
//         const transporter = nodemailer.createTransport({
//             host: config.email.smtpHost,
//             port: config.email.smtpPort,
//             secure: config.email.smtpPort === 465, // Use true for port 465, false for others like 587
//             auth: {
//                 user: config.email.smtpUser,
//                 pass: config.email.smtpPass,
//             },
//             // Optional: Add TLS options if needed for specific providers
//             // tls: {
//             //     ciphers:'SSLv3'
//             // }
//         });

//         const mailOptions = {
//             from: `"${config.email.emailFromName || 'Your App Name'}" <${config.email.emailUser}>`, // Use a display name
//             to: email,
//             subject: 'Password Reset Request',
//             html: `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
//                    <p>Please click on the following link, or paste this into your browser to complete the process:</p>
//                    <p><a href="${resetUrl}" style="color: #007bff; text-decoration: none;">Reset Password</a></p>
//                    <p>If the link above doesn't work, copy and paste this URL into your browser:</p>
//                    <p>${resetUrl}</p>
//                    <p>This link will expire in 5 minutes.</p>
//                    <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`, // Added expiry notice and better styling
//         };

//         await transporter.sendMail(mailOptions);
//         console.log(`Password reset email sent to ${email}`);

//     } catch (error) {
//         console.error('Password reset request error:', error);
//         // Do not throw error to the user to prevent leaking info, but log it server-side.
//         // Consider sending a generic success message even on internal failure for security.
//         // For now, throwing a generic error for the controller to handle (will be caught by global handler)
//         throw new Error('Failed to process password reset request. Please try again later.');
//     }
// };

// const resetPassword = async (token, password) => {
//     try {
//         // Find the user based on the token *and* expiry date
//         // It's crucial to check expiry here before comparing the token
//         const user = await User.findOne({
//             resetPasswordToken: { $exists: true, $ne: null }, // Ensure resetPasswordToken exists and is not null
//             resetPasswordExpires: { $gt: Date.now() }, // Check if token is not expired
//         });

//         // If no user found with an unexpired token OR if the token doesn't match
//         if (!user || !bcrypt.compareSync(token, user.resetPasswordToken)) {
//             // Log the attempt for security monitoring
//             console.warn(`Invalid or expired password reset attempt with token: ${token}`);
//             throw new Error('Invalid or expired password reset token.');
//         }

//         // Hash the new password
//         const hashedPassword = await bcrypt.hash(password, 10); // Use async hash
//         user.password = hashedPassword;
//         user.resetPasswordToken = undefined; // Clear reset token fields
//         user.resetPasswordExpires = undefined;
//         await user.save(); // Let default validation run

//         console.log(`Password successfully reset for user: ${user.email}`); // Log success

//     } catch (error) {
//         console.error('Password reset error:', error);
//         if (error.message === 'Invalid or expired password reset token.') {
//             throw error; // Re-throw specific user-facing error
//         }
//         // Handle potential validation errors during save if any
//         if (error.name === 'ValidationError') {
//             throw new Error('Password update failed due to validation issues.');
//         }
//         // Throw a generic error for other issues
//         throw new Error('Password reset failed. Please request a new reset link.');
//     }
// };


// export default {
//     registerUser,
//     loginUser,
//     requestPasswordReset,
//     resetPassword,
// };

// import User from '../models/User.js';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import config from '../config/index.js';
// import nodemailer from 'nodemailer';
// import mongoose from 'mongoose'; // Import mongoose

// const registerUser = async (fullName, email, password) => {
//     console.log(`[Auth Service - registerUser] Attempting registration for email: ${email}`);
//     try {
//         // Check if user with this email already exists
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             console.log(`[Auth Service - registerUser] Registration failed: Email ${email} already exists.`);
//             throw new Error('Email already exists.'); // User-friendly error message
//         }

//         // Hash the password before saving (will be done by pre-save hook)
//         // The 'pre save' hook in User.js model will initialize kyc object here
//         const newUser = new User({ fullName, email, password }); // Pass plaintext password, hook will hash it
//         await newUser.save();
//         console.log(`[Auth Service - registerUser] User ${email} registered successfully.`);

//         // Exclude sensitive fields in the returned object
//         const userPayload = {
//             _id: newUser._id,
//             email: newUser.email,
//             fullName: newUser.fullName,
//             role: newUser.role,
//             kyc: {
//                 status: newUser.kyc?.status || 'not_started',
//                 rejectionReason: newUser.kyc?.rejectionReason || null,
//             },
//             createdAt: newUser.createdAt,
//             updatedAt: newUser.updatedAt,
//         };
//         return userPayload;
//     } catch (error) {
//         console.error("[Auth Service - registerUser] Error during registration:", error.message);
//         if (error.message === 'Email already exists.') {
//             throw error; // Re-throw specific user-friendly error
//         }
//         // Consider logging the full error for internal debugging
//         // console.error(error);
//         throw new Error('Registration failed. Please check your input and try again.');
//     }
// };

// const loginUser = async (email, password) => {
//     // --- ADDED LOG ---
//     console.log(`[Auth Service - loginUser] Attempting login for email: ${email}`);
//     // --- TEMPORARY DEBUGGING - CONSIDER REMOVING/COMMENTING AFTER FIX ---
//     // console.log(`[Auth Service - loginUser] Plaintext password received: "${password}" (Length: ${password.length})`);
//     // --- END TEMPORARY DEBUGGING ---
//     try {
//         // Find user by email - Ensure password field is selected
//         const user = await User.findOne({ email })
//                                .select('+password +kyc +createdAt +updatedAt'); // Select required fields explicitly

//         if (!user) {
//             // --- ADDED LOG ---
//             console.log(`[Auth Service - loginUser] User not found for email: ${email}`);
//             throw new Error('Invalid credentials'); // Generic error message for security
//         }

//         // --- ADDED LOG ---
//         console.log(`[Auth Service - loginUser] User found: ${user.email}`);

//         // Safeguard: Check if password field exists on the retrieved user object
//         if (!user.password) {
//             // --- ADDED LOG ---
//             console.error(`[Auth Service - loginUser] CRITICAL: Password field is MISSING for user ${email} after DB query! Check if it was hashed and selected.`);
//             throw new Error('Authentication process failed unexpectedly.');
//         }

//         // --- ADDED LOG --- (Don't log full hash in production)
//         console.log(`[Auth Service - loginUser] Hashed password retrieved from DB for ${email}. Starts with: ${user.password.substring(0, 7)}...`);

//         // Compare provided password with hashed password from database
//         // --- ADDED LOG ---
//         console.log(`[Auth Service - loginUser] Comparing provided password with stored hash for ${email}...`);
//         const passwordMatch = await bcrypt.compare(password, user.password); // Plaintext first, then hash
//         // --- ADDED LOG --- (Crucial log)
//         console.log(`[Auth Service - loginUser] bcrypt.compare result for ${email}: ${passwordMatch}`);

//         if (!passwordMatch) {
//             // --- ADDED LOG ---
//             console.log(`[Auth Service - loginUser] Password comparison FAILED for ${email}`);
//             throw new Error('Invalid credentials'); // Generic error message
//         }

//         // --- ADDED LOG ---
//         console.log(`[Auth Service - loginUser] Password comparison SUCCEEDED for ${email}`);

//         // --- Ensure kyc object exists before creating payload ---
//         if (!user.kyc) {
//             console.warn(`[Auth Service - loginUser] User ${email} is missing the kyc subdocument after login fetch. Defaulting status.`);
//             user.kyc = { status: 'not_started', rejectionReason: null };
//         }

//         // Construct the full user payload matching Frontend User type
//         const userPayload = {
//             _id: user._id.toString(), // Ensure ID is string
//             email: user.email,
//             fullName: user.fullName,
//             role: user.role,
//             kyc: { // Nest the kyc object
//                  status: user.kyc.status,
//                  rejectionReason: user.kyc.rejectionReason,
//             },
//             createdAt: user.createdAt.toISOString(),
//             updatedAt: user.updatedAt.toISOString(),
//         };

//         // Generate JWT token upon successful login
//         const token = jwt.sign(
//             { userId: user._id, role: user.role },
//             config.auth.jwtSecret,
//             { expiresIn: config.auth.jwtExpiration }
//         );

//         console.log(`[Auth Service - loginUser] Login successful, token generated for ${email}. KYC Status: ${userPayload.kyc.status}`);
//         // Return the user payload (with KYC status) and the token
//         return { user: userPayload, token };

//     } catch (error) {
//         // --- ADDED LOG ---
//         console.error(`[Auth Service - loginUser] Error during login process for ${email}:`, error.message);
//         // console.error(error); // Optional: Log full error stack in dev
//         if (error.message === 'Invalid credentials' || error.message === 'Authentication process failed unexpectedly.') {
//             throw error; // Re-throw specific known errors for controller to handle
//         }
//         // Throw a more generic error for unknown issues during login
//         throw new Error('Login failed due to a server error.'); // Avoid exposing detailed internal errors
//     }
// };


// const requestPasswordReset = async (email) => {
//     console.log(`[Auth Service - requestPasswordReset] Request received for email: ${email}`);
//     try {
//         const user = await User.findOne({ email });
//         if (!user) {
//             console.log(`[Auth Service - requestPasswordReset] Password reset requested for non-existent or unverified email: ${email}. Responding silently.`);
//             // Intentionally do not reveal if email exists for security.
//             return; // Just return success silently to prevent email enumeration
//         }

//         const resetToken = Date.now().toString(36) + Math.random().toString(36).substring(2);
//         const hashedResetToken = bcrypt.hashSync(resetToken, 10); // Hash the token for storage

//         user.resetPasswordToken = hashedResetToken;
//         user.resetPasswordExpires = Date.now() + 300000; // Token expires in 5 minutes
//         await user.save({ validateBeforeSave: false }); // Skip validation for these fields
//         console.log(`[Auth Service - requestPasswordReset] Reset token generated and saved for ${email}.`);

//         const resetUrl = `${config.email.clientURL}/auth/reset-password/${resetToken}`; // Send UNHASHED token in URL

//         const transporter = nodemailer.createTransport({
//             host: config.email.smtpHost,
//             port: config.email.smtpPort,
//             secure: config.email.smtpPort === 465,
//             auth: { user: config.email.smtpUser, pass: config.email.smtpPass },
//         });

//         const mailOptions = {
//             from: `"${config.email.emailFromName || 'Your App Name'}" <${config.email.emailUser}>`,
//             to: email,
//             subject: 'Password Reset Request',
//             html: `<p>You requested a password reset.</p>
//                    <p>Click this link to reset your password (expires in 5 minutes):</p>
//                    <p><a href="${resetUrl}" style="color: #007bff; text-decoration: none;">${resetUrl}</a></p>
//                    <p>If you did not request this, please ignore this email.</p>`,
//         };

//         await transporter.sendMail(mailOptions);
//         console.log(`[Auth Service - requestPasswordReset] Password reset email successfully sent to ${email}`);

//     } catch (error) {
//         console.error('[Auth Service - requestPasswordReset] Error processing password reset request:', error);
//         // Do not throw error to the user to prevent leaking info, but log it.
//         // Consider sending a generic success message even on internal failure for security.
//         // Throwing generic error for now, controller should handle it gracefully.
//         throw new Error('Failed to process password reset request. Please try again later.');
//     }
// };

// const resetPassword = async (token, password) => {
//     console.log(`[Auth Service - resetPassword] Attempting password reset with token.`);
//     try {
//         // Find the user based on the token *and* expiry date
//         // It's crucial to check expiry here before comparing the token
//         const user = await User.findOne({
//             resetPasswordToken: { $exists: true, $ne: null }, // Ensure field exists
//             resetPasswordExpires: { $gt: Date.now() },        // Ensure token is not expired
//         });

//         // If no user found OR if the provided token doesn't match the HASHED token in DB
//         if (!user || !bcrypt.compareSync(token, user.resetPasswordToken)) {
//             console.warn(`[Auth Service - resetPassword] Invalid or expired password reset attempt.`);
//             throw new Error('Invalid or expired password reset token.');
//         }

//         console.log(`[Auth Service - resetPassword] Valid reset token found for user ${user.email}. Updating password.`);

//         // Hash the new password (pre-save hook will handle this)
//         user.password = password; // Assign the new plaintext password
//         user.resetPasswordToken = undefined; // Clear reset token fields
//         user.resetPasswordExpires = undefined;
//         await user.save(); // Let pre-save hook hash the password and run default validation

//         console.log(`[Auth Service - resetPassword] Password successfully reset for user: ${user.email}`);

//     } catch (error) {
//         console.error('[Auth Service - resetPassword] Password reset error:', error.message);
//         // console.error(error); // Optional: Log full error stack
//         if (error.message === 'Invalid or expired password reset token.') {
//             throw error; // Re-throw specific user-facing error
//         }
//         if (error.name === 'ValidationError') { // Catch Mongoose validation errors (e.g., password too short)
//             console.log("[Auth Service - resetPassword] Validation error during password save:", error.errors);
//             // Extract a user-friendly message if possible
//             const messages = Object.values(error.errors).map(el => el.message);
//             throw new Error(`Password update failed: ${messages.join(', ')}`);
//         }
//         // Throw a generic error for other issues
//         throw new Error('Password reset failed. Please request a new reset link.');
//     }
// };


// export default {
//     registerUser,
//     loginUser,
//     requestPasswordReset,
//     resetPassword,
// };


// // services/auth.service.js
// import User from '../models/User.js';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import config from '../config/index.js';
// import nodemailer from 'nodemailer';
// import mongoose from 'mongoose';
// import { OAuth2Client } from 'google-auth-library'; // Import Google library

// // --- Existing registerUser, loginUser, requestPasswordReset, resetPassword functions (Keep them as they are) ---
// // ... (registerUser code) ...
// const registerUser = async (fullName, email, password) => {
//     console.log(`[Auth Service - registerUser] Attempting registration for email: ${email}`);
//     try {
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             console.log(`[Auth Service - registerUser] Registration failed: Email ${email} already exists.`);
//             // Check if it's a Google account trying to register normally
//             if (existingUser.isGoogleAccount) {
//                 throw new Error('This email is registered using Google Sign-In. Please log in with Google.');
//             }
//             throw new Error('Email already exists.');
//         }

//         const newUser = new User({ fullName, email, password });
//         await newUser.save();
//         console.log(`[Auth Service - registerUser] User ${email} registered successfully.`);

//         const userPayload = { /* ... (construct payload as before) ... */
//             _id: newUser._id,
//             email: newUser.email,
//             fullName: newUser.fullName,
//             role: newUser.role,
//             kyc: { status: newUser.kyc?.status || 'not_started', rejectionReason: newUser.kyc?.rejectionReason || null, },
//             createdAt: newUser.createdAt,
//             updatedAt: newUser.updatedAt,
//             // Add isGoogleAccount to payload if needed by frontend logic (optional)
//             // isGoogleAccount: newUser.isGoogleAccount
//         };
//         return userPayload;
//     } catch (error) {
//         console.error("[Auth Service - registerUser] Error during registration:", error.message);
//         if (error.message === 'Email already exists.' || error.message.includes('Google Sign-In')) {
//             throw error;
//         }
//         throw new Error('Registration failed. Please check your input and try again.');
//     }
// };

// // ... (loginUser code) ...
// const loginUser = async (email, password) => {
//     console.log(`[Auth Service - loginUser] Attempting login for email: ${email}`);
//     try {
//         const user = await User.findOne({ email })
//                                .select('+password +kyc +createdAt +updatedAt +isGoogleAccount +googleId'); // Select needed fields

//         if (!user) {
//             console.log(`[Auth Service - loginUser] User not found for email: ${email}`);
//             throw new Error('Invalid credentials');
//         }

//         // --- Prevent normal login for Google accounts ---
//         if (user.isGoogleAccount || user.googleId) {
//              console.log(`[Auth Service - loginUser] Attempt to log in normally for Google account: ${email}`);
//              throw new Error('This account uses Google Sign-In. Please use the "Continue with Google" button.');
//         }
//         // -----------------------------------------------

//         console.log(`[Auth Service - loginUser] User found: ${user.email}`);

//         if (!user.password) {
//              console.error(`[Auth Service - loginUser] CRITICAL: Password field is MISSING for non-Google user ${email}!`);
//              throw new Error('Authentication process failed unexpectedly.');
//         }

//         console.log(`[Auth Service - loginUser] Comparing provided password with stored hash for ${email}...`);
//         const passwordMatch = await bcrypt.compare(password, user.password);
//         console.log(`[Auth Service - loginUser] bcrypt.compare result for ${email}: ${passwordMatch}`);

//         if (!passwordMatch) {
//             console.log(`[Auth Service - loginUser] Password comparison FAILED for ${email}`);
//             throw new Error('Invalid credentials');
//         }

//         console.log(`[Auth Service - loginUser] Password comparison SUCCEEDED for ${email}`);

//         if (!user.kyc) { user.kyc = { status: 'not_started', rejectionReason: null }; }

//         const userPayload = { /* ... (construct payload as before) ... */
//             _id: user._id.toString(), email: user.email, fullName: user.fullName, role: user.role,
//             kyc: { status: user.kyc.status, rejectionReason: user.kyc.rejectionReason, },
//             createdAt: user.createdAt.toISOString(), updatedAt: user.updatedAt.toISOString(),
//             // isGoogleAccount: user.isGoogleAccount // optional
//          };

//         const token = jwt.sign( /* ... (generate token as before) ... */
//             { userId: user._id, role: user.role },
//             config.auth.jwtSecret,
//             { expiresIn: config.auth.jwtExpiration }
//         );

//         console.log(`[Auth Service - loginUser] Login successful, token generated for ${email}. KYC Status: ${userPayload.kyc.status}`);
//         return { user: userPayload, token };

//     } catch (error) {
//         console.error(`[Auth Service - loginUser] Error during login process for ${email}:`, error.message);
//         if (error.message === 'Invalid credentials' || error.message.includes('Google Sign-In') || error.message.includes('Authentication process failed')) {
//             throw error; // Re-throw specific known errors
//         }
//         throw new Error('Login failed due to a server error.');
//     }
// };

// // ... (requestPasswordReset code - check if it's a Google account first?) ...
//  const requestPasswordReset = async (email) => {
//     console.log(`[Auth Service - requestPasswordReset] Request received for email: ${email}`);
//     try {
//         const user = await User.findOne({ email }).select('+isGoogleAccount +googleId'); // Check if Google account
//         if (!user) {
//             console.log(`[Auth Service - requestPasswordReset] Non-existent email: ${email}. Responding silently.`); return;
//         }
//         // --- Prevent password reset for Google accounts ---
//         if (user.isGoogleAccount || user.googleId) {
//              console.log(`[Auth Service - requestPasswordReset] Password reset requested for Google account: ${email}. Denying silently.`);
//              // Send the generic success message anyway for security through obscurity
//              // Optionally, you could send a specific email explaining they need to use Google recovery.
//              return; // Exit function silently
//         }
//         // --- Continue with normal password reset ---
//         // ... (rest of the reset logic: generate token, save, send email) ...
//         const resetToken = Date.now().toString(36) + Math.random().toString(36).substring(2);
//         const hashedResetToken = bcrypt.hashSync(resetToken, 10);

//         user.resetPasswordToken = hashedResetToken;
//         user.resetPasswordExpires = Date.now() + 300000; // 5 minutes
//         await user.save({ validateBeforeSave: false });
//         console.log(`[Auth Service - requestPasswordReset] Reset token generated and saved for ${email}.`);

//         const resetUrl = `${config.email.clientURL}/auth/reset-password/${resetToken}`;

//         const transporter = nodemailer.createTransport({ /* ... transporter config ... */
//             host: config.email.smtpHost, port: config.email.smtpPort, secure: config.email.smtpPort === 465,
//             auth: { user: config.email.smtpUser, pass: config.email.smtpPass },
//         });
//         const mailOptions = { /* ... mail options ... */
//             from: `"${config.email.emailFromName || 'Your App Name'}" <${config.email.emailUser}>`, to: email, subject: 'Password Reset Request',
//             html: `<p>You requested a password reset.</p><p>Click this link to reset your password (expires in 5 minutes):</p><p><a href="${resetUrl}" style="color: #007bff; text-decoration: none;">${resetUrl}</a></p><p>If you did not request this, please ignore this email.</p>`,
//         };
//         await transporter.sendMail(mailOptions);
//         console.log(`[Auth Service - requestPasswordReset] Password reset email successfully sent to ${email}`);
//     } catch (error) {
//         console.error('[Auth Service - requestPasswordReset] Error processing password reset request:', error);
//         throw new Error('Failed to process password reset request. Please try again later.');
//     }
// };
// // ... (resetPassword code - this should inherently not work for Google accounts as they won't have the token) ...
// const resetPassword = async (token, password) => { /* ... keep as is ... */
//     console.log(`[Auth Service - resetPassword] Attempting password reset with token.`);
//     try {
//         const user = await User.findOne({
//             resetPasswordToken: { $exists: true, $ne: null },
//             resetPasswordExpires: { $gt: Date.now() },
//         }).select('+password'); // Ensure password selected for comparison if needed, though pre-save hook handles hashing

//         if (!user || !bcrypt.compareSync(token, user.resetPasswordToken)) {
//             console.warn(`[Auth Service - resetPassword] Invalid or expired password reset attempt.`);
//             throw new Error('Invalid or expired password reset token.');
//         }

//          // Add check: Should not be able to reset password for a Google account via token
//          if (user.isGoogleAccount || user.googleId) {
//              console.warn(`[Auth Service - resetPassword] Attempt to reset password for Google account ${user.email} via token.`);
//              throw new Error('Password reset is not available for accounts signed in with Google.');
//          }

//         console.log(`[Auth Service - resetPassword] Valid reset token found for user ${user.email}. Updating password.`);
//         user.password = password;
//         user.resetPasswordToken = undefined;
//         user.resetPasswordExpires = undefined;
//         await user.save(); // pre-save hook hashes password

//         console.log(`[Auth Service - resetPassword] Password successfully reset for user: ${user.email}`);
//     } catch (error) {
//         console.error('[Auth Service - resetPassword] Password reset error:', error.message);
//         if (error.message.includes('Invalid or expired') || error.message.includes('not available for accounts signed in with Google')) {
//             throw error;
//         }
//         if (error.name === 'ValidationError') {
//             const messages = Object.values(error.errors).map(el => el.message);
//             throw new Error(`Password update failed: ${messages.join(', ')}`);
//         }
//         throw new Error('Password reset failed. Please request a new reset link.');
//     }
// };

// // --- New Google OAuth Service Function ---
// const googleOAuthLogin = async (idToken) => {
//     console.log("[Auth Service - googleOAuthLogin] Verifying Google ID token.");
//     const client = new OAuth2Client(config.googleAuth.clientId);
//     try {
//         const ticket = await client.verifyIdToken({
//             idToken: idToken,
//             audience: config.googleAuth.clientId, // Specify the CLIENT_ID of the app that accesses the backend
//         });
//         const payload = ticket.getPayload();

//         if (!payload) {
//             throw new Error('Invalid Google ID token payload.');
//         }
//         if (!payload.email_verified) {
//              throw new Error('Google account email not verified.');
//         }

//         const { sub: googleId, email, name: fullName, picture: googleProfilePicture } = payload;

//         console.log(`[Auth Service - googleOAuthLogin] Google token verified for email: ${email}`);

//         // Find user by Google ID first, then by email
//         let user = await User.findOne({ googleId: googleId })
//                              .select('+kyc +createdAt +updatedAt +isGoogleAccount +googleId'); // Fetch necessary fields

//         if (!user) {
//             console.log(`[Auth Service - googleOAuthLogin] No user found with googleId ${googleId}. Checking by email: ${email}`);
//             user = await User.findOne({ email: email })
//                              .select('+kyc +createdAt +updatedAt +isGoogleAccount +googleId');

//             if (user) {
//                 // User exists with this email but hasn't linked Google yet
//                 console.log(`[Auth Service - googleOAuthLogin] Existing user found by email ${email}. Linking Google ID.`);
//                  // Check if the existing account is already a normal account with a password
//                  if (!user.isGoogleAccount && !user.googleId) {
//                      // Decide policy: Allow linking? Or throw error? Let's allow linking.
//                      // Update the user to link the Google account
//                      user.googleId = googleId;
//                      user.isGoogleAccount = true; // Mark as Google account now
//                      user.googleProfilePicture = googleProfilePicture;
//                      // We might want to nullify the password here, but that's a security consideration.
//                      // For now, let's just link. User can still log in via Google.
//                      // Password reset should be blocked now for this user.
//                      await user.save();
//                      console.log(`[Auth Service - googleOAuthLogin] Linked Google ID ${googleId} to existing user ${email}.`);
//                  } else if (user.googleId !== googleId) {
//                      // Edge case: Email matches, but googleId is different (unlikely unless Google reuses emails?)
//                      console.error(`[Auth Service - googleOAuthLogin] Email ${email} exists but with different Google ID! Existing: ${user.googleId}, New: ${googleId}`);
//                      throw new Error('Account conflict. Please contact support.');
//                  }
//                  // If user.googleId === googleId, it means we somehow missed the findOne({ googleId }) query, but this handles it.
//             } else {
//                 // User does not exist, create a new Google-based user
//                 console.log(`[Auth Service - googleOAuthLogin] No user found. Creating new Google user for ${email}`);
//                 user = new User({
//                     googleId: googleId,
//                     email: email,
//                     fullName: fullName,
//                     isGoogleAccount: true,
//                     googleProfilePicture: googleProfilePicture,
//                     // Password field will be skipped due to model validation logic
//                     // KYC will be initialized by pre-save hook
//                 });
//                 await user.save();
//                 console.log(`[Auth Service - googleOAuthLogin] New Google user ${email} created successfully.`);
//             }
//         } else {
//              console.log(`[Auth Service - googleOAuthLogin] Existing Google user found by googleId ${googleId} for email ${email}.`);
//              // Optional: Update name/picture if changed in Google profile
//              let updated = false;
//              if (user.fullName !== fullName) { user.fullName = fullName; updated = true; }
//              if (user.googleProfilePicture !== googleProfilePicture) { user.googleProfilePicture = googleProfilePicture; updated = true; }
//              if (updated) {
//                  await user.save();
//                  console.log(`[Auth Service - googleOAuthLogin] Updated profile info for ${email}.`);
//              }
//         }

//         // --- Prepare payload and token (same as regular login) ---
//         if (!user.kyc) { user.kyc = { status: 'not_started', rejectionReason: null }; }

//         const userPayload = {
//             _id: user._id.toString(), email: user.email, fullName: user.fullName, role: user.role,
//             kyc: { status: user.kyc.status, rejectionReason: user.kyc.rejectionReason, },
//             createdAt: user.createdAt.toISOString(), updatedAt: user.updatedAt.toISOString(),
//             // isGoogleAccount: user.isGoogleAccount // optional
//         };

//         const token = jwt.sign(
//             { userId: user._id, role: user.role },
//             config.auth.jwtSecret,
//             { expiresIn: config.auth.jwtExpiration }
//         );

//         console.log(`[Auth Service - googleOAuthLogin] Google login successful, token generated for ${email}. KYC Status: ${userPayload.kyc.status}`);
//         return { user: userPayload, token };

//     } catch (error) {
//         console.error("[Auth Service - googleOAuthLogin] Error during Google OAuth process:", error);
//         if (error.message.includes('Invalid Google ID token') || error.message.includes('email not verified') || error.message.includes('Account conflict')) {
//              throw error; // Re-throw specific errors
//         }
//         // Distinguish between verification failure and user creation/login failure
//         if (error instanceof mongoose.Error.ValidationError) {
//             throw new Error(`User data validation failed: ${error.message}`);
//         }
//          if (error instanceof mongoose.Error && error.message.includes('duplicate key error')) {
//             // This might happen if two requests try to create the same user concurrently
//             console.warn("[Auth Service - googleOAuthLogin] Potential duplicate key error during Google user creation:", error.message);
//             // Attempt to fetch the user again, as it might have been created by the other request
//             const payload = ticket?.getPayload();
//             if (payload?.sub) {
//                 const existingUser = await User.findOne({ googleId: payload.sub }).select('+kyc +createdAt +updatedAt +isGoogleAccount');
//                 if (existingUser) {
//                      console.log("[Auth Service - googleOAuthLogin] Found user on retry after duplicate key error.");
//                      // Proceed to generate token for the existing user (logic copied from above)
//                      if (!existingUser.kyc) { existingUser.kyc = { status: 'not_started', rejectionReason: null }; }
//                      const userPayload = { /* ... construct payload ... */ };
//                      const token = jwt.sign({ userId: existingUser._id, role: existingUser.role }, config.auth.jwtSecret, { expiresIn: config.auth.jwtExpiration });
//                      return { user: userPayload, token };
//                 }
//             }
//              throw new Error('Failed to process Google Sign-In due to a conflict. Please try again.');
//         }
//         throw new Error('Google Sign-In failed. Please try again or use email/password.'); // Generic error
//     }
// };
// // -------------------------------------

// export default {
//     registerUser,
//     loginUser,
//     requestPasswordReset,
//     resetPassword,
//     googleOAuthLogin, // <-- Export the new function
// };


// // backend/src/services/auth.service.js
// import User from '../models/User.js';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import config from '../config/index.js';
// import nodemailer from 'nodemailer';
// import mongoose from 'mongoose';
// import { OAuth2Client } from 'google-auth-library';

// // --- Register User (Added Google check during lookup) ---
// const registerUser = async (fullName, email, password) => {
//     console.log(`[Auth Service - registerUser] Attempting registration for email: ${email}`);
//     try {
//         // Select google flags during lookup
//         const existingUser = await User.findOne({ email }).select('+isGoogleAccount +googleId');
//         if (existingUser) {
//             console.log(`[Auth Service - registerUser] Registration failed: Email ${email} already exists.`);
//             // --- MODIFIED: Check if existing is Google account ---
//             if (existingUser.isGoogleAccount || existingUser.googleId) {
//                 throw new Error('This email is registered using Google Sign-In. Please log in with Google.');
//             }
//             // --- END MODIFICATION ---
//             throw new Error('Email already exists.');
//         }

//         const newUser = new User({ fullName, email, password });
//         await newUser.save();
//         console.log(`[Auth Service - registerUser] User ${email} registered successfully.`);

//         const userPayload = {
//             _id: newUser._id,
//             email: newUser.email,
//             fullName: newUser.fullName,
//             role: newUser.role,
//             kyc: { status: newUser.kyc?.status || 'not_started', rejectionReason: newUser.kyc?.rejectionReason || null, },
//             createdAt: newUser.createdAt,
//             updatedAt: newUser.updatedAt,
//             isGoogleAccount: newUser.isGoogleAccount // Include this flag
//         };
//         return userPayload;
//     } catch (error) {
//         console.error("[Auth Service - registerUser] Error during registration:", error.message);
//         if (error.message === 'Email already exists.' || error.message.includes('Google Sign-In')) {
//             throw error; // Re-throw specific errors
//         }
//         throw new Error('Registration failed. Please check your input and try again.');
//     }
// };

// // --- Login User (Added check for Google Account) ---
// const loginUser = async (email, password) => {
//     console.log(`[Auth Service - loginUser] Attempting login for email: ${email}`);
//     try {
//         const user = await User.findOne({ email })
//                                .select('+password +kyc +createdAt +updatedAt +isGoogleAccount +googleId'); // Select needed fields

//         if (!user) {
//             console.log(`[Auth Service - loginUser] User not found for email: ${email}`);
//             throw new Error('Invalid credentials');
//         }

//         // --- MODIFIED: Prevent normal login for Google accounts ---
//         if (user.isGoogleAccount || user.googleId) {
//              console.log(`[Auth Service - loginUser] Attempt to log in normally for Google account: ${email}`);
//              // Specific error message for the frontend
//              throw new Error('This account uses Google Sign-In. Please use the "Continue with Google" button.');
//         }
//         // --- END MODIFICATION ---

//         console.log(`[Auth Service - loginUser] User found: ${user.email}`);

//         // Ensure password field exists for non-Google users attempting login
//         if (!user.password) {
//              console.error(`[Auth Service - loginUser] CRITICAL: Password field is MISSING for non-Google user ${email}!`);
//              // This indicates a data integrity issue for a non-Google account
//              throw new Error('Authentication process failed unexpectedly.');
//         }

//         console.log(`[Auth Service - loginUser] Comparing provided password with stored hash for ${email}...`);
//         const passwordMatch = await bcrypt.compare(password, user.password);
//         console.log(`[Auth Service - loginUser] bcrypt.compare result for ${email}: ${passwordMatch}`);

//         if (!passwordMatch) {
//             console.log(`[Auth Service - loginUser] Password comparison FAILED for ${email}`);
//             throw new Error('Invalid credentials');
//         }

//         console.log(`[Auth Service - loginUser] Password comparison SUCCEEDED for ${email}`);

//         if (!user.kyc) { user.kyc = { status: 'not_started', rejectionReason: null }; }

//         const userPayload = {
//             _id: user._id.toString(), email: user.email, fullName: user.fullName, role: user.role,
//             kyc: { status: user.kyc.status, rejectionReason: user.kyc.rejectionReason, },
//             createdAt: user.createdAt.toISOString(), updatedAt: user.updatedAt.toISOString(),
//             isGoogleAccount: user.isGoogleAccount // Include flag
//          };

//         const token = jwt.sign(
//             { userId: user._id, role: user.role },
//             config.auth.jwtSecret,
//             { expiresIn: config.auth.jwtExpiration }
//         );

//         console.log(`[Auth Service - loginUser] Login successful, token generated for ${email}. KYC Status: ${userPayload.kyc.status}`);
//         return { user: userPayload, token };

//     } catch (error) {
//         console.error(`[Auth Service - loginUser] Error during login process for ${email}:`, error.message);
//          // Re-throw specific known errors (including the new Google check error)
//         if (error.message === 'Invalid credentials' || error.message.includes('Google Sign-In') || error.message.includes('Authentication process failed')) {
//             throw error;
//         }
//         // Generic error for unexpected issues
//         throw new Error('Login failed due to a server error.');
//     }
// };

// // --- Request Password Reset (Modified: Google check, Existing token check, Expiry time) ---
// const requestPasswordReset = async (email) => {
//     console.log(`[Auth Service - requestPasswordReset] Request received for email: ${email}`);
//     try {
//         const user = await User.findOne({ email }).select('+isGoogleAccount +googleId +resetPasswordToken +resetPasswordExpires');
//         if (!user) {
//             console.log(`[Auth Service - requestPasswordReset] Non-existent email: ${email}. Responding silently.`);
//             // SECURITY: Do not reveal if email exists. Return normally.
//             return;
//         }

//         // --- MODIFIED: Prevent password reset for Google accounts ---
//         if (user.isGoogleAccount || user.googleId) {
//              console.log(`[Auth Service - requestPasswordReset] Password reset requested for Google account: ${email}. Denying silently.`);
//              // SECURITY: Respond as if successful, but do nothing.
//              return;
//         }
//         // --- END MODIFICATION ---

//         // --- MODIFIED: Check for existing, valid token ---
//         if (user.resetPasswordToken && user.resetPasswordExpires && user.resetPasswordExpires > Date.now()) {
//             console.log(`[Auth Service - requestPasswordReset] Active reset token already exists for ${email}. Denying silently.`);
//             // SECURITY: Respond as if successful, but do nothing.
//             return;
//         }
//         // --- END MODIFICATION ---

//         // --- Generate and save NEW token ---
//         const resetToken = Date.now().toString(36) + Math.random().toString(36).substring(2);
//         const hashedResetToken = bcrypt.hashSync(resetToken, 10);

//         user.resetPasswordToken = hashedResetToken;
//         // --- MODIFIED: Set expiry to 3 minutes ---
//         user.resetPasswordExpires = Date.now() + 180000; // 3 minutes * 60 seconds * 1000 ms
//         // --- END MODIFICATION ---

//         await user.save({ validateBeforeSave: false }); // Skip validation to save token fields
//         console.log(`[Auth Service - requestPasswordReset] Reset token generated and saved for ${email}. Expires in 3 minutes.`);

//         // --- Send Email ---
//         const resetUrl = `${config.email.clientURL}/auth/reset-password/${resetToken}`; // Use the UNHASHED token in the URL

//         const transporter = nodemailer.createTransport({
//             host: config.email.smtpHost, port: config.email.smtpPort, secure: config.email.smtpPort === 465,
//             auth: { user: config.email.smtpUser, pass: config.email.smtpPass },
//         });
//         const mailOptions = {
//             from: `"${config.email.emailFromName || 'Wise App'}" <${config.email.emailUser}>`,
//             to: email,
//             subject: 'Password Reset Request',
//             html: `<p>You requested a password reset.</p><p>Click this link to reset your password (expires in 3 minutes):</p><p><a href="${resetUrl}" style="color: #007bff; text-decoration: none;">${resetUrl}</a></p><p>If you did not request this, please ignore this email.</p>`,
//         };
//         await transporter.sendMail(mailOptions);
//         console.log(`[Auth Service - requestPasswordReset] Password reset email successfully sent to ${email}`);

//     } catch (error) {
//         console.error('[Auth Service - requestPasswordReset] Error processing password reset request:', error);
//         // Log the error, but don't throw it back to the controller to maintain the generic success response for security.
//         // If email sending fails critically, Nodemailer might throw, which should be logged.
//         // We don't want to expose internal errors to the forgot password requestor.
//         // If specific handling is needed (e.g., retry logic), add it here.
//         // For now, log and let the controller send the generic success message.
//     }
// };

// // --- Reset Password (Modified: Add Google Account Check) ---
// const resetPassword = async (token, password) => {
//     console.log(`[Auth Service - resetPassword] Attempting password reset with token.`);
//     if (!token || !password) {
//          throw new Error('Token and new password are required.');
//     }
//     try {
//         // Find users with a token field that *might* match when hashed
//         const potentialUsers = await User.find({
//             resetPasswordToken: { $exists: true, $ne: null },
//             resetPasswordExpires: { $gt: Date.now() },
//         }).select('+password +resetPasswordToken +isGoogleAccount +googleId'); // Select necessary fields

//         let user = null;
//         // Iterate through potential users to find the one whose token matches the hash
//         for (const potentialUser of potentialUsers) {
//              if (potentialUser.resetPasswordToken && bcrypt.compareSync(token, potentialUser.resetPasswordToken)) {
//                  user = potentialUser;
//                  break;
//              }
//         }

//         if (!user) {
//             console.warn(`[Auth Service - resetPassword] Invalid or expired password reset attempt (token mismatch or expired).`);
//             throw new Error('Invalid or expired password reset token.');
//         }

//          // --- MODIFIED: Prevent reset for Google accounts ---
//          if (user.isGoogleAccount || user.googleId) {
//              console.warn(`[Auth Service - resetPassword] Attempt to reset password for Google account ${user.email} via token.`);
//              // Specific user-facing error
//              throw new Error('Password reset is not available for accounts signed in with Google.');
//          }
//          // --- END MODIFICATION ---

//         console.log(`[Auth Service - resetPassword] Valid reset token found for user ${user.email}. Updating password.`);
//         user.password = password; // Assign new password (pre-save hook will hash)
//         user.resetPasswordToken = undefined; // Clear token
//         user.resetPasswordExpires = undefined; // Clear expiry
//         await user.save(); // Trigger pre-save hook (hashes password) and saves

//         console.log(`[Auth Service - resetPassword] Password successfully reset for user: ${user.email}`);
//     } catch (error) {
//         console.error('[Auth Service - resetPassword] Password reset error:', error.message);
//         // Re-throw specific errors
//         if (error.message.includes('Invalid or expired') || error.message.includes('not available for accounts signed in with Google')) {
//             throw error;
//         }
//         // Handle validation errors (e.g., password too short) from the save operation
//         if (error.name === 'ValidationError') {
//             const messages = Object.values(error.errors).map(el => el.message);
//             throw new Error(`Password update failed due to validation issues: ${messages.join(', ')}`);
//         }
//         // Generic fallback
//         throw new Error('Password reset failed. Please request a new reset link.');
//     }
// };

// // --- Google OAuth Login (No changes needed for these requirements, but ensure flags are set) ---
// const googleOAuthLogin = async (idToken) => {
//     console.log("[Auth Service - googleOAuthLogin] Verifying Google ID token.");
//     const client = new OAuth2Client(config.googleAuth.clientId);
//     let ticket; // Declare ticket outside try block to potentially access payload in catch
//     try {
//         ticket = await client.verifyIdToken({
//             idToken: idToken,
//             audience: config.googleAuth.clientId,
//         });
//         const payload = ticket.getPayload();

//         if (!payload) { throw new Error('Invalid Google ID token payload.'); }
//         if (!payload.email_verified) { throw new Error('Google account email not verified.'); }

//         const { sub: googleId, email, name: fullName, picture: googleProfilePicture } = payload;
//         console.log(`[Auth Service - googleOAuthLogin] Google token verified for email: ${email}`);

//         let user = await User.findOne({ googleId: googleId })
//                              .select('+kyc +createdAt +updatedAt +isGoogleAccount +googleId');

//         if (!user) {
//             console.log(`[Auth Service - googleOAuthLogin] No user found with googleId ${googleId}. Checking by email: ${email}`);
//             user = await User.findOne({ email: email })
//                              .select('+kyc +createdAt +updatedAt +isGoogleAccount +googleId +password'); // Include password to check if it exists

//             if (user) {
//                 console.log(`[Auth Service - googleOAuthLogin] Existing user found by email ${email}. Linking Google ID.`);
//                 // If the user exists but isn't marked as Google/doesn't have googleId, link it.
//                  if (!user.isGoogleAccount && !user.googleId) {
//                      console.log(`[Auth Service - googleOAuthLogin] Linking Google ID ${googleId} to existing non-Google user ${email}.`);
//                      user.googleId = googleId;
//                      user.isGoogleAccount = true; // Mark as Google account now
//                      user.googleProfilePicture = googleProfilePicture;
//                      // SECURITY DECISION: We will NOT nullify the password here.
//                      // The login/reset checks will prevent using the old password.
//                      // This allows potential future "unlink" functionality without data loss.
//                      await user.save();
//                  } else if (user.googleId && user.googleId !== googleId) {
//                      // Edge case: Email matches, but different Google ID. Highly unlikely.
//                      console.error(`[Auth Service - googleOAuthLogin] CRITICAL: Email ${email} exists but with different Google ID! Existing: ${user.googleId}, New: ${googleId}`);
//                      throw new Error('Account conflict. Please contact support.');
//                  }
//                  // Ensure isGoogleAccount is true if googleId matches
//                  if (!user.isGoogleAccount) {
//                      user.isGoogleAccount = true;
//                      await user.save();
//                  }
//             } else {
//                 // User does not exist, create a new Google-based user
//                 console.log(`[Auth Service - googleOAuthLogin] No user found. Creating new Google user for ${email}`);
//                 user = new User({
//                     googleId: googleId,
//                     email: email,
//                     fullName: fullName,
//                     isGoogleAccount: true, // Explicitly set
//                     googleProfilePicture: googleProfilePicture,
//                     // Password field is NOT required due to model logic
//                 });
//                 await user.save();
//                 console.log(`[Auth Service - googleOAuthLogin] New Google user ${email} created successfully.`);
//             }
//         } else {
//              console.log(`[Auth Service - googleOAuthLogin] Existing Google user found by googleId ${googleId} for email ${email}.`);
//              // Ensure isGoogleAccount is true if found by googleId
//              if (!user.isGoogleAccount) {
//                  user.isGoogleAccount = true;
//                  // Optional: Update name/picture
//                  if (user.fullName !== fullName) { user.fullName = fullName; }
//                  if (user.googleProfilePicture !== googleProfilePicture) { user.googleProfilePicture = googleProfilePicture; }
//                  await user.save();
//                  console.log(`[Auth Service - googleOAuthLogin] Updated profile info and marked as Google account for ${email}.`);
//              } else {
//                 // Optional: Update name/picture if changed
//                 let updated = false;
//                 if (user.fullName !== fullName) { user.fullName = fullName; updated = true; }
//                 if (user.googleProfilePicture !== googleProfilePicture) { user.googleProfilePicture = googleProfilePicture; updated = true; }
//                 if (updated) {
//                     await user.save();
//                     console.log(`[Auth Service - googleOAuthLogin] Updated profile info for ${email}.`);
//                 }
//              }
//         }

//         // --- Prepare payload and token ---
//         if (!user.kyc) { user.kyc = { status: 'not_started', rejectionReason: null }; }

//         const userPayload = {
//             _id: user._id.toString(), email: user.email, fullName: user.fullName, role: user.role,
//             kyc: { status: user.kyc.status, rejectionReason: user.kyc.rejectionReason, },
//             createdAt: user.createdAt.toISOString(), updatedAt: user.updatedAt.toISOString(),
//             isGoogleAccount: user.isGoogleAccount // Ensure flag is in payload
//         };

//         const token = jwt.sign(
//             { userId: user._id, role: user.role },
//             config.auth.jwtSecret,
//             { expiresIn: config.auth.jwtExpiration }
//         );

//         console.log(`[Auth Service - googleOAuthLogin] Google login successful, token generated for ${email}. KYC Status: ${userPayload.kyc.status}, IsGoogle: ${userPayload.isGoogleAccount}`);
//         return { user: userPayload, token };

//     } catch (error) {
//         console.error("[Auth Service - googleOAuthLogin] Error during Google OAuth process:", error);
//         if (error.message.includes('Invalid Google ID token') || error.message.includes('email not verified') || error.message.includes('Account conflict')) {
//              throw error; // Re-throw specific validation/verification errors
//         }
//         if (error instanceof mongoose.Error.ValidationError) {
//             throw new Error(`User data validation failed during Google Sign-In: ${error.message}`);
//         }
//          if (error instanceof mongoose.Error && error.message.includes('duplicate key error')) {
//             console.warn("[Auth Service - googleOAuthLogin] Potential duplicate key error during Google user creation:", error.message);
//             // Attempt to fetch the user again, as it might have been created by a concurrent request
//             const payload = ticket?.getPayload(); // Use optional chaining
//             if (payload?.sub) { // Check if payload and sub exist
//                 try {
//                     const existingUser = await User.findOne({ googleId: payload.sub }).select('+kyc +createdAt +updatedAt +isGoogleAccount');
//                     if (existingUser) {
//                          console.log("[Auth Service - googleOAuthLogin] Found user on retry after duplicate key error.");
//                          // Generate token for the existing user (reuse logic, ensure payload creation is correct)
//                          if (!existingUser.kyc) { existingUser.kyc = { status: 'not_started', rejectionReason: null }; }
//                          const userPayload = {
//                              _id: existingUser._id.toString(), email: existingUser.email, fullName: existingUser.fullName, role: existingUser.role,
//                              kyc: { status: existingUser.kyc.status, rejectionReason: existingUser.kyc.rejectionReason },
//                              createdAt: existingUser.createdAt.toISOString(), updatedAt: existingUser.updatedAt.toISOString(),
//                              isGoogleAccount: existingUser.isGoogleAccount // Ensure flag is included
//                          };
//                          const token = jwt.sign({ userId: existingUser._id, role: existingUser.role }, config.auth.jwtSecret, { expiresIn: config.auth.jwtExpiration });
//                          return { user: userPayload, token };
//                     }
//                 } catch (retryError) {
//                     console.error("[Auth Service - googleOAuthLogin] Error during retry after duplicate key error:", retryError);
//                     // Fall through to the generic error if retry fails
//                 }
//             }
//             // If retry doesn't work or payload is missing
//              throw new Error('Failed to process Google Sign-In due to a conflict. Please try again.');
//         }
//         // Generic error for other failures (DB connection, etc.)
//         throw new Error('Google Sign-In failed. Please try again or use email/password.');
//     }
// };
// // -------------------------------------

// export default {
//     registerUser,
//     loginUser,
//     requestPasswordReset,
//     resetPassword,
//     googleOAuthLogin,
// };


// // backend/src/services/auth.service.js
// import User from '../models/User.js';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import config from '../config/index.js';
// import nodemailer from 'nodemailer';
// import mongoose from 'mongoose';
// import { OAuth2Client } from 'google-auth-library';

// // --- Register User (Added Google check during lookup) ---
// const registerUser = async (fullName, email, password) => {
//     console.log(`[Auth Service - registerUser] Attempting registration for email: ${email}`);
//     try {
//         // Select google flags during lookup
//         const existingUser = await User.findOne({ email }).select('+isGoogleAccount +googleId');
//         if (existingUser) {
//             console.log(`[Auth Service - registerUser] Registration failed: Email ${email} already exists.`);
//             // --- MODIFIED: Check if existing is Google account ---
//             if (existingUser.isGoogleAccount || existingUser.googleId) {
//                 // Instruct user to use "Forgot Password" if they want to set a password for their Google-linked account
//                 throw new Error('This email is associated with a Google account. Please log in with Google, or use "Forgot Password" to set/reset a password for email login.');
//             }
//             // --- END MODIFICATION ---
//             throw new Error('Email already exists.');
//         }

//         const newUser = new User({ fullName, email, password });
//         await newUser.save();
//         console.log(`[Auth Service - registerUser] User ${email} registered successfully.`);

//         const userPayload = {
//             _id: newUser._id,
//             email: newUser.email,
//             fullName: newUser.fullName,
//             role: newUser.role,
//             kyc: { status: newUser.kyc?.status || 'not_started', rejectionReason: newUser.kyc?.rejectionReason || null, },
//             createdAt: newUser.createdAt,
//             updatedAt: newUser.updatedAt,
//             isGoogleAccount: newUser.isGoogleAccount // Include this flag
//         };
//         return userPayload;
//     } catch (error) {
//         console.error("[Auth Service - registerUser] Error during registration:", error.message);
//         if (error.message === 'Email already exists.' || error.message.includes('Google account')) {
//             throw error; // Re-throw specific errors
//         }
//         throw new Error('Registration failed. Please check your input and try again.');
//     }
// };

// // --- Login User (REMOVED check that prevented Google Account login with password) ---
// const loginUser = async (email, password) => {
//     console.log(`[Auth Service - loginUser] Attempting login for email: ${email}`);
//     try {
//         const user = await User.findOne({ email })
//                                .select('+password +kyc +createdAt +updatedAt +isGoogleAccount +googleId'); // Select needed fields

//         if (!user) {
//             console.log(`[Auth Service - loginUser] User not found for email: ${email}`);
//             throw new Error('Invalid credentials');
//         }

//         // --- REMOVED: Check preventing normal login for Google accounts ---
//         // A user with a Google account CAN login with email/password IF they have set one (e.g., via forgot password)
//         // --- END REMOVAL ---

//         console.log(`[Auth Service - loginUser] User found: ${user.email}`);

//         // If it's a non-Google account OR a Google account attempting password login, a password must exist and match.
//         if (!user.password) {
//              // This case can happen if a Google user (no password set yet) tries to log in via email/password.
//              console.log(`[Auth Service - loginUser] Password not set for user: ${email}. Likely a Google account without a password.`);
//              throw new Error('Invalid credentials'); // Or a more specific message like "Password not set for this account."
//         }

//         console.log(`[Auth Service - loginUser] Comparing provided password with stored hash for ${email}...`);
//         const passwordMatch = await bcrypt.compare(password, user.password);
//         console.log(`[Auth Service - loginUser] bcrypt.compare result for ${email}: ${passwordMatch}`);

//         if (!passwordMatch) {
//             console.log(`[Auth Service - loginUser] Password comparison FAILED for ${email}`);
//             throw new Error('Invalid credentials');
//         }

//         console.log(`[Auth Service - loginUser] Password comparison SUCCEEDED for ${email}`);

//         if (!user.kyc) { user.kyc = { status: 'not_started', rejectionReason: null }; }

//         const userPayload = {
//             _id: user._id.toString(), email: user.email, fullName: user.fullName, role: user.role,
//             kyc: { status: user.kyc.status, rejectionReason: user.kyc.rejectionReason, },
//             createdAt: user.createdAt.toISOString(), updatedAt: user.updatedAt.toISOString(),
//             isGoogleAccount: user.isGoogleAccount // Include flag
//          };

//         const token = jwt.sign(
//             { userId: user._id, role: user.role },
//             config.auth.jwtSecret,
//             { expiresIn: config.auth.jwtExpiration }
//         );

//         console.log(`[Auth Service - loginUser] Login successful, token generated for ${email}. KYC Status: ${userPayload.kyc.status}`);
//         return { user: userPayload, token };

//     } catch (error) {
//         console.error(`[Auth Service - loginUser] Error during login process for ${email}:`, error.message);
//         if (error.message === 'Invalid credentials' || error.message.includes('Authentication process failed')) { // Keep these
//             throw error;
//         }
//         // Generic error for unexpected issues
//         throw new Error('Login failed due to a server error.');
//     }
// };

// // --- Request Password Reset (REMOVED check preventing reset for Google accounts) ---
// const requestPasswordReset = async (email) => {
//     console.log(`[Auth Service - requestPasswordReset] Request received for email: ${email}`);
//     try {
//         const user = await User.findOne({ email }).select('+isGoogleAccount +googleId +resetPasswordToken +resetPasswordExpires');
//         if (!user) {
//             console.log(`[Auth Service - requestPasswordReset] Non-existent email: ${email}. Responding silently.`);
//             return;
//         }

//         // --- REMOVED: Check preventing password reset for Google accounts ---
//         // Google users should be able to set/reset a password.
//         // --- END REMOVAL ---

//         if (user.resetPasswordToken && user.resetPasswordExpires && user.resetPasswordExpires > Date.now()) {
//             console.log(`[Auth Service - requestPasswordReset] Active reset token already exists for ${email}. Denying silently.`);
//             return;
//         }

//         const resetToken = Date.now().toString(36) + Math.random().toString(36).substring(2);
//         const hashedResetToken = bcrypt.hashSync(resetToken, 10);

//         user.resetPasswordToken = hashedResetToken;
//         user.resetPasswordExpires = Date.now() + 180000; // 3 minutes

//         await user.save({ validateBeforeSave: false });
//         console.log(`[Auth Service - requestPasswordReset] Reset token generated and saved for ${email}. Expires in 3 minutes.`);

//         const resetUrl = `${config.email.clientURL}/auth/reset-password/${resetToken}`;

//         const transporter = nodemailer.createTransport({
//             host: config.email.smtpHost, port: config.email.smtpPort, secure: config.email.smtpPort === 465,
//             auth: { user: config.email.smtpUser, pass: config.email.smtpPass },
//         });
//         const mailOptions = {
//             from: `"${config.email.emailFromName || 'Wise App'}" <${config.email.emailUser}>`,
//             to: email,
//             subject: 'Password Reset Request',
//             html: `<p>You requested a password reset.</p><p>Click this link to reset your password (expires in 3 minutes):</p><p><a href="${resetUrl}" style="color: #007bff; text-decoration: none;">${resetUrl}</a></p><p>If you did not request this, please ignore this email.</p>`,
//         };
//         await transporter.sendMail(mailOptions);
//         console.log(`[Auth Service - requestPasswordReset] Password reset email successfully sent to ${email}`);

//     } catch (error) {
//         console.error('[Auth Service - requestPasswordReset] Error processing password reset request:', error);
//     }
// };

// // --- Reset Password (REMOVED check preventing reset for Google accounts) ---
// const resetPassword = async (token, password) => {
//     console.log(`[Auth Service - resetPassword] Attempting password reset with token.`);
//     if (!token || !password) {
//          throw new Error('Token and new password are required.');
//     }
//     try {
//         const potentialUsers = await User.find({
//             resetPasswordToken: { $exists: true, $ne: null },
//             resetPasswordExpires: { $gt: Date.now() },
//         }).select('+password +resetPasswordToken +isGoogleAccount +googleId');

//         let user = null;
//         for (const potentialUser of potentialUsers) {
//              if (potentialUser.resetPasswordToken && bcrypt.compareSync(token, potentialUser.resetPasswordToken)) {
//                  user = potentialUser;
//                  break;
//              }
//         }

//         if (!user) {
//             console.warn(`[Auth Service - resetPassword] Invalid or expired password reset attempt (token mismatch or expired).`);
//             throw new Error('Invalid or expired password reset token.');
//         }

//          // --- REMOVED: Prevent reset for Google accounts ---
//          // --- END REMOVAL ---

//         console.log(`[Auth Service - resetPassword] Valid reset token found for user ${user.email}. Updating password.`);
//         user.password = password; 
//         user.resetPasswordToken = undefined; 
//         user.resetPasswordExpires = undefined; 
//         await user.save(); 

//         console.log(`[Auth Service - resetPassword] Password successfully reset for user: ${user.email}`);
//     } catch (error) {
//         console.error('[Auth Service - resetPassword] Password reset error:', error.message);
//         if (error.message.includes('Invalid or expired')) { // Keep this
//             throw error;
//         }
//         if (error.name === 'ValidationError') {
//             const messages = Object.values(error.errors).map(el => el.message);
//             throw new Error(`Password update failed due to validation issues: ${messages.join(', ')}`);
//         }
//         throw new Error('Password reset failed. Please request a new reset link.');
//     }
// };

// // --- Google OAuth Login (No changes needed for these requirements, but ensure flags are set) ---
// const googleOAuthLogin = async (idToken) => {
//     console.log("[Auth Service - googleOAuthLogin] Verifying Google ID token.");
//     const client = new OAuth2Client(config.googleAuth.clientId);
//     let ticket; 
//     try {
//         ticket = await client.verifyIdToken({
//             idToken: idToken,
//             audience: config.googleAuth.clientId,
//         });
//         const payload = ticket.getPayload();

//         if (!payload) { throw new Error('Invalid Google ID token payload.'); }
//         if (!payload.email_verified) { throw new Error('Google account email not verified.'); }

//         const { sub: googleId, email, name: fullName, picture: googleProfilePicture } = payload;
//         console.log(`[Auth Service - googleOAuthLogin] Google token verified for email: ${email}`);

//         let user = await User.findOne({ googleId: googleId })
//                              .select('+kyc +createdAt +updatedAt +isGoogleAccount +googleId');

//         if (!user) {
//             console.log(`[Auth Service - googleOAuthLogin] No user found with googleId ${googleId}. Checking by email: ${email}`);
//             user = await User.findOne({ email: email })
//                              .select('+kyc +createdAt +updatedAt +isGoogleAccount +googleId +password'); 

//             if (user) {
//                 console.log(`[Auth Service - googleOAuthLogin] Existing user found by email ${email}. Linking Google ID.`);
//                  if (!user.isGoogleAccount && !user.googleId) {
//                      console.log(`[Auth Service - googleOAuthLogin] Linking Google ID ${googleId} to existing non-Google user ${email}.`);
//                      user.googleId = googleId;
//                      user.isGoogleAccount = true; 
//                      user.googleProfilePicture = googleProfilePicture;
//                      // Password is intentionally NOT nullified. User can still use old pass or reset.
//                      await user.save();
//                  } else if (user.googleId && user.googleId !== googleId) {
//                      console.error(`[Auth Service - googleOAuthLogin] CRITICAL: Email ${email} exists but with different Google ID! Existing: ${user.googleId}, New: ${googleId}`);
//                      throw new Error('Account conflict. Please contact support.');
//                  }
//                  if (!user.isGoogleAccount) { // Ensure flag is true
//                      user.isGoogleAccount = true;
//                      await user.save();
//                  }
//             } else {
//                 console.log(`[Auth Service - googleOAuthLogin] No user found. Creating new Google user for ${email}`);
//                 user = new User({
//                     googleId: googleId,
//                     email: email,
//                     fullName: fullName,
//                     isGoogleAccount: true, 
//                     googleProfilePicture: googleProfilePicture,
//                 });
//                 await user.save();
//                 console.log(`[Auth Service - googleOAuthLogin] New Google user ${email} created successfully.`);
//             }
//         } else {
//              console.log(`[Auth Service - googleOAuthLogin] Existing Google user found by googleId ${googleId} for email ${email}.`);
//              if (!user.isGoogleAccount) {
//                  user.isGoogleAccount = true;
//                  if (user.fullName !== fullName) { user.fullName = fullName; }
//                  if (user.googleProfilePicture !== googleProfilePicture) { user.googleProfilePicture = googleProfilePicture; }
//                  await user.save();
//                  console.log(`[Auth Service - googleOAuthLogin] Updated profile info and marked as Google account for ${email}.`);
//              } else {
//                 let updated = false;
//                 if (user.fullName !== fullName) { user.fullName = fullName; updated = true; }
//                 if (user.googleProfilePicture !== googleProfilePicture) { user.googleProfilePicture = googleProfilePicture; updated = true; }
//                 if (updated) {
//                     await user.save();
//                     console.log(`[Auth Service - googleOAuthLogin] Updated profile info for ${email}.`);
//                 }
//              }
//         }

//         if (!user.kyc) { user.kyc = { status: 'not_started', rejectionReason: null }; }

//         const userPayload = {
//             _id: user._id.toString(), email: user.email, fullName: user.fullName, role: user.role,
//             kyc: { status: user.kyc.status, rejectionReason: user.kyc.rejectionReason, },
//             createdAt: user.createdAt.toISOString(), updatedAt: user.updatedAt.toISOString(),
//             isGoogleAccount: user.isGoogleAccount 
//         };

//         const token = jwt.sign(
//             { userId: user._id, role: user.role },
//             config.auth.jwtSecret,
//             { expiresIn: config.auth.jwtExpiration }
//         );

//         console.log(`[Auth Service - googleOAuthLogin] Google login successful, token generated for ${email}. KYC Status: ${userPayload.kyc.status}, IsGoogle: ${userPayload.isGoogleAccount}`);
//         return { user: userPayload, token };

//     } catch (error) {
//         console.error("[Auth Service - googleOAuthLogin] Error during Google OAuth process:", error);
//         if (error.message.includes('Invalid Google ID token') || error.message.includes('email not verified') || error.message.includes('Account conflict')) {
//              throw error; 
//         }
//         if (error instanceof mongoose.Error.ValidationError) {
//             throw new Error(`User data validation failed during Google Sign-In: ${error.message}`);
//         }
//          if (error instanceof mongoose.Error && error.message.includes('duplicate key error')) {
//             console.warn("[Auth Service - googleOAuthLogin] Potential duplicate key error during Google user creation:", error.message);
//             const payload = ticket?.getPayload(); 
//             if (payload?.sub) { 
//                 try {
//                     const existingUser = await User.findOne({ googleId: payload.sub }).select('+kyc +createdAt +updatedAt +isGoogleAccount');
//                     if (existingUser) {
//                          console.log("[Auth Service - googleOAuthLogin] Found user on retry after duplicate key error.");
//                          if (!existingUser.kyc) { existingUser.kyc = { status: 'not_started', rejectionReason: null }; }
//                          const userPayload = {
//                              _id: existingUser._id.toString(), email: existingUser.email, fullName: existingUser.fullName, role: existingUser.role,
//                              kyc: { status: existingUser.kyc.status, rejectionReason: existingUser.kyc.rejectionReason },
//                              createdAt: existingUser.createdAt.toISOString(), updatedAt: existingUser.updatedAt.toISOString(),
//                              isGoogleAccount: existingUser.isGoogleAccount 
//                          };
//                          const token = jwt.sign({ userId: existingUser._id, role: existingUser.role }, config.auth.jwtSecret, { expiresIn: config.auth.jwtExpiration });
//                          return { user: userPayload, token };
//                     }
//                 } catch (retryError) {
//                     console.error("[Auth Service - googleOAuthLogin] Error during retry after duplicate key error:", retryError);
//                 }
//             }
//              throw new Error('Failed to process Google Sign-In due to a conflict. Please try again.');
//         }
//         throw new Error('Google Sign-In failed. Please try again or use email/password.');
//     }
// };

// export default {
//     registerUser,
//     loginUser,
//     requestPasswordReset,
//     resetPassword,
//     googleOAuthLogin,
// };


// // backend/src/services/auth.service.js
// import User from '../models/User.js';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import config from '../config/index.js';
// import mongoose from 'mongoose';
// import { OAuth2Client } from 'google-auth-library';
// import notificationService from './notification.service.js';
// import emailService from '../utils/emailService.js';

// // --- Register User ---
// const registerUser = async (fullName, email, password) => {
//     console.log(`[Auth Service - registerUser] Attempting registration for email: ${email}`);
//     try {
//         // Select google flags during lookup
//         const existingUser = await User.findOne({ email }).select('+isGoogleAccount +googleId');
//         if (existingUser) {
//             console.log(`[Auth Service - registerUser] Registration failed: Email ${email} already exists.`);
//             if (existingUser.isGoogleAccount || existingUser.googleId) {
//                 throw new Error('This email is associated with a Google account. Please log in with Google, or use "Forgot Password" to set/reset a password for email login.');
//             }
//             throw new Error('Email already exists.');
//         }

//         const newUser = new User({ fullName, email, password });
//         await newUser.save(); // Mongoose `isNew` is true before this, false after.
//         console.log(`[Auth Service - registerUser] User ${email} registered successfully with ID: ${newUser._id}.`);

//         // --- Send Welcome Notification ---
//         try {
//             console.log(`[Auth Service - registerUser] Attempting to send welcome notification to ${newUser.email}`);
//             await notificationService.sendWelcomeNotification(newUser); // Pass the Mongoose user document
//         } catch (notificationError) {
//             console.error(`[Auth Service - registerUser] Non-critical error sending welcome notification for ${newUser.email}:`, notificationError);
//         }
//         // --- End Send Welcome Notification ---

//         const userPayload = {
//             _id: newUser._id,
//             email: newUser.email,
//             fullName: newUser.fullName,
//             role: newUser.role,
//             kyc: { status: newUser.kyc?.status || 'not_started', rejectionReason: newUser.kyc?.rejectionReason || null, },
//             createdAt: newUser.createdAt,
//             updatedAt: newUser.updatedAt,
//             isGoogleAccount: newUser.isGoogleAccount
//         };
//         return userPayload;
//     } catch (error) {
//         console.error("[Auth Service - registerUser] Error during registration:", error.message);
//         if (error.message === 'Email already exists.' || error.message.includes('Google account')) {
//             throw error; // Re-throw specific errors
//         }
//         throw new Error('Registration failed. Please check your input and try again.');
//     }
// };

// // --- Login User ---
// const loginUser = async (email, password) => {
//     console.log(`[Auth Service - loginUser] Attempting login for email: ${email}`);
//     try {
//         const user = await User.findOne({ email })
//                                .select('+password +kyc +createdAt +updatedAt +isGoogleAccount +googleId');

//         if (!user) {
//             console.log(`[Auth Service - loginUser] User not found for email: ${email}`);
//             throw new Error('Invalid credentials');
//         }

//         console.log(`[Auth Service - loginUser] User found: ${user.email}`);

//         if (!user.password) {
//              console.log(`[Auth Service - loginUser] Password not set for user: ${email}. Likely a Google account without a password.`);
//              throw new Error('Invalid credentials');
//         }

//         console.log(`[Auth Service - loginUser] Comparing provided password with stored hash for ${email}...`);
//         const passwordMatch = await bcrypt.compare(password, user.password);
//         console.log(`[Auth Service - loginUser] bcrypt.compare result for ${email}: ${passwordMatch}`);

//         if (!passwordMatch) {
//             console.log(`[Auth Service - loginUser] Password comparison FAILED for ${email}`);
//             throw new Error('Invalid credentials');
//         }

//         console.log(`[Auth Service - loginUser] Password comparison SUCCEEDED for ${email}`);

//         if (!user.kyc) { user.kyc = { status: 'not_started', rejectionReason: null }; }

//         const userPayload = {
//             _id: user._id.toString(), email: user.email, fullName: user.fullName, role: user.role,
//             kyc: { status: user.kyc.status, rejectionReason: user.kyc.rejectionReason, },
//             createdAt: user.createdAt.toISOString(), updatedAt: user.updatedAt.toISOString(),
//             isGoogleAccount: user.isGoogleAccount
//          };

//         const token = jwt.sign(
//             { userId: user._id, role: user.role },
//             config.auth.jwtSecret,
//             { expiresIn: config.auth.jwtExpiration }
//         );

//         console.log(`[Auth Service - loginUser] Login successful, token generated for ${email}. KYC Status: ${userPayload.kyc.status}`);
//         return { user: userPayload, token };

//     } catch (error) {
//         console.error(`[Auth Service - loginUser] Error during login process for ${email}:`, error.message);
//         if (error.message === 'Invalid credentials' || error.message.includes('Authentication process failed')) {
//             throw error;
//         }
//         throw new Error('Login failed due to a server error.');
//     }
// };

// // --- Request Password Reset ---
// const requestPasswordReset = async (email) => {
//     console.log(`[Auth Service - requestPasswordReset] Request received for email: ${email}`);
//     try {
//         const user = await User.findOne({ email }).select('+fullName +isGoogleAccount +googleId +resetPasswordToken +resetPasswordExpires');
//         if (!user) {
//             console.log(`[Auth Service - requestPasswordReset] Non-existent email: ${email}. Responding silently.`);
//             return; // Respond silently
//         }

//         if (user.resetPasswordToken && user.resetPasswordExpires && user.resetPasswordExpires > Date.now()) {
//             console.log(`[Auth Service - requestPasswordReset] Active reset token already exists for ${email}. Denying silently.`);
//             return; // Respond silently
//         }

//         const resetToken = Date.now().toString(36) + Math.random().toString(36).substring(2);
//         const hashedResetToken = bcrypt.hashSync(resetToken, 10);
//         const tokenExpiryMinutes = 30;
//         const tokenExpiryMilliseconds = tokenExpiryMinutes * 60 * 1000;

//         user.resetPasswordToken = hashedResetToken;
//         user.resetPasswordExpires = Date.now() + tokenExpiryMilliseconds;

//         await user.save({ validateBeforeSave: false });
//         console.log(`[Auth Service - requestPasswordReset] Reset token generated and saved for ${email}. Expires in ${tokenExpiryMinutes} minutes.`);

//         const resetUrl = `${config.clientUrl}/auth/reset-password/${resetToken}`;
//         const appName = config.email.emailFromName || 'Remityn';

//         const templateData = {
//             userName: user.fullName || 'Valued User',
//             userEmail: user.email,
//             resetUrl: resetUrl,
//             appName: appName,
//             resetLinkExpiryMinutes: tokenExpiryMinutes.toString(),
//             currentYear: new Date().getFullYear().toString(),
//         };

//         const htmlContent = await emailService.renderTemplate('requestPasswordReset', templateData);

//         const textContent = `Hello ${user.fullName || 'Valued User'},\n\n` +
//                             `We received a request to reset the password for your account (${user.email}) on ${appName}.\n\n` +
//                             `If you made this request, please use the following link to reset your password. This link is valid for ${tokenExpiryMinutes} minutes:\n` +
//                             `${resetUrl}\n\n` +
//                             `If you did not request a password reset, please ignore this email.\n\n` +
//                             `Thank you,\nThe ${appName} Team`;

//         await emailService.sendEmail({
//             to: email,
//             subject: `Password Reset Request for ${appName}`,
//             html: htmlContent,
//             text: textContent,
//         });
//         console.log(`[Auth Service - requestPasswordReset] Password reset email dispatch attempted for ${email} using 'requestPasswordReset' template.`);

//     } catch (error) {
//         console.error('[Auth Service - requestPasswordReset] Error processing password reset request:', error);
//         // Respond silently
//     }
// };

// // --- Reset Password ---
// const resetPassword = async (token, password) => {
//     console.log(`[Auth Service - resetPassword] Attempting password reset with token.`);
//     if (!token || !password) {
//          throw new Error('Token and new password are required.');
//     }
//     try {
//         const potentialUsers = await User.find({
//             resetPasswordToken: { $exists: true, $ne: null },
//             resetPasswordExpires: { $gt: Date.now() },
//         }).select('+password +resetPasswordToken +isGoogleAccount +googleId');

//         let user = null;
//         for (const potentialUser of potentialUsers) {
//              if (potentialUser.resetPasswordToken && bcrypt.compareSync(token, potentialUser.resetPasswordToken)) {
//                  user = potentialUser;
//                  break;
//              }
//         }

//         if (!user) {
//             console.warn(`[Auth Service - resetPassword] Invalid or expired password reset attempt (token mismatch or expired).`);
//             throw new Error('Invalid or expired password reset token.');
//         }

//         console.log(`[Auth Service - resetPassword] Valid reset token found for user ${user.email}. Updating password.`);
//         user.password = password;
//         user.resetPasswordToken = undefined;
//         user.resetPasswordExpires = undefined;
//         await user.save();

//         console.log(`[Auth Service - resetPassword] Password successfully reset for user: ${user.email}`);
//     } catch (error) {
//         console.error('[Auth Service - resetPassword] Password reset error:', error.message);
//         if (error.message.includes('Invalid or expired')) {
//             throw error;
//         }
//         if (error.name === 'ValidationError') {
//             const messages = Object.values(error.errors).map(el => el.message);
//             throw new Error(`Password update failed due to validation issues: ${messages.join(', ')}`);
//         }
//         throw new Error('Password reset failed. Please request a new reset link.');
//     }
// };

// // --- Google OAuth Login ---
// const googleOAuthLogin = async (idToken) => {
//     console.log("[Auth Service - googleOAuthLogin] Verifying Google ID token.");
//     const client = new OAuth2Client(config.googleAuth.clientId);
//     let ticket;
//     try {
//         ticket = await client.verifyIdToken({
//             idToken: idToken,
//             audience: config.googleAuth.clientId,
//         });
//         const payload = ticket.getPayload();

//         if (!payload) { throw new Error('Invalid Google ID token payload.'); }
//         if (!payload.email_verified) { throw new Error('Google account email not verified.'); }

//         const { sub: googleId, email, name: fullName, picture: googleProfilePicture } = payload;
//         console.log(`[Auth Service - googleOAuthLogin] Google token verified for email: ${email}`);

//         let user = await User.findOne({ googleId: googleId })
//                              .select('+kyc +createdAt +updatedAt +isGoogleAccount +googleId');

//         let isNewUserCreatedInThisFlow = false;

//         if (!user) {
//             console.log(`[Auth Service - googleOAuthLogin] No user found with googleId ${googleId}. Checking by email: ${email}`);
//             user = await User.findOne({ email: email })
//                              .select('+kyc +createdAt +updatedAt +isGoogleAccount +googleId +password');

//             if (user) {
//                 console.log(`[Auth Service - googleOAuthLogin] Existing user found by email ${email}. Linking Google ID.`);
//                  if (!user.isGoogleAccount && !user.googleId) {
//                      console.log(`[Auth Service - googleOAuthLogin] Linking Google ID ${googleId} to existing non-Google user ${email}.`);
//                      user.googleId = googleId;
//                      user.isGoogleAccount = true;
//                      user.googleProfilePicture = googleProfilePicture;
//                      await user.save();
//                  } else if (user.googleId && user.googleId !== googleId) {
//                      console.error(`[Auth Service - googleOAuthLogin] CRITICAL: Email ${email} exists but with different Google ID! Existing: ${user.googleId}, New: ${googleId}`);
//                      throw new Error('Account conflict. Please contact support.');
//                  }
//                  if (!user.isGoogleAccount) {
//                      user.isGoogleAccount = true;
//                      await user.save();
//                  }
//             } else {
//                 console.log(`[Auth Service - googleOAuthLogin] No user found by email. Creating new Google user for ${email}`);
//                 user = new User({
//                     googleId: googleId,
//                     email: email,
//                     fullName: fullName,
//                     isGoogleAccount: true,
//                     googleProfilePicture: googleProfilePicture,
//                 });
//                 await user.save();
//                 isNewUserCreatedInThisFlow = true;
//                 console.log(`[Auth Service - googleOAuthLogin] New Google user ${email} created successfully with ID: ${user._id}.`);
//             }
//         } else {
//              console.log(`[Auth Service - googleOAuthLogin] Existing Google user found by googleId ${googleId} for email ${email}.`);
//              let profileNeedsUpdate = false;
//              if (user.fullName !== fullName) { user.fullName = fullName; profileNeedsUpdate = true; }
//              if (user.googleProfilePicture !== googleProfilePicture) { user.googleProfilePicture = googleProfilePicture; profileNeedsUpdate = true; }
//              if (!user.isGoogleAccount) { user.isGoogleAccount = true; profileNeedsUpdate = true; }
//              if (profileNeedsUpdate) {
//                  await user.save();
//                  console.log(`[Auth Service - googleOAuthLogin] Updated profile info for ${email}.`);
//              }
//         }

//         if (isNewUserCreatedInThisFlow && user) {
//             try {
//                 console.log(`[Auth Service - googleOAuthLogin] Attempting to send welcome notification to new Google user ${user.email}`);
//                 await notificationService.sendWelcomeNotification(user);
//             } catch (notificationError) {
//                 console.error(`[Auth Service - googleOAuthLogin] Non-critical error sending welcome notification for ${user.email}:`, notificationError);
//             }
//         }

//         if (!user.kyc) { user.kyc = { status: 'not_started', rejectionReason: null }; }

//         const userPayload = {
//             _id: user._id.toString(), email: user.email, fullName: user.fullName, role: user.role,
//             kyc: { status: user.kyc.status, rejectionReason: user.kyc.rejectionReason, },
//             createdAt: user.createdAt.toISOString(), updatedAt: user.updatedAt.toISOString(),
//             isGoogleAccount: user.isGoogleAccount
//         };

//         const token = jwt.sign(
//             { userId: user._id, role: user.role },
//             config.auth.jwtSecret,
//             { expiresIn: config.auth.jwtExpiration }
//         );

//         console.log(`[Auth Service - googleOAuthLogin] Google login successful, token generated for ${email}. KYC Status: ${userPayload.kyc.status}, IsGoogle: ${userPayload.isGoogleAccount}`);
//         return { user: userPayload, token };

//     } catch (error) {
//         console.error("[Auth Service - googleOAuthLogin] Error during Google OAuth process:", error);
//         if (error.message.includes('Invalid Google ID token') || error.message.includes('email not verified') || error.message.includes('Account conflict')) {
//              throw error;
//         }
//         if (error instanceof mongoose.Error.ValidationError) {
//             throw new Error(`User data validation failed during Google Sign-In: ${error.message}`);
//         }
//          if (error instanceof mongoose.Error && error.message.includes('duplicate key error')) {
//             console.warn("[Auth Service - googleOAuthLogin] Potential duplicate key error during Google user creation:", error.message);
//             const payload = ticket?.getPayload();
//             if (payload?.sub) {
//                 try {
//                     const existingUser = await User.findOne({ googleId: payload.sub }).select('+kyc +createdAt +updatedAt +isGoogleAccount');
//                     if (existingUser) {
//                          console.log("[Auth Service - googleOAuthLogin] Found user on retry after duplicate key error.");
//                          if (!existingUser.kyc) { existingUser.kyc = { status: 'not_started', rejectionReason: null }; }
//                          const userPayloadRetry = { // Renamed to avoid conflict
//                              _id: existingUser._id.toString(), email: existingUser.email, fullName: existingUser.fullName, role: existingUser.role,
//                              kyc: { status: existingUser.kyc.status, rejectionReason: existingUser.kyc.rejectionReason },
//                              createdAt: existingUser.createdAt.toISOString(), updatedAt: existingUser.updatedAt.toISOString(),
//                              isGoogleAccount: existingUser.isGoogleAccount
//                          };
//                          const tokenRetry = jwt.sign({ userId: existingUser._id, role: existingUser.role }, config.auth.jwtSecret, { expiresIn: config.auth.jwtExpiration }); // Renamed
//                          return { user: userPayloadRetry, token: tokenRetry };
//                     }
//                 } catch (retryError) {
//                     console.error("[Auth Service - googleOAuthLogin] Error during retry after duplicate key error:", retryError);
//                 }
//             }
//              throw new Error('Failed to process Google Sign-In due to a conflict. Please try again.');
//         }
//         throw new Error('Google Sign-In failed. Please try again or use email/password.');
//     }
// };

// export default {
//     registerUser,
//     loginUser,
//     requestPasswordReset,
//     resetPassword,
//     googleOAuthLogin,
// };



import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import mongoose from 'mongoose';
import { OAuth2Client } from 'google-auth-library';
import notificationService from './notification.service.js';
import emailService from '../utils/emailService.js';

const OTP_EXPIRY_MINUTES = 5;

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendVerificationEmail = async (user, otp) => {
    const appName = config.email.emailFromName || 'Remityn';
    const templateData = {
        userName: user.fullName,
        otp: otp,
        appName: appName,
        expiryMinutes: OTP_EXPIRY_MINUTES,
        currentYear: new Date().getFullYear().toString(),
    };
    const htmlContent = await emailService.renderTemplate('otpVerification', templateData);
    await emailService.sendEmail({
        to: user.email,
        subject: `Your ${appName} Verification Code`,
        html: htmlContent,
        text: `Your verification code for ${appName} is ${otp}. It will expire in ${OTP_EXPIRY_MINUTES} minutes.`,
    });
    console.log(`[Auth Service] Verification OTP email sent to ${user.email}.`);
};

const registerUser = async (fullName, email, password) => {
    console.log(`[Auth Service] Attempting registration for email: ${email}`);
    let user = await User.findOne({ email }).select('+isGoogleAccount +isVerified +verificationOtpExpires');

    if (user) {
        if (user.isVerified) {
            console.log(`[Auth Service] Registration failed: Email ${email} already exists and is verified.`);
            if (user.isGoogleAccount) {
                 throw new Error('This email is associated with a Google account. Please log in with Google.');
            }
            throw new Error('Email already exists.');
        }
        if (user.verificationOtpExpires && user.verificationOtpExpires > new Date()) {
             console.log(`[Auth Service] Registration blocked: Active OTP exists for unverified user ${email}.`);
             throw new Error(`An OTP has already been sent to ${email}. Please check your email or wait for it to expire.`);
        }
        console.log(`[Auth Service] Found existing unverified user for ${email}. Will overwrite with new details and send new OTP.`);
        user.fullName = fullName;
        user.password = password;
        user.isGoogleAccount = false;
    } else {
        user = new User({ fullName, email, password });
    }

    const otp = generateOtp();
    user.verificationOtp = await bcrypt.hash(otp, 10);
    user.verificationOtpExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    user.isVerified = false;

    await user.save();
    console.log(`[Auth Service] User data saved for ${email}. IsNew: ${user.isNew}, ID: ${user._id}`);
    
    await sendVerificationEmail(user, otp);
    
    return { message: 'Registration successful. An OTP has been sent to your email.' };
};

const verifyOtp = async (email, otp) => {
    console.log(`[Auth Service] Attempting OTP verification for ${email}`);
    const user = await User.findOne({ email }).select('+verificationOtp +verificationOtpExpires +isVerified');

    if (!user) throw new Error('User not found.');
    if (user.isVerified) return { message: 'Account is already verified.' };

    if (!user.verificationOtp || !user.verificationOtpExpires) {
        throw new Error('No OTP found for this account. Please request a new one.');
    }
    if (user.verificationOtpExpires < new Date()) {
        throw new Error('OTP has expired. Please request a new one.');
    }

    const isMatch = await bcrypt.compare(otp, user.verificationOtp);
    if (!isMatch) {
        throw new Error('Invalid OTP.');
    }

    user.isVerified = true;
    user.verificationOtp = undefined;
    user.verificationOtpExpires = undefined;
    await user.save();

    console.log(`[Auth Service] User ${email} verified successfully.`);
    try {
        await notificationService.sendWelcomeNotification(user);
    } catch (notificationError) {
        console.error(`[Auth Service] Non-critical error sending welcome notification for ${user.email}:`, notificationError);
    }

    return { message: 'Email verified successfully. You can now log in.' };
};


const resendOtp = async (email) => {
    console.log(`[Auth Service] Resending OTP for ${email}`);
    const user = await User.findOne({ email }).select('+isVerified +verificationOtpExpires');
    if (!user) throw new Error('User not found.');
    if (user.isVerified) throw new Error('Account is already verified.');
    if (user.verificationOtpExpires && user.verificationOtpExpires > new Date(Date.now() - 60 * 1000)) {
        throw new Error('Please wait a minute before requesting another OTP.');
    }

    const otp = generateOtp();
    user.verificationOtp = await bcrypt.hash(otp, 10);
    user.verificationOtpExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    await user.save();
    await sendVerificationEmail(user, otp);
    return { message: 'A new OTP has been sent to your email.' };
};

const loginUser = async (email, password) => {
    console.log(`[Auth Service] Attempting login for email: ${email}`);
    const user = await User.findOne({ email })
                           .select('+password +isVerified +kyc +createdAt +updatedAt +isGoogleAccount');

    if (!user) {
        throw new Error('Invalid credentials');
    }

    if (!user.isVerified) {
        console.log(`[Auth Service] Login failed for ${email}: Account not verified.`);
        throw new Error('Account not verified. Please check your email for an OTP.');
    }

    if (!user.password) {
         console.log(`[Auth Service - loginUser] Password not set for user: ${email}. Likely a Google account without a password.`);
         throw new Error('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        throw new Error('Invalid credentials');
    }

    console.log(`[Auth Service] Login successful for ${email}`);
    
    if (!user.kyc) { user.kyc = { status: 'not_started' }; }

    const userPayload = {
        _id: user._id.toString(), email: user.email, fullName: user.fullName, role: user.role,
        isVerified: user.isVerified,
        kyc: { status: user.kyc.status, rejectionReason: user.kyc.rejectionReason, },
        createdAt: user.createdAt.toISOString(), updatedAt: user.updatedAt.toISOString(),
        isGoogleAccount: user.isGoogleAccount
     };

    const token = jwt.sign(
        { userId: user._id, role: user.role },
        config.auth.jwtSecret,
        { expiresIn: config.auth.jwtExpiration }
    );

    return { user: userPayload, token };
};

// --- Request Password Reset ---
const requestPasswordReset = async (email) => {
    console.log(`[Auth Service - requestPasswordReset] Request received for email: ${email}`);
    try {
        const user = await User.findOne({ email }).select('+fullName +isGoogleAccount +googleId +resetPasswordToken +resetPasswordExpires');
        if (!user) {
            console.log(`[Auth Service - requestPasswordReset] Non-existent email: ${email}. Responding silently.`);
            return; // Respond silently
        }

        if (user.resetPasswordToken && user.resetPasswordExpires && user.resetPasswordExpires > Date.now()) {
            console.log(`[Auth Service - requestPasswordReset] Active reset token already exists for ${email}. Denying silently.`);
            return; // Respond silently
        }

        const resetToken = Date.now().toString(36) + Math.random().toString(36).substring(2);
        const hashedResetToken = bcrypt.hashSync(resetToken, 10);
        const tokenExpiryMinutes = 30;
        const tokenExpiryMilliseconds = tokenExpiryMinutes * 60 * 1000;

        user.resetPasswordToken = hashedResetToken;
        user.resetPasswordExpires = Date.now() + tokenExpiryMilliseconds;

        await user.save({ validateBeforeSave: false });
        console.log(`[Auth Service - requestPasswordReset] Reset token generated and saved for ${email}. Expires in ${tokenExpiryMinutes} minutes.`);

        const resetUrl = `${config.clientUrl}/auth/reset-password/${resetToken}`;
        const appName = config.email.emailFromName || 'Remityn';

        const templateData = {
            userName: user.fullName || 'Valued User',
            userEmail: user.email,
            resetUrl: resetUrl,
            appName: appName,
            resetLinkExpiryMinutes: tokenExpiryMinutes.toString(),
            currentYear: new Date().getFullYear().toString(),
        };

        const htmlContent = await emailService.renderTemplate('requestPasswordReset', templateData);

        const textContent = `Hello ${user.fullName || 'Valued User'},\n\n` +
                            `We received a request to reset the password for your account (${user.email}) on ${appName}.\n\n` +
                            `If you made this request, please use the following link to reset your password. This link is valid for ${tokenExpiryMinutes} minutes:\n` +
                            `${resetUrl}\n\n` +
                            `If you did not request a password reset, please ignore this email.\n\n` +
                            `Thank you,\nThe ${appName} Team`;

        await emailService.sendEmail({
            to: email,
            subject: `Password Reset Request for ${appName}`,
            html: htmlContent,
            text: textContent,
        });
        console.log(`[Auth Service - requestPasswordReset] Password reset email dispatch attempted for ${email} using 'requestPasswordReset' template.`);

    } catch (error) {
        console.error('[Auth Service - requestPasswordReset] Error processing password reset request:', error);
        // Respond silently
    }
};

// --- Reset Password ---
const resetPassword = async (token, password) => {
    console.log(`[Auth Service - resetPassword] Attempting password reset with token.`);
    if (!token || !password) {
         throw new Error('Token and new password are required.');
    }
    try {
        const potentialUsers = await User.find({
            resetPasswordToken: { $exists: true, $ne: null },
            resetPasswordExpires: { $gt: Date.now() },
        }).select('+password +resetPasswordToken +isGoogleAccount +googleId');

        let user = null;
        for (const potentialUser of potentialUsers) {
             if (potentialUser.resetPasswordToken && bcrypt.compareSync(token, potentialUser.resetPasswordToken)) {
                 user = potentialUser;
                 break;
             }
        }

        if (!user) {
            console.warn(`[Auth Service - resetPassword] Invalid or expired password reset attempt (token mismatch or expired).`);
            throw new Error('Invalid or expired password reset token.');
        }

        console.log(`[Auth Service - resetPassword] Valid reset token found for user ${user.email}. Updating password.`);
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        console.log(`[Auth Service - resetPassword] Password successfully reset for user: ${user.email}`);
    } catch (error) {
        console.error('[Auth Service - resetPassword] Password reset error:', error.message);
        if (error.message.includes('Invalid or expired')) {
            throw error;
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(el => el.message);
            throw new Error(`Password update failed due to validation issues: ${messages.join(', ')}`);
        }
        throw new Error('Password reset failed. Please request a new reset link.');
    }
};

// --- Google OAuth Login ---
// --- Google OAuth Login (FIXED) ---
const googleOAuthLogin = async (idToken) => {
    const client = new OAuth2Client(config.googleAuth.clientId);
    let ticket;
    try {
        ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: config.googleAuth.clientId,
        });
        const payload = ticket.getPayload();

        if (!payload) { throw new Error('Invalid Google ID token payload.'); }
        if (!payload.email_verified) { throw new Error('Google account email not verified.'); }

        const { sub: googleId, email, name: fullName, picture: googleProfilePicture } = payload;

        let user = await User.findOne({ email: email })
                             .select('+kyc +createdAt +updatedAt +isGoogleAccount +googleId +isVerified');

        let isNewUserCreatedInThisFlow = false;

        if (!user) {
            user = new User({
                googleId: googleId,
                email: email,
                fullName: fullName,
                isGoogleAccount: true,
                isVerified: true, // Google accounts are verified by default
                googleProfilePicture: googleProfilePicture,
            });
            await user.save();
            isNewUserCreatedInThisFlow = true;
        } else {
             // Link existing account or update info
             let profileNeedsUpdate = false;
             if (!user.googleId) { user.googleId = googleId; profileNeedsUpdate = true; }
             if (!user.isGoogleAccount) { user.isGoogleAccount = true; profileNeedsUpdate = true; }
             if (!user.isVerified) { user.isVerified = true; profileNeedsUpdate = true; } // Mark as verified if not already
             if (user.fullName !== fullName) { user.fullName = fullName; profileNeedsUpdate = true; }
             if (user.googleProfilePicture !== googleProfilePicture) { user.googleProfilePicture = googleProfilePicture; profileNeedsUpdate = true; }
             if (profileNeedsUpdate) { await user.save(); }
        }

        if (isNewUserCreatedInThisFlow) {
            try {
                await notificationService.sendWelcomeNotification(user);
            } catch (notificationError) {
                console.error(`[Auth Service] Non-critical error sending welcome notification for new Google user ${user.email}:`, notificationError);
            }
        }

        if (!user.kyc) { user.kyc = { status: 'not_started', rejectionReason: null }; }

        // ----- THIS IS THE FIX -----
        const userPayload = {
            _id: user._id.toString(), email: user.email, fullName: user.fullName, role: user.role,
            isVerified: user.isVerified, // <<< THIS IS THE FIX: Added isVerified to the payload
            kyc: { status: user.kyc.status, rejectionReason: user.kyc.rejectionReason, },
            createdAt: user.createdAt.toISOString(), updatedAt: user.updatedAt.toISOString(),
            isGoogleAccount: user.isGoogleAccount
        };
        // ------------------------

        const token = jwt.sign({ userId: user._id, role: user.role }, config.auth.jwtSecret, { expiresIn: config.auth.jwtExpiration });

        return { user: userPayload, token };

    } catch (error) {
        console.error("[Auth Service - googleOAuthLogin] Error during Google OAuth process:", error);
        throw new Error('Google Sign-In failed. Please try again or use email/password.');
    }
};

export default {
    registerUser,
    loginUser,
    verifyOtp,
    resendOtp,
    requestPasswordReset,
    resetPassword,
    googleOAuthLogin,
};