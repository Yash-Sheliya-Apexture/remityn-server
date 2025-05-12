// // backend/src/services/transfer.service.js
// import Transfer from '../models/Transfer.js';
// import Account from '../models/Account.js';
// import Currency from '../models/Currency.js';
// import Recipient from '../models/Recipient.js';
// import exchangeRateService from './exchangeRate.service.js';
// import mongoose from 'mongoose';

// // --- REMOVED Fee Calculation Logic ---
// // --- REMOVED Estimate Arrival Time Logic ---

// // --- Calculate Send Summary (REVISED - NO FEES) ---
// const calculateSendSummary = async (userId, sourceAccountId, recipientId, amount, isSendingAmount) => {
//     try {
//         console.log('Service: calculateSendSummary (No Fees) - Start', { userId, sourceAccountId, recipientId, amount, isSendingAmount });

//         if (!mongoose.Types.ObjectId.isValid(sourceAccountId) || !mongoose.Types.ObjectId.isValid(recipientId)) {
//             throw new Error('Invalid account or recipient ID format.');
//         }
//         const sourceAccount = await Account.findById(sourceAccountId).populate('currency user');
//         const recipient = await Recipient.findById(recipientId).populate('currency user');
//         if (!sourceAccount || !sourceAccount.user?._id || !sourceAccount.user._id.equals(userId)) {
//             throw new Error('Source account not found or access denied.');
//         }
//         if (!recipient || !recipient.user?._id || !recipient.user._id.equals(userId)) {
//             throw new Error('Recipient not found or access denied.');
//         }
//         if (amount === undefined || amount === null || isNaN(amount) || amount <= 0) {
//             throw new Error('Invalid amount specified.');
//         }

//         const sendCurrencyCode = sourceAccount.currency.code;
//         const receiveCurrencyCode = recipient.currency.code;
//         console.log(`Service: calculateSendSummary (No Fees) - Currencies: Send=${sendCurrencyCode}, Receive=${receiveCurrencyCode}`);

//         const latestRatesDocument = await exchangeRateService.getLatestExchangeRates();
//         if (!latestRatesDocument || !latestRatesDocument.rates || typeof latestRatesDocument.rates.rates !== 'object') {
//             console.error('Service: calculateSendSummary (No Fees) - Failed to fetch valid exchange rates data.');
//             throw new Error('Could not retrieve current exchange rates. Data structure issue.');
//         }
//         const actualRatesMap = latestRatesDocument.rates.rates;
//         const actualBaseCurrency = latestRatesDocument.rates.base || 'USD';
//         console.log(`Service: calculateSendSummary (No Fees) - Using actual base currency: ${actualBaseCurrency}`);
//         const rateBaseToSend = sendCurrencyCode === actualBaseCurrency ? 1 : (actualRatesMap[sendCurrencyCode] ? parseFloat(actualRatesMap[sendCurrencyCode]) : null);
//         const rateBaseToReceive = receiveCurrencyCode === actualBaseCurrency ? 1 : (actualRatesMap[receiveCurrencyCode] ? parseFloat(actualRatesMap[receiveCurrencyCode]) : null);
//         if (rateBaseToSend === null || isNaN(rateBaseToSend) || rateBaseToReceive === null || isNaN(rateBaseToReceive) || rateBaseToSend === 0) {
//             console.error(`Service: calculateSendSummary (No Fees) - Missing rate relative to ${actualBaseCurrency}.`);
//             throw new Error(`Cannot determine exchange rate between ${sendCurrencyCode} and ${receiveCurrencyCode}. Rates might be unavailable.`);
//         }
//         const exchangeRate = rateBaseToReceive / rateBaseToSend;
//         console.log(`Service: calculateSendSummary (No Fees) - Calculated Rate (${sendCurrencyCode}/${receiveCurrencyCode}): ${exchangeRate}`);

//         let sendAmountCalc, receiveAmountCalc;
//         if (isSendingAmount) {
//             sendAmountCalc = parseFloat(amount);
//             receiveAmountCalc = sendAmountCalc * exchangeRate;
//         } else {
//             receiveAmountCalc = parseFloat(amount);
//             sendAmountCalc = receiveAmountCalc / exchangeRate;
//         }

//         if (sourceAccount.balance < sendAmountCalc) {
//             console.warn(`Service: calculateSendSummary (No Fees) - Insufficient balance. Required: ${sendAmountCalc.toFixed(2)}, Available: ${sourceAccount.balance.toFixed(2)}`);
//             throw new Error('Insufficient balance.');
//         }

//         const summary = {
//             userId: userId.toString(),
//             sourceAccountId: sourceAccountId.toString(),
//             recipientId: recipientId.toString(),
//             sendAmount: parseFloat(sendAmountCalc.toFixed(2)),
//             receiveAmount: parseFloat(receiveAmountCalc.toFixed(2)),
//             sendCurrencyCode,
//             receiveCurrencyCode,
//             exchangeRate: parseFloat(exchangeRate.toFixed(6)),
//             availableBalance: parseFloat(sourceAccount.balance.toFixed(2)),
//         };
//         console.log('Service: calculateSendSummary (No Fees) - Success', summary);
//         return summary;

//     } catch (error) {
//         console.error("ERROR in calculateSendSummary service (No Fees):", error);
//         throw error;
//     }
// };

// // --- Execute Transfer (REVISED - Start as PENDING, remove setTimeout) ---
// const executeTransfer = async (transferDetails) => {
//     console.log('Service: executeTransfer (Pending) - Start', transferDetails);
//     const {
//         userId, sourceAccountId, recipientId, sendAmount, receiveAmount,
//         exchangeRate, reason, reference, sendCurrencyCode, receiveCurrencyCode
//     } = transferDetails;

//      if (!userId || !sourceAccountId || !recipientId || !sendAmount || !receiveAmount || !exchangeRate || !sendCurrencyCode || !receiveCurrencyCode) {
//          console.error("Service: executeTransfer (Pending) - Missing essential transfer details.");
//          throw new Error("Missing essential transfer information.");
//      }

//     const session = await mongoose.startSession();
//     session.startTransaction();
//     console.log('Service: executeTransfer (Pending) - Transaction started.');

//     try {
//         const sourceAccount = await Account.findOne({ _id: sourceAccountId, user: userId }).session(session).populate('currency');
//         const recipient = await Recipient.findOne({ _id: recipientId, user: userId }).session(session).populate('currency');
//         if (!sourceAccount) throw new Error('Source account not found or access denied.');
//         if (!recipient) throw new Error('Recipient not found or access denied.');
//         if (sourceAccount.currency.code !== sendCurrencyCode) throw new Error('Source currency mismatch during execution.');
//         if (recipient.currency.code !== receiveCurrencyCode) throw new Error('Recipient currency mismatch during execution.');
//         if (sourceAccount.balance < sendAmount) throw new Error('Insufficient balance.');

//         const originalBalance = sourceAccount.balance;
//         sourceAccount.balance -= sendAmount;
//         await sourceAccount.save({ session });
//         console.log(`Service: executeTransfer (Pending) - Debited ${sendAmount} ${sendCurrencyCode}. Balance ${originalBalance} -> ${sourceAccount.balance}`);

//         const newTransfer = new Transfer({
//             user: userId,
//             sourceAccount: sourceAccountId,
//             recipient: recipientId,
//             sendAmount,
//             receiveAmount,
//             sendCurrency: sourceAccount.currency._id,
//             receiveCurrency: recipient.currency._id,
//             exchangeRate,
//             fees: 0, // Set fees to 0
//             reason,
//             reference: reference || null,
//             status: 'pending', // Start as pending
//             createdAt: new Date(),
//             updatedAt: new Date(),
//         });
//         await newTransfer.save({ session });
//         console.log(`Service: executeTransfer (Pending) - Created Transfer record ${newTransfer._id} with status 'pending'`);

//         await session.commitTransaction();
//         console.log('Service: executeTransfer (Pending) - Transaction committed.');

//          const populatedTransfer = await Transfer.findById(newTransfer._id)
//             .populate('user', 'fullName email')
//             .populate({ path: 'sourceAccount', select: 'balance currency', populate: { path: 'currency', select: 'code flagImage' } })
//             .populate({ path: 'recipient', select: 'accountHolderName nickname currency accountNumber bankName', populate: { path: 'currency', select: 'code flagImage' } });
//         console.log('Service: executeTransfer (Pending) - Success, returning populated transfer.');
//         return populatedTransfer;

//     } catch (error) {
//         console.error('Service: executeTransfer (Pending) - Error during transaction, aborting.', error);
//         await session.abortTransaction();
//         console.log('Service: executeTransfer (Pending) - Transaction aborted.');
//         throw error;
//     } finally {
//         session.endSession();
//         console.log('Service: executeTransfer (Pending) - Session ended.');
//     }
// };

// // --- getTransferDetails (Keep as is) ---
// const getTransferDetails = async (transferId, userId) => {
//     console.log(`Service: getTransferDetails - Fetching transfer ${transferId} for user ${userId}`);
//      if (!mongoose.Types.ObjectId.isValid(transferId)) {
//         throw new Error('Invalid transfer ID format.');
//      }
//      // Find the transfer and populate all necessary fields
//      const transfer = await Transfer.findOne({ _id: transferId, user: userId })
//         .populate('user', 'fullName email') // Populate user details
//         .populate({
//             path: 'sourceAccount', // Populate source account...
//             select: 'currency',    // ...select its currency field...
//             populate: {            // ...and populate that currency field
//                 path: 'currency',
//                 select: 'code flagImage'
//             }
//         })
//         .populate({
//             path: 'recipient',     // Populate recipient...
//             select: 'accountHolderName nickname currency accountNumber bankName', // ...select needed fields...
//             populate: {            // ...and populate its nested currency field
//                 path: 'currency',
//                 select: 'code flagImage'
//             }
//         })
//         .populate('sendCurrency', 'code flagImage') // <-- ADD THIS LINE: Populate top-level sendCurrency
//         .populate('receiveCurrency', 'code flagImage'); // <-- ADD THIS LINE: Populate top-level receiveCurrency

//     if (!transfer) {
//         console.log(`Service: getTransferDetails - Transfer ${transferId} not found or access denied for user ${userId}`);
//         throw new Error('Transfer not found or access denied.');
//     }
//     console.log(`Service: getTransferDetails - Transfer ${transferId} found and populated.`);
//     return transfer; // Return the fully populated transfer object
// };

// // --- getUserTransfers (Keep as is) ---
// const getUserTransfers = async (userId) => {
//     console.log(`Service: getUserTransfers - Fetching transfers for user ${userId}`);
//     try {
//         const transfers = await Transfer.find({ user: userId })
//             .populate('recipient', 'accountHolderName nickname') // Keep recipient details concise
//             .populate('sendCurrency', 'code flagImage') // Populate send currency
//             .populate('receiveCurrency', 'code flagImage') // Populate receive currency
//             // --- MODIFIED SELECT ---
//             // Include sourceAccount ID, exclude user, updatedAt, fees
//             .select('recipient sendCurrency receiveCurrency sendAmount receiveAmount status createdAt sourceAccount reason reference')
//             // --- END MODIFIED SELECT ---
//             .sort({ createdAt: -1 });
//         console.log(`Service: getUserTransfers - Found ${transfers.length} transfers for user ${userId}`);
//         return transfers;
//     } catch (error) {
//         console.error(`Service: getUserTransfers - Error fetching transfers for user ${userId}:`, error);
//         throw new Error('Failed to retrieve transfer history.');
//     }
// };


// // --- Export Service Methods ---
// export default {
//     calculateSendSummary,
//     executeTransfer,
//     getTransferDetails,
//     getUserTransfers,
// };


// // backend/src/services/transfer.service.js
// import Transfer from '../models/Transfer.js';
// import Account from '../models/Account.js';
// import Currency from '../models/Currency.js';
// import Recipient from '../models/Recipient.js';
// import exchangeRateService from './exchangeRate.service.js'; // Needed for live rates
// import mongoose from 'mongoose';

// // Helper to get Live Rate (remains the same)
// const getLiveRate = async (sendCode, receiveCode) => {
//     try {
//         const latestRatesDocument = await exchangeRateService.getLatestExchangeRates();
//         if (!latestRatesDocument?.rates?.rates) {
//             console.warn(`Live rates data unavailable for ${sendCode}/${receiveCode}`);
//             return null;
//         }
//         const actualRatesMap = latestRatesDocument.rates.rates;
//         const actualBaseCurrency = latestRatesDocument.rates.base || 'USD'; // Adjust if needed

//         // Ensure rates are treated as numbers
//         const rateBaseToSend = sendCode === actualBaseCurrency ? 1 : (actualRatesMap[sendCode] ? parseFloat(actualRatesMap[sendCode]) : null);
//         const rateBaseToReceive = receiveCode === actualBaseCurrency ? 1 : (actualRatesMap[receiveCode] ? parseFloat(actualRatesMap[receiveCode]) : null);

//         if (rateBaseToSend !== null && !isNaN(rateBaseToSend) && rateBaseToReceive !== null && !isNaN(rateBaseToReceive) && rateBaseToSend !== 0) {
//             // Calculate rate with sufficient precision first
//             const preciseRate = rateBaseToReceive / rateBaseToSend;
//             // THEN round to a standard number of decimal places (e.g., 6 for intermediate calculation, or 2 if you want it rounded early)
//             // Let's round to 2 places as requested in the prompt.
//             return parseFloat(preciseRate.toFixed(2));
//         }
//         console.warn(`Could not calculate live rate between ${sendCode} and ${receiveCode}`);
//         return null;
//     } catch (error) {
//         console.error(`Error fetching live rate for ${sendCode}/${receiveCode}:`, error.message);
//         return null;
//     }
// };

// // --- Calculate Send Summary (REVISED - Percentage Adjustment ADDED & Rate Rounding FIXED) ---
// const calculateSendSummary = async (userId, sourceAccountId, recipientId, amount, isSendingAmount) => {
//     console.log('Service: calculateSendSummary (Percentage ADDED Adj, Rate Rounded) - Start', { userId, sourceAccountId, recipientId, amount, isSendingAmount });

//     if (!mongoose.Types.ObjectId.isValid(sourceAccountId) || !mongoose.Types.ObjectId.isValid(recipientId)) {
//         throw new Error('Invalid account or recipient ID format.');
//     }

//     // 1. Fetch Account, Recipient, and Source Currency details
//     const sourceAccount = await Account.findById(sourceAccountId).populate('user');
//     const recipient = await Recipient.findById(recipientId).populate('user');

//     if (!sourceAccount || !sourceAccount.user?._id || !sourceAccount.user._id.equals(userId)) throw new Error('Source account not found or access denied.');
//     if (!recipient || !recipient.user?._id || !recipient.user._id.equals(userId)) throw new Error('Recipient not found or access denied.');
//     if (amount === undefined || amount === null || isNaN(amount) || amount <= 0) throw new Error('Invalid amount specified.');

//     // Fetch full currency docs
//     const sourceCurrencyDoc = await Currency.findById(sourceAccount.currency);
//     const recipientCurrencyDoc = await Currency.findById(recipient.currency);
//     if (!sourceCurrencyDoc || !recipientCurrencyDoc) throw new Error('Could not load currency details for calculation.');

//     const sendCurrencyCode = sourceCurrencyDoc.code;
//     const receiveCurrencyCode = recipientCurrencyDoc.code;
//     console.log(`Service: calculateSendSummary (Percentage ADDED Adj, Rate Rounded) - Currencies: Send=${sendCurrencyCode}, Receive=${receiveCurrencyCode}`);

//     // 2. Get Live Exchange Rate (already rounded to 2 decimal places by getLiveRate)
//     const liveExchangeRate = await getLiveRate(sendCurrencyCode, receiveCurrencyCode);
//     if (liveExchangeRate === null || liveExchangeRate <= 0 || !isFinite(liveExchangeRate)) {
//         console.error(`Service: calculateSendSummary (Percentage ADDED Adj, Rate Rounded) - Failed to fetch valid live exchange rate for ${sendCurrencyCode}/${receiveCurrencyCode}. Rate: ${liveExchangeRate}`);
//         throw new Error(`Live exchange rate is currently unavailable for ${sendCurrencyCode} to ${receiveCurrencyCode}. Please try again later.`);
//     }
//     // Log the rate *as fetched* (should be 2 decimal places now)
//     console.log(`Service: calculateSendSummary (Percentage ADDED Adj, Rate Rounded) - Fetched Live Rate: ${liveExchangeRate.toFixed(2)}`);

//     // 3. Get Rate Adjustment Percentage from Source Currency
//     const adjustmentPercent = sourceCurrencyDoc.rateAdjustmentPercentage ?? 0; // Default to 0 if null/undefined
//     console.log(`Service: calculateSendSummary (Percentage ADDED Adj, Rate Rounded) - Source Adjustment: ${adjustmentPercent}%`);

//     // 4. Calculate Adjusted Rate AND round it immediately to 2 decimal places
//     let adjustedExchangeRate = liveExchangeRate * (1 + adjustmentPercent / 100); // Calculate with adjustment
//     adjustedExchangeRate = parseFloat(adjustedExchangeRate.toFixed(2)); // Apply rounding to 2 decimal places
//     console.log(`Service: calculateSendSummary (Percentage ADDED Adj, Rate Rounded) - Adjusted Rate (Rounded): ${adjustedExchangeRate.toFixed(2)}`);

//     // Add check for invalid resulting rate (e.g., if adjustment is -100% or less, or rounding results in 0)
//     if (adjustedExchangeRate <= 0 || !isFinite(adjustedExchangeRate)) {
//         console.error(`Service: calculateSendSummary (Percentage ADDED Adj, Rate Rounded) - Invalid adjusted rate calculated: ${adjustedExchangeRate} from live rate ${liveExchangeRate.toFixed(2)} and adjustment ${adjustmentPercent}%`);
//         throw new Error("An error occurred calculating the final exchange rate after adjustment. Please check the adjustment percentage or contact support.");
//     }

//     // 5. Calculate Amounts based on the *Rounded* Adjusted Rate
//     let sendAmountCalc, receiveAmountCalc;
//     if (isSendingAmount) {
//         sendAmountCalc = parseFloat(amount);
//         receiveAmountCalc = sendAmountCalc * adjustedExchangeRate;
//     } else {
//         receiveAmountCalc = parseFloat(amount);
//         // Use the rounded adjusted rate for calculation
//         sendAmountCalc = receiveAmountCalc / adjustedExchangeRate;
//     }

//     // 6. Check Balance
//     const currentSourceAccount = await Account.findById(sourceAccountId); // Re-fetch for current balance
//     if (!currentSourceAccount) {
//          throw new Error('Source account could not be re-verified.'); // Should not happen if initial check passed, but good practice
//     }
//     // Round sendAmountCalc before comparison to avoid floating point issues near the limit
//     if (currentSourceAccount.balance < parseFloat(sendAmountCalc.toFixed(2))) {
//         const available = currentSourceAccount.balance;
//         console.warn(`Service: calculateSendSummary (Percentage ADDED Adj, Rate Rounded) - Insufficient balance. Required: ${sendAmountCalc.toFixed(2)}, Available: ${available.toFixed(2)}`);
//         throw new Error('Insufficient balance.');
//     }

//     // 7. Construct Summary
//     const summary = {
//         userId: userId.toString(),
//         sourceAccountId: sourceAccountId.toString(),
//         recipientId: recipientId.toString(),
//         // Ensure final amounts are strictly 2 decimal places
//         sendAmount: parseFloat(sendAmountCalc.toFixed(2)),
//         receiveAmount: parseFloat(receiveAmountCalc.toFixed(2)),
//         sendCurrencyCode,
//         receiveCurrencyCode,
//         // Store the rounded adjusted rate used for calculations
//         exchangeRate: adjustedExchangeRate, // Already rounded to 2 places
//         liveExchangeRate: liveExchangeRate, // Original live rate (also rounded to 2 places by getLiveRate)
//         rateAdjustmentApplied: adjustmentPercent, // Include the % used
//         availableBalance: parseFloat(currentSourceAccount.balance.toFixed(2)),
//         // Fees removed for simplicity
//     };
//     console.log('Service: calculateSendSummary (Percentage ADDED Adj, Rate Rounded) - Success', summary);
//     return summary;
// };


// // --- executeTransfer (No change needed from previous step) ---
// const executeTransfer = async (transferDetails) => {
//     console.log('Service: executeTransfer (Percentage ADDED Adj) - Start', transferDetails);
//     const { userId, sourceAccountId, recipientId, sendAmount, receiveAmount, exchangeRate, reason, reference, sendCurrencyCode, receiveCurrencyCode } = transferDetails;
//     if (!userId || !sourceAccountId || !recipientId || sendAmount === undefined || receiveAmount === undefined || exchangeRate === undefined || !sendCurrencyCode || !receiveCurrencyCode) throw new Error("Missing essential transfer information.");
//     if (isNaN(sendAmount) || sendAmount <= 0 || isNaN(receiveAmount) || receiveAmount <= 0 || isNaN(exchangeRate) || exchangeRate <= 0) throw new Error("Invalid amount or exchange rate.");

//     const session = await mongoose.startSession();
//     let populatedTransfer = null; // Define outside try to return it

//     try {
//         session.startTransaction();
//         const sourceAccount = await Account.findOne({ _id: sourceAccountId, user: userId }).session(session).populate('currency');
//         const recipient = await Recipient.findOne({ _id: recipientId, user: userId }).session(session).populate('currency');
//         if (!sourceAccount) throw new Error('Source account not found or access denied.');
//         if (!recipient) throw new Error('Recipient not found or access denied.');
//         if (sourceAccount.currency.code !== sendCurrencyCode) throw new Error('Source currency mismatch.');
//         if (recipient.currency.code !== receiveCurrencyCode) throw new Error('Recipient currency mismatch.');
//         if (sourceAccount.balance < sendAmount) throw new Error('Insufficient balance.');

//         const originalBalance = sourceAccount.balance;
//         sourceAccount.balance -= sendAmount;
//         await sourceAccount.save({ session });

//         const newTransfer = new Transfer({
//             user: userId, sourceAccount: sourceAccountId, recipient: recipientId,
//             sendAmount, receiveAmount,
//             sendCurrency: sourceAccount.currency._id, receiveCurrency: recipient.currency._id,
//             exchangeRate, fees: 0, reason: reason || null, reference: reference || null,
//             status: 'pending', createdAt: new Date(), updatedAt: new Date(),
//         });
//         await newTransfer.save({ session });

//         await session.commitTransaction();
//         console.log('Service: executeTransfer - Transaction committed.');

//         // Populate outside the transaction
//         populatedTransfer = await Transfer.findById(newTransfer._id)
//            .populate('user', 'fullName email')
//            .populate({ path: 'sourceAccount', select: 'balance currency', populate: { path: 'currency', select: 'code flagImage' } })
//            .populate({ path: 'recipient', select: 'accountHolderName nickname currency accountNumber bankName', populate: { path: 'currency', select: 'code flagImage' } })
//            .populate('sendCurrency', 'code flagImage')
//            .populate('receiveCurrency', 'code flagImage');

//     } catch (error) {
//         if (session.inTransaction()) {
//             await session.abortTransaction();
//              console.error('Service: executeTransfer (Percentage ADDED Adj) - Error, transaction aborted.', error);
//         } else {
//              console.error('Service: executeTransfer (Percentage ADDED Adj) - Error occurred outside transaction.', error);
//         }
//         throw error; // Rethrow the error to be handled by the controller
//     } finally {
//         session.endSession();
//         console.log('Service: executeTransfer - Session ended.');
//     }
//     return populatedTransfer; // Return the populated transfer
// };


// // --- getTransferDetails (No change needed) ---
// const getTransferDetails = async (transferId, userId) => {
//     console.log(`Service: getTransferDetails - Fetching transfer ${transferId} for user ${userId}`);
//     if (!mongoose.Types.ObjectId.isValid(transferId)) { throw new Error('Invalid transfer ID format.'); }
//     const transfer = await Transfer.findOne({ _id: transferId, user: userId })
//         .populate('user', 'fullName email')
//         .populate({ path: 'sourceAccount', select: 'currency', populate: { path: 'currency', select: 'code flagImage' } }) // Avoid populating balance here for security/simplicity unless needed
//         .populate({ path: 'recipient', select: 'accountHolderName nickname currency accountNumber bankName', populate: { path: 'currency', select: 'code flagImage' } })
//         .populate('sendCurrency', 'code flagImage')
//         .populate('receiveCurrency', 'code flagImage');
//     if (!transfer) { throw new Error('Transfer not found or access denied.'); }
//     return transfer;
// };

// // --- getUserTransfers (No change needed) ---
// const getUserTransfers = async (userId) => {
//     console.log(`Service: getUserTransfers - Fetching transfers for user ${userId}`);
//     try {
//         const transfers = await Transfer.find({ user: userId })
//             .populate('recipient', 'accountHolderName nickname') // Populate only essential recipient info for list view
//             .populate('sendCurrency', 'code flagImage')
//             .populate('receiveCurrency', 'code flagImage')
//             .select('recipient sendCurrency receiveCurrency sendAmount receiveAmount status createdAt sourceAccount reason reference exchangeRate') // Ensure sourceAccount ID is selected if needed for linking
//             .sort({ createdAt: -1 });
//         return transfers;
//     } catch (error) {
//         console.error(`Service: getUserTransfers - Error fetching transfers for user ${userId}:`, error);
//         throw new Error('Failed to retrieve transfer history.');
//     }
// };


// // --- cancelTransfer (Refined for better transaction handling and clarity) ---
// const cancelTransfer = async (transferId, userId) => {
//     console.log(`Service: cancelTransfer - Attempting to cancel transfer ${transferId} for user ${userId}`);
//     if (!mongoose.Types.ObjectId.isValid(transferId)) {
//         throw new Error('Invalid transfer ID format.');
//     }

//     const session = await mongoose.startSession();
//     let populatedTransfer = null; // To hold the final result

//     try {
//         session.startTransaction();

//         // Fetch the transfer within the transaction, ensuring it belongs to the user
//         const transfer = await Transfer.findOne({ _id: transferId, user: userId }).session(session);

//         if (!transfer) {
//             // No need to abort if nothing was found, but good practice if other ops happened before
//             // await session.abortTransaction();
//             throw new Error('Transfer not found or access denied.');
//         }

//         // Define statuses that CANNOT be cancelled (final states)
//         const nonCancellableStatuses = ['completed', 'failed', 'canceled'];
//         if (nonCancellableStatuses.includes(transfer.status)) {
//             // await session.abortTransaction(); // Abort if the state check fails *within* a transaction context
//             throw new Error(`Cannot cancel transfer: Status is already '${transfer.status}'.`);
//         }

//         // Define statuses that ALLOW cancellation (adjust as per your workflow)
//         const cancellableStatuses = ['pending', 'processing'];
//         if (!cancellableStatuses.includes(transfer.status)) {
//             // await session.abortTransaction();
//             console.warn(`Service: cancelTransfer - Attempting to cancel transfer ${transferId} with unexpected status: ${transfer.status}`);
//             throw new Error(`Cannot cancel transfer: Unexpected status '${transfer.status}'.`);
//         }


//         // --- Refunding Logic ---
//         // Assuming funds are debited immediately ('pending' status) in executeTransfer
//         const needsRefund = ['pending', 'processing'].includes(transfer.status);

//         if (needsRefund && transfer.sourceAccount && transfer.sendAmount > 0) {
//             const sourceAccount = await Account.findById(transfer.sourceAccount).session(session);
//             if (!sourceAccount) {
//                 // Critical inconsistency if transfer exists but account doesn't
//                 console.error(`Service: cancelTransfer - Critical error: Source account ${transfer.sourceAccount} not found for transfer ${transferId}.`);
//                 // Abort transaction explicitly here as it's a critical failure within the process
//                 await session.abortTransaction();
//                 throw new Error('Failed to cancel transfer: Source account data inconsistency.');
//             }
//             // Add the sent amount back to the balance
//             sourceAccount.balance += transfer.sendAmount;
//             await sourceAccount.save({ session });
//             console.log(`Service: cancelTransfer - Refunded ${transfer.sendAmount} to account ${transfer.sourceAccount} within transaction.`);
//         } else if (needsRefund) {
//             // Log if refund was expected but couldn't proceed (e.g., zero amount, missing source account ID)
//             console.warn(`Service: cancelTransfer - Refund condition met for transfer ${transferId}, but source account or send amount is invalid/zero. Skipping refund step.`);
//         }
//         // --- End Refunding Logic ---


//         // Update the transfer status
//         transfer.status = 'canceled';
//         transfer.updatedAt = new Date();
//         // Set a reason for cancellation
//         transfer.failureReason = transfer.failureReason || 'Cancelled by user.'; // Keep existing reason if it failed before cancellation
//         await transfer.save({ session });

//         // Commit the transaction if all steps were successful
//         await session.commitTransaction();
//         console.log(`Service: cancelTransfer - Transfer ${transferId} successfully cancelled and refunded (if applicable). Transaction committed.`);

//         // Populate the updated transfer details *after* the transaction is committed
//         populatedTransfer = await Transfer.findById(transfer._id) // Use transfer._id which is guaranteed to exist
//             .populate('user', 'fullName email')
//             .populate({ path: 'sourceAccount', select: 'currency', populate: { path: 'currency', select: 'code flagImage' } })
//             .populate({ path: 'recipient', select: 'accountHolderName nickname currency accountNumber bankName', populate: { path: 'currency', select: 'code flagImage' } })
//             .populate('sendCurrency', 'code flagImage')
//             .populate('receiveCurrency', 'code flagImage');

//     } catch (error) {
//         // If any error occurs, abort the transaction *if* it's still active
//         if (session.inTransaction()) {
//             await session.abortTransaction();
//             console.error(`Service: cancelTransfer - Error during cancellation transaction for ${transferId}, transaction aborted:`, error);
//         } else {
//             // Log if the error happened before the transaction started or after it was committed/aborted
//              console.error(`Service: cancelTransfer - Error occurred for ${transferId} outside active transaction:`, error);
//         }

//         // Rethrow the specific error or a generic one
//         if (error.message.startsWith('Cannot cancel transfer') || error.message.startsWith('Transfer not found') || error.message.startsWith('Invalid transfer ID')) {
//             throw error; // Keep specific, expected errors
//         }
//         throw new Error(`Failed to cancel transfer: ${error.message}`); // Generic failure message for unexpected errors
//     } finally {
//         // Ensure the session is always ended, regardless of success or failure
//         session.endSession();
//          console.log(`Service: cancelTransfer - Session ended for transfer ${transferId}.`);
//     }

//     // Return the populated transfer details (will be null if an error occurred before population)
//     return populatedTransfer;
// };


// // --- Export Service Methods ---
// export default {
//     calculateSendSummary,
//     executeTransfer,
//     getTransferDetails,
//     getUserTransfers,
//     cancelTransfer,
// };



// backend/src/services/transfer.service.js
import Transfer from '../models/Transfer.js';
import Account from '../models/Account.js';
import Currency from '../models/Currency.js';
import Recipient from '../models/Recipient.js';
import exchangeRateService from './exchangeRate.service.js'; // Needed for live rates
import mongoose from 'mongoose';

// Helper to get Live Rate (remains the same)
const getLiveRate = async (sendCode, receiveCode) => {
    try {
        const latestRatesDocument = await exchangeRateService.getLatestExchangeRates();
        if (!latestRatesDocument?.rates?.rates) {
            console.warn(`Live rates data unavailable for ${sendCode}/${receiveCode}`);
            return null;
        }
        const actualRatesMap = latestRatesDocument.rates.rates;
        const actualBaseCurrency = latestRatesDocument.rates.base || 'USD'; // Adjust if needed

        // Ensure rates are treated as numbers
        const rateBaseToSend = sendCode === actualBaseCurrency ? 1 : (actualRatesMap[sendCode] ? parseFloat(actualRatesMap[sendCode]) : null);
        const rateBaseToReceive = receiveCode === actualBaseCurrency ? 1 : (actualRatesMap[receiveCode] ? parseFloat(actualRatesMap[receiveCode]) : null);

        if (rateBaseToSend !== null && !isNaN(rateBaseToSend) && rateBaseToReceive !== null && !isNaN(rateBaseToReceive) && rateBaseToSend !== 0) {
            // Calculate rate with sufficient precision first
            const preciseRate = rateBaseToReceive / rateBaseToSend;
            // THEN round to a standard number of decimal places (e.g., 6 for intermediate calculation, or 2 if you want it rounded early)
            // Let's round to 2 places as requested in the prompt.
            return parseFloat(preciseRate.toFixed(2));
        }
        console.warn(`Could not calculate live rate between ${sendCode} and ${receiveCode}`);
        return null;
    } catch (error) {
        console.error(`Error fetching live rate for ${sendCode}/${receiveCode}:`, error.message);
        return null;
    }
};

// --- Calculate Send Summary (REVISED - Percentage Adjustment ADDED & Rate Rounding FIXED) ---
const calculateSendSummary = async (userId, sourceAccountId, recipientId, amount, isSendingAmount) => {
    console.log('Service: calculateSendSummary (Percentage ADDED Adj, Rate Rounded) - Start', { userId, sourceAccountId, recipientId, amount, isSendingAmount });

    if (!mongoose.Types.ObjectId.isValid(sourceAccountId) || !mongoose.Types.ObjectId.isValid(recipientId)) {
        throw new Error('Invalid account or recipient ID format.');
    }

    // 1. Fetch Account, Recipient, and Source Currency details
    const sourceAccount = await Account.findById(sourceAccountId).populate('user');
    const recipient = await Recipient.findById(recipientId).populate('user');

    if (!sourceAccount || !sourceAccount.user?._id || !sourceAccount.user._id.equals(userId)) throw new Error('Source account not found or access denied.');
    if (!recipient || !recipient.user?._id || !recipient.user._id.equals(userId)) throw new Error('Recipient not found or access denied.');
    if (amount === undefined || amount === null || isNaN(amount) || amount <= 0) throw new Error('Invalid amount specified.');

    // Fetch full currency docs
    const sourceCurrencyDoc = await Currency.findById(sourceAccount.currency);
    const recipientCurrencyDoc = await Currency.findById(recipient.currency);
    if (!sourceCurrencyDoc || !recipientCurrencyDoc) throw new Error('Could not load currency details for calculation.');

    const sendCurrencyCode = sourceCurrencyDoc.code;
    const receiveCurrencyCode = recipientCurrencyDoc.code;
    console.log(`Service: calculateSendSummary (Percentage ADDED Adj, Rate Rounded) - Currencies: Send=${sendCurrencyCode}, Receive=${receiveCurrencyCode}`);

    // 2. Get Live Exchange Rate (already rounded to 2 decimal places by getLiveRate)
    const liveExchangeRate = await getLiveRate(sendCurrencyCode, receiveCurrencyCode);
    if (liveExchangeRate === null || liveExchangeRate <= 0 || !isFinite(liveExchangeRate)) {
        console.error(`Service: calculateSendSummary (Percentage ADDED Adj, Rate Rounded) - Failed to fetch valid live exchange rate for ${sendCurrencyCode}/${receiveCurrencyCode}. Rate: ${liveExchangeRate}`);
        throw new Error(`Live exchange rate is currently unavailable for ${sendCurrencyCode} to ${receiveCurrencyCode}. Please try again later.`);
    }
    // Log the rate *as fetched* (should be 2 decimal places now)
    console.log(`Service: calculateSendSummary (Percentage ADDED Adj, Rate Rounded) - Fetched Live Rate: ${liveExchangeRate.toFixed(2)}`);

    // 3. Get Rate Adjustment Percentage from Source Currency
    const adjustmentPercent = sourceCurrencyDoc.rateAdjustmentPercentage ?? 0; // Default to 0 if null/undefined
    console.log(`Service: calculateSendSummary (Percentage ADDED Adj, Rate Rounded) - Source Adjustment: ${adjustmentPercent}%`);

    // 4. Calculate Adjusted Rate AND round it immediately to 2 decimal places
    let adjustedExchangeRate = liveExchangeRate * (1 + adjustmentPercent / 100); // Calculate with adjustment
    adjustedExchangeRate = parseFloat(adjustedExchangeRate.toFixed(2)); // Apply rounding to 2 decimal places
    console.log(`Service: calculateSendSummary (Percentage ADDED Adj, Rate Rounded) - Adjusted Rate (Rounded): ${adjustedExchangeRate.toFixed(2)}`);

    // Add check for invalid resulting rate (e.g., if adjustment is -100% or less, or rounding results in 0)
    if (adjustedExchangeRate <= 0 || !isFinite(adjustedExchangeRate)) {
        console.error(`Service: calculateSendSummary (Percentage ADDED Adj, Rate Rounded) - Invalid adjusted rate calculated: ${adjustedExchangeRate} from live rate ${liveExchangeRate.toFixed(2)} and adjustment ${adjustmentPercent}%`);
        throw new Error("An error occurred calculating the final exchange rate after adjustment. Please check the adjustment percentage or contact support.");
    }

    // 5. Calculate Amounts based on the *Rounded* Adjusted Rate
    let sendAmountCalc, receiveAmountCalc;
    if (isSendingAmount) {
        sendAmountCalc = parseFloat(amount);
        receiveAmountCalc = sendAmountCalc * adjustedExchangeRate;
    } else {
        receiveAmountCalc = parseFloat(amount);
        // Use the rounded adjusted rate for calculation
        sendAmountCalc = receiveAmountCalc / adjustedExchangeRate;
    }

    // 6. Check Balance
    const currentSourceAccount = await Account.findById(sourceAccountId); // Re-fetch for current balance
    if (!currentSourceAccount) {
         throw new Error('Source account could not be re-verified.'); // Should not happen if initial check passed, but good practice
    }
    // Round sendAmountCalc before comparison to avoid floating point issues near the limit
    if (currentSourceAccount.balance < parseFloat(sendAmountCalc.toFixed(2))) {
        const available = currentSourceAccount.balance;
        console.warn(`Service: calculateSendSummary (Percentage ADDED Adj, Rate Rounded) - Insufficient balance. Required: ${sendAmountCalc.toFixed(2)}, Available: ${available.toFixed(2)}`);
        throw new Error('Insufficient balance.');
    }

    // 7. Construct Summary
    const summary = {
        userId: userId.toString(),
        sourceAccountId: sourceAccountId.toString(),
        recipientId: recipientId.toString(),
        // Ensure final amounts are strictly 2 decimal places
        sendAmount: parseFloat(sendAmountCalc.toFixed(2)),
        receiveAmount: parseFloat(receiveAmountCalc.toFixed(2)),
        sendCurrencyCode,
        receiveCurrencyCode,
        // Store the rounded adjusted rate used for calculations
        exchangeRate: adjustedExchangeRate, // Already rounded to 2 places
        liveExchangeRate: liveExchangeRate, // Original live rate (also rounded to 2 places by getLiveRate)
        rateAdjustmentApplied: adjustmentPercent, // Include the % used
        availableBalance: parseFloat(currentSourceAccount.balance.toFixed(2)),
        // Fees removed for simplicity
    };
    console.log('Service: calculateSendSummary (Percentage ADDED Adj, Rate Rounded) - Success', summary);
    return summary;
};


// --- executeTransfer (No change needed from previous step) ---
const executeTransfer = async (transferDetails) => {
    console.log('Service: executeTransfer (Percentage ADDED Adj) - Start', transferDetails);
    const { userId, sourceAccountId, recipientId, sendAmount, receiveAmount, exchangeRate, reason, reference, sendCurrencyCode, receiveCurrencyCode } = transferDetails;
    if (!userId || !sourceAccountId || !recipientId || sendAmount === undefined || receiveAmount === undefined || exchangeRate === undefined || !sendCurrencyCode || !receiveCurrencyCode) throw new Error("Missing essential transfer information.");
    if (isNaN(sendAmount) || sendAmount <= 0 || isNaN(receiveAmount) || receiveAmount <= 0 || isNaN(exchangeRate) || exchangeRate <= 0) throw new Error("Invalid amount or exchange rate.");

    const session = await mongoose.startSession();
    let populatedTransfer = null; // Define outside try to return it

    try {
        session.startTransaction();
        const sourceAccount = await Account.findOne({ _id: sourceAccountId, user: userId }).session(session).populate('currency');
        const recipient = await Recipient.findOne({ _id: recipientId, user: userId }).session(session).populate('currency');
        if (!sourceAccount) throw new Error('Source account not found or access denied.');
        if (!recipient) throw new Error('Recipient not found or access denied.');
        if (sourceAccount.currency.code !== sendCurrencyCode) throw new Error('Source currency mismatch.');
        if (recipient.currency.code !== receiveCurrencyCode) throw new Error('Recipient currency mismatch.');
        if (sourceAccount.balance < sendAmount) throw new Error('Insufficient balance.');

        const originalBalance = sourceAccount.balance;
        sourceAccount.balance -= sendAmount;
        await sourceAccount.save({ session });

        const newTransfer = new Transfer({
            user: userId, sourceAccount: sourceAccountId, recipient: recipientId,
            sendAmount, receiveAmount,
            sendCurrency: sourceAccount.currency._id, receiveCurrency: recipient.currency._id,
            exchangeRate, fees: 0, reason: reason || null, reference: reference || null,
            status: 'pending', createdAt: new Date(), updatedAt: new Date(),
        });
        await newTransfer.save({ session });

        await session.commitTransaction();
        console.log('Service: executeTransfer - Transaction committed.');

        // Populate outside the transaction
        populatedTransfer = await Transfer.findById(newTransfer._id)
           .populate('user', 'fullName email')
           .populate({ path: 'sourceAccount', select: 'balance currency', populate: { path: 'currency', select: 'code flagImage' } })
           .populate({ path: 'recipient', select: 'accountHolderName nickname currency accountNumber bankName', populate: { path: 'currency', select: 'code flagImage' } })
           .populate('sendCurrency', 'code flagImage')
           .populate('receiveCurrency', 'code flagImage');

    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
             console.error('Service: executeTransfer (Percentage ADDED Adj) - Error, transaction aborted.', error);
        } else {
             console.error('Service: executeTransfer (Percentage ADDED Adj) - Error occurred outside transaction.', error);
        }
        throw error; // Rethrow the error to be handled by the controller
    } finally {
        session.endSession();
        console.log('Service: executeTransfer - Session ended.');
    }
    return populatedTransfer; // Return the populated transfer
};


// --- getTransferDetails (No change needed) ---
const getTransferDetails = async (transferId, userId) => {
    console.log(`Service: getTransferDetails - Fetching transfer ${transferId} for user ${userId}`);
    if (!mongoose.Types.ObjectId.isValid(transferId)) { throw new Error('Invalid transfer ID format.'); }
    const transfer = await Transfer.findOne({ _id: transferId, user: userId })
        .populate('user', 'fullName email')
        .populate({ path: 'sourceAccount', select: 'currency', populate: { path: 'currency', select: 'code flagImage' } }) // Avoid populating balance here for security/simplicity unless needed
        .populate({ path: 'recipient', select: 'accountHolderName nickname currency accountNumber bankName', populate: { path: 'currency', select: 'code flagImage' } })
        .populate('sendCurrency', 'code flagImage')
        .populate('receiveCurrency', 'code flagImage');
    if (!transfer) { throw new Error('Transfer not found or access denied.'); }
    return transfer;
};

// --- getUserTransfers (No change needed) ---
const getUserTransfers = async (userId) => {
    console.log(`Service: getUserTransfers - Fetching transfers for user ${userId}`);
    try {
        const transfers = await Transfer.find({ user: userId })
            .populate('recipient', 'accountHolderName nickname') // Populate only essential recipient info for list view
            .populate('sendCurrency', 'code flagImage')
            .populate('receiveCurrency', 'code flagImage')
            .select('recipient sendCurrency receiveCurrency sendAmount receiveAmount status createdAt sourceAccount reason reference exchangeRate') // Ensure sourceAccount ID is selected if needed for linking
            .sort({ createdAt: -1 });
        return transfers;
    } catch (error) {
        console.error(`Service: getUserTransfers - Error fetching transfers for user ${userId}:`, error);
        throw new Error('Failed to retrieve transfer history.');
    }
};


// --- cancelTransfer (MODIFIED FOR STRICT STATUS CHECK) ---
const cancelTransfer = async (transferId, userId) => {
    console.log(`Service: cancelTransfer - Attempting to cancel transfer ${transferId} for user ${userId}`);
    if (!mongoose.Types.ObjectId.isValid(transferId)) {
        throw new Error('Invalid transfer ID format.');
    }

    const session = await mongoose.startSession();
    let populatedTransfer = null; // To hold the final result

    try {
        session.startTransaction();

        // Fetch the transfer within the transaction, ensuring it belongs to the user
        const transfer = await Transfer.findOne({ _id: transferId, user: userId }).session(session);

        if (!transfer) {
            // No need to abort if nothing was found before starting ops
            // await session.abortTransaction(); // Not strictly needed here but safe
            throw new Error('Transfer not found or access denied.');
        }

        // --- START FIX: Strict status check for user cancellation ---
        // Users can ONLY cancel if the status is 'pending'
        if (transfer.status !== 'pending') {
            await session.abortTransaction(); // Abort transaction as the condition failed
            console.warn(`Service: cancelTransfer - User ${userId} attempted to cancel transfer ${transferId} with non-pending status: ${transfer.status}. Cancellation blocked.`);
            // Throw a specific, user-friendly error message
            throw new Error(`Cannot cancel transfer: Status is already '${transfer.status}'. Only pending transfers can be cancelled.`);
        }
        // --- END FIX ---


        // --- Refunding Logic (Only runs if status IS 'pending') ---
        console.log(`Service: cancelTransfer - Transfer ${transferId} is pending. Proceeding with cancellation and refund.`);
        const needsRefund = true; // We already know it's pending here

        if (needsRefund && transfer.sourceAccount && transfer.sendAmount > 0) {
            const sourceAccount = await Account.findById(transfer.sourceAccount).session(session);
            if (!sourceAccount) {
                console.error(`Service: cancelTransfer - Critical error: Source account ${transfer.sourceAccount} not found for transfer ${transferId}.`);
                await session.abortTransaction(); // Abort due to critical inconsistency
                throw new Error('Failed to cancel transfer: Source account data inconsistency.');
            }
            // Add the sent amount back to the balance
            sourceAccount.balance += transfer.sendAmount;
            await sourceAccount.save({ session });
            console.log(`Service: cancelTransfer - Refunded ${transfer.sendAmount} to account ${transfer.sourceAccount} within transaction.`);
        } else if (needsRefund) {
             console.warn(`Service: cancelTransfer - Refund condition met for transfer ${transferId}, but source account or send amount is invalid/zero. Skipping refund step.`);
        }
        // --- End Refunding Logic ---


        // Update the transfer status
        transfer.status = 'canceled';
        transfer.updatedAt = new Date();
        // Set a reason for cancellation
        transfer.failureReason = transfer.failureReason || 'Cancelled by user.'; // Keep existing reason if it failed before cancellation
        await transfer.save({ session });

        // Commit the transaction if all steps were successful
        await session.commitTransaction();
        console.log(`Service: cancelTransfer - Transfer ${transferId} successfully cancelled and refunded. Transaction committed.`);

        // Populate the updated transfer details *after* the transaction is committed
        populatedTransfer = await Transfer.findById(transfer._id) // Use transfer._id which is guaranteed to exist
            .populate('user', 'fullName email')
            .populate({ path: 'sourceAccount', select: 'currency', populate: { path: 'currency', select: 'code flagImage' } })
            .populate({ path: 'recipient', select: 'accountHolderName nickname currency accountNumber bankName', populate: { path: 'currency', select: 'code flagImage' } })
            .populate('sendCurrency', 'code flagImage')
            .populate('receiveCurrency', 'code flagImage');

    } catch (error) {
        // If any error occurs, abort the transaction *if* it's still active
        if (session.inTransaction()) {
            await session.abortTransaction();
            console.error(`Service: cancelTransfer - Error during cancellation transaction for ${transferId}, transaction aborted:`, error);
        } else {
             console.error(`Service: cancelTransfer - Error occurred for ${transferId} outside active transaction:`, error);
        }

        // Rethrow the specific error or a generic one
        // --- START FIX: Ensure specific cancellation error is re-thrown ---
        if (error.message.startsWith('Cannot cancel transfer') ||
            error.message.startsWith('Transfer not found') ||
            error.message.startsWith('Invalid transfer ID') ||
            error.message.includes('Source account data inconsistency')) { // Added specific check
            throw error; // Keep specific, expected errors
        }
        // --- END FIX ---
        throw new Error(`Failed to cancel transfer: ${error.message}`); // Generic failure message for unexpected errors
    } finally {
        // Ensure the session is always ended, regardless of success or failure
        session.endSession();
         console.log(`Service: cancelTransfer - Session ended for transfer ${transferId}.`);
    }

    // Return the populated transfer details (will be null if an error occurred before population)
    return populatedTransfer;
};


// --- Export Service Methods ---
export default {
    calculateSendSummary,
    executeTransfer,
    getTransferDetails,
    getUserTransfers,
    cancelTransfer,
};