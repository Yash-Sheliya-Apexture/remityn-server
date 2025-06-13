// // backend/src/models/User.js
// import mongoose from 'mongoose';

// const userSchema = new mongoose.Schema({
//     fullName: { type: String, required: true },
//     email: { type: String, required: true, unique: true, lowercase: true, trim: true }, // Email: unique, lowercase, trimmed
//     password: { type: String, required: true },
//     role: { type: String, enum: ['user', 'admin'], default: 'user' },
//     createdAt: { type: Date, default: Date.now },
//     // Add other user-related fields here
// }, {
//     timestamps: true, // Automatically adds createdAt and updatedAt timestamps
//     toJSON: {
//         transform: function (doc, ret) {
//             delete ret.password; // Exclude password from JSON responses by default
//             delete ret.__v; // Remove version key
//             return ret;
//         }
//     }
// });

// const User = mongoose.model('User', userSchema);

// export default User;


// // backend/src/models/User.js
// import mongoose from 'mongoose';

// const userSchema = new mongoose.Schema({
//     fullName: { type: String, required: true },
//     email: { type: String, required: true, unique: true, lowercase: true, trim: true },
//     password: { type: String, required: true },
//     role: { type: String, enum: ['user', 'admin'], default: 'user' },
//     createdAt: { type: Date, default: Date.now },
//     resetPasswordToken: String, // Add reset password token field
//     resetPasswordExpires: Date,  // Add reset password expiry field
// }, {
//     timestamps: true,
//     toJSON: {
//         transform: function (doc, ret) {
//             delete ret.password;
//             delete ret.__v;
//             delete ret.resetPasswordToken; // Optionally hide reset tokens in responses
//             delete ret.resetPasswordExpires;
//             return ret;
//         }
//     }
// });

// const User = mongoose.model('User', userSchema);

// export default User;


// // backend/src/models/User.js
// import mongoose from 'mongoose';

// const userSchema = new mongoose.Schema({
//     fullName: { type: String, required: true },
//     email: { type: String, required: true, unique: true, lowercase: true, trim: true },
//     password: { type: String, required: true },
//     role: { type: String, enum: ['user', 'admin'], default: 'user' },
//     createdAt: { type: Date, default: Date.now },
//     resetPasswordToken: String, // Add reset password token field
//     resetPasswordExpires: Date,  // Add reset password expiry field
// }, {
//     timestamps: true,
//     toJSON: {
//         transform: function (doc, ret) {
//             delete ret.password;
//             delete ret.__v;
//             delete ret.resetPasswordToken; // Optionally hide reset tokens in responses
//             delete ret.resetPasswordExpires;
//             return ret;
//         }
//     }
// });

// const User = mongoose.model('User', userSchema);

// export default User;


// // backend/src/models/User.js
// import mongoose from 'mongoose';

// // --- KYC Subdocument Schema ---
// const kycSchema = new mongoose.Schema({
//     status: {
//         type: String,
//         enum: ['not_started', 'pending', 'verified', 'rejected', 'skipped'], // Added 'skipped'
//         default: 'not_started',
//     },
//     firstName: { type: String, trim: true },
//     lastName: { type: String, trim: true },
//     dateOfBirth: { type: Date },
//     mobile: {
//         countryCode: { type: String, trim: true },
//         number: { type: String, trim: true },
//     },
//     occupation: { type: String, trim: true }, // Consider an enum if options are strictly limited and managed by admin
//     salaryRange: {
//         type: String,
//         enum: ['0-1000', '10000-50000', '50000-100000', '100000+', null], // Added null for potential reset/not provided
//         default: null,
//     },
//     nationality: { type: String, trim: true }, // Consider using country codes
//     idType: {
//         type: String,
//         enum: ['passport', 'resident_permit', null],
//         default: null,
//     },
//     idNumber: { type: String, trim: true },
//     idIssueDate: { type: Date },
//     idExpiryDate: { type: Date },
//     documents: [{
//         docType: { type: String, required: true, enum: ['id_front', 'id_back'] }, // E.g., 'id_front', 'id_back'
//         url: { type: String, required: true }, // URL from cloud storage
//         public_id: { type: String, required: true }, // ID for deletion from cloud storage
//         uploadedAt: { type: Date, default: Date.now },
//     }],
//     submittedAt: { type: Date },
//     verifiedAt: { type: Date },
//     rejectedAt: { type: Date },
//     rejectionReason: { type: String, trim: true },
//     lastUpdatedAt: { type: Date }, // Track updates to editable fields
// }, { _id: false }); // Don't create a separate _id for the subdocument


// const userSchema = new mongoose.Schema({
//     fullName: { type: String, required: true },
//     email: { type: String, required: true, unique: true, lowercase: true, trim: true },
//     password: { type: String, required: true , select: true},
//     role: { type: String, enum: ['user', 'admin'], default: 'user' },
//     // --- Add KYC Subdocument ---
//     kyc: {
//         type: kycSchema,
//         default: () => ({}), // Ensures the default object is created
//     },
//     createdAt: { type: Date, default: Date.now },
//     resetPasswordToken: String,
//     resetPasswordExpires: Date,
// }, {
//     timestamps: true, // Adds createdAt and updatedAt automatically
//     toJSON: { // <-- This affects JSON serialization, NOT database queries
//         transform: function (doc, ret) {
//             delete ret.password; // This deletes password when converting to JSON (e.g., for API response)
//             delete ret.__v;
//             delete ret.resetPasswordToken;
//             delete ret.resetPasswordExpires;
//             return ret;
//         }
//     }
// });

// // --- Initialize KYC on new user creation ---
// userSchema.pre('save', function (next) {
//     if (this.isNew && !this.kyc) { // Ensure kyc object exists on new users
//         this.kyc = { status: 'not_started' };
//     }
//     // Initialize names from fullName if KYC names are missing (only on creation or if explicitly empty)
//     if (this.isNew || (!this.kyc.firstName && !this.kyc.lastName)) {
//         const nameParts = this.fullName.trim().split(' ');
//         this.kyc.firstName = nameParts[0] || '';
//         this.kyc.lastName = nameParts.slice(1).join(' ') || '';
//     }
//     next();
// });


// const User = mongoose.model('User', userSchema);

// export default User;



// // backend/models/User.js
// import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs'; // For password hashing

// // --- KYC Subdocument Schema ---
// const kycSchema = new mongoose.Schema({
//     status: {
//         type: String,
//         enum: ['not_started', 'pending', 'verified', 'rejected', 'skipped'],
//         default: 'not_started',
//         index: true, // Index status for faster queries (e.g., find pending)
//     },
//     firstName: { type: String, trim: true },
//     lastName: { type: String, trim: true },
//     dateOfBirth: { type: Date },
//     mobile: {
//         _id: false, // Don't create ID for mobile object
//         countryCode: { type: String, trim: true },
//         number: { type: String, trim: true },
//     },
//     occupation: { type: String, trim: true },
//     salaryRange: {
//         type: String,
//         enum: ['0-1000', '10000-50000', '50000-100000', '100000+', null],
//         default: null,
//     },
//     nationality: { type: String, trim: true },
//     idType: {
//         type: String,
//         enum: ['passport', 'resident_permit', null],
//         default: null,
//     },
//     idNumber: { type: String, trim: true },
//     idIssueDate: { type: Date },
//     idExpiryDate: { type: Date },
//     documents: [{
//         _id: false, // Don't create ID for document objects
//         docType: { type: String, required: true, enum: ['id_front', 'id_back'] },
//         url: { type: String, required: true },
//         public_id: { type: String, required: true }, // Cloudinary public ID
//         uploadedAt: { type: Date, default: Date.now },
//     }],
//     submittedAt: { type: Date },
//     verifiedAt: { type: Date },
//     rejectedAt: { type: Date },
//     rejectionReason: { type: String, trim: true },
//     lastUpdatedAt: { type: Date }, // Track general updates to KYC
// }, { _id: false });


// // --- User Schema ---
// const userSchema = new mongoose.Schema({
//     fullName: { type: String, required: [true, 'Full name is required.'], trim: true },
//     email: {
//         type: String,
//         required: [true, 'Email is required.'],
//         unique: true,
//         lowercase: true,
//         trim: true,
//         match: [ // Basic email format validation
//             /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
//             'Please fill a valid email address',
//         ],
//         index: true, // Index email for faster lookups
//     },
//     password: {
//         type: String,
//         required: [true, 'Password is required.'],
//         minlength: [8, 'Password must be at least 8 characters long.'],
//         select: false, // Exclude password from query results by default
//     },
//     role: {
//         type: String,
//         enum: ['user', 'admin'],
//         default: 'user',
//     },
//     kyc: {
//         type: kycSchema,
//         default: () => ({ status: 'not_started' }), // Ensure default object with status
//         // No 'select: false' here, let it be included by default
//         // We select needed parts in controllers/services
//     },
//     resetPasswordToken: String,
//     resetPasswordExpires: Date,
// }, {
//     timestamps: true, // Automatically add createdAt and updatedAt
//     toJSON: {
//         transform: function (doc, ret) {
//             delete ret.password; // Remove password when converting document to JSON
//             delete ret.__v;     // Remove version key
//             delete ret.resetPasswordToken;
//             delete ret.resetPasswordExpires;
//             // Optionally transform _id to id
//             // ret.id = ret._id;
//             // delete ret._id;
//             return ret;
//         },
//         virtuals: true // Include virtuals if any are defined
//     },
//     toObject: { // Similar options for toObject if used
//         transform: function (doc, ret) {
//              delete ret.password;
//              delete ret.__v;
//              delete ret.resetPasswordToken;
//              delete ret.resetPasswordExpires;
//              return ret;
//         },
//         virtuals: true
//     }
// });

// // --- Middleware ---

// // Initialize KYC default and potentially pre-fill names on NEW user save
// userSchema.pre('save', function (next) {
//     if (this.isNew) {
//         // Ensure KYC object exists with default status
//         if (!this.kyc || !this.kyc.status) {
//             this.kyc = { status: 'not_started' };
//         }
//         // Pre-fill names from fullName if KYC names are empty
//         if (!this.kyc.firstName && !this.kyc.lastName && this.fullName) {
//             const nameParts = this.fullName.trim().split(' ');
//             this.kyc.firstName = nameParts[0] || '';
//             this.kyc.lastName = nameParts.slice(1).join(' ') || '';
//             console.log(`Initialized KYC names for new user ${this.email}`);
//         }
//     }
//     next();
// });

// // Password Hashing Middleware (Run before saving if password is modified)
// userSchema.pre('save', async function (next) {
//     // Only hash the password if it has been modified (or is new)
//     if (!this.isModified('password')) return next();

//     try {
//         const salt = await bcrypt.genSalt(10); // Generate salt (10 rounds is generally good)
//         this.password = await bcrypt.hash(this.password, salt); // Hash the password
//         next();
//     } catch (error) {
//         next(error); // Pass error to error handling middleware
//     }
// });

// // --- Methods ---

// // Method to compare entered password with hashed password in DB
// userSchema.methods.matchPassword = async function (enteredPassword) {
//     // 'this' refers to the user document
//     // Need to explicitly select password if it was excluded in the initial query
//     const userWithPassword = await mongoose.model('User').findById(this._id).select('+password');
//     if (!userWithPassword) return false; // Should not happen if called on existing user doc
//     return await bcrypt.compare(enteredPassword, userWithPassword.password);
// };

// // --- Model Creation ---
// const User = mongoose.model('User', userSchema);

// export default User;


// import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs'; // For password hashing

// // --- KYC Subdocument Schema ---
// const kycSchema = new mongoose.Schema({
//     status: {
//         type: String,
//         enum: ['not_started', 'pending', 'verified', 'rejected', 'skipped'],
//         default: 'not_started',
//         index: true, // Index status for faster queries (e.g., find pending)
//     },
//     firstName: { type: String, trim: true },
//     lastName: { type: String, trim: true },
//     dateOfBirth: { type: Date },
//     mobile: {
//         _id: false, // Don't create ID for mobile object
//         countryCode: { type: String, trim: true },
//         number: { type: String, trim: true },
//     },
//     occupation: { type: String, trim: true },
//     salaryRange: {
//         type: String,
//         enum: ['0-1000', '10000-50000', '50000-100000', '100000+', null],
//         default: null,
//     },
//     nationality: { type: String, trim: true },
//     idType: {
//         type: String,
//         enum: ['passport', 'resident_permit', null],
//         default: null,
//     },
//     idNumber: { type: String, trim: true },
//     idIssueDate: { type: Date },
//     idExpiryDate: { type: Date },
//     documents: [{
//         _id: false, // Don't create ID for document objects
//         docType: { type: String, required: true, enum: ['id_front', 'id_back'] },
//         url: { type: String, required: true },
//         public_id: { type: String, required: true }, // Cloudinary public ID
//         uploadedAt: { type: Date, default: Date.now },
//     }],
//     submittedAt: { type: Date },
//     verifiedAt: { type: Date },
//     rejectedAt: { type: Date },
//     rejectionReason: { type: String, trim: true },
//     lastUpdatedAt: { type: Date }, // Track general updates to KYC
// }, { _id: false });


// // --- User Schema ---
// const userSchema = new mongoose.Schema({
//     fullName: { type: String, required: [true, 'Full name is required.'], trim: true },
//     email: {
//         type: String,
//         required: [true, 'Email is required.'],
//         unique: true,
//         lowercase: true,
//         trim: true,
//         match: [ // Basic email format validation
//             /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
//             'Please fill a valid email address',
//         ],
//         index: true, // Index email for faster lookups
//     },
//     password: {
//         type: String,
//         required: [true, 'Password is required.'],
//         minlength: [8, 'Password must be at least 8 characters long.'],
//         select: false, // Exclude password from query results by default
//     },
//     role: {
//         type: String,
//         enum: ['user', 'admin'],
//         default: 'user',
//     },
//     kyc: {
//         type: kycSchema,
//         default: () => ({ status: 'not_started' }), // Ensure default object with status
//     },
//     resetPasswordToken: String,
//     resetPasswordExpires: Date,
// }, {
//     timestamps: true, // Automatically add createdAt and updatedAt
//     toJSON: {
//         transform: function (doc, ret) {
//             delete ret.password; // Remove password when converting document to JSON
//             delete ret.__v;     // Remove version key
//             delete ret.resetPasswordToken;
//             delete ret.resetPasswordExpires;
//             return ret;
//         },
//         virtuals: true // Include virtuals if any are defined
//     },
//     toObject: { // Similar options for toObject if used
//         transform: function (doc, ret) {
//              delete ret.password;
//              delete ret.__v;
//              delete ret.resetPasswordToken;
//              delete ret.resetPasswordExpires;
//              return ret;
//         },
//         virtuals: true
//     }
// });

// // --- Middleware ---

// // Initialize KYC default and potentially pre-fill names on NEW user save
// userSchema.pre('save', function (next) {
//     if (this.isNew) {
//         // Ensure KYC object exists with default status
//         if (!this.kyc || !this.kyc.status) {
//             this.kyc = { status: 'not_started' };
//         }
//         // Pre-fill names from fullName if KYC names are empty
//         if (!this.kyc.firstName && !this.kyc.lastName && this.fullName) {
//             const nameParts = this.fullName.trim().split(' ');
//             this.kyc.firstName = nameParts[0] || '';
//             this.kyc.lastName = nameParts.slice(1).join(' ') || '';
//             console.log(`[User Model - pre-save] Initialized KYC names for new user ${this.email}`);
//         }
//     }
//     next();
// });

// // Password Hashing Middleware (Run before saving if password is modified)
// userSchema.pre('save', async function (next) {
//     // Only hash the password if it has been modified (or is new)
//     if (!this.isModified('password')) {
//         // --- ADDED LOG ---
//         console.log(`[User Model - pre-save] Password for ${this.email} not modified. Skipping hash.`);
//         return next();
//     }

//     // --- ADDED LOG ---
//     console.log(`[User Model - pre-save] Password for ${this.email} IS modified. Attempting to hash...`);

//     try {
//         const salt = await bcrypt.genSalt(10); // Generate salt (10 rounds is generally good)
//         // const originalPasswordForDebug = this.password; // Optional: Uncomment for deeper debugging
//         this.password = await bcrypt.hash(this.password, salt); // Hash the password
//         // --- ADDED LOG ---
//         console.log(`[User Model - pre-save] Password for ${this.email} successfully hashed.`);
//         // console.log(`[User Model - pre-save] Original length: ${originalPasswordForDebug.length}, Hashed starts with: ${this.password.substring(0, 7)}`); // Optional detail
//         next();
//     } catch (error) {
//         // --- ADDED ERROR LOG ---
//         console.error(`[User Model - pre-save] Error hashing password for ${this.email}:`, error);
//         next(error); // Pass error to error handling middleware
//     }
// });

// // --- Methods ---

// // Method to compare entered password with hashed password in DB
// userSchema.methods.matchPassword = async function (enteredPassword) {
//     // 'this' refers to the user document
//     // Need to explicitly select password if it was excluded in the initial query
//     const userWithPassword = await mongoose.model('User').findById(this._id).select('+password');
//     if (!userWithPassword) return false; // Should not happen if called on existing user doc
//     return await bcrypt.compare(enteredPassword, userWithPassword.password);
// };

// // --- Model Creation ---
// const User = mongoose.model('User', userSchema);

// export default User;

// // models/User.js
// import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';

// // --- KYC Subdocument Schema (Keep as is) ---
// const kycSchema = new mongoose.Schema({
//     status: { type: String, enum: ['not_started', 'pending', 'verified', 'rejected', 'skipped'], default: 'not_started', index: true, },
//     firstName: { type: String, trim: true },
//     lastName: { type: String, trim: true },
//     dateOfBirth: { type: Date },
//     mobile: { _id: false, countryCode: { type: String, trim: true }, number: { type: String, trim: true }, },
//     occupation: { type: String, trim: true },
//     salaryRange: { type: String, enum: ['0-1000', '10000-50000', '50000-100000', '100000+', null], default: null, },
//     nationality: { type: String, trim: true },
//     idType: { type: String, enum: ['passport', 'resident_permit', null], default: null, },
//     idNumber: { type: String, trim: true },
//     idIssueDate: { type: Date },
//     idExpiryDate: { type: Date },
//     documents: [{ _id: false, docType: { type: String, required: true, enum: ['id_front', 'id_back'] }, url: { type: String, required: true }, public_id: { type: String, required: true }, uploadedAt: { type: Date, default: Date.now }, }],
//     submittedAt: { type: Date },
//     verifiedAt: { type: Date },
//     rejectedAt: { type: Date },
//     rejectionReason: { type: String, trim: true },
//     lastUpdatedAt: { type: Date },
// }, { _id: false });

// // --- User Schema ---
// const userSchema = new mongoose.Schema({
//     fullName: { type: String, required: [true, 'Full name is required.'], trim: true },
//     email: {
//         type: String,
//         required: [true, 'Email is required.'],
//         unique: true,
//         lowercase: true,
//         trim: true,
//         match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
//         index: true,
//     },
//     password: {
//         type: String,
//         // --- Modified: Password is required ONLY if it's NOT a Google account ---
//         required: [
//             function() {
//                 // 'this' refers to the document being validated
//                 return !this.isGoogleAccount && !this.googleId;
//             },
//             'Password is required.'
//         ],
//         minlength: [8, 'Password must be at least 8 characters long.'],
//         select: false, // Exclude password from query results by default
//     },
//     role: { type: String, enum: ['user', 'admin'], default: 'user' },
//     kyc: { type: kycSchema, default: () => ({ status: 'not_started' }) },
//     resetPasswordToken: String,
//     resetPasswordExpires: Date,
//     // --- Added Google Fields ---
//     googleId: { // Google's unique identifier for the user
//         type: String,
//         unique: true,
//         sparse: true, // Allows multiple documents to have null/missing googleId, but enforces uniqueness when present
//         select: false, // Usually not needed in payloads
//     },
//     isGoogleAccount: { // Flag to indicate signup via Google
//         type: Boolean,
//         default: false,
//     },
//     // Optional: Store Google profile picture URL
//     googleProfilePicture: {
//         type: String,
//         select: false,
//     },
//     // --------------------------
// }, {
//     timestamps: true,
//     toJSON: {
//         transform: function (doc, ret) {
//             delete ret.password;
//             delete ret.__v;
//             delete ret.resetPasswordToken;
//             delete ret.resetPasswordExpires;
//             delete ret.googleId; // Exclude googleId from default JSON output
//             delete ret.googleProfilePicture;
//             // Ensure isGoogleAccount is included if needed
//             // ret.isGoogleAccount = doc.isGoogleAccount;
//             return ret;
//         },
//         virtuals: true
//     },
//     toObject: {
//         transform: function (doc, ret) {
//              delete ret.password;
//              delete ret.__v;
//              delete ret.resetPasswordToken;
//              delete ret.resetPasswordExpires;
//              delete ret.googleId;
//              delete ret.googleProfilePicture;
//              // ret.isGoogleAccount = doc.isGoogleAccount;
//              return ret;
//         },
//         virtuals: true
//     }
// });

// // --- Middleware (KYC Init - Keep as is) ---
// userSchema.pre('save', function (next) {
//     if (this.isNew) {
//         if (!this.kyc || !this.kyc.status) { this.kyc = { status: 'not_started' }; }
//         if (!this.kyc.firstName && !this.kyc.lastName && this.fullName) {
//             const nameParts = this.fullName.trim().split(' ');
//             this.kyc.firstName = nameParts[0] || '';
//             this.kyc.lastName = nameParts.slice(1).join(' ') || '';
//         }
//     }
//     next();
// });

// // --- Middleware (Password Hashing - Modify condition) ---
// userSchema.pre('save', async function (next) {
//     // Only hash the password if it has been modified (or is new) AND it's not a Google account being created/updated without a password change
//     if (!this.isModified('password') || !this.password) {
//         console.log(`[User Model - pre-save] Password for ${this.email} not modified or not present. Skipping hash.`);
//         return next();
//     }

//     console.log(`[User Model - pre-save] Password for ${this.email} IS modified. Attempting to hash...`);
//     try {
//         const salt = await bcrypt.genSalt(10);
//         this.password = await bcrypt.hash(this.password, salt);
//         console.log(`[User Model - pre-save] Password for ${this.email} successfully hashed.`);
//         next();
//     } catch (error) {
//         console.error(`[User Model - pre-save] Error hashing password for ${this.email}:`, error);
//         next(error);
//     }
// });

// // --- Methods (Keep matchPassword as is) ---
// userSchema.methods.matchPassword = async function (enteredPassword) {
//     // Ensure password exists before comparing (important for Google accounts)
//     if (!this.password) {
//         return false;
//     }
//     // Explicitly fetch password if it wasn't selected
//     const userWithPassword = await mongoose.model('User').findById(this._id).select('+password');
//     if (!userWithPassword || !userWithPassword.password) return false;
//     return await bcrypt.compare(enteredPassword, userWithPassword.password);
// };

// // --- Model Creation ---
// const User = mongoose.model('User', userSchema);

// export default User;


import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// --- KYC Subdocument Schema (Keep as is) ---
const kycSchema = new mongoose.Schema({
    status: { type: String, enum: ['not_started', 'pending', 'verified', 'rejected', 'skipped'], default: 'not_started', index: true, },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    dateOfBirth: { type: Date },
    mobile: { _id: false, countryCode: { type: String, trim: true }, number: { type: String, trim: true }, },
    occupation: { type: String, trim: true },
    salaryRange: { type: String, enum: ['0-1000', '10000-50000', '50000-100000', '100000+', null], default: null, },
    nationality: { type: String, trim: true },
    idType: { type: String, enum: ['passport', 'resident_permit', null], default: null, },
    idNumber: { type: String, trim: true },
    idIssueDate: { type: Date },
    idExpiryDate: { type: Date },
    documents: [{ _id: false, docType: { type: String, required: true, enum: ['id_front', 'id_back'] }, url: { type: String, required: true }, public_id: { type: String, required: true }, uploadedAt: { type: Date, default: Date.now }, }],
    submittedAt: { type: Date },
    verifiedAt: { type: Date },
    rejectedAt: { type: Date },
    rejectionReason: { type: String, trim: true },
    lastUpdatedAt: { type: Date },
}, { _id: false });

// --- User Schema ---
const userSchema = new mongoose.Schema({
    fullName: { type: String, required: [true, 'Full name is required.'], trim: true },
    email: {
        type: String,
        required: [true, 'Email is required.'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
        index: true,
    },
    password: {
        type: String,
        required: [
            function() { return !this.isGoogleAccount && !this.googleId; },
            'Password is required.'
        ],
        minlength: [8, 'Password must be at least 8 characters long.'],
        select: false,
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isVerified: { type: Boolean, default: false }, // ADDED: Email verification status
    kyc: { type: kycSchema, default: () => ({ status: 'not_started' }) },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    verificationOtp: { type: String, select: false }, // ADDED: OTP for verification
    verificationOtpExpires: { type: Date, select: false }, // ADDED: OTP expiration
    googleId: { type: String, unique: true, sparse: true, select: false, },
    isGoogleAccount: { type: Boolean, default: false },
    googleProfilePicture: { type: String, select: false },
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            delete ret.password;
            delete ret.__v;
            delete ret.resetPasswordToken;
            delete ret.resetPasswordExpires;
            delete ret.verificationOtp;
            delete ret.verificationOtpExpires;
            delete ret.googleId;
            delete ret.googleProfilePicture;
            return ret;
        },
        virtuals: true
    },
    toObject: {
        transform: function (doc, ret) {
             delete ret.password;
             delete ret.__v;
             delete ret.resetPasswordToken;
             delete ret.resetPasswordExpires;
             delete ret.verificationOtp;
             delete ret.verificationOtpExpires;
             delete ret.googleId;
             delete ret.googleProfilePicture;
             return ret;
        },
        virtuals: true
    }
});

// --- Middleware (KYC Init - Keep as is) ---
userSchema.pre('save', function (next) {
    if (this.isNew) {
        if (!this.kyc || !this.kyc.status) { this.kyc = { status: 'not_started' }; }
        if (!this.kyc.firstName && !this.kyc.lastName && this.fullName) {
            const nameParts = this.fullName.trim().split(' ');
            this.kyc.firstName = nameParts[0] || '';
            this.kyc.lastName = nameParts.slice(1).join(' ') || '';
        }
    }
    // For Google Sign-In, mark as verified immediately
    if (this.isGoogleAccount && this.isNew) {
        this.isVerified = true;
    }
    next();
});

// --- Middleware (Password Hashing - Modify condition) ---
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// --- Methods (Keep matchPassword as is) ---
userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) { return false; }
    const userWithPassword = await mongoose.model('User').findById(this._id).select('+password');
    if (!userWithPassword || !userWithPassword.password) return false;
    return await bcrypt.compare(enteredPassword, userWithPassword.password);
};

// --- Model Creation ---
const User = mongoose.model('User', userSchema);

export default User;