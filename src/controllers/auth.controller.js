// import authService from '../services/auth.service.js';

// const register = async (req, res, next) => { // Add 'next' for error handling
//     try {
//         const { fullName, email, password } = req.body;
//         const newUser = await authService.registerUser(fullName, email, password);
//         res.status(201).json({ message: 'User registered successfully', user: newUser }); // 201 Created status for successful registration
//     } catch (error) {
//         next(error); // Pass errors to error handling middleware
//     }
// };

// const login = async (req, res, next) => { // Add 'next' for error handling
//     try {
//         const { email, password } = req.body;
//         const { user, token } = await authService.loginUser(email, password);
//         res.json({ message: 'Login successful', user, token }); // 200 OK status for successful login
//     } catch (error) {
//         next(error); // Pass errors to error handling middleware
//     }
// };


// const forgotPassword = async (req, res, next) => {
//     try {
//         const { email } = req.body;
//         await authService.requestPasswordReset(email);
//         res.json({ message: 'Password reset email sent successfully' });
//     } catch (error) {
//         next(error);
//     }
// };

// const resetPassword = async (req, res, next) => {
//     try {
//         const { token, password } = req.body;
//         await authService.resetPassword(token, password);
//         res.json({ message: 'Password reset successfully' });
//     } catch (error) {
//         next(error);
//     }
// };


// export default {
//     register,
//     login,
//     forgotPassword,
//     resetPassword, 
// };


// import authService from '../services/auth.service.js';

// const register = async (req, res, next) => { // Add 'next' for error handling
//     try {
//         const { fullName, email, password } = req.body;
//         const newUser = await authService.registerUser(fullName, email, password);
//         res.status(201).json({ message: 'User registered successfully', user: newUserPayload }); // Send user payload
//     } catch (error) {
//         next(error); // Pass errors to error handling middleware
//     }
// };

// // --- Updated login controller ---
// const login = async (req, res, next) => { // Add 'next'
//     try {
//         const { email, password } = req.body;
//         // Call the service, which now correctly returns { user: userPayload, token: '...' }
//         const result = await authService.loginUser(email, password);

//         // --- FIX: Send the structured response ---
//         res.status(200).json({
//              message: 'Login successful',
//              user: result.user, // Pass the user object from the service result
//              token: result.token // Pass the token from the service result
//         });
//     } catch (error) {
//         // Handle specific errors from the service (e.g., invalid credentials)
//          if (error.message === 'Invalid credentials') {
//             return res.status(401).json({ message: 'Invalid email or password.' }); // 401 Unauthorized
//         }
//         if (error.message.includes('Authentication process failed') || error.message.includes('Login failed due to a server error')) {
//              // Log internal errors but send a generic message
//              console.error("Internal login error:", error);
//              return res.status(500).json({ message: 'An internal server error occurred during login.' });
//         }
//         // Pass other unexpected errors to the generic error handler
//         next(error);
//     }
// };

// const forgotPassword = async (req, res, next) => {
//     try {
//         const { email } = req.body;
//         await authService.requestPasswordReset(email);
//         res.json({ message: 'Password reset email sent successfully' });
//     } catch (error) {
//         next(error);
//     }
// };

// const resetPassword = async (req, res, next) => {
//     try {
//         const { token, password } = req.body;
//         await authService.resetPassword(token, password);
//         res.json({ message: 'Password reset successfully' });
//     } catch (error) {
//         next(error);
//     }
// };


// export default {
//     register,
//     login,
//     forgotPassword,
//     resetPassword,
// };



// // backend/src/controllers/auth.controller.js
// import authService from '../services/auth.service.js';

// const register = async (req, res, next) => {
//     try {
//         const { fullName, email, password } = req.body;
//         // 'newUser' now correctly holds the payload returned by the service
//         const newUser = await authService.registerUser(fullName, email, password);

//         // --- FIX: Use the correct variable 'newUser' ---
//         res.status(201).json({
//             message: 'User registered successfully',
//             user: newUser // Use the variable holding the service result
//         });
//     } catch (error) {
//         // Handle specific errors like 'Email already exists'
//         if (error.message === 'Email already exists.') {
//              // Send a user-friendly conflict status code
//             return res.status(409).json({ message: error.message });
//         }
//         // Pass other errors to the global error handler
//         next(error);
//     }
// };

// // --- Updated login controller ---
// const login = async (req, res, next) => {
//     try {
//         const { email, password } = req.body;
//         // Call the service, which returns { user: userPayload, token: '...' }
//         const result = await authService.loginUser(email, password);

//         // Send the structured response (This part was already correct)
//         res.status(200).json({
//              message: 'Login successful',
//              user: result.user, // Pass the user object from the service result
//              token: result.token // Pass the token from the service result
//         });
//     } catch (error) {
//         // Handle specific errors from the service (e.g., invalid credentials)
//          if (error.message === 'Invalid credentials') {
//              // Return 401 Unauthorized for invalid credentials
//             return res.status(401).json({ message: 'Invalid email or password.' });
//         }
//         // Log internal errors but send a generic message
//         if (error.message.includes('Authentication process failed') || error.message.includes('Login failed')) {
//              console.error("Internal login error:", error);
//              return res.status(500).json({ message: 'An internal server error occurred during login.' });
//         }
//         // Pass other unexpected errors to the generic error handler
//         next(error);
//     }
// };

// const forgotPassword = async (req, res, next) => {
//     try {
//         const { email } = req.body;
//         await authService.requestPasswordReset(email);
//         // Send a consistent success message regardless of email existence (security)
//         res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
//     } catch (error) {
//         // Log internal errors, but avoid revealing specific issues to the user
//         console.error("Forgot password error:", error);
//         res.status(500).json({ message: "Failed to process password reset request. Please try again later." });
//         // Or potentially still send the success message above for maximum security obfuscation
//         // next(error); // Only if you want the global handler to manage it differently
//     }
// };

// const resetPassword = async (req, res, next) => {
//     try {
//         const { token, password } = req.body;
//         await authService.resetPassword(token, password);
//         res.json({ message: 'Password reset successfully' });
//     } catch (error) {
//          // Handle specific errors from the service
//         if (error.message === 'Invalid or expired password reset token.') {
//             return res.status(400).json({ message: error.message }); // Bad Request
//         }
//         if (error.message.includes('validation issues')) {
//             return res.status(400).json({ message: error.message }); // Bad Request
//         }
//         // Log internal errors
//         console.error("Reset password error:", error);
//         res.status(500).json({ message: 'Password reset failed. Please try again or request a new link.' });
//         // next(error); // If you prefer global handling
//     }
// };


// export default {
//     register,
//     login,
//     forgotPassword,
//     resetPassword,
// };


// // backend/src/controllers/auth.controller.js
// import authService from '../services/auth.service.js';
// import { OAuth2Client } from 'google-auth-library';
// import config from '../config/index.js';
// import jwt from 'jsonwebtoken'; // Needed for decoding in callback (alternative approach)
// // Correct import for Buffer (though often available globally in Node)
// import { Buffer } from 'node:buffer'; // Explicit import is safer

// const register = async (req, res, next) => {
//     try {
//         const { fullName, email, password } = req.body;
//         // 'newUser' now correctly holds the payload returned by the service
//         const newUser = await authService.registerUser(fullName, email, password);

//         // --- FIX: Use the correct variable 'newUser' ---
//         res.status(201).json({
//             message: 'User registered successfully',
//             user: newUser // Use the variable holding the service result
//         });
//     } catch (error) {
//         // Handle specific errors like 'Email already exists'
//         if (error.message === 'Email already exists.') {
//              // Send a user-friendly conflict status code
//             return res.status(409).json({ message: error.message });
//         }
//         // Pass other errors to the global error handler
//         next(error);
//     }
// };

// // --- Updated login controller ---
// const login = async (req, res, next) => {
//     try {
//         const { email, password } = req.body;
//         // Call the service, which returns { user: userPayload, token: '...' }
//         const result = await authService.loginUser(email, password);

//         // Send the structured response (This part was already correct)
//         res.status(200).json({
//              message: 'Login successful',
//              user: result.user, // Pass the user object from the service result
//              token: result.token // Pass the token from the service result
//         });
//     } catch (error) {
//         // Handle specific errors from the service (e.g., invalid credentials)
//          if (error.message === 'Invalid credentials') {
//              // Return 401 Unauthorized for invalid credentials
//             return res.status(401).json({ message: 'Invalid email or password.' });
//         }
//         // Log internal errors but send a generic message
//         if (error.message.includes('Authentication process failed') || error.message.includes('Login failed')) {
//              console.error("Internal login error:", error);
//              return res.status(500).json({ message: 'An internal server error occurred during login.' });
//         }
//         // Pass other unexpected errors to the generic error handler
//         next(error);
//     }
// };

// const forgotPassword = async (req, res, next) => {
//     try {
//         const { email } = req.body;
//         await authService.requestPasswordReset(email);
//         // Send a consistent success message regardless of email existence (security)
//         res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
//     } catch (error) {
//         // Log internal errors, but avoid revealing specific issues to the user
//         console.error("Forgot password error:", error);
//         res.status(500).json({ message: "Failed to process password reset request. Please try again later." });
//         // Or potentially still send the success message above for maximum security obfuscation
//         // next(error); // Only if you want the global handler to manage it differently
//     }
// };

// const resetPassword = async (req, res, next) => {
//     try {
//         const { token, password } = req.body;
//         await authService.resetPassword(token, password);
//         res.json({ message: 'Password reset successfully' });
//     } catch (error) {
//          // Handle specific errors from the service
//         if (error.message === 'Invalid or expired password reset token.') {
//             return res.status(400).json({ message: error.message }); // Bad Request
//         }
//         if (error.message.includes('validation issues')) {
//             return res.status(400).json({ message: error.message }); // Bad Request
//         }
//         // Log internal errors
//         console.error("Reset password error:", error);
//         res.status(500).json({ message: 'Password reset failed. Please try again or request a new link.' });
//         // next(error); // If you prefer global handling
//     }
// };


// // --- Google OAuth Controller Functions ---
// const googleAuthInitiate = (req, res, next) => { /* ... keep as is ... */
//     try { if (!config.googleAuth.redirectUri) { console.error('[Auth C - Google] CRITICAL: redirectUri missing'); return res.status(500).json({ message: 'Google Sign-In config error.' }); } const client = new OAuth2Client(config.googleAuth.clientId, config.googleAuth.clientSecret, config.googleAuth.redirectUri); const authorizeUrl = client.generateAuthUrl({ access_type: 'offline', scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email', 'openid'], prompt: 'consent' }); console.log('[Auth C - Google] Redirecting user to Google:', authorizeUrl); res.redirect(authorizeUrl); } catch (error) { console.error('[Auth C - Google] Error generating auth URL:', error); next(new Error('Failed to initiate Google Sign-In.')); }
// };

// const googleAuthCallback = async (req, res, next) => {
//     const code = req.query.code;
//     const errorQuery = req.query.error;

//     // --- Basic config/error checks (keep as is) ---
//     if (!config.googleAuth.redirectUri) { console.error('[Auth C - Google CB] CRITICAL: redirectUri missing'); return res.redirect(`${config.clientUrl}/auth/login?googleError=${encodeURIComponent('Google Sign-In configuration error.')}`); }
//     if (errorQuery) { console.error('[Auth C - Google CB] Error from Google:', errorQuery); return res.redirect(`${config.clientUrl}/auth/login?googleError=${encodeURIComponent('Google authentication failed: ' + errorQuery)}`); }
//     if (!code) { console.error('[Auth C - Google CB] No authorization code.'); return res.redirect(`${config.clientUrl}/auth/login?googleError=${encodeURIComponent('Google authentication failed: Missing code.')}`); }

//     console.log('[Auth C - Google CB] Received code. Exchanging...');

//     try {
//         const client = new OAuth2Client(
//             config.googleAuth.clientId,
//             config.googleAuth.clientSecret,
//             config.googleAuth.redirectUri
//         );

//         const { tokens } = await client.getToken(code);
//         console.log('[Auth C - Google CB] Tokens received.');

//         if (!tokens.id_token) { throw new Error('ID token missing from Google response.'); }

//         // Service handles verification, login/registration, returns user payload AND token
//         const { user: userPayload, token: jwtToken } = await authService.googleOAuthLogin(tokens.id_token);

//         // --- Encode User Payload for URL ---
//         if (!userPayload || !userPayload._id || !userPayload.role || !userPayload.kyc) {
//             console.error('[Auth C - Google CB] Error: Missing essential user data in payload from service.');
//             throw new Error('Internal server error retrieving user details.');
//         }
//         const relevantPayload = {
//              _id: userPayload._id.toString(),
//              fullName: userPayload.fullName,
//              email: userPayload.email,
//              role: userPayload.role,
//              kyc: { status: userPayload.kyc.status },
//              createdAt: userPayload.createdAt, // Pass timestamps if needed
//              updatedAt: userPayload.updatedAt,
//         };
//         const payloadString = JSON.stringify(relevantPayload);

//         // --- *** CORRECTED BUFFER USAGE HERE *** ---
//         const encodedPayload = Buffer.from(payloadString).toString('base64url');
//         // --- *** END CORRECTION *** ---

//         const redirectUrl = `${config.clientUrl}/auth/google/callback-handler?token=${jwtToken}&ud=${encodedPayload}`;

//         console.log(`[Auth C - Google CB] Redirecting to frontend with token and user data (ud): ${redirectUrl.split('&ud=')[0]}...`);
//         res.redirect(redirectUrl);

//     } catch (error) {
//         console.error('[Auth C - Google CB] Error processing callback:', error);
//         // Send the actual error message back for better debugging, if desired
//         const message = error instanceof Error ? error.message : 'Google Sign-In failed during callback. Please try again.';
//         res.redirect(`${config.clientUrl}/auth/login?googleError=${encodeURIComponent(message)}`);
//     }
// };

// export default {
//     register,
//     login,
//     forgotPassword,
//     resetPassword,
//     googleAuthInitiate,
//     googleAuthCallback,
// };


// // backend/src/controllers/auth.controller.js
// import authService from '../services/auth.service.js';
// import { OAuth2Client } from 'google-auth-library';
// import config from '../config/index.js';
// import jwt from 'jsonwebtoken'; // Needed for decoding in callback (alternative approach)
// // Correct import for Buffer (though often available globally in Node)
// import { Buffer } from 'node:buffer'; // Explicit import is safer

// const register = async (req, res, next) => {
//     try {
//         const { fullName, email, password } = req.body;
//         // 'newUser' now correctly holds the payload returned by the service
//         const newUser = await authService.registerUser(fullName, email, password);

//         // --- FIX: Use the correct variable 'newUser' ---
//         res.status(201).json({
//             message: 'User registered successfully',
//             user: newUser // Use the variable holding the service result
//         });
//     } catch (error) {
//         // Handle specific errors like 'Email already exists'
//         if (error.message === 'Email already exists.') {
//              // Send a user-friendly conflict status code
//             return res.status(409).json({ message: error.message });
//         }
//         // Handle Google account trying to register normally
//         if (error.message.includes('Google Sign-In')) {
//             return res.status(400).json({ message: error.message });
//         }
//         // Pass other errors to the global error handler
//         next(error);
//     }
// };

// // --- Updated login controller ---
// const login = async (req, res, next) => {
//     try {
//         const { email, password } = req.body;
//         // Call the service, which returns { user: userPayload, token: '...' }
//         const result = await authService.loginUser(email, password);

//         // Send the structured response
//         res.status(200).json({
//              message: 'Login successful',
//              user: result.user, // Pass the user object from the service result
//              token: result.token // Pass the token from the service result
//         });
//     } catch (error) {
//         // --- CATCH SPECIFIC "Google Sign-In" ERROR ---
//         if (error.message.includes('Google Sign-In')) {
//             // Return 400 Bad Request for this specific user error
//             return res.status(400).json({ message: error.message });
//         }
//         // --- END CATCH ---

//         // Handle specific errors from the service (e.g., invalid credentials)
//          if (error.message === 'Invalid credentials') {
//              // Return 401 Unauthorized for invalid credentials
//             return res.status(401).json({ message: 'Invalid email or password.' });
//         }
//         // Log internal errors but send a generic message
//         if (error.message.includes('Authentication process failed') || error.message.includes('Login failed')) {
//              console.error("Internal login error:", error);
//              return res.status(500).json({ message: 'An internal server error occurred during login.' });
//         }
//         // Pass other unexpected errors to the generic error handler
//         next(error);
//     }
// };

// const forgotPassword = async (req, res, next) => {
//     try {
//         const { email } = req.body;
//         await authService.requestPasswordReset(email);
//         // Send a consistent success message regardless of email existence (security)
//         res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
//     } catch (error) {
//         // Log internal errors, but avoid revealing specific issues to the user
//         console.error("Forgot password error:", error);
//         res.status(500).json({ message: "Failed to process password reset request. Please try again later." });
//         // Or potentially still send the success message above for maximum security obfuscation
//         // next(error); // Only if you want the global handler to manage it differently
//     }
// };

// const resetPassword = async (req, res, next) => {
//     try {
//         const { token, password } = req.body;
//         await authService.resetPassword(token, password);
//         res.json({ message: 'Password reset successfully' });
//     } catch (error) {
//          // Handle specific errors from the service
//         if (error.message === 'Invalid or expired password reset token.') {
//             return res.status(400).json({ message: error.message }); // Bad Request
//         }
//         if (error.message.includes('validation issues')) {
//             return res.status(400).json({ message: error.message }); // Bad Request
//         }
//         if (error.message.includes('not available for accounts signed in with Google')) {
//             return res.status(400).json({ message: error.message }); // Bad Request
//         }
//         // Log internal errors
//         console.error("Reset password error:", error);
//         res.status(500).json({ message: 'Password reset failed. Please try again or request a new link.' });
//         // next(error); // If you prefer global handling
//     }
// };


// // --- Google OAuth Controller Functions ---
// const googleAuthInitiate = (req, res, next) => {
//     try { if (!config.googleAuth.redirectUri) { console.error('[Auth C - Google] CRITICAL: redirectUri missing'); return res.status(500).json({ message: 'Google Sign-In config error.' }); } const client = new OAuth2Client(config.googleAuth.clientId, config.googleAuth.clientSecret, config.googleAuth.redirectUri); const authorizeUrl = client.generateAuthUrl({ access_type: 'offline', scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email', 'openid'], prompt: 'consent' }); console.log('[Auth C - Google] Redirecting user to Google:', authorizeUrl); res.redirect(authorizeUrl); } catch (error) { console.error('[Auth C - Google] Error generating auth URL:', error); next(new Error('Failed to initiate Google Sign-In.')); }
// };

// const googleAuthCallback = async (req, res, next) => {
//     const code = req.query.code;
//     const errorQuery = req.query.error;

//     // --- Basic config/error checks ---
//     if (!config.googleAuth.redirectUri) { console.error('[Auth C - Google CB] CRITICAL: redirectUri missing'); return res.redirect(`${config.clientUrl}/auth/login?googleError=${encodeURIComponent('Google Sign-In configuration error.')}`); }
//     if (errorQuery) { console.error('[Auth C - Google CB] Error from Google:', errorQuery); return res.redirect(`${config.clientUrl}/auth/login?googleError=${encodeURIComponent('Google authentication failed: ' + errorQuery)}`); }
//     if (!code) { console.error('[Auth C - Google CB] No authorization code.'); return res.redirect(`${config.clientUrl}/auth/login?googleError=${encodeURIComponent('Google authentication failed: Missing code.')}`); }

//     console.log('[Auth C - Google CB] Received code. Exchanging...');

//     try {
//         const client = new OAuth2Client(
//             config.googleAuth.clientId,
//             config.googleAuth.clientSecret,
//             config.googleAuth.redirectUri
//         );

//         const { tokens } = await client.getToken(code);
//         console.log('[Auth C - Google CB] Tokens received.');

//         if (!tokens.id_token) { throw new Error('ID token missing from Google response.'); }

//         // Service handles verification, login/registration, returns user payload AND token
//         const { user: userPayload, token: jwtToken } = await authService.googleOAuthLogin(tokens.id_token);

//         // --- Encode User Payload for URL ---
//         if (!userPayload || !userPayload._id || !userPayload.role || !userPayload.kyc) {
//             console.error('[Auth C - Google CB] Error: Missing essential user data in payload from service.');
//             throw new Error('Internal server error retrieving user details.');
//         }
//         // Ensure sensitive fields like password hash are NOT included here if the service accidentally returned them
//         const relevantPayload = {
//              _id: userPayload._id.toString(),
//              fullName: userPayload.fullName,
//              email: userPayload.email,
//              role: userPayload.role,
//              kyc: { status: userPayload.kyc.status }, // Only include necessary parts of KYC
//              createdAt: userPayload.createdAt,
//              updatedAt: userPayload.updatedAt,
//              // isGoogleAccount: userPayload.isGoogleAccount // Optional: Only if needed by frontend immediately
//         };
//         const payloadString = JSON.stringify(relevantPayload);

//         // --- Buffer Usage (Corrected) ---
//         const encodedPayload = Buffer.from(payloadString).toString('base64url');
//         // --- End Correction ---

//         const redirectUrl = `${config.clientUrl}/auth/google/callback-handler?token=${jwtToken}&ud=${encodedPayload}`;

//         console.log(`[Auth C - Google CB] Redirecting to frontend with token and user data (ud): ${redirectUrl.split('&ud=')[0]}...`);
//         res.redirect(redirectUrl);

//     } catch (error) {
//         console.error('[Auth C - Google CB] Error processing callback:', error);
//         // Send the actual error message back for better debugging, if desired
//         const message = error instanceof Error ? error.message : 'Google Sign-In failed during callback. Please try again.';
//         // Ensure specific error messages are user-friendly if possible
//         let userFriendlyMessage = message;
//         if (message.includes('Invalid Google ID token') || message.includes('token validation failed')) {
//             userFriendlyMessage = 'Google authentication failed. Please try signing in again.';
//         } else if (message.includes('email not verified')) {
//              userFriendlyMessage = 'Your Google account email must be verified to sign in.';
//         } else if (message.includes('Account conflict')) {
//              userFriendlyMessage = 'There was an issue linking your Google account. Please contact support.';
//         } else if (message.includes('Failed to process Google Sign-In')) {
//             userFriendlyMessage = 'An internal error occurred during Google Sign-In. Please try again later or use email/password.';
//         }
//         // Log the original error for debugging
//         console.error('[Auth C - Google CB] Original Error:', error);

//         res.redirect(`${config.clientUrl}/auth/login?googleError=${encodeURIComponent(userFriendlyMessage)}`);
//     }
// };

// export default {
//     register,
//     login,
//     forgotPassword,
//     resetPassword,
//     googleAuthInitiate,
//     googleAuthCallback,
// };


// // backend/src/controllers/auth.controller.js
// import authService from '../services/auth.service.js';
// import { OAuth2Client } from 'google-auth-library';
// import config from '../config/index.js';
// import jwt from 'jsonwebtoken';
// import { Buffer } from 'node:buffer';

// // --- Register Controller (Handles new Google error) ---
// const register = async (req, res, next) => {
//     try {
//         const { fullName, email, password } = req.body;
//         const newUser = await authService.registerUser(fullName, email, password);
//         res.status(201).json({
//             message: 'User registered successfully',
//             user: newUser
//         });
//     } catch (error) {
//         // Handle specific errors
//         if (error.message === 'Email already exists.') {
//             return res.status(409).json({ message: error.message }); // 409 Conflict
//         }
//         // --- MODIFIED: Handle Google account trying to register normally ---
//         if (error.message.includes('Google Sign-In')) {
//             return res.status(400).json({ message: error.message }); // 400 Bad Request
//         }
//         // --- END MODIFICATION ---
//         next(error); // Pass other errors to global handler
//     }
// };

// // --- Login Controller (Handles new Google error) ---
// const login = async (req, res, next) => {
//     try {
//         const { email, password } = req.body;
//         const result = await authService.loginUser(email, password);
//         res.status(200).json({
//              message: 'Login successful',
//              user: result.user,
//              token: result.token
//         });
//     } catch (error) {
//         // --- MODIFIED: Catch specific "Google Sign-In" ERROR ---
//         if (error.message.includes('Google Sign-In')) {
//             // Return 400 Bad Request for this specific user error
//             return res.status(400).json({ message: error.message });
//         }
//         // --- END MODIFICATION ---

//         // Handle invalid credentials specifically
//          if (error.message === 'Invalid credentials') {
//             return res.status(401).json({ message: 'Invalid email or password.' }); // 401 Unauthorized
//         }
//         // Log internal errors but send a generic message
//         if (error.message.includes('Authentication process failed') || error.message.includes('Login failed')) {
//              console.error("Internal login error:", error);
//              return res.status(500).json({ message: 'An internal server error occurred during login.' });
//         }
//         next(error); // Pass other unexpected errors
//     }
// };

// // --- Forgot Password Controller (No changes needed, returns generic success) ---
// const forgotPassword = async (req, res, next) => {
//     try {
//         const { email } = req.body;
//         // Service handles logic (Google check, existing token check) silently
//         await authService.requestPasswordReset(email);

//         // SECURITY: Send a consistent success message regardless of email existence or account type
//         res.json({ message: 'If an account with that email exists and requires a password reset, a link has been sent.' });
//     } catch (error) {
//         // Log internal errors, but avoid revealing specific issues to the user
//         console.error("Forgot password error (controller level):", error);
//         // Still send the generic success message for security
//         res.json({ message: 'If an account with that email exists and requires a password reset, a link has been sent.' });
//         // Optionally, if you *must* indicate a server-side failure:
//         // res.status(500).json({ message: "Failed to process password reset request due to a server error. Please try again later." });
//         // next(error); // Only if you want the global handler for critical failures
//     }
// };

// // --- Reset Password Controller (Handles new Google error) ---
// const resetPassword = async (req, res, next) => {
//     try {
//         const { token, password } = req.body;
//         await authService.resetPassword(token, password);
//         res.json({ message: 'Password reset successfully' });
//     } catch (error) {
//          // Handle specific errors from the service
//         if (error.message === 'Invalid or expired password reset token.') {
//             return res.status(400).json({ message: error.message }); // 400 Bad Request
//         }
//         // --- MODIFIED: Handle Google account error ---
//         if (error.message.includes('not available for accounts signed in with Google')) {
//             return res.status(400).json({ message: error.message }); // 400 Bad Request
//         }
//         // --- END MODIFICATION ---
//         if (error.message.includes('validation issues')) { // Catch password validation errors
//             return res.status(400).json({ message: error.message }); // 400 Bad Request
//         }
//          if (error.message.includes('required')) { // Catch missing token/password
//              return res.status(400).json({ message: error.message }); // 400 Bad Request
//          }

//         console.error("Reset password error:", error);
//         res.status(500).json({ message: 'Password reset failed. Please try again or request a new link.' });
//         // next(error);
//     }
// };


// // --- Google OAuth Initiate (No changes needed) ---
// const googleAuthInitiate = (req, res, next) => {
//     try {
//         if (!config.googleAuth.redirectUri) { console.error('[Auth C - Google] CRITICAL: redirectUri missing'); return res.status(500).json({ message: 'Google Sign-In config error.' }); }
//         const client = new OAuth2Client(config.googleAuth.clientId, config.googleAuth.clientSecret, config.googleAuth.redirectUri);
//         const authorizeUrl = client.generateAuthUrl({ access_type: 'offline', scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email', 'openid'], prompt: 'consent' });
//         console.log('[Auth C - Google] Redirecting user to Google:', authorizeUrl);
//         res.redirect(authorizeUrl);
//     } catch (error) {
//         console.error('[Auth C - Google] Error generating auth URL:', error);
//         next(new Error('Failed to initiate Google Sign-In.'));
//     }
// };

// // --- Google OAuth Callback (No changes needed structurally, but relies on service logic) ---
// const googleAuthCallback = async (req, res, next) => {
//     const code = req.query.code;
//     const errorQuery = req.query.error;

//     if (!config.googleAuth.redirectUri) { console.error('[Auth C - Google CB] CRITICAL: redirectUri missing'); return res.redirect(`${config.clientUrl}/auth/login?googleError=${encodeURIComponent('Google Sign-In configuration error.')}`); }
//     if (errorQuery) { console.error('[Auth C - Google CB] Error from Google:', errorQuery); return res.redirect(`${config.clientUrl}/auth/login?googleError=${encodeURIComponent('Google authentication failed: ' + errorQuery)}`); }
//     if (!code) { console.error('[Auth C - Google CB] No authorization code.'); return res.redirect(`${config.clientUrl}/auth/login?googleError=${encodeURIComponent('Google authentication failed: Missing code.')}`); }

//     console.log('[Auth C - Google CB] Received code. Exchanging...');

//     try {
//         const client = new OAuth2Client(config.googleAuth.clientId, config.googleAuth.clientSecret, config.googleAuth.redirectUri);
//         const { tokens } = await client.getToken(code);
//         console.log('[Auth C - Google CB] Tokens received.');

//         if (!tokens.id_token) { throw new Error('ID token missing from Google response.'); }

//         // Service handles verification, login/registration, returns user payload AND token
//         const { user: userPayload, token: jwtToken } = await authService.googleOAuthLogin(tokens.id_token);

//         // --- Encode User Payload for URL ---
//         if (!userPayload || !userPayload._id || !userPayload.role || !userPayload.kyc || !userPayload.hasOwnProperty('isGoogleAccount')) {
//             console.error('[Auth C - Google CB] Error: Missing essential user data in payload from service:', userPayload);
//             throw new Error('Internal server error retrieving complete user details.');
//         }

//         // Ensure only necessary, safe fields are included
//         const relevantPayload = {
//              _id: userPayload._id.toString(),
//              fullName: userPayload.fullName,
//              email: userPayload.email,
//              role: userPayload.role,
//              kyc: { status: userPayload.kyc.status },
//              createdAt: userPayload.createdAt,
//              updatedAt: userPayload.updatedAt,
//              isGoogleAccount: userPayload.isGoogleAccount // Include the flag
//         };
//         const payloadString = JSON.stringify(relevantPayload);
//         const encodedPayload = Buffer.from(payloadString).toString('base64url');
//         const redirectUrl = `${config.clientUrl}/auth/google/callback-handler?token=${jwtToken}&ud=${encodedPayload}`;

//         console.log(`[Auth C - Google CB] Redirecting to frontend with token and user data (ud): ${redirectUrl.split('&ud=')[0]}...`);
//         res.redirect(redirectUrl);

//     } catch (error) {
//         console.error('[Auth C - Google CB] Error processing callback:', error);
//         const message = error instanceof Error ? error.message : 'Google Sign-In failed during callback. Please try again.';
//         // Map specific errors to user-friendly messages
//         let userFriendlyMessage = message;
//         if (message.includes('Invalid Google ID token') || message.includes('token validation failed')) {
//             userFriendlyMessage = 'Google authentication failed. Please try signing in again.';
//         } else if (message.includes('email not verified')) {
//              userFriendlyMessage = 'Your Google account email must be verified to sign in.';
//         } else if (message.includes('Account conflict')) {
//              userFriendlyMessage = 'There was an issue linking your Google account. Please contact support.';
//         } else if (message.includes('Google Sign-In failed') || message.includes('User data validation failed')) {
//             userFriendlyMessage = 'An internal error occurred during Google Sign-In. Please try again later or use email/password.';
//         }
//         console.error('[Auth C - Google CB] Original Error:', error); // Log original error
//         res.redirect(`${config.clientUrl}/auth/login?googleError=${encodeURIComponent(userFriendlyMessage)}`);
//     }
// };

// export default {
//     register,
//     login,
//     forgotPassword,
//     resetPassword,
//     googleAuthInitiate,
//     googleAuthCallback,
// };


// // backend/src/controllers/auth.controller.js
// import authService from '../services/auth.service.js';
// import { OAuth2Client } from 'google-auth-library';
// import config from '../config/index.js';
// import jwt from 'jsonwebtoken';
// import { Buffer } from 'node:buffer';

// // --- Register Controller ---
// const register = async (req, res, next) => {
//     try {
//         const { fullName, email, password } = req.body;
//         const newUser = await authService.registerUser(fullName, email, password);
//         res.status(201).json({
//             message: 'User registered successfully',
//             user: newUser
//         });
//     } catch (error) {
//         if (error.message === 'Email already exists.') {
//             return res.status(409).json({ message: error.message }); 
//         }
//         // Handles "This email is associated with a Google account..."
//         if (error.message.includes('Google account')) { 
//             return res.status(400).json({ message: error.message }); 
//         }
//         next(error); 
//     }
// };

// // --- Login Controller (REMOVED specific Google Sign-In error check from service) ---
// const login = async (req, res, next) => {
//     try {
//         const { email, password } = req.body;
//         const result = await authService.loginUser(email, password);
//         res.status(200).json({
//              message: 'Login successful',
//              user: result.user,
//              token: result.token
//         });
//     } catch (error) {
//         // --- REMOVED: Catch specific "Google Sign-In" ERROR from service ---
//         // The service no longer throws this specific error for login.
//         // "Invalid credentials" will cover cases where Google users try to log in with
//         // a wrong password or if they haven't set one via "Forgot Password".
//         // --- END REMOVAL ---

//          if (error.message === 'Invalid credentials') {
//             return res.status(401).json({ message: 'Invalid email or password.' }); 
//         }
//         if (error.message.includes('Authentication process failed') || error.message.includes('Login failed')) {
//              console.error("Internal login error:", error);
//              return res.status(500).json({ message: 'An internal server error occurred during login.' });
//         }
//         next(error); 
//     }
// };

// // --- Forgot Password Controller (No changes needed here) ---
// const forgotPassword = async (req, res, next) => {
//     try {
//         const { email } = req.body;
//         await authService.requestPasswordReset(email);
//         res.json({ message: 'If an account with that email exists and requires a password reset, a link has been sent.' });
//     } catch (error) {
//         console.error("Forgot password error (controller level):", error);
//         res.json({ message: 'If an account with that email exists and requires a password reset, a link has been sent.' });
//     }
// };

// // --- Reset Password Controller (REMOVED Google account error check) ---
// const resetPassword = async (req, res, next) => {
//     try {
//         const { token, password } = req.body;
//         await authService.resetPassword(token, password);
//         res.json({ message: 'Password reset successfully' });
//     } catch (error) {
//         if (error.message === 'Invalid or expired password reset token.') {
//             return res.status(400).json({ message: error.message }); 
//         }
//         // --- REMOVED: Handle Google account error ---
//         // The service layer will no longer throw this specific error.
//         // --- END REMOVAL ---
//         if (error.message.includes('validation issues')) { 
//             return res.status(400).json({ message: error.message }); 
//         }
//          if (error.message.includes('required')) { 
//              return res.status(400).json({ message: error.message }); 
//          }

//         console.error("Reset password error:", error);
//         res.status(500).json({ message: 'Password reset failed. Please try again or request a new link.' });
//     }
// };


// // --- Google OAuth Initiate (No changes needed) ---
// const googleAuthInitiate = (req, res, next) => {
//     try {
//         if (!config.googleAuth.redirectUri) { console.error('[Auth C - Google] CRITICAL: redirectUri missing'); return res.status(500).json({ message: 'Google Sign-In config error.' }); }
//         const client = new OAuth2Client(config.googleAuth.clientId, config.googleAuth.clientSecret, config.googleAuth.redirectUri);
//         const authorizeUrl = client.generateAuthUrl({ access_type: 'offline', scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email', 'openid'], prompt: 'consent' });
//         console.log('[Auth C - Google] Redirecting user to Google:', authorizeUrl);
//         res.redirect(authorizeUrl);
//     } catch (error) {
//         console.error('[Auth C - Google] Error generating auth URL:', error);
//         next(new Error('Failed to initiate Google Sign-In.'));
//     }
// };

// // --- Google OAuth Callback (No changes needed structurally) ---
// const googleAuthCallback = async (req, res, next) => {
//     const code = req.query.code;
//     const errorQuery = req.query.error;

//     if (!config.googleAuth.redirectUri) { console.error('[Auth C - Google CB] CRITICAL: redirectUri missing'); return res.redirect(`${config.clientUrl}/auth/login?googleError=${encodeURIComponent('Google Sign-In configuration error.')}`); }
//     if (errorQuery) { console.error('[Auth C - Google CB] Error from Google:', errorQuery); return res.redirect(`${config.clientUrl}/auth/login?googleError=${encodeURIComponent('Google authentication failed: ' + errorQuery)}`); }
//     if (!code) { console.error('[Auth C - Google CB] No authorization code.'); return res.redirect(`${config.clientUrl}/auth/login?googleError=${encodeURIComponent('Google authentication failed: Missing code.')}`); }

//     console.log('[Auth C - Google CB] Received code. Exchanging...');

//     try {
//         const client = new OAuth2Client(config.googleAuth.clientId, config.googleAuth.clientSecret, config.googleAuth.redirectUri);
//         const { tokens } = await client.getToken(code);
//         console.log('[Auth C - Google CB] Tokens received.');

//         if (!tokens.id_token) { throw new Error('ID token missing from Google response.'); }

//         const { user: userPayload, token: jwtToken } = await authService.googleOAuthLogin(tokens.id_token);

//         if (!userPayload || !userPayload._id || !userPayload.role || !userPayload.kyc || !userPayload.hasOwnProperty('isGoogleAccount')) {
//             console.error('[Auth C - Google CB] Error: Missing essential user data in payload from service:', userPayload);
//             throw new Error('Internal server error retrieving complete user details.');
//         }

//         const relevantPayload = {
//              _id: userPayload._id.toString(),
//              fullName: userPayload.fullName,
//              email: userPayload.email,
//              role: userPayload.role,
//              kyc: { status: userPayload.kyc.status },
//              createdAt: userPayload.createdAt,
//              updatedAt: userPayload.updatedAt,
//              isGoogleAccount: userPayload.isGoogleAccount 
//         };
//         const payloadString = JSON.stringify(relevantPayload);
//         const encodedPayload = Buffer.from(payloadString).toString('base64url');
//         const redirectUrl = `${config.clientUrl}/auth/google/callback-handler?token=${jwtToken}&ud=${encodedPayload}`;

//         console.log(`[Auth C - Google CB] Redirecting to frontend with token and user data (ud): ${redirectUrl.split('&ud=')[0]}...`);
//         res.redirect(redirectUrl);

//     } catch (error) {
//         console.error('[Auth C - Google CB] Error processing callback:', error);
//         const message = error instanceof Error ? error.message : 'Google Sign-In failed during callback. Please try again.';
//         let userFriendlyMessage = message;
//         if (message.includes('Invalid Google ID token') || message.includes('token validation failed')) {
//             userFriendlyMessage = 'Google authentication failed. Please try signing in again.';
//         } else if (message.includes('email not verified')) {
//              userFriendlyMessage = 'Your Google account email must be verified to sign in.';
//         } else if (message.includes('Account conflict')) {
//              userFriendlyMessage = 'There was an issue linking your Google account. Please contact support.';
//         } else if (message.includes('Google Sign-In failed') || message.includes('User data validation failed')) {
//             userFriendlyMessage = 'An internal error occurred during Google Sign-In. Please try again later or use email/password.';
//         }
//         console.error('[Auth C - Google CB] Original Error:', error); 
//         res.redirect(`${config.clientUrl}/auth/login?googleError=${encodeURIComponent(userFriendlyMessage)}`);
//     }
// };

// export default {
//     register,
//     login,
//     forgotPassword,
//     resetPassword,
//     googleAuthInitiate,
//     googleAuthCallback,
// };


import authService from '../services/auth.service.js';
import { OAuth2Client } from 'google-auth-library';
import config from '../config/index.js';
import { Buffer } from 'node:buffer';

const register = async (req, res, next) => {
    try {
        const { fullName, email, password } = req.body;
        const result = await authService.registerUser(fullName, email, password);
        res.status(201).json({ message: result.message, email: email });
    } catch (error) {
        if (error.message.includes('already been sent')) {
             return res.status(400).json({ message: error.message });
        }
        if (error.message === 'Email already exists.') {
            return res.status(409).json({ message: error.message });
        }
        if (error.message.includes('Google account')) {
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
};

const verifyOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        const result = await authService.verifyOtp(email, otp);
        res.status(200).json({ message: result.message });
    } catch (error) {
        if (error.message.includes('Invalid') || error.message.includes('expired') || error.message.includes('No OTP')) {
            return res.status(400).json({ message: error.message });
        }
        if (error.message.includes('not found')) {
            return res.status(404).json({ message: error.message });
        }
        next(error);
    }
};

const resendOtp = async (req, res, next) => {
    try {
        const { email } = req.body;
        const result = await authService.resendOtp(email);
        res.status(200).json({ message: result.message });
    } catch (error) {
        if (error.message.includes('wait a minute')) {
            return res.status(429).json({ message: error.message }); // 429 Too Many Requests
        }
        if (error.message.includes('already verified')) {
            return res.status(400).json({ message: error.message });
        }
        if (error.message.includes('not found')) {
            return res.status(404).json({ message: error.message });
        }
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await authService.loginUser(email, password);
        res.status(200).json({
             message: 'Login successful',
             user: result.user,
             token: result.token
        });
    } catch (error) {
        if (error.message === 'Account not verified. Please check your email for an OTP.') {
            return res.status(403).json({ 
                message: error.message,
                notVerified: true, // Custom flag for frontend
                email: req.body.email 
            });
        }
        if (error.message === 'Invalid credentials') {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
        next(error);
    }
};


// --- Forgot Password Controller (No changes needed here) ---
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        await authService.requestPasswordReset(email);
        res.json({ message: 'If an account with that email exists and requires a password reset, a link has been sent.' });
    } catch (error) {
        console.error("Forgot password error (controller level):", error);
        res.json({ message: 'If an account with that email exists and requires a password reset, a link has been sent.' });
    }
};

// --- Reset Password Controller (REMOVED Google account error check) ---
const resetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;
        await authService.resetPassword(token, password);
        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        if (error.message === 'Invalid or expired password reset token.') {
            return res.status(400).json({ message: error.message }); 
        }
        // --- REMOVED: Handle Google account error ---
        // The service layer will no longer throw this specific error.
        // --- END REMOVAL ---
        if (error.message.includes('validation issues')) { 
            return res.status(400).json({ message: error.message }); 
        }
         if (error.message.includes('required')) { 
             return res.status(400).json({ message: error.message }); 
         }

        console.error("Reset password error:", error);
        res.status(500).json({ message: 'Password reset failed. Please try again or request a new link.' });
    }
};


// --- Google OAuth Initiate ---
const googleAuthInitiate = (req, res, next) => {
    try {
        const client = new OAuth2Client(config.googleAuth.clientId, config.googleAuth.clientSecret, config.googleAuth.redirectUri);
        const authorizeUrl = client.generateAuthUrl({ access_type: 'offline', scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email', 'openid'], prompt: 'consent' });
        res.redirect(authorizeUrl);
    } catch (error) {
        console.error('[Auth C - Google] Error generating auth URL:', error);
        next(new Error('Failed to initiate Google Sign-In.'));
    }
};

// --- Google OAuth Callback (FIXED) ---
const googleAuthCallback = async (req, res, next) => {
    const code = req.query.code;
    const errorQuery = req.query.error;

    if (errorQuery) { return res.redirect(`${config.clientUrl}/auth/login?googleError=${encodeURIComponent('Google authentication failed: ' + errorQuery)}`); }
    if (!code) { return res.redirect(`${config.clientUrl}/auth/login?googleError=${encodeURIComponent('Google authentication failed: Missing code.')}`); }

    try {
        const client = new OAuth2Client(config.googleAuth.clientId, config.googleAuth.clientSecret, config.googleAuth.redirectUri);
        const { tokens } = await client.getToken(code);

        if (!tokens.id_token) { throw new Error('ID token missing from Google response.'); }

        const { user: userPayload, token: jwtToken } = await authService.googleOAuthLogin(tokens.id_token);

        if (!userPayload || !userPayload._id || typeof userPayload.isVerified !== 'boolean' ) {
            console.error('[Auth C - Google CB] Error: Missing essential user data in payload from service:', userPayload);
            throw new Error('Internal server error retrieving complete user details.');
        }

        const relevantPayload = {
             _id: userPayload._id.toString(),
             fullName: userPayload.fullName,
             email: userPayload.email,
             role: userPayload.role,
             isVerified: userPayload.isVerified, // <<< THIS IS THE FIX
             kyc: { status: userPayload.kyc.status },
             createdAt: userPayload.createdAt,
             updatedAt: userPayload.updatedAt,
             isGoogleAccount: userPayload.isGoogleAccount 
        };
        const payloadString = JSON.stringify(relevantPayload);
        const encodedPayload = Buffer.from(payloadString).toString('base64url');
        const redirectUrl = `${config.clientUrl}/auth/google/callback-handler?token=${jwtToken}&ud=${encodedPayload}`;

        res.redirect(redirectUrl);

    } catch (error) {
        console.error('[Auth C - Google CB] Error processing callback:', error);
        const message = error instanceof Error ? error.message : 'Google Sign-In failed during callback.';
        res.redirect(`${config.clientUrl}/auth/login?googleError=${encodeURIComponent(message)}`);
    }
};


export default {
    register,
    verifyOtp, // ADDED
    resendOtp, // ADDED
    login,
    forgotPassword,
    resetPassword,
    googleAuthInitiate,
    googleAuthCallback,
};