// // backend/src/services/kyc.service.js
// import User from '../models/User.js';
// import cloudinary from '../config/cloudinary.js';
// import mongoose from 'mongoose';

// const submitKyc = async (userId, kycData, files) => {
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//         throw new Error('Invalid user ID.');
//     }
//     const user = await User.findById(userId);
//     if (!user) {
//         throw new Error('User not found.');
//     }

//     // Prevent resubmission if already verified
//     if (user.kyc?.status === 'verified') {
//         throw new Error('KYC already verified.');
//     }
//     // Prevent submission if pending (unless admin reset it)
//     if (user.kyc?.status === 'pending') {
//         throw new Error('KYC submission is currently pending review.');
//     }

//     // --- Process File Uploads ---
//     const uploadedDocuments = [];
//     const filesToDeleteOnError = []; // Keep track of uploads to delete if subsequent steps fail

//     try {
//         if (files?.id_front?.[0]) {
//             const file = files.id_front[0];
//             uploadedDocuments.push({
//                 docType: 'id_front',
//                 url: file.path, // URL from Cloudinary via multer-storage-cloudinary
//                 public_id: file.filename // public_id from Cloudinary via multer-storage-cloudinary
//             });
//             filesToDeleteOnError.push(file.filename);
//         }
//         if (files?.id_back?.[0]) {
//             const file = files.id_back[0];
//             uploadedDocuments.push({
//                 docType: 'id_back',
//                 url: file.path,
//                 public_id: file.filename
//             });
//              filesToDeleteOnError.push(file.filename);
//         }

//         // Basic validation for required fields based on idType
//         if (!kycData.firstName || !kycData.lastName || !kycData.dateOfBirth || !kycData.mobile?.number || !kycData.nationality || !kycData.idType || !kycData.idNumber || !kycData.idIssueDate || !kycData.idExpiryDate) {
//              throw new Error('Missing required KYC information.');
//         }
//         if (uploadedDocuments.length < (kycData.idType === 'passport' ? 1 : 2)) { // Passport might only need front, permit needs both
//             throw new Error('Required ID document uploads are missing.');
//         }
//         // Add more specific validations (date formats, expiry date > issue date, etc.)

//         // --- Update User KYC Data ---
//         user.kyc = {
//             ...user.kyc, // Keep existing status or other fields if needed
//             firstName: kycData.firstName,
//             lastName: kycData.lastName,
//             dateOfBirth: kycData.dateOfBirth,
//             mobile: kycData.mobile,
//             occupation: kycData.occupation,
//             salaryRange: kycData.salaryRange,
//             nationality: kycData.nationality,
//             idType: kycData.idType,
//             idNumber: kycData.idNumber,
//             idIssueDate: kycData.idIssueDate,
//             idExpiryDate: kycData.idExpiryDate,
//             documents: uploadedDocuments, // Replace documents with new uploads
//             status: 'pending', // Set status to pending for admin review
//             submittedAt: new Date(),
//             rejectionReason: null, // Clear previous rejection reason
//             rejectedAt: null,
//             verifiedAt: null,
//         };

//         await user.save();
//         return user.kyc; // Return the updated KYC status/data

//     } catch (error) {
//         // --- Cleanup Cloudinary Uploads on Error ---
//         if (filesToDeleteOnError.length > 0) {
//             console.error(`KYC submission failed for user ${userId}. Deleting uploaded files:`, filesToDeleteOnError);
//             // Use Cloudinary's delete_resources method
//             cloudinary.api.delete_resources(filesToDeleteOnError, { resource_type: 'image' })
//                 .then(result => console.log('Cloudinary cleanup result:', result))
//                 .catch(delError => console.error('Cloudinary cleanup failed:', delError));
//         }
//         console.error(`Error submitting KYC for user ${userId}:`, error);
//         // Re-throw the specific error message if available
//         throw new Error(error.message || 'Failed to submit KYC information.');
//     }
// };

// const skipKyc = async (userId) => {
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//         throw new Error('Invalid user ID.');
//     }
//     const user = await User.findById(userId);
//     if (!user) {
//         throw new Error('User not found.');
//     }

//     // Only allow skipping if not started or rejected
//     if (user.kyc?.status !== 'not_started' && user.kyc?.status !== 'rejected') {
//         throw new Error(`Cannot skip KYC in current status: ${user.kyc?.status}`);
//     }

//     user.kyc.status = 'skipped';
//     await user.save();
//     return { status: user.kyc.status };
// };


// const getKycStatus = async (userId) => {
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//         throw new Error('Invalid user ID.');
//     }
//     const user = await User.findById(userId).select('kyc.status kyc.rejectionReason'); // Only select necessary fields
//     if (!user) {
//         throw new Error('User not found.');
//     }
//     return user.kyc || { status: 'not_started' }; // Return kyc object or default
// };

// const updateKycDetails = async (userId, updateData) => {
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//         throw new Error('Invalid user ID.');
//     }
//     const user = await User.findById(userId);
//     if (!user) {
//         throw new Error('User not found.');
//     }

//     const allowedUpdates = {};
//     // Only allow updating specific fields
//     if (updateData.firstName !== undefined) allowedUpdates['kyc.firstName'] = updateData.firstName;
//     if (updateData.lastName !== undefined) allowedUpdates['kyc.lastName'] = updateData.lastName;
//     if (updateData.mobile !== undefined) { // Assuming mobile is an object { countryCode, number }
//         if (updateData.mobile.countryCode) allowedUpdates['kyc.mobile.countryCode'] = updateData.mobile.countryCode;
//         if (updateData.mobile.number) allowedUpdates['kyc.mobile.number'] = updateData.mobile.number;
//     }
//     if (updateData.salaryRange !== undefined) allowedUpdates['kyc.salaryRange'] = updateData.salaryRange;

//     if (Object.keys(allowedUpdates).length === 0) {
//         throw new Error('No valid fields provided for update.');
//     }

//     allowedUpdates['kyc.lastUpdatedAt'] = new Date();

//     const updatedUser = await User.findByIdAndUpdate(
//         userId,
//         { $set: allowedUpdates },
//         { new: true, runValidators: true, context: 'query' } // return updated doc, run schema validators
//     ).select('kyc'); // Select only the updated KYC part

//     if (!updatedUser) {
//         throw new Error('User update failed.'); // Should not happen if user was found earlier
//     }

//     return updatedUser.kyc;
// };


// // --- Admin Services (can be in a separate admin/kyc.admin.service.js) ---

// const getKycDetailsAdmin = async (userId) => {
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//         throw new Error('Invalid user ID format for admin view.');
//     }
//     const user = await User.findById(userId).select('+kyc.documents'); // Include documents for admin
//     if (!user) {
//         throw new Error('User not found for admin view.');
//     }
//     // Optionally exclude password even though select is used
//     user.password = undefined;
//     return user; // Return full user object with detailed KYC
// };

// const updateKycStatusAdmin = async (adminUserId, targetUserId, status, rejectionReason = null) => {
//      if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
//         throw new Error('Invalid target user ID format.');
//     }
//      if (!['verified', 'rejected'].includes(status)) {
//         throw new Error('Invalid status. Must be "verified" or "rejected".');
//     }
//      if (status === 'rejected' && !rejectionReason) {
//         throw new Error('Rejection reason is required when rejecting KYC.');
//     }

//     const user = await User.findById(targetUserId);
//     if (!user) {
//         throw new Error('Target user not found.');
//     }
//     if (user.kyc?.status !== 'pending') {
//         throw new Error(`Cannot update status. User KYC status is currently "${user.kyc?.status}", not "pending".`);
//     }

//     user.kyc.status = status;
//     if (status === 'verified') {
//         user.kyc.verifiedAt = new Date();
//         user.kyc.rejectedAt = null;
//         user.kyc.rejectionReason = null;
//     } else { // rejected
//         user.kyc.rejectedAt = new Date();
//         user.kyc.rejectionReason = rejectionReason;
//         user.kyc.verifiedAt = null;
//     }

//     await user.save();
//     console.log(`Admin ${adminUserId} updated KYC status for user ${targetUserId} to ${status}`); // Audit log
//     return user.kyc;
// };


// export default {
//     submitKyc,
//     skipKyc,
//     getKycStatus,
//     updateKycDetails,
//     // Admin functions (or move them)
//     getKycDetailsAdmin,
//     updateKycStatusAdmin,
// };


// // backend/services/kyc.service.js
// import User from '../models/User.js';
// import cloudinary from '../config/cloudinary.js'; // Keep this import for potential cleanup
// import mongoose from 'mongoose';

// // --- User KYC Services ---

// // The 'files' parameter comes directly from the req.files object populated by multer.fields
// // It should look like: { id_front: [fileObject], id_back?: [fileObject] }
// // fileObject contains { path, filename, etc. } from CloudinaryStorage
// const submitKyc = async (userId, kycData, files) => {
//     console.log(`[KYC Service] Starting submission process for User: ${userId}`);
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//         throw new Error('Invalid user ID format.');
//     }

//     const user = await User.findById(userId).select('+kyc');
//     if (!user) {
//         console.warn(`[KYC Service] User not found: ${userId}`);
//         throw new Error('User not found.');
//     }

//     if (!user.kyc) {
//         console.log(`[KYC Service] Initializing KYC object for User: ${userId}`);
//         user.kyc = { status: 'not_started' };
//     }

//     if (user.kyc.status === 'verified') {
//         console.warn(`[KYC Service] Attempted submission for already verified User: ${userId}`);
//         throw new Error('KYC is already verified.');
//     }
//     if (user.kyc.status === 'pending') {
//         console.warn(`[KYC Service] Attempted submission for pending User: ${userId}`);
//         throw new Error('KYC submission is currently pending review.');
//     }

//     const requiredFields = ['firstName', 'lastName', 'dateOfBirth', 'mobile', 'nationality', 'idType', 'idNumber', 'idIssueDate', 'idExpiryDate'];
//     for (const field of requiredFields) {
//         if (!kycData[field]) {
//             const fieldName = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
//             console.error(`[KYC Service] Missing required field: ${fieldName} for User: ${userId}`);
//             throw new Error(`Missing required KYC information: ${fieldName}.`);
//         }
//     }
//     if (!(kycData.dateOfBirth instanceof Date) || !(kycData.idIssueDate instanceof Date) || !(kycData.idExpiryDate instanceof Date)) {
//         console.error(`[KYC Service] Internal Error: Invalid Date object received for User: ${userId}`);
//         throw new Error('Internal Error: Invalid Date object received by service.');
//     }
//     if (kycData.idExpiryDate <= kycData.idIssueDate) {
//         console.error(`[KYC Service] Date validation failed: Expiry <= Issue for User: ${userId}`);
//         throw new Error('ID Expiry Date must be after Issue Date.');
//     }

//     // --- Prepare Document Data from Uploaded Files (req.files object) ---
//     let uploadedDocumentsData = [];
//     let publicIdsToDeleteOnError = []; // Track Cloudinary public_ids

//     console.log(`[KYC Service] Processing uploaded files from req.files for User: ${userId}`);
//     try {
//         // *** Access files correctly from the object provided by multer.fields ***
//         const frontFileArray = files?.id_front;
//         const backFileArray = files?.id_back;

//         // Process Front ID (required)
//         if (frontFileArray && Array.isArray(frontFileArray) && frontFileArray.length > 0) {
//             const frontFile = frontFileArray[0]; // Get the first file object
//             // 'path' is the Cloudinary URL, 'filename' is the public_id from multer-storage-cloudinary
//             if (!frontFile.path || !frontFile.filename) {
//                  console.error("[KYC Service] Cloudinary upload data missing for front ID:", frontFile);
//                  throw new Error("Cloudinary upload data missing for front ID.");
//             }
//             uploadedDocumentsData.push({
//                 docType: 'id_front',
//                 url: frontFile.path,
//                 public_id: frontFile.filename, // This is the key for potential deletion
//                 uploadedAt: new Date(),
//             });
//             publicIdsToDeleteOnError.push(frontFile.filename); // Add public_id for cleanup
//             console.log(`[KYC Service] Added Front ID: ${frontFile.filename}`);
//         } else {
//              console.error("[KYC Service] Front ID file array is missing or empty in 'files' object:", files);
//              throw new Error("Front ID file data missing in service layer.");
//         }

//         // Process Back ID (optional, depends on idType)
//         if (backFileArray && Array.isArray(backFileArray) && backFileArray.length > 0) {
//             const backFile = backFileArray[0];
//              if (!backFile.path || !backFile.filename) {
//                  console.error("[KYC Service] Cloudinary upload data missing for back ID:", backFile);
//                  throw new Error("Cloudinary upload data missing for back ID.");
//             }
//             uploadedDocumentsData.push({
//                 docType: 'id_back',
//                 url: backFile.path,
//                 public_id: backFile.filename,
//                 uploadedAt: new Date(),
//             });
//             publicIdsToDeleteOnError.push(backFile.filename); // Add public_id for cleanup
//              console.log(`[KYC Service] Added Back ID: ${backFile.filename}`);
//         } else if (kycData.idType === 'resident_permit') {
//              // If back file IS required but not present
//              console.error("[KYC Service] Back ID file array missing for Resident Permit:", files);
//              throw new Error("Back ID file data missing for Resident Permit in service layer.");
//         }

//         console.log(`[KYC Service] Prepared ${uploadedDocumentsData.length} documents for User: ${userId}`);

//         // --- Update User KYC Data ---
//         user.kyc = {
//             // ... (copy all kycData fields as before)
//             firstName: kycData.firstName.trim(),
//             lastName: kycData.lastName.trim(),
//             dateOfBirth: kycData.dateOfBirth,
//             mobile: {
//                 countryCode: kycData.mobile.countryCode.trim(),
//                 number: kycData.mobile.number.trim(),
//             },
//             occupation: kycData.occupation?.trim(),
//             salaryRange: kycData.salaryRange,
//             nationality: kycData.nationality.trim(),
//             idType: kycData.idType,
//             idNumber: kycData.idNumber.trim(),
//             idIssueDate: kycData.idIssueDate,
//             idExpiryDate: kycData.idExpiryDate,
//             // *** Assign the prepared documents ***
//             documents: uploadedDocumentsData,
//             status: 'pending',
//             submittedAt: new Date(),
//             rejectionReason: null,
//             rejectedAt: null,
//             verifiedAt: null,
//             lastUpdatedAt: new Date(),
//         };

//         console.log(`[KYC Service] Attempting to save KYC for User: ${userId}`);
//         await user.save();
//         console.log(`[KYC Service] KYC submitted and saved successfully for User: ${userId}`);
//         return user.kyc.toObject();

//     } catch (saveOrProcessingError) {
//         console.error(`[KYC Service] Error during submission process for User ${userId}:`, saveOrProcessingError);

//         // --- Cloudinary Cleanup on Error ---
//         if (publicIdsToDeleteOnError.length > 0) {
//             console.warn(`[KYC Service] DB save/processing failed for User ${userId}. Attempting Cloudinary cleanup for public_ids:`, publicIdsToDeleteOnError);
//             try {
//                 // Use invalidate: true to try and purge CDN cache faster
//                 const deletionResult = await cloudinary.api.delete_resources(publicIdsToDeleteOnError, { resource_type: 'image', invalidate: true }); // Adjust resource_type if needed ('raw' for pdf)
//                 console.log(`[KYC Service] Cloudinary cleanup result for User ${userId}:`, deletionResult);
//                 if (deletionResult.deleted_counts && Object.values(deletionResult.deleted_counts).some(count => count === 'not_found')) {
//                      console.warn(`[KYC Service] Some resources were not found during cleanup for User ${userId}.`);
//                 }
//             } catch (cloudinaryError) {
//                 console.error(`[KYC Service] CRITICAL: Cloudinary cleanup FAILED for User ${userId}:`, cloudinaryError);
//             }
//         } else {
//             console.log(`[KYC Service] No Cloudinary files to clean up for failed submission (User: ${userId}).`);
//         }

//         if (saveOrProcessingError.name === 'ValidationError') {
//             const messages = Object.values(saveOrProcessingError.errors).map(el => el.message);
//             throw new Error(`Validation failed: ${messages.join('. ') || 'Please check your input.'}`);
//         }
//         // Re-throw original or enhanced error message
//         throw new Error(saveOrProcessingError.message || 'Failed to save KYC information due to an internal error.');
//     }
// };


// const skipKyc = async (userId) => {
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//         throw new Error('Invalid user ID format.');
//     }
//     const user = await User.findById(userId).select('+kyc');
//     if (!user) { throw new Error('User not found.'); }

//     if (!user.kyc) user.kyc = { status: 'not_started' }; // Initialize if missing

//     // Allow skipping only if not started or previously rejected
//     if (!['not_started', 'rejected'].includes(user.kyc.status)) {
//         console.warn(`[KYC Service] Cannot skip KYC for User: ${userId} in status: ${user.kyc.status}`);
//         throw new Error(`Cannot skip KYC in current status: ${user.kyc.status}.`);
//     }

//     console.log(`[KYC Service] Skipping KYC for User: ${userId}`);
//     user.kyc.status = 'skipped';
//     user.kyc.lastUpdatedAt = new Date(); // Track when skipped
//     // Optionally clear other fields if skipping should reset them
//     // user.kyc.rejectionReason = null;
//     // user.kyc.rejectedAt = null;

//     // Skip validation for this simple status update if no other fields are changed
//     await user.save({ validateBeforeSave: false });
//     return { status: user.kyc.status }; // Return only the new status
// };

// const getKycStatus = async (userId) => {
//     if (!mongoose.Types.ObjectId.isValid(userId)) { throw new Error('Invalid user ID format.'); }
//     // Select only the necessary fields for status check
//     const user = await User.findById(userId).select('kyc.status kyc.rejectionReason').lean(); // Use lean for plain object
//     if (!user) { throw new Error('User not found.'); }

//     // Return kyc object or a default 'not_started' state if kyc is missing/null
//     return user.kyc || { status: 'not_started' };
// };

// const updateKycDetails = async (userId, updateData) => {
//     if (!mongoose.Types.ObjectId.isValid(userId)) { throw new Error('Invalid user ID format.'); }

//     // Select kyc to check status before allowing update
//     const user = await User.findById(userId).select('+kyc');
//     if (!user) { throw new Error('User not found.'); }
//     if (!user.kyc) user.kyc = { status: 'not_started' }; // Initialize if needed

//     // Optional: Prevent updates based on status (adjust as needed)
//     // For example, allow updates only if not_started, skipped, or rejected
//     const allowedUpdateStatuses = ['not_started', 'skipped', 'rejected'];
//     if (!allowedUpdateStatuses.includes(user.kyc.status)) {
//        console.warn(`[KYC Service] Update details denied for User: ${userId} in status: ${user.kyc.status}`);
//        throw new Error(`Cannot update details while KYC status is ${user.kyc.status}. Please contact support if needed.`);
//     }

//     const allowedUpdates = {}; // Prepare fields for $set using dot notation

//     // Validate and add allowed fields to the update object
//     if (updateData.firstName !== undefined) {
//         if (typeof updateData.firstName !== 'string') throw new Error('Invalid First Name format.');
//         allowedUpdates['kyc.firstName'] = updateData.firstName.trim();
//     }
//     if (updateData.lastName !== undefined) {
//         if (typeof updateData.lastName !== 'string') throw new Error('Invalid Last Name format.');
//         allowedUpdates['kyc.lastName'] = updateData.lastName.trim();
//     }
//     if (updateData.mobile !== undefined) {
//         if (typeof updateData.mobile !== 'object' || !updateData.mobile.countryCode?.trim() || !updateData.mobile.number?.trim()) {
//             throw new Error('Invalid Mobile format. Expected { countryCode, number }.');
//         }
//         allowedUpdates['kyc.mobile.countryCode'] = updateData.mobile.countryCode.trim();
//         allowedUpdates['kyc.mobile.number'] = updateData.mobile.number.trim();
//     }
//     // Validate salaryRange against schema enum + null
//     const validSalaryRanges = ['0-1000', '10000-50000', '50000-100000', '100000+', null];
//     if (updateData.salaryRange !== undefined) {
//         if (!validSalaryRanges.includes(updateData.salaryRange)) {
//             throw new Error('Invalid salary range provided.');
//         }
//         allowedUpdates['kyc.salaryRange'] = updateData.salaryRange;
//     }
//     if (updateData.occupation !== undefined) {
//          if (typeof updateData.occupation !== 'string') throw new Error('Invalid Occupation format.');
//          allowedUpdates['kyc.occupation'] = updateData.occupation.trim();
//     }
//     // Add other editable fields here following the same pattern (e.g., nationality if allowed)
//      if (updateData.nationality !== undefined) {
//          if (typeof updateData.nationality !== 'string') throw new Error('Invalid Nationality format.');
//          allowedUpdates['kyc.nationality'] = updateData.nationality.trim();
//      }


//     if (Object.keys(allowedUpdates).length === 0) {
//         throw new Error('No valid or permitted fields provided for update.');
//     }

//     // Always update the timestamp
//     allowedUpdates['kyc.lastUpdatedAt'] = new Date();
//     console.log(`[KYC Service] Applying KYC detail updates for User: ${userId}`, allowedUpdates);

//     // Perform the update using findByIdAndUpdate for efficiency
//     const updatedUser = await User.findByIdAndUpdate(
//         userId,
//         { $set: allowedUpdates },
//         // Options: return the modified document, run schema validators on the update operation
//         { new: true, runValidators: true, context: 'query' }
//     ).select('kyc').lean(); // Select only the updated KYC part and return lean object

//     if (!updatedUser) {
//         // This might happen if the user was deleted between the find and update
//         console.error(`[KYC Service] User ${userId} not found during update operation.`);
//         throw new Error('User update failed (not found).');
//     }

//     console.log(`[KYC Service] KYC details updated successfully for User: ${userId}`);
//     return updatedUser.kyc; // Return the updated kyc subdocument
// };

// export default {
//     submitKyc,
//     skipKyc,
//     getKycStatus,
//     updateKycDetails,
// };


// // backend/services/kyc.service.js
// import User from '../models/User.js';
// import cloudinary from '../config/cloudinary.js'; // Keep this import for potential cleanup
// import mongoose from 'mongoose';

// // --- User KYC Services ---

// // The 'files' parameter comes directly from the req.files object populated by multer.fields
// // It should look like: { id_front: [fileObject], id_back?: [fileObject] }
// // fileObject contains { path, filename, etc. } from CloudinaryStorage
// const submitKyc = async (userId, validatedKycData, files) => {
//     console.log(`[KYC Service] Starting submission process for User: ${userId}`);
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//         console.error(`[KYC Service] Invalid user ID format received: ${userId}`);
//         throw new Error('Invalid user ID format.');
//     }

//     // Use lean initially to check status efficiently, then fetch full doc if proceeding
//     const userStatusCheck = await User.findById(userId).select('kyc.status').lean();
//     if (!userStatusCheck) {
//         console.warn(`[KYC Service] User not found during status check: ${userId}`);
//         throw new Error('User not found.');
//     }

//     const currentStatus = userStatusCheck.kyc?.status || 'not_started';
//     if (currentStatus === 'verified') {
//         console.warn(`[KYC Service] Attempted submission for already verified User: ${userId}`);
//         throw new Error('KYC is already verified.');
//     }
//     if (currentStatus === 'pending') {
//         console.warn(`[KYC Service] Attempted submission for pending User: ${userId}`);
//         throw new Error('KYC submission is currently pending review.');
//     }

//     // Status allows submission, fetch the full document to update
//     // Select '+kyc' to ensure the subdocument is included even if not typically selected
//     const user = await User.findById(userId).select('+kyc');
//      if (!user) { // Double check in case user deleted between checks (unlikely but safe)
//         console.warn(`[KYC Service] User not found when fetching full document: ${userId}`);
//         throw new Error('User not found.');
//     }

//     // Validate dates received from controller (should already be Date objects)
//     if (!(validatedKycData.dateOfBirth instanceof Date) || !(validatedKycData.idIssueDate instanceof Date) || !(validatedKycData.idExpiryDate instanceof Date)) {
//         console.error(`[KYC Service] Internal Error: Invalid Date object received for User: ${userId}`, validatedKycData);
//         throw new Error('Internal Error: Invalid Date object received by service.');
//     }
//      if (validatedKycData.idExpiryDate <= validatedKycData.idIssueDate) {
//         console.error(`[KYC Service] Date validation failed: Expiry <= Issue for User: ${userId}`);
//         throw new Error('ID Expiry Date must be after Issue Date.');
//     }

//     // --- Prepare Document Data from Uploaded Files (req.files object) ---
//     let uploadedDocumentsData = [];
//     let publicIdsToDeleteOnError = []; // Track Cloudinary public_ids

//     console.log(`[KYC Service] Processing uploaded files from req.files for User: ${userId}`);
//     try {
//         // Access files correctly from the object provided by multer.fields
//         const frontFileArray = files?.id_front;
//         const backFileArray = files?.id_back;

//         // Process Front ID (required)
//         if (frontFileArray && Array.isArray(frontFileArray) && frontFileArray.length > 0) {
//             const frontFile = frontFileArray[0]; // Get the first file object
//             if (!frontFile.path || !frontFile.filename) {
//                  console.error("[KYC Service] Cloudinary upload data missing for front ID:", frontFile);
//                  throw new Error("Cloudinary upload data missing for front ID.");
//             }
//             uploadedDocumentsData.push({
//                 docType: 'id_front',
//                 url: frontFile.path,
//                 public_id: frontFile.filename, // This is the key for potential deletion
//                 uploadedAt: new Date(),
//             });
//             publicIdsToDeleteOnError.push(frontFile.filename); // Add public_id for cleanup
//             console.log(`[KYC Service] Added Front ID: ${frontFile.filename}`);
//         } else {
//              console.error("[KYC Service] Front ID file array is missing or empty in 'files' object:", files);
//              throw new Error("Front ID file data missing in service layer (Controller should have caught)."); // Should have been caught by controller
//         }

//         // Process Back ID (optional, depends on validated idType)
//         if (validatedKycData.idType === 'resident_permit') {
//             if (backFileArray && Array.isArray(backFileArray) && backFileArray.length > 0) {
//                 const backFile = backFileArray[0];
//                  if (!backFile.path || !backFile.filename) {
//                      console.error("[KYC Service] Cloudinary upload data missing for back ID:", backFile);
//                      throw new Error("Cloudinary upload data missing for back ID.");
//                 }
//                 uploadedDocumentsData.push({
//                     docType: 'id_back',
//                     url: backFile.path,
//                     public_id: backFile.filename,
//                     uploadedAt: new Date(),
//                 });
//                 publicIdsToDeleteOnError.push(backFile.filename); // Add public_id for cleanup
//                  console.log(`[KYC Service] Added Back ID: ${backFile.filename}`);
//             } else {
//                  // If back file IS required but not present (should be caught by controller)
//                  console.error("[KYC Service] Back ID file array missing for Resident Permit:", files);
//                  throw new Error("Back ID file data missing for Resident Permit in service layer (Controller should have caught).");
//             }
//         }

//         console.log(`[KYC Service] Prepared ${uploadedDocumentsData.length} documents for User: ${userId}`);

//         // --- Update User KYC Data ---
//         // Use the validatedKycData object from the controller
//         user.kyc = {
//             firstName: validatedKycData.firstName,
//             lastName: validatedKycData.lastName,
//             dateOfBirth: validatedKycData.dateOfBirth,
//             mobile: { // Already validated object
//                 countryCode: validatedKycData.mobile.countryCode,
//                 number: validatedKycData.mobile.number,
//             },
//             occupation: validatedKycData.occupation, // Already trimmed or null
//             salaryRange: validatedKycData.salaryRange, // Already validated or null
//             nationality: validatedKycData.nationality,
//             idType: validatedKycData.idType,
//             idNumber: validatedKycData.idNumber,
//             idIssueDate: validatedKycData.idIssueDate,
//             idExpiryDate: validatedKycData.idExpiryDate,
//             documents: uploadedDocumentsData, // Assign the prepared documents
//             status: 'pending', // Set status to pending
//             submittedAt: new Date(),
//             // Clear previous rejection/verification details
//             rejectionReason: null,
//             rejectedAt: null,
//             verifiedAt: null,
//             lastUpdatedAt: new Date(),
//         };

//         console.log(`[KYC Service] Attempting to save KYC for User: ${userId}`);
//         await user.save(); // This will run Mongoose schema validations
//         console.log(`[KYC Service] KYC submitted and saved successfully for User: ${userId}`);

//         // Return the saved KYC subdocument as a plain object
//         return user.kyc.toObject();

//     } catch (saveOrProcessingError) {
//         console.error(`[KYC Service] Error during submission process for User ${userId}:`, saveOrProcessingError);

//         // --- Cloudinary Cleanup on Error ---
//         if (publicIdsToDeleteOnError.length > 0) {
//             console.warn(`[KYC Service] DB save/processing failed for User ${userId}. Attempting Cloudinary cleanup for public_ids:`, publicIdsToDeleteOnError);
//             try {
//                 // Determine resource type (image or raw for PDF) - adjust if necessary
//                 // Assuming all uploads are treated as 'image' by Cloudinary for simplicity,
//                 // or 'auto' was used during upload. 'image' is safer for deletion.
//                 const deletionResult = await cloudinary.api.delete_resources(publicIdsToDeleteOnError, { resource_type: 'image', invalidate: true });
//                 console.log(`[KYC Service] Cloudinary cleanup result for User ${userId}:`, deletionResult);
//                 // Check if any failed (e.g., 'not_found')
//                 const notFoundCount = deletionResult.deleted_counts ? Object.values(deletionResult.deleted_counts).filter(status => status === 'not_found').length : 0;
//                 if (notFoundCount > 0) {
//                      console.warn(`[KYC Service] ${notFoundCount} resource(s) were not found during cleanup for User ${userId}.`);
//                 }
//             } catch (cloudinaryError) {
//                 // Log critical error, but don't prevent the original error from being thrown
//                 console.error(`[KYC Service] CRITICAL: Cloudinary cleanup FAILED for User ${userId}:`, cloudinaryError);
//                 // Optionally add more context to the original error?
//                  // saveOrProcessingError.message += ' (Cloudinary cleanup failed)';
//             }
//         } else {
//             console.log(`[KYC Service] No Cloudinary files to clean up for failed submission (User: ${userId}).`);
//         }

//         // Handle Mongoose validation errors specifically
//         if (saveOrProcessingError.name === 'ValidationError') {
//             const messages = Object.values(saveOrProcessingError.errors).map(el => el.message);
//             // Throw a new error with combined validation messages
//             throw new Error(`Validation failed: ${messages.join('. ') || 'Please check your input.'}`);
//         }

//         // Re-throw the original error (or the modified one if you added context)
//         throw saveOrProcessingError;
//     }
// };


// const skipKyc = async (userId) => {
//     if (!mongoose.Types.ObjectId.isValid(userId)) { throw new Error('Invalid user ID format.'); }

//     const user = await User.findById(userId).select('+kyc'); // Need kyc subdoc
//     if (!user) { throw new Error('User not found.'); }

//     if (!user.kyc) user.kyc = { status: 'not_started' }; // Initialize if missing

//     // Allow skipping only if not started or previously rejected
//     if (!['not_started', 'rejected'].includes(user.kyc.status)) {
//         console.warn(`[KYC Service] Cannot skip KYC for User: ${userId} in status: ${user.kyc.status}`);
//         throw new Error(`Cannot skip KYC in current status: ${user.kyc.status}.`);
//     }

//     console.log(`[KYC Service] Skipping KYC for User: ${userId}`);
//     user.kyc.status = 'skipped';
//     user.kyc.lastUpdatedAt = new Date(); // Track when skipped
//     user.kyc.rejectionReason = null; // Clear any previous rejection reason
//     user.kyc.rejectedAt = null;

//     // Skip validation for this simple status update if no other fields are changed
//     await user.save({ validateBeforeSave: false });

//     // Return only the new status as a plain object
//     return { status: user.kyc.status };
// };

// const getKycStatus = async (userId) => {
//     if (!mongoose.Types.ObjectId.isValid(userId)) { throw new Error('Invalid user ID format.'); }
//     // Select only the necessary fields for status check + rejection reason
//     const user = await User.findById(userId).select('kyc.status kyc.rejectionReason').lean(); // Use lean for performance
//     if (!user) { throw new Error('User not found.'); }

//     // Return kyc object or a default 'not_started' state if kyc is missing/null
//     return user.kyc || { status: 'not_started', rejectionReason: null };
// };

// const updateKycDetails = async (userId, updateData) => {
//     if (!mongoose.Types.ObjectId.isValid(userId)) { throw new Error('Invalid user ID format.'); }

//     // Find user and select KYC subdocument to check status and update
//     const user = await User.findById(userId).select('+kyc');
//     if (!user) { throw new Error('User not found.'); }
//     if (!user.kyc) user.kyc = { status: 'not_started' }; // Initialize if needed

//     // Prevent updates based on status (allow only if not started, skipped, or rejected)
//     const allowedUpdateStatuses = ['not_started', 'skipped', 'rejected'];
//     if (!allowedUpdateStatuses.includes(user.kyc.status)) {
//        console.warn(`[KYC Service] Update details denied for User: ${userId} in status: ${user.kyc.status}`);
//        throw new Error(`Cannot update details while KYC status is ${user.kyc.status}. Contact support if needed.`);
//     }

//     const updateFields = {}; // Prepare fields for $set using dot notation

//     // Validate and add allowed fields to the update object
//     // Only allow updating a specific subset of fields
//     const editableFields = ['firstName', 'lastName', 'mobile', 'salaryRange', 'occupation', 'nationality'];
//     let hasValidUpdate = false;

//     for (const key of editableFields) {
//         if (updateData[key] !== undefined) { // Check if the key exists in the input data
//              const value = updateData[key];
//              switch (key) {
//                 case 'firstName':
//                 case 'lastName':
//                 case 'occupation':
//                 case 'nationality':
//                      if (typeof value !== 'string') throw new Error(`Invalid format for ${key}. Expected string.`);
//                      updateFields[`kyc.${key}`] = value.trim();
//                      if (updateFields[`kyc.${key}`]) hasValidUpdate = true; // Check if non-empty after trim
//                      break;
//                 case 'mobile':
//                      if (typeof value !== 'object' || !value.countryCode?.trim() || !value.number?.trim()) {
//                          throw new Error('Invalid Mobile format. Expected { countryCode, number }.');
//                      }
//                      updateFields['kyc.mobile.countryCode'] = value.countryCode.trim();
//                      updateFields['kyc.mobile.number'] = value.number.trim();
//                      hasValidUpdate = true;
//                      break;
//                  case 'salaryRange':
//                      const validSalaryRanges = ['0-1000', '10000-50000', '50000-100000', '100000+', null];
//                      if (!validSalaryRanges.includes(value)) {
//                          throw new Error('Invalid salary range provided.');
//                      }
//                      updateFields['kyc.salaryRange'] = value; // Allow null
//                       hasValidUpdate = true; // Setting to null is a valid update
//                      break;
//              }
//         }
//     }


//     if (!hasValidUpdate) {
//         throw new Error('No valid or permitted fields provided for update.');
//     }

//     // Always update the timestamp
//     updateFields['kyc.lastUpdatedAt'] = new Date();
//     // If updating details after rejection, potentially reset status to 'not_started' or 'pending'?
//     // Or require re-submission? For now, just update fields.
//     // if (user.kyc.status === 'rejected') {
//     //     updateFields['kyc.status'] = 'not_started'; // Or pending if files are still there? Complex.
//     //     updateFields['kyc.rejectionReason'] = null;
//     //     updateFields['kyc.rejectedAt'] = null;
//     // }

//     console.log(`[KYC Service] Applying KYC detail updates for User: ${userId}`, updateFields);

//     // Perform the update using findByIdAndUpdate for efficiency
//     const updatedUser = await User.findByIdAndUpdate(
//         userId,
//         { $set: updateFields },
//         // Options: return the modified document, run schema validators on the update operation
//         { new: true, runValidators: true, context: 'query' }
//     ).select('kyc').lean(); // Select only the updated KYC part and return lean object

//     if (!updatedUser) {
//         // This might happen if the user was deleted between the find and update
//         console.error(`[KYC Service] User ${userId} not found during update operation.`);
//         throw new Error('User update failed (not found).');
//     }

//     console.log(`[KYC Service] KYC details updated successfully for User: ${userId}`);
//     return updatedUser.kyc; // Return the updated kyc subdocument
// };

// export default {
//     submitKyc,
//     skipKyc,
//     getKycStatus,
//     updateKycDetails,
// };


// backend/services/kyc.service.js
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js'; // Keep this import for potential cleanup
import mongoose from 'mongoose';

// --- User KYC Services ---

// submitKyc function remains the same
const submitKyc = async (userId, validatedKycData, files) => {
    console.log(`[KYC Service] Starting submission process for User: ${userId}`);
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        console.error(`[KYC Service] Invalid user ID format received: ${userId}`);
        throw new Error('Invalid user ID format.');
    }

    // Use lean initially to check status efficiently, then fetch full doc if proceeding
    const userStatusCheck = await User.findById(userId).select('kyc.status').lean();
    if (!userStatusCheck) {
        console.warn(`[KYC Service] User not found during status check: ${userId}`);
        throw new Error('User not found.');
    }

    const currentStatus = userStatusCheck.kyc?.status || 'not_started';
    if (currentStatus === 'verified') {
        console.warn(`[KYC Service] Attempted submission for already verified User: ${userId}`);
        throw new Error('KYC is already verified.');
    }
    if (currentStatus === 'pending') {
        console.warn(`[KYC Service] Attempted submission for pending User: ${userId}`);
        throw new Error('KYC submission is currently pending review.');
    }

    // Status allows submission, fetch the full document to update
    // Select '+kyc' to ensure the subdocument is included even if not typically selected
    const user = await User.findById(userId).select('+kyc');
     if (!user) { // Double check in case user deleted between checks (unlikely but safe)
        console.warn(`[KYC Service] User not found when fetching full document: ${userId}`);
        throw new Error('User not found.');
    }

    // Validate dates received from controller (should already be Date objects)
    if (!(validatedKycData.dateOfBirth instanceof Date) || !(validatedKycData.idIssueDate instanceof Date) || !(validatedKycData.idExpiryDate instanceof Date)) {
        console.error(`[KYC Service] Internal Error: Invalid Date object received for User: ${userId}`, validatedKycData);
        throw new Error('Internal Error: Invalid Date object received by service.');
    }
     if (validatedKycData.idExpiryDate <= validatedKycData.idIssueDate) {
        console.error(`[KYC Service] Date validation failed: Expiry <= Issue for User: ${userId}`);
        throw new Error('ID Expiry Date must be after Issue Date.');
    }

    // --- Prepare Document Data from Uploaded Files (req.files object) ---
    let uploadedDocumentsData = [];
    let publicIdsToDeleteOnError = []; // Track Cloudinary public_ids

    console.log(`[KYC Service] Processing uploaded files from req.files for User: ${userId}`);
    try {
        // Access files correctly from the object provided by multer.fields
        const frontFileArray = files?.id_front;
        const backFileArray = files?.id_back;

        // Process Front ID (required)
        if (frontFileArray && Array.isArray(frontFileArray) && frontFileArray.length > 0) {
            const frontFile = frontFileArray[0]; // Get the first file object
            if (!frontFile.path || !frontFile.filename) {
                 console.error("[KYC Service] Cloudinary upload data missing for front ID:", frontFile);
                 throw new Error("Cloudinary upload data missing for front ID.");
            }
            uploadedDocumentsData.push({
                docType: 'id_front',
                url: frontFile.path,
                public_id: frontFile.filename, // This is the key for potential deletion
                uploadedAt: new Date(),
            });
            publicIdsToDeleteOnError.push(frontFile.filename); // Add public_id for cleanup
            console.log(`[KYC Service] Added Front ID: ${frontFile.filename}`);
        } else {
             console.error("[KYC Service] Front ID file array is missing or empty in 'files' object:", files);
             throw new Error("Front ID file data missing in service layer (Controller should have caught)."); // Should have been caught by controller
        }

        // Process Back ID (optional, depends on validated idType)
        if (validatedKycData.idType === 'resident_permit') {
            if (backFileArray && Array.isArray(backFileArray) && backFileArray.length > 0) {
                const backFile = backFileArray[0];
                 if (!backFile.path || !backFile.filename) {
                     console.error("[KYC Service] Cloudinary upload data missing for back ID:", backFile);
                     throw new Error("Cloudinary upload data missing for back ID.");
                }
                uploadedDocumentsData.push({
                    docType: 'id_back',
                    url: backFile.path,
                    public_id: backFile.filename,
                    uploadedAt: new Date(),
                });
                publicIdsToDeleteOnError.push(backFile.filename); // Add public_id for cleanup
                 console.log(`[KYC Service] Added Back ID: ${backFile.filename}`);
            } else {
                 // If back file IS required but not present (should be caught by controller)
                 console.error("[KYC Service] Back ID file array missing for Resident Permit:", files);
                 throw new Error("Back ID file data missing for Resident Permit in service layer (Controller should have caught).");
            }
        }

        console.log(`[KYC Service] Prepared ${uploadedDocumentsData.length} documents for User: ${userId}`);

        // --- Update User KYC Data ---
        // Use the validatedKycData object from the controller
        user.kyc = {
            firstName: validatedKycData.firstName,
            lastName: validatedKycData.lastName,
            dateOfBirth: validatedKycData.dateOfBirth,
            mobile: { // Already validated object
                countryCode: validatedKycData.mobile.countryCode,
                number: validatedKycData.mobile.number,
            },
            occupation: validatedKycData.occupation, // Already trimmed or null
            salaryRange: validatedKycData.salaryRange, // Already validated or null
            nationality: validatedKycData.nationality,
            idType: validatedKycData.idType,
            idNumber: validatedKycData.idNumber,
            idIssueDate: validatedKycData.idIssueDate,
            idExpiryDate: validatedKycData.idExpiryDate,
            documents: uploadedDocumentsData, // Assign the prepared documents
            status: 'pending', // Set status to pending
            submittedAt: new Date(),
            // Clear previous rejection/verification details
            rejectionReason: null,
            rejectedAt: null,
            verifiedAt: null,
            lastUpdatedAt: new Date(),
        };

        console.log(`[KYC Service] Attempting to save KYC for User: ${userId}`);
        await user.save(); // This will run Mongoose schema validations
        console.log(`[KYC Service] KYC submitted and saved successfully for User: ${userId}`);

        // Return the saved KYC subdocument as a plain object
        return user.kyc.toObject();

    } catch (saveOrProcessingError) {
        console.error(`[KYC Service] Error during submission process for User ${userId}:`, saveOrProcessingError);

        // --- Cloudinary Cleanup on Error ---
        if (publicIdsToDeleteOnError.length > 0) {
            console.warn(`[KYC Service] DB save/processing failed for User ${userId}. Attempting Cloudinary cleanup for public_ids:`, publicIdsToDeleteOnError);
            try {
                // Determine resource type (image or raw for PDF) - adjust if necessary
                // Assuming all uploads are treated as 'image' by Cloudinary for simplicity,
                // or 'auto' was used during upload. 'image' is safer for deletion.
                const deletionResult = await cloudinary.api.delete_resources(publicIdsToDeleteOnError, { resource_type: 'image', invalidate: true });
                console.log(`[KYC Service] Cloudinary cleanup result for User ${userId}:`, deletionResult);
                // Check if any failed (e.g., 'not_found')
                const notFoundCount = deletionResult.deleted_counts ? Object.values(deletionResult.deleted_counts).filter(status => status === 'not_found').length : 0;
                if (notFoundCount > 0) {
                     console.warn(`[KYC Service] ${notFoundCount} resource(s) were not found during cleanup for User ${userId}.`);
                }
            } catch (cloudinaryError) {
                // Log critical error, but don't prevent the original error from being thrown
                console.error(`[KYC Service] CRITICAL: Cloudinary cleanup FAILED for User ${userId}:`, cloudinaryError);
                // Optionally add more context to the original error?
                 // saveOrProcessingError.message += ' (Cloudinary cleanup failed)';
            }
        } else {
            console.log(`[KYC Service] No Cloudinary files to clean up for failed submission (User: ${userId}).`);
        }

        // Handle Mongoose validation errors specifically
        if (saveOrProcessingError.name === 'ValidationError') {
            const messages = Object.values(saveOrProcessingError.errors).map(el => el.message);
            // Throw a new error with combined validation messages
            throw new Error(`Validation failed: ${messages.join('. ') || 'Please check your input.'}`);
        }

        // Re-throw the original error (or the modified one if you added context)
        throw saveOrProcessingError;
    }
};

// skipKyc function remains the same
const skipKyc = async (userId) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) { throw new Error('Invalid user ID format.'); }

    const user = await User.findById(userId).select('+kyc'); // Need kyc subdoc
    if (!user) { throw new Error('User not found.'); }

    if (!user.kyc) user.kyc = { status: 'not_started' }; // Initialize if missing

    // Allow skipping only if not started or previously rejected
    if (!['not_started', 'rejected'].includes(user.kyc.status)) {
        console.warn(`[KYC Service] Cannot skip KYC for User: ${userId} in status: ${user.kyc.status}`);
        throw new Error(`Cannot skip KYC in current status: ${user.kyc.status}.`);
    }

    console.log(`[KYC Service] Skipping KYC for User: ${userId}`);
    user.kyc.status = 'skipped';
    user.kyc.lastUpdatedAt = new Date(); // Track when skipped
    user.kyc.rejectionReason = null; // Clear any previous rejection reason
    user.kyc.rejectedAt = null;

    // Skip validation for this simple status update if no other fields are changed
    await user.save({ validateBeforeSave: false });

    // Return only the new status as a plain object
    return { status: user.kyc.status };
};

// getKycStatus function remains the same
const getKycStatus = async (userId) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) { throw new Error('Invalid user ID format.'); }
    // Select only the necessary fields for status check + rejection reason
    const user = await User.findById(userId).select('kyc.status kyc.rejectionReason').lean(); // Use lean for performance
    if (!user) { throw new Error('User not found.'); }

    // Return kyc object or a default 'not_started' state if kyc is missing/null
    return user.kyc || { status: 'not_started', rejectionReason: null };
};

// *** MODIFIED updateKycDetails function ***
const updateKycDetails = async (userId, updateData) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) { throw new Error('Invalid user ID format.'); }

    // Find user and select KYC subdocument to check status and update
    const user = await User.findById(userId).select('+kyc');
    if (!user) { throw new Error('User not found.'); }
    if (!user.kyc) user.kyc = { status: 'not_started' }; // Initialize if needed

    const currentStatus = user.kyc.status;
    const updateFields = {}; // Prepare fields for $set using dot notation
    let hasValidUpdate = false;

    // --- Define editable fields based on status (REVISED) ---
    // REMOVED: mobile, nationality
    const editableFieldsPreVerification = ['firstName', 'lastName', 'salaryRange', 'occupation'];
    // REMOVED: mobile, nationality
    const editableFieldsPostVerification = ['firstName', 'lastName', 'occupation'];
    let allowedFields;

    if (['not_started', 'skipped', 'rejected'].includes(currentStatus)) {
        allowedFields = editableFieldsPreVerification;
        console.log(`[KYC Service] Allowing updates for status '${currentStatus}' for fields:`, allowedFields);
    } else if (currentStatus === 'verified') {
        allowedFields = editableFieldsPostVerification;
        console.log(`[KYC Service] Allowing updates for status 'verified' for fields:`, allowedFields);
    } else {
        // Disallow updates for 'pending' or any other unexpected status
        console.warn(`[KYC Service] Update details denied for User: ${userId} in status: ${currentStatus}`);
        throw new Error(`Cannot update details while KYC status is ${currentStatus}.`);
    }

    // --- Validate and add allowed fields to the update object ---
    for (const key in updateData) {
        // Check if the incoming key is actually one of the allowed fields for the current status
        if (allowedFields.includes(key)) {
            const value = updateData[key];
            switch (key) {
                case 'firstName':
                case 'lastName':
                case 'occupation':
                     // Removed nationality case
                    if (typeof value !== 'string') throw new Error(`Invalid format for ${key}. Expected string.`);
                    updateFields[`kyc.${key}`] = value.trim();
                    // Ensure required fields (like firstName, lastName) are not empty after trim
                    if (!updateFields[`kyc.${key}`] && (key === 'firstName' || key === 'lastName')) {
                        throw new Error(`${key.charAt(0).toUpperCase() + key.slice(1)} cannot be empty.`);
                    }
                    if (updateFields[`kyc.${key}`]) hasValidUpdate = true;
                    break;
                // REMOVED: mobile case
                case 'salaryRange': // Still only allowed pre-verification
                    const validSalaryRanges = ['0-1000', '10000-50000', '50000-100000', '100000+', null];
                    if (!validSalaryRanges.includes(value)) {
                        throw new Error(`Invalid salary range provided.`);
                    }
                    updateFields['kyc.salaryRange'] = value; // Allow null
                    hasValidUpdate = true; // Setting to null is a valid update
                    break;
            }
        } else if (updateData.hasOwnProperty(key)) {
            // If the key exists in updateData but is NOT in allowedFields, throw an error
            console.warn(`[KYC Service] Attempted update of disallowed field '${key}' for status '${currentStatus}' by User: ${userId}`);
            throw new Error(`Cannot update field '${key}' when KYC status is '${currentStatus}'. Allowed fields: ${allowedFields.join(', ')}.`);
        }
    }

    if (!hasValidUpdate) {
        throw new Error('No valid or permitted fields provided for update.');
    }

    // Always update the timestamp
    updateFields['kyc.lastUpdatedAt'] = new Date();

    console.log(`[KYC Service] Applying KYC detail updates for User: ${userId}`, updateFields);

    // Perform the update using findByIdAndUpdate for efficiency
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateFields },
        { new: true, runValidators: true, context: 'query' }
    ).select('kyc').lean(); // Select only the updated KYC part and return lean object

    if (!updatedUser) {
        console.error(`[KYC Service] User ${userId} not found during update operation.`);
        throw new Error('User update failed (not found).');
    }

    console.log(`[KYC Service] KYC details updated successfully for User: ${userId}`);
    return updatedUser.kyc; // Return the updated kyc subdocument
};
// *** END OF MODIFIED FUNCTION ***

export default {
    submitKyc,
    skipKyc,
    getKycStatus,
    updateKycDetails,
};