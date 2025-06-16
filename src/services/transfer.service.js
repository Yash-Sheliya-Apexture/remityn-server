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


// // --- cancelTransfer (MODIFIED FOR STRICT STATUS CHECK) ---
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
//             // No need to abort if nothing was found before starting ops
//             // await session.abortTransaction(); // Not strictly needed here but safe
//             throw new Error('Transfer not found or access denied.');
//         }

//         // --- START FIX: Strict status check for user cancellation ---
//         // Users can ONLY cancel if the status is 'pending'
//         if (transfer.status !== 'pending') {
//             await session.abortTransaction(); // Abort transaction as the condition failed
//             console.warn(`Service: cancelTransfer - User ${userId} attempted to cancel transfer ${transferId} with non-pending status: ${transfer.status}. Cancellation blocked.`);
//             // Throw a specific, user-friendly error message
//             throw new Error(`Cannot cancel transfer: Status is already '${transfer.status}'. Only pending transfers can be cancelled.`);
//         }
//         // --- END FIX ---


//         // --- Refunding Logic (Only runs if status IS 'pending') ---
//         console.log(`Service: cancelTransfer - Transfer ${transferId} is pending. Proceeding with cancellation and refund.`);
//         const needsRefund = true; // We already know it's pending here

//         if (needsRefund && transfer.sourceAccount && transfer.sendAmount > 0) {
//             const sourceAccount = await Account.findById(transfer.sourceAccount).session(session);
//             if (!sourceAccount) {
//                 console.error(`Service: cancelTransfer - Critical error: Source account ${transfer.sourceAccount} not found for transfer ${transferId}.`);
//                 await session.abortTransaction(); // Abort due to critical inconsistency
//                 throw new Error('Failed to cancel transfer: Source account data inconsistency.');
//             }
//             // Add the sent amount back to the balance
//             sourceAccount.balance += transfer.sendAmount;
//             await sourceAccount.save({ session });
//             console.log(`Service: cancelTransfer - Refunded ${transfer.sendAmount} to account ${transfer.sourceAccount} within transaction.`);
//         } else if (needsRefund) {
//              console.warn(`Service: cancelTransfer - Refund condition met for transfer ${transferId}, but source account or send amount is invalid/zero. Skipping refund step.`);
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
//         console.log(`Service: cancelTransfer - Transfer ${transferId} successfully cancelled and refunded. Transaction committed.`);

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
//              console.error(`Service: cancelTransfer - Error occurred for ${transferId} outside active transaction:`, error);
//         }

//         // Rethrow the specific error or a generic one
//         // --- START FIX: Ensure specific cancellation error is re-thrown ---
//         if (error.message.startsWith('Cannot cancel transfer') ||
//             error.message.startsWith('Transfer not found') ||
//             error.message.startsWith('Invalid transfer ID') ||
//             error.message.includes('Source account data inconsistency')) { // Added specific check
//             throw error; // Keep specific, expected errors
//         }
//         // --- END FIX ---
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


// // backend/src/services/transfer.service.js
// import Transfer from '../models/Transfer.js';
// import Account from '../models/Account.js';
// import Currency from '../models/Currency.js';
// import Recipient from '../models/Recipient.js';
// import exchangeRateService from './exchangeRate.service.js'; // Needed for live rates
// import mongoose from 'mongoose';

// // Helper to get Live Rate (FIXED for scraped X/INR data)
// const getLiveRate = async (sendCode, receiveCode) => {
//     console.log(`Service: getLiveRate - Attempting to get rate for ${sendCode}/${receiveCode}`);

//     // Handle same currency pair immediately
//     if (sendCode === receiveCode) {
//         console.log(`Service: getLiveRate - Same currency pair (${sendCode}/${receiveCode}), rate is 1.`);
//         return 1; // Rate is 1 for the same currency
//     }

//     try {
//         const latestRatesDocument = await exchangeRateService.getLatestExchangeRates();

//         // --- FIX: Check if the document and the rates object exist and are valid ---
//         // The rates are now stored directly under the 'rates' field by the scraper
//         if (!latestRatesDocument?.rates || typeof latestRatesDocument.rates !== 'object' || Object.keys(latestRatesDocument.rates).length === 0) {
//             console.warn(`Service: getLiveRate - Live rates data unavailable or empty from DB.`);
//             return null; // Return null if rates are not available or invalid
//         }
//         // --- FIX: Access the rates object directly ---
//         const actualRatesMap = latestRatesDocument.rates; // Use the rates object directly

//         console.log("Service: getLiveRate - Fetched rates map from DB:", actualRatesMap); // Log fetched rates to debug

//         let liveRate;

//         // --- FIX: Calculate rate based on X/INR data structure ---
//         if (receiveCode === 'INR') {
//             // If receiving INR, the rate is simply sendCode/INR
//             const rateSendToINR = actualRatesMap[sendCode];
//              console.log(`Service: getLiveRate - Receive currency is INR. Looking for rate ${sendCode}/INR.`);

//             if (rateSendToINR === undefined || rateSendToINR === null || isNaN(parseFloat(rateSendToINR)) || parseFloat(rateSendToINR) <= 0) {
//                  console.warn(`Service: getLiveRate - Valid rate for ${sendCode}/INR not found or invalid:`, rateSendToINR);
//                  return null; // Rate not found or invalid
//             }
//             liveRate = parseFloat(rateSendToINR); // Rate is already CURRENCY/INR

//         } else if (sendCode === 'INR') {
//             // If sending INR, the rate is INR/receiveCode, which is 1 / (receiveCode/INR)
//             const rateReceiveToINR = actualRatesMap[receiveCode];
//              console.log(`Service: getLiveRate - Send currency is INR. Looking for rate INR/${receiveCode} (1 / ${receiveCode}/INR).`);

//             if (rateReceiveToINR === undefined || rateReceiveToINR === null || isNaN(parseFloat(rateReceiveToINR)) || parseFloat(rateReceiveToINR) <= 0) {
//                  console.warn(`Service: getLiveRate - Valid rate for ${receiveCode}/INR not found or invalid:`, rateReceiveToINR);
//                  return null; // Rate not found or invalid
//             }
//              const numericRateReceiveToINR = parseFloat(rateReceiveToINR);
//             if (numericRateReceiveToINR === 0) { // Avoid division by zero
//                  console.warn(`Service: getLiveRate - Rate for ${receiveCode}/INR is zero, cannot calculate INR/${receiveCode}.`);
//                  return null;
//             }
//             liveRate = 1 / numericRateReceiveToINR;

//         } else {
//             // General case: sendCode to receiveCode (e.g., EUR to USD)
//             // Calculated as (receiveCode/INR) / (sendCode/INR)
//             const rateSendToINR = actualRatesMap[sendCode];
//             const rateReceiveToINR = actualRatesMap[receiveCode];
//              console.log(`Service: getLiveRate - General case ${sendCode}/${receiveCode}. Calculating (${receiveCode}/INR) / (${sendCode}/INR).`);


//             if (rateSendToINR === undefined || rateSendToINR === null || isNaN(parseFloat(rateSendToINR)) || parseFloat(rateSendToINR) <= 0 ||
//                 rateReceiveToINR === undefined || rateReceiveToINR === null || isNaN(parseFloat(rateReceiveToINR)) || parseFloat(rateReceiveToINR) <= 0)
//             {
//                  console.warn(`Service: getLiveRate - Valid rates for both ${sendCode}/INR and ${receiveCode}/INR not found or invalid.`);
//                  return null; // One or both rates missing/invalid
//             }

//             const numericRateSendToINR = parseFloat(rateSendToINR);
//             const numericRateReceiveToINR = parseFloat(rateReceiveToINR);

//             if (numericRateSendToINR === 0) { // Avoid division by zero
//                 console.warn(`Service: getLiveRate - Rate for ${sendCode}/INR is zero, cannot calculate ${sendCode}/${receiveCode}.`);
//                 return null;
//             }

//             liveRate = numericRateReceiveToINR / numericRateSendToINR;
//         }

//         // Add a final check for the calculated liveRate just in case
//         if (liveRate === undefined || liveRate === null || isNaN(liveRate) || liveRate <= 0 || !isFinite(liveRate)) {
//              console.warn(`Service: getLiveRate - Final calculated live rate is invalid: ${liveRate}`);
//              return null;
//         }

//         // Round the final live rate to a reasonable precision (e.g., 4 decimal places)
//         // This rate is the 'marketRate' for comparison. The 'ourRate' will be rounded to 2 places later.
//         const roundedLiveRate = parseFloat(liveRate.toFixed(4));
//         console.log(`Service: getLiveRate - Final Rounded Live Rate for ${sendCode}/${receiveCode}: ${roundedLiveRate}`);
//         return roundedLiveRate;

//     } catch (error) {
//         console.error(`Service: getLiveRate - Unexpected error fetching or calculating live rate for ${sendCode}/${receiveCode}:`, error.message);
//         return null;
//     }
// };

// // --- calculateSendSummary (Minor adjustment to check liveRate <= 0) ---
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

//     // 2. Get Live Exchange Rate (now rounded to 4 decimal places by getLiveRate)
//     const liveExchangeRate = await getLiveRate(sendCurrencyCode, receiveCurrencyCode);
//     // --- FIX: Check liveExchangeRate is valid and > 0 ---
//     if (liveExchangeRate === null || liveExchangeRate <= 0 || !isFinite(liveExchangeRate)) {
//         console.error(`Service: calculateSendSummary (Percentage ADDED Adj, Rate Rounded) - Failed to fetch valid live exchange rate for ${sendCurrencyCode}/${receiveCurrencyCode}. Rate: ${liveExchangeRate}`);
//         throw new Error(`Could not retrieve current exchange rates for ${sendCurrencyCode} to ${receiveCurrencyCode}. Please try again later.`);
//     }
//     // Log the rate *as fetched* (should be 4 decimal places now)
//     console.log(`Service: calculateSendSummary (Percentage ADDED Adj, Rate Rounded) - Fetched Live Rate: ${liveExchangeRate.toFixed(4)}`);


//     // 3. Get Rate Adjustment Percentage from Source Currency
//     const adjustmentPercent = sourceCurrencyDoc.rateAdjustmentPercentage ?? 0; // Default to 0 if null/undefined
//     console.log(`Service: calculateSendSummary (Percentage ADDED Adj, Rate Rounded) - Source Adjustment: ${adjustmentPercent}%`);

//     // 4. Calculate Adjusted Rate AND round it immediately to 2 decimal places for *Our Rate* display/calculation
//     let adjustedExchangeRate = liveExchangeRate * (1 + adjustmentPercent / 100); // Calculate with adjustment
//     adjustedExchangeRate = parseFloat(adjustedExchangeRate.toFixed(2)); // Apply rounding to 2 decimal places for the 'our rate'

//     // Add check for invalid resulting rate (e.g., if adjustment is -100% or less, or rounding results in 0)
//     if (adjustedExchangeRate <= 0 || !isFinite(adjustedExchangeRate)) {
//         console.error(`Service: calculateSendSummary (Percentage ADDED Adj, Rate Rounded) - Invalid adjusted rate calculated: ${adjustedExchangeRate} from live rate ${liveExchangeRate.toFixed(4)} and adjustment ${adjustmentPercent}%`);
//         throw new Error("An error occurred calculating the final exchange rate after adjustment. Please check the adjustment percentage or contact support.");
//     }
//     console.log(`Service: calculateSendSummary (Percentage ADDED Adj, Rate Rounded) - Adjusted Rate (Rounded to 2): ${adjustedExchangeRate.toFixed(2)}`);


//     // 5. Calculate Amounts based on the *Rounded* Adjusted Rate (adjustedExchangeRate)
//     let sendAmountCalc, receiveAmountCalc;
//     const numericAmount = parseFloat(amount);

//     if (isSendingAmount) {
//         sendAmountCalc = numericAmount;
//         receiveAmountCalc = sendAmountCalc * adjustedExchangeRate;
//     } else {
//         receiveAmountCalc = numericAmount;
//         // Use the rounded adjusted rate for calculation
//         if (adjustedExchangeRate === 0) {
//              console.error("Service: calculateSendSummary - Adjusted rate is zero when calculating send amount from receive amount.");
//              throw new Error("An error occurred calculating the send amount. Adjusted rate is zero.");
//         }
//         sendAmountCalc = receiveAmountCalc / adjustedExchangeRate;
//     }

//     // 6. Check Balance
//     const currentSourceAccount = await Account.findById(sourceAccountId); // Re-fetch for current balance
//     if (!currentSourceAccount) {
//          throw new Error('Source account could not be re-verified.'); // Should not happen if initial check passed, but good practice
//     }
//      // Round sendAmountCalc before comparison to avoid floating point issues near the limit, and ensure it's not more than 2 decimal places
//     const finalSendAmount = parseFloat(sendAmountCalc.toFixed(2));

//     if (currentSourceAccount.balance < finalSendAmount) {
//         const available = currentSourceAccount.balance;
//         console.warn(`Service: calculateSendSummary (Percentage ADDED Adj, Rate Rounded) - Insufficient balance. Required: ${finalSendAmount}, Available: ${available.toFixed(2)}`);
//         throw new Error('Insufficient balance.');
//     }

//      // Ensure receive amount is also rounded to 2 decimal places for final summary
//      const finalReceiveAmount = parseFloat(receiveAmountCalc.toFixed(2));


//     // 7. Construct Summary
//     const summary = {
//         userId: userId.toString(),
//         sourceAccountId: sourceAccountId.toString(),
//         recipientId: recipientId.toString(),
//         // Ensure final amounts are strictly 2 decimal places
//         sendAmount: finalSendAmount,
//         receiveAmount: finalReceiveAmount,
//         sendCurrencyCode,
//         receiveCurrencyCode,
//         // Store the rounded adjusted rate used for calculations
//         exchangeRate: adjustedExchangeRate, // Our Rate (rounded to 2 places)
//         liveExchangeRate: liveExchangeRate, // Original live rate (rounded to 4 places by getLiveRate)
//         rateAdjustmentApplied: adjustmentPercent, // Include the % used
//         availableBalance: parseFloat(currentSourceAccount.balance.toFixed(2)),
//         // Fees are calculated/handled client-side in your frontend logic currently
//         // If fees were added here, you'd include them in the summary object
//     };
//     console.log('Service: calculateSendSummary (Percentage ADDED Adj, Rate Rounded) - Success', summary);
//     return summary;
// };


// // --- Rest of the service methods remain unchanged from the previous step ---
// // executeTransfer
// // getTransferDetails
// // getUserTransfers
// // cancelTransfer

// const executeTransfer = async (transferDetails) => {
//     console.log('Service: executeTransfer - Start', transferDetails);
//     const { userId, sourceAccountId, recipientId, sendAmount, receiveAmount, exchangeRate, reason, reference, sendCurrencyCode, receiveCurrencyCode } = transferDetails;
//     // Add validation for fees if they are included in transferDetails
//     const fees = transferDetails.fees ?? 0; // Assuming fees are passed in transferDetails, default to 0 if not

//     if (!userId || !sourceAccountId || !recipientId || sendAmount === undefined || receiveAmount === undefined || exchangeRate === undefined || !sendCurrencyCode || !receiveCurrencyCode) {
//         console.error('Service: executeTransfer - Missing essential transfer information.');
//         throw new Error("Missing essential transfer information.");
//     }
//      // Basic validation for amounts and rate
//     if (isNaN(sendAmount) || sendAmount < 0 || isNaN(receiveAmount) < 0 || receiveAmount < 0 || isNaN(exchangeRate) || exchangeRate <= 0) {
//         console.error('Service: executeTransfer - Invalid amount or exchange rate provided.');
//         throw new Error("Invalid amount or exchange rate.");
//     }
//      // Validate fees if they are expected
//     if (isNaN(fees) || fees < 0) {
//         console.error('Service: executeTransfer - Invalid fees provided.');
//         throw new Error("Invalid fees information.");
//     }


//     const session = await mongoose.startSession();
//     let populatedTransfer = null; // Define outside try to return it

//     try {
//         session.startTransaction();
//         console.log('Service: executeTransfer - Transaction started.');

//         // Fetch account and recipient within the transaction, verifying user ownership
//         const sourceAccount = await Account.findOne({ _id: sourceAccountId, user: userId }).session(session).populate('currency');
//         const recipient = await Recipient.findOne({ _id: recipientId, user: userId }).session(session).populate('currency');

//         if (!sourceAccount) {
//              console.error(`Service: executeTransfer - Source account ${sourceAccountId} not found or access denied for user ${userId}.`);
//              throw new Error('Source account not found or access denied.');
//         }
//         if (!recipient) {
//              console.error(`Service: executeTransfer - Recipient ${recipientId} not found or access denied for user ${userId}.`);
//              throw new Error('Recipient not found or access denied.');
//         }

//         // Verify currency codes match the accounts/recipient (critical check)
//         if (sourceAccount.currency.code !== sendCurrencyCode) {
//              console.error(`Service: executeTransfer - Source account currency mismatch. Account: ${sourceAccount.currency.code}, Provided: ${sendCurrencyCode}.`);
//              throw new Error('Source currency mismatch.');
//         }
//         if (recipient.currency.code !== receiveCurrencyCode) {
//              console.error(`Service: executeTransfer - Recipient currency mismatch. Recipient: ${recipient.currency.code}, Provided: ${receiveCurrencyCode}.`);
//              throw new Error('Recipient currency mismatch.');
//         }

//         // Verify sufficient balance *after* fetching the latest balance within the transaction
//         // The amount to deduct is sendAmount + fees
//         const totalAmountToDeduct = sendAmount + fees;
//         console.log(`Service: executeTransfer - Checking balance. Required: ${totalAmountToDeduct.toFixed(2)}, Available: ${sourceAccount.balance.toFixed(2)}.`);

//         if (sourceAccount.balance < totalAmountToDeduct) {
//              console.warn(`Service: executeTransfer - Insufficient balance. Required: ${totalAmountToDeduct.toFixed(2)}, Available: ${sourceAccount.balance.toFixed(2)}.`);
//              throw new Error('Insufficient balance.'); // This message is specifically handled by the controller/frontend
//         }

//         // Deduct the total amount (sendAmount + fees) from the source account balance
//         const originalBalance = sourceAccount.balance; // Log original balance for auditing
//         sourceAccount.balance -= totalAmountToDeduct; // Deduct send amount + fees
//         console.log(`Service: executeTransfer - Deducting ${totalAmountToDeduct.toFixed(2)} from account ${sourceAccountId}. New balance: ${sourceAccount.balance.toFixed(2)}`);

//         // Save the updated source account balance
//         await sourceAccount.save({ session });
//         console.log('Service: executeTransfer - Source account balance updated.');


//         // Create the new transfer record
//         const newTransfer = new Transfer({
//             user: userId,
//             sourceAccount: sourceAccountId,
//             recipient: recipientId,
//             sendAmount: parseFloat(sendAmount.toFixed(2)), // Store amounts rounded to 2 decimal places
//             receiveAmount: parseFloat(receiveAmount.toFixed(2)),
//             sendCurrency: sourceAccount.currency._id, // Use the Currency ObjectId from the populated account
//             receiveCurrency: recipient.currency._id, // Use the Currency ObjectId from the populated recipient
//             exchangeRate: parseFloat(exchangeRate.toFixed(4)), // Store exchange rate with sufficient precision (e.g., 4)
//             fees: parseFloat(fees.toFixed(2)), // Store fees rounded to 2 decimal places
//             reason: reason || null,
//             reference: reference || null,
//             status: 'pending', // Start with 'pending'
//             // createdAt and updatedAt are handled by timestamps option
//         });
//         await newTransfer.save({ session });
//         console.log(`Service: executeTransfer - New transfer created with ID ${newTransfer._id}.`);

//         // Commit the transaction
//         await session.commitTransaction();
//         console.log('Service: executeTransfer - Transaction committed successfully.');

//         // Populate the newly created transfer record *outside* the transaction
//         populatedTransfer = await Transfer.findById(newTransfer._id)
//            .populate('user', 'fullName email') // Populate user but only select basic fields
//            // Populate sourceAccount, but only currency details needed for display
//            .populate({ path: 'sourceAccount', select: 'currency', populate: { path: 'currency', select: 'code flagImage' } })
//            // Populate recipient, selecting necessary fields and currency details
//            .populate({ path: 'recipient', select: 'accountHolderName nickname currency accountNumber bankName', populate: { path: 'currency', select: 'code flagImage' } })
//            // Explicitly populate send/receive currency fields if they aren't fully populated via sourceAccount/recipient
//            // (This might be redundant if populate path is correct, but safe)
//            .populate('sendCurrency', 'code flagImage')
//            .populate('receiveCurrency', 'code flagImage');

//         if (!populatedTransfer) {
//             console.error(`Service: executeTransfer - Failed to populate transfer after creation for ID ${newTransfer._id}.`);
//             // This is an unusual state, but indicates something went wrong fetching it back
//             throw new Error('Transfer created but failed to retrieve details.');
//         }
//         console.log('Service: executeTransfer - Transfer successfully executed and populated.');

//     } catch (error) {
//         // If any error occurred during the try block and the session is active, abort the transaction
//         if (session.inTransaction()) {
//             await session.abortTransaction();
//             console.error('Service: executeTransfer - Transaction aborted due to error:', error);
//         } else {
//             console.error('Service: executeTransfer - Error occurred outside active transaction:', error);
//         }
//         // Rethrow the error so it can be handled by the controller
//         throw error;
//     } finally {
//         // Always end the session
//         session.endSession();
//         console.log('Service: executeTransfer - Session ended.');
//     }

//     // Return the fully populated transfer object
//     return populatedTransfer;
// };


// const getTransferDetails = async (transferId, userId) => {
//     console.log(`Service: getTransferDetails - Fetching transfer ${transferId} for user ${userId}`);
//     if (!mongoose.Types.ObjectId.isValid(transferId)) {
//         console.warn(`Service: getTransferDetails - Invalid transfer ID format: ${transferId}`);
//         throw new Error('Invalid transfer ID format.');
//     }
//     // Fetch the transfer, ensuring it belongs to the user and populate necessary fields
//     const transfer = await Transfer.findOne({ _id: transferId, user: userId })
//         .populate('user', 'fullName email') // Populate user but select basic fields
//         // Populate sourceAccount, but only currency details needed for display
//         .populate({ path: 'sourceAccount', select: 'currency', populate: { path: 'currency', select: 'code flagImage' } }) // Avoid populating balance here unless needed
//         // Populate recipient, selecting necessary fields and currency details
//         .populate({ path: 'recipient', select: 'accountHolderName nickname currency accountNumber bankName', populate: { path: 'currency', select: 'code flagImage' } })
//          // Explicitly populate send/receive currency fields if they aren't fully populated via sourceAccount/recipient
//         .populate('sendCurrency', 'code flagImage')
//         .populate('receiveCurrency', 'code flagImage');


//     if (!transfer) {
//         console.warn(`Service: getTransferDetails - Transfer ${transferId} not found or access denied for user ${userId}.`);
//         throw new Error('Transfer not found or access denied.');
//     }
//     console.log(`Service: getTransferDetails - Transfer ${transferId} found.`);
//     return transfer;
// };

// const getUserTransfers = async (userId) => {
//     console.log(`Service: getUserTransfers - Fetching transfers for user ${userId}`);
//     try {
//         // Find all transfers for the user, populate relevant fields, and sort by creation date
//         const transfers = await Transfer.find({ user: userId })
//             .populate('recipient', 'accountHolderName nickname') // Populate only essential recipient info for list view
//             .populate('sendCurrency', 'code flagImage') // Populate send currency details
//             .populate('receiveCurrency', 'code flagImage') // Populate receive currency details
//             // Select the fields needed for the transaction list display
//             .select('recipient sendCurrency receiveCurrency sendAmount receiveAmount status createdAt updatedAt sourceAccount reason reference exchangeRate fees failureReason') // Added fees, failureReason, updatedAt, sourceAccount
//             .sort({ createdAt: -1 }); // Sort by creation date, newest first

//         console.log(`Service: getUserTransfers - Found ${transfers.length} transfers for user ${userId}.`);
//         return transfers;
//     } catch (error) {
//         console.error(`Service: getUserTransfers - Error fetching transfers for user ${userId}:`, error);
//         throw new Error('Failed to retrieve transfer history.'); // Throw a generic error message
//     }
// };


// const cancelTransfer = async (transferId, userId) => {
//     console.log(`Service: cancelTransfer - Attempting to cancel transfer ${transferId} for user ${userId}`);
//     if (!mongoose.Types.ObjectId.isValid(transferId)) {
//         console.warn(`Service: cancelTransfer - Invalid transfer ID format: ${transferId}`);
//         throw new Error('Invalid transfer ID format.');
//     }

//     const session = await mongoose.startSession();
//     let populatedTransfer = null; // To hold the final result

//     try {
//         session.startTransaction();
//         console.log(`Service: cancelTransfer - Transaction started for ${transferId}.`);

//         // Fetch the transfer within the transaction, ensuring it belongs to the user
//         // Select the sourceAccount and sendAmount fields which are needed for the refund logic
//         const transfer = await Transfer.findOne({ _id: transferId, user: userId }).select('status sourceAccount sendAmount').session(session);

//         if (!transfer) {
//             console.warn(`Service: cancelTransfer - Transfer ${transferId} not found or access denied for user ${userId}.`);
//             // No need to abort if nothing was found before starting ops
//             // await session.abortTransaction(); // Not strictly needed here but safe
//             throw new Error('Transfer not found or access denied.');
//         }

//         // --- Strict status check for user cancellation ---
//         // Users can ONLY cancel if the status is 'pending'
//         if (transfer.status !== 'pending') {
//             await session.abortTransaction(); // Abort transaction as the condition failed
//             console.warn(`Service: cancelTransfer - User ${userId} attempted to cancel transfer ${transferId} with non-pending status: ${transfer.status}. Cancellation blocked.`);
//             // Throw a specific, user-friendly error message that the controller handles
//             throw new Error(`Cannot cancel transfer: Status is already '${transfer.status}'. Only pending transfers can be cancelled.`);
//         }
//         // --- End Strict status check ---

//         // --- Refunding Logic (Only runs if status IS 'pending') ---
//         console.log(`Service: cancelTransfer - Transfer ${transferId} is pending. Proceeding with cancellation and refund.`);

//         // Check if refund is necessary and possible
//         if (transfer.sourceAccount && transfer.sendAmount > 0) {
//              console.log(`Service: cancelTransfer - Fetching source account ${transfer.sourceAccount} for refund.`);
//             const sourceAccount = await Account.findById(transfer.sourceAccount).session(session);
//             if (!sourceAccount) {
//                 console.error(`Service: cancelTransfer - Critical error: Source account ${transfer.sourceAccount} not found for transfer ${transferId} during refund.`);
//                 await session.abortTransaction(); // Abort due to critical inconsistency
//                 throw new Error('Failed to cancel transfer: Source account data inconsistency.'); // Specific error for data issue
//             }
//             // Add the sent amount back to the balance + any fees if they were deducted initially
//             // Assuming fees were deducted along with sendAmount at executeTransfer step
//             const totalAmountRefund = transfer.sendAmount + (transfer.fees ?? 0); // Refund send amount + fees
//             sourceAccount.balance += totalAmountRefund; // Add back the total amount deducted
//             await sourceAccount.save({ session });
//             console.log(`Service: cancelTransfer - Refunded ${totalAmountRefund.toFixed(2)} to account ${transfer.sourceAccount} within transaction.`);
//         } else {
//              // This case should ideally not happen if status is 'pending' and sendAmount > 0
//              console.warn(`Service: cancelTransfer - Refund condition met for transfer ${transferId}, but source account or send amount is invalid/zero (${transfer.sourceAccount}, ${transfer.sendAmount}). Skipping refund step.`);
//              // Depending on business logic, this might warrant an error or just a warning.
//              // For now, log warning and proceed with status update.
//         }
//         // --- End Refunding Logic ---


//         // Update the transfer status to 'canceled'
//         // Re-fetch the transfer with all fields needed for the final response population
//         const updatedTransfer = await Transfer.findById(transferId).session(session); // Fetch the full document
//         if (!updatedTransfer) { // Should not happen after the initial findOne, but safeguard
//              await session.abortTransaction();
//              throw new Error('Failed to retrieve transfer for status update.');
//         }
//         updatedTransfer.status = 'canceled';
//         updatedTransfer.updatedAt = new Date();
//         updatedTransfer.failureReason = updatedTransfer.failureReason || 'Cancelled by user.'; // Keep existing reason if it failed before cancellation

//         await updatedTransfer.save({ session });
//         console.log(`Service: cancelTransfer - Transfer status updated to 'canceled' for ${transferId}.`);

//         // Commit the transaction if all steps (fetch, balance update if needed, status update) were successful
//         await session.commitTransaction();
//         console.log(`Service: cancelTransfer - Transfer ${transferId} successfully cancelled. Transaction committed.`);

//         // Populate the updated transfer details *after* the transaction is committed
//         // Use the updatedTransfer document fetched within the transaction
//         populatedTransfer = await Transfer.findById(updatedTransfer._id) // Use updatedTransfer._id which is guaranteed to exist
//             .populate('user', 'fullName email') // Populate user but select basic fields
//             // Populate sourceAccount, but only currency details needed for display
//             .populate({ path: 'sourceAccount', select: 'currency', populate: { path: 'currency', select: 'code flagImage' } })
//             // Populate recipient, selecting necessary fields and currency details
//             .populate({ path: 'recipient', select: 'accountHolderName nickname currency accountNumber bankName', populate: { path: 'currency', select: 'code flagImage' } })
//             // Explicitly populate send/receive currency fields
//             .populate('sendCurrency', 'code flagImage')
//             .populate('receiveCurrency', 'code flagImage');

//         if (!populatedTransfer) {
//              console.error(`Service: cancelTransfer - Failed to populate transfer after cancellation for ID ${updatedTransfer._id}.`);
//              // This is an unusual state, indicates a potential issue after commitment, but the core ops succeeded.
//              // Decide if you want to throw here or just return the unpopulated one with a warning.
//              // Throwing might be safer if frontend expects populated data.
//              throw new Error('Transfer cancelled, but failed to retrieve full details.');
//         }
//          console.log(`Service: cancelTransfer - Transfer ${transferId} successfully cancelled and populated.`);


//     } catch (error) {
//         // If any error occurs during the try block and the session is active, abort the transaction
//         if (session.inTransaction()) {
//             await session.abortTransaction();
//              console.error(`Service: cancelTransfer - Transaction aborted due to error for ${transferId}:`, error);
//         } else {
//             console.error(`Service: cancelTransfer - Error occurred outside active transaction for ${transferId}:`, error);
//         }

//         // Rethrow the specific error or a generic one
//         // --- Ensure specific cancellation error is re-thrown ---
//         if (error.message.startsWith('Cannot cancel transfer') ||
//             error.message.startsWith('Transfer not found') ||
//             error.message.startsWith('Invalid transfer ID') ||
//             error.message.includes('Source account data inconsistency') || // Added specific check
//              error.message.startsWith('Failed to retrieve transfer') // Added for new failure case
//            ) {
//             throw error; // Keep specific, expected errors for controller handling
//         }
//         // --- End Ensure specific cancellation error is re-thrown ---
//         console.error(`Service: cancelTransfer - Catching unexpected error:`, error); // Log the error before throwing generic
//         throw new Error(`Failed to cancel transfer: An unexpected error occurred.`); // Generic failure message for unexpected errors
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
import exchangeRateService from './exchangeRate.service.js';
import mongoose from 'mongoose';

// Helper to get Live Rate (REVISED for direct INR rates)
const getLiveRate = async (sendCurrencyCode, receiveCurrencyCode) => {
    console.log(`Service: getLiveRate - Fetching live rate for ${sendCurrencyCode}/${receiveCurrencyCode}`);
    try {
        // This service call now fetches rates scraped from Google Finance against INR
        // The structure is { rates: { EUR: 94.26, USD: 84.81, ... } }
        const latestRatesDocument = await exchangeRateService.getLatestExchangeRates();

        // Check if the main 'rates' object (containing the individual currency rates) exists
        if (!latestRatesDocument?.rates || typeof latestRatesDocument.rates !== 'object') {
            console.warn(`Service: getLiveRate - Live rates data structure is invalid or 'rates' object is missing for ${sendCurrencyCode}/${receiveCurrencyCode}. Document:`, latestRatesDocument);
            return null;
        }

        // This is the object like { EUR: 94.26, USD: 84.81, ... }
        const actualRatesMap = latestRatesDocument.rates;

        // --- MODIFIED LOGIC FOR DIRECT INR RATES ---
        let liveRate = null;

        if (sendCurrencyCode === receiveCurrencyCode) {
            liveRate = 1; // Rate is 1 if sending and receiving the same currency
        } else if (receiveCurrencyCode === 'INR') {
            // If receiving INR, the rate for sendCurrencyCode is directly its value in INR
            liveRate = actualRatesMap[sendCurrencyCode] ? parseFloat(actualRatesMap[sendCurrencyCode]) : null;
            if (liveRate !== null) {
                 console.log(`Service: getLiveRate - Direct rate ${sendCurrencyCode}/INR: ${liveRate}`);
            } else {
                 console.warn(`Service: getLiveRate - Rate for ${sendCurrencyCode}/INR not found in map:`, actualRatesMap);
            }
        } else if (sendCurrencyCode === 'INR') {
            // If sending INR, the rate is 1 / (receiveCurrencyCode to INR rate)
            const rateReceiveToINR = actualRatesMap[receiveCurrencyCode] ? parseFloat(actualRatesMap[receiveCurrencyCode]) : null;
            if (rateReceiveToINR !== null && rateReceiveToINR !== 0) {
                liveRate = 1 / rateReceiveToINR;
                 console.log(`Service: getLiveRate - Calculated rate INR/${receiveCurrencyCode} (1/${rateReceiveToINR}): ${liveRate}`);
            } else {
                 console.warn(`Service: getLiveRate - Rate for ${receiveCurrencyCode}/INR not found or zero for INR/${sendCurrencyCode} conversion. Map:`, actualRatesMap);
            }
        } else {
            // Cross-currency conversion (e.g., USD to EUR) via INR
            // (USD to INR) / (EUR to INR) = USD to EUR
            const rateSendToINR = actualRatesMap[sendCurrencyCode] ? parseFloat(actualRatesMap[sendCurrencyCode]) : null;
            const rateReceiveToINR = actualRatesMap[receiveCurrencyCode] ? parseFloat(actualRatesMap[receiveCurrencyCode]) : null;

            if (rateSendToINR !== null && rateReceiveToINR !== null && rateReceiveToINR !== 0) {
                liveRate = rateSendToINR / rateReceiveToINR; // This calculates Send/Receive via INR
                // The above line is incorrect for Send/Receive. It should be (Receive in INR) / (Send in INR) if you want Send/Receive.
                // Example: USD to EUR: (EUR/INR) / (USD/INR) is NOT USD/EUR.
                // It should be (USD/INR) / (EUR/INR) to get USD per EUR value *if rates are relative to common denom*
                // But our rates are already TO INR.
                // So if you want USD to EUR: you need (USD_TO_INR) / (EUR_TO_INR) to get how many EUR for 1 USD value (INCORRECT)
                // Correct: (Rate of Send Currency to INR) / (Rate of Receive Currency to INR) = Value of Send Currency in terms of Receive Currency
                // e.g. (USD/INR) / (EUR/INR) = USD/EUR
                // liveRate = rateSendToINR / rateReceiveToINR; THIS IS WRONG.

                // If you want the rate as "1 unit of SendCurrency = X units of ReceiveCurrency":
                // Rate = (Rate of SendCurrency to INR) / (Rate of ReceiveCurrency to INR)
                // Example: USD to EUR. Send: USD, Receive: EUR
                // (USD/INR) / (EUR/INR)  = (84.81) / (94.26) = 0.90 USD per EUR (approx) -> This is how many USD for 1 EUR.
                // We want: 1 USD = X EUR. So it's rateSendToINR / rateReceiveToINR.
                liveRate = rateSendToINR / rateReceiveToINR;
                 console.log(`Service: getLiveRate - Cross rate ${sendCurrencyCode}/${receiveCurrencyCode} via INR: (${rateSendToINR} / ${rateReceiveToINR}) = ${liveRate}`);
            } else {
                 console.warn(`Service: getLiveRate - Missing rates for cross-currency ${sendCurrencyCode}/${receiveCurrencyCode} via INR. SendRate: ${rateSendToINR}, ReceiveRate: ${rateReceiveToINR}. Map:`, actualRatesMap);
            }
        }
        // --- END MODIFIED LOGIC ---

        if (liveRate !== null && !isNaN(liveRate) && isFinite(liveRate) && liveRate > 0) {
            // Round to a sensible number of decimal places for exchange rates.
            // 6 decimal places is common for intermediate calculations.
            // For display, 2-4 is typical. Let's keep more precision here.
            const preciseRate = parseFloat(liveRate.toFixed(6)); // Increased precision
            console.log(`Service: getLiveRate - Final precise rate for ${sendCurrencyCode}/${receiveCurrencyCode}: ${preciseRate}`);
            return preciseRate;
        }

        console.warn(`Service: getLiveRate - Could not calculate a valid live rate for ${sendCurrencyCode}/${receiveCurrencyCode}. Result: ${liveRate}`);
        return null;

    } catch (error) {
        console.error(`Service: getLiveRate - Error fetching live rate for ${sendCurrencyCode}/${receiveCurrencyCode}:`, error.message, error.stack);
        return null;
    }
};

// --- Calculate Send Summary (Adjusted for potentially more precise live rate) ---
const calculateSendSummary = async (userId, sourceAccountId, recipientId, amount, isSendingAmount) => {
    console.log('Service: calculateSendSummary - Start', { userId, sourceAccountId, recipientId, amount, isSendingAmount });

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
    console.log(`Service: calculateSendSummary - Currencies: Send=${sendCurrencyCode}, Receive=${receiveCurrencyCode}`);

    // 2. Get Live Exchange Rate (getLiveRate now returns rate with more precision)
    const liveExchangeRate = await getLiveRate(sendCurrencyCode, receiveCurrencyCode); // e.g., 94.267890 for EUR/INR
    if (liveExchangeRate === null || liveExchangeRate <= 0 || !isFinite(liveExchangeRate)) {
        console.error(`Service: calculateSendSummary - Failed to fetch valid live exchange rate for ${sendCurrencyCode}/${receiveCurrencyCode}. Rate from getLiveRate: ${liveExchangeRate}`);
        throw new Error(`Live exchange rate is currently unavailable for ${sendCurrencyCode} to ${receiveCurrencyCode}. Please try again later.`);
    }
    console.log(`Service: calculateSendSummary - Fetched Live Rate (more precision): ${liveExchangeRate}`);

    // 3. Get Rate Adjustment Percentage from Source Currency
    const adjustmentPercent = sourceCurrencyDoc.rateAdjustmentPercentage ?? 0;
    console.log(`Service: calculateSendSummary - Source Adjustment: ${adjustmentPercent}%`);

    // 4. Calculate Adjusted Rate (use precise live rate for calculation)
    let adjustedExchangeRate = liveExchangeRate * (1 + adjustmentPercent / 100);
    // Round the *final adjusted rate* to a sensible number of decimal places for storage/use in transfer.
    // 4 decimal places is a good balance for financial rates.
    adjustedExchangeRate = parseFloat(adjustedExchangeRate.toFixed(2));
    console.log(`Service: calculateSendSummary - Adjusted Rate (Rounded to 4dp): ${adjustedExchangeRate}`);

    if (adjustedExchangeRate <= 0 || !isFinite(adjustedExchangeRate)) {
        console.error(`Service: calculateSendSummary - Invalid adjusted rate calculated: ${adjustedExchangeRate} from live rate ${liveExchangeRate} and adjustment ${adjustmentPercent}%`);
        throw new Error("An error occurred calculating the final exchange rate after adjustment.");
    }

    // 5. Calculate Amounts based on the *Rounded Adjusted Rate*
    let sendAmountCalc, receiveAmountCalc;
    const numericAmount = parseFloat(String(amount)); // Ensure amount is a number

    if (isSendingAmount) {
        sendAmountCalc = numericAmount;
        receiveAmountCalc = sendAmountCalc * adjustedExchangeRate;
    } else {
        receiveAmountCalc = numericAmount;
        sendAmountCalc = receiveAmountCalc / adjustedExchangeRate;
    }

    // 6. Check Balance
    const currentSourceAccount = await Account.findById(sourceAccountId);
    if (!currentSourceAccount) {
         throw new Error('Source account could not be re-verified.');
    }
    // Round sendAmountCalc to 2 decimal places *for comparison with balance only*
    if (currentSourceAccount.balance < parseFloat(sendAmountCalc.toFixed(2))) {
        const available = currentSourceAccount.balance;
        console.warn(`Service: calculateSendSummary - Insufficient balance. Required: ${sendAmountCalc.toFixed(2)}, Available: ${available.toFixed(2)}`);
        throw new Error('Insufficient balance.');
    }

    // 7. Construct Summary
    const summary = {
        userId: userId.toString(),
        sourceAccountId: sourceAccountId.toString(),
        recipientId: recipientId.toString(),
        // Final amounts should be strictly 2 decimal places for currency values
        sendAmount: parseFloat(sendAmountCalc.toFixed(2)),
        receiveAmount: parseFloat(receiveAmountCalc.toFixed(2)),
        sendCurrencyCode,
        receiveCurrencyCode,
        // Store the adjusted rate rounded to 4 decimal places used for calculations
        exchangeRate: adjustedExchangeRate,
        // Store the original live rate (more precision) for informational purposes if needed
        liveExchangeRate: parseFloat(liveExchangeRate.toFixed(6)), // Store live rate with more precision
        rateAdjustmentApplied: adjustmentPercent,
        availableBalance: parseFloat(currentSourceAccount.balance.toFixed(2)),
    };
    console.log('Service: calculateSendSummary - Success', summary);
    return summary;
};

// ... (rest of transfer.service.js: executeTransfer, getTransferDetails, getUserTransfers, cancelTransfer)
// These other functions generally don't need changes related to this specific rate fetching issue,
// as they consume the `exchangeRate` provided by `calculateSendSummary` or stored in the Transfer model.
// Ensure executeTransfer uses the `exchangeRate` from the summary for consistency.

// --- executeTransfer (Ensure it uses the rate from summary or recalculates consistently) ---
const executeTransfer = async (transferDetails) => {
    console.log('Service: executeTransfer - Start', transferDetails);
    // Ensure exchangeRate is correctly passed from frontend summary
    const { userId, sourceAccountId, recipientId, sendAmount, receiveAmount, exchangeRate, reason, reference, sendCurrencyCode, receiveCurrencyCode } = transferDetails;

    // Basic validation (from your existing code)
    if (!userId || !sourceAccountId || !recipientId || sendAmount === undefined || receiveAmount === undefined || exchangeRate === undefined || !sendCurrencyCode || !receiveCurrencyCode) {
        throw new Error("Missing essential transfer information.");
    }
    if (isNaN(sendAmount) || sendAmount <= 0 || isNaN(receiveAmount) || receiveAmount <= 0 || isNaN(exchangeRate) || exchangeRate <= 0) {
        throw new Error("Invalid amount or exchange rate.");
    }

    const session = await mongoose.startSession();
    let populatedTransfer = null;

    try {
        session.startTransaction();
        const sourceAccount = await Account.findOne({ _id: sourceAccountId, user: userId }).session(session).populate('currency');
        const recipient = await Recipient.findOne({ _id: recipientId, user: userId }).session(session).populate('currency');

        if (!sourceAccount) throw new Error('Source account not found or access denied.');
        if (!recipient) throw new Error('Recipient not found or access denied.');
        if (sourceAccount.currency.code !== sendCurrencyCode) throw new Error('Source currency mismatch.');
        if (recipient.currency.code !== receiveCurrencyCode) throw new Error('Recipient currency mismatch.');

        // Use the sendAmount rounded to 2 decimal places for balance check and deduction
        const finalSendAmount = parseFloat(sendAmount.toFixed(2));
        if (sourceAccount.balance < finalSendAmount) throw new Error('Insufficient balance.');

        sourceAccount.balance -= finalSendAmount;
        await sourceAccount.save({ session });

        const newTransfer = new Transfer({
            user: userId,
            sourceAccount: sourceAccountId,
            recipient: recipientId,
            sendAmount: finalSendAmount, // Use 2dp rounded sendAmount
            receiveAmount: parseFloat(receiveAmount.toFixed(2)), // Use 2dp rounded receiveAmount
            sendCurrency: sourceAccount.currency._id,
            receiveCurrency: recipient.currency._id,
            exchangeRate: parseFloat(exchangeRate.toFixed(4)), // Store rate with 4dp
            fees: 0, // Assuming fees are handled elsewhere or included in rate
            reason: reason || null,
            reference: reference || null,
            status: 'pending', // Or 'processing' if it goes directly to processing
            createdAt: new Date(),
            updatedAt: new Date(),
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
             console.error('Service: executeTransfer - Error, transaction aborted.', error);
        } else {
             console.error('Service: executeTransfer - Error occurred outside transaction.', error);
        }
        throw error;
    } finally {
        session.endSession();
        console.log('Service: executeTransfer - Session ended.');
    }
    return populatedTransfer;
};


// --- getTransferDetails, getUserTransfers, cancelTransfer (No changes from previous steps are strictly needed for this specific rate fix) ---
// Ensure cancelTransfer's refund logic correctly uses transfer.sendAmount which should be stored with 2dp.
const getTransferDetails = async (transferId, userId) => {
    console.log(`Service: getTransferDetails - Fetching transfer ${transferId} for user ${userId}`);
    if (!mongoose.Types.ObjectId.isValid(transferId)) { throw new Error('Invalid transfer ID format.'); }
    const transfer = await Transfer.findOne({ _id: transferId, user: userId })
        .populate('user', 'fullName email')
        .populate({ path: 'sourceAccount', select: 'currency', populate: { path: 'currency', select: 'code flagImage' } })
        .populate({ path: 'recipient', select: 'accountHolderName nickname currency accountNumber bankName', populate: { path: 'currency', select: 'code flagImage' } })
        .populate('sendCurrency', 'code flagImage')
        .populate('receiveCurrency', 'code flagImage');
    if (!transfer) { throw new Error('Transfer not found or access denied.'); }
    return transfer;
};

const getUserTransfers = async (userId) => {
    console.log(`Service: getUserTransfers - Fetching transfers for user ${userId}`);
    try {
        const transfers = await Transfer.find({ user: userId })
            .populate('recipient', 'accountHolderName nickname')
            .populate('sendCurrency', 'code flagImage')
            .populate('receiveCurrency', 'code flagImage')
            .select('recipient sendCurrency receiveCurrency sendAmount receiveAmount status createdAt sourceAccount reason reference exchangeRate')
            .sort({ createdAt: -1 });
        return transfers;
    } catch (error) {
        console.error(`Service: getUserTransfers - Error fetching transfers for user ${userId}:`, error);
        throw new Error('Failed to retrieve transfer history.');
    }
};

const cancelTransfer = async (transferId, userId) => {
    console.log(`Service: cancelTransfer - Attempting to cancel transfer ${transferId} for user ${userId}`);
    if (!mongoose.Types.ObjectId.isValid(transferId)) {
        throw new Error('Invalid transfer ID format.');
    }

    const session = await mongoose.startSession();
    let populatedTransfer = null;

    try {
        session.startTransaction();
        const transfer = await Transfer.findOne({ _id: transferId, user: userId }).session(session);

        if (!transfer) {
            throw new Error('Transfer not found or access denied.');
        }
        if (transfer.status !== 'pending') {
            await session.abortTransaction();
            console.warn(`Service: cancelTransfer - User ${userId} attempted to cancel transfer ${transferId} with non-pending status: ${transfer.status}. Cancellation blocked.`);
            throw new Error(`Cannot cancel transfer: Status is already '${transfer.status}'. Only pending transfers can be cancelled.`);
        }

        console.log(`Service: cancelTransfer - Transfer ${transferId} is pending. Proceeding with cancellation and refund.`);
        // Refund logic assumes sendAmount is positive
        if (transfer.sourceAccount && transfer.sendAmount > 0) {
            const sourceAccount = await Account.findById(transfer.sourceAccount).session(session);
            if (!sourceAccount) {
                console.error(`Service: cancelTransfer - Critical error: Source account ${transfer.sourceAccount} not found for transfer ${transferId}.`);
                await session.abortTransaction();
                throw new Error('Failed to cancel transfer: Source account data inconsistency.');
            }
            sourceAccount.balance += transfer.sendAmount; // transfer.sendAmount should be 2dp
            await sourceAccount.save({ session });
            console.log(`Service: cancelTransfer - Refunded ${transfer.sendAmount} to account ${transfer.sourceAccount} within transaction.`);
        } else if (transfer.sourceAccount) { // Only log if sourceAccount exists but sendAmount is not > 0
             console.warn(`Service: cancelTransfer - Refund condition met for transfer ${transferId}, but send amount is not positive. Skipping refund step. Send Amount: ${transfer.sendAmount}`);
        }

        transfer.status = 'canceled';
        transfer.updatedAt = new Date();
        transfer.failureReason = transfer.failureReason || 'Cancelled by user.';
        await transfer.save({ session });

        await session.commitTransaction();
        console.log(`Service: cancelTransfer - Transfer ${transferId} successfully cancelled and refunded. Transaction committed.`);

        populatedTransfer = await Transfer.findById(transfer._id)
            .populate('user', 'fullName email')
            .populate({ path: 'sourceAccount', select: 'currency', populate: { path: 'currency', select: 'code flagImage' } })
            .populate({ path: 'recipient', select: 'accountHolderName nickname currency accountNumber bankName', populate: { path: 'currency', select: 'code flagImage' } })
            .populate('sendCurrency', 'code flagImage')
            .populate('receiveCurrency', 'code flagImage');

    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
            console.error(`Service: cancelTransfer - Error during cancellation transaction for ${transferId}, transaction aborted:`, error);
        } else {
             console.error(`Service: cancelTransfer - Error occurred for ${transferId} outside active transaction:`, error);
        }
        if (error.message.startsWith('Cannot cancel transfer') ||
            error.message.startsWith('Transfer not found') ||
            error.message.startsWith('Invalid transfer ID') ||
            error.message.includes('Source account data inconsistency')) {
            throw error;
        }
        throw new Error(`Failed to cancel transfer: ${error.message}`);
    } finally {
        session.endSession();
         console.log(`Service: cancelTransfer - Session ended for transfer ${transferId}.`);
    }
    return populatedTransfer;
};


export default {
    calculateSendSummary,
    executeTransfer,
    getTransferDetails,
    getUserTransfers,
    cancelTransfer,
};