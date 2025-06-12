// // backend/src/utils/scrapeAllRatesAgainstINR.js
// // Import the specific browser you want to use (e.g., chromium, firefox, webkit)
// import { chromium } from 'playwright'; // We'll use chromium

// // --- Configuration ---
// const GOOGLE_FINANCE_BASE_URL = 'https://www.google.com/finance/quote/'; // Append CURRENCY_CODE-INR

// // Selector (STILL NEEDS TO BE VERIFIED FOR CONSISTENCY ACROSS PAGES!)
// // Find a selector that works for the main rate on pages like USD-INR, EUR-INR, GBP-INR, etc.
// // Inspect the element on multiple pages to confirm.
// const RATE_SELECTOR = 'div[data-last-price]'; // This is a common pattern, but VERIFY IT IS CORRECT AND CONSISTENT!
// // Example alternative (likely unstable):
// // const RATE_SELECTOR = '.YMlKec.fxKbKc'; // This class is very likely to change and might not be consistent across all pairs!


// // --- Scraper Function ---
// /**
//  * Scrapes exchange rates for a list of target currencies against INR from Google Finance using Playwright.
//  * @param {string[]} targetCurrencyCodes - Array of currency codes (e.g., ['USD', 'EUR', 'GBP'])
//  * @returns {Promise<{[currencyCode: string]: number} | null>} An object mapping currency code to rate (e.g., { USD: 84.70, EUR: 94.05 }), or null if major failure occurs.
//  */
// async function scrapeAllRatesAgainstINR(targetCurrencyCodes) {
//     if (!targetCurrencyCodes || targetCurrencyCodes.length === 0) {
//         console.log('Scraper: No target currency codes provided.');
//         return {}; // Return empty object if no currencies to scrape
//     }

//     let browser;
//     let context; // Playwright uses contexts
//     const scrapedRates = {};
//     const failedScrapes = [];

//     console.log('Scraper: Starting Playwright browser (Chromium)...');
//     try {
//         browser = await chromium.launch({
//             headless: true, // Use true for production
//             args: [
//                 '--no-sandbox',
//                 '--disable-setuid-sandbox',
//                 '--disable-dev-shm-usage',
//                 '--disable-accelerated-2d-canvas',
//                 '--no-first-run',
//                 '--no-zygote',
//                 '--disable-gpu'
//             ]
//         });
//         // Create a new browser context for isolation
//         context = await browser.newContext({
//              userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' // Set user agent
//              // Add other context options if needed (like permissions, ignoreHTTPSErrors)
//         });

//         const page = await context.newPage(); // Create a new page within the context


//         // --- Iterate and Scrape Each Currency ---
//         for (const code of targetCurrencyCodes) {
//             const url = `${GOOGLE_FINANCE_BASE_URL}${code}-INR`;
//             console.log(`Scraper: Navigating to ${url}`);

//             try {
//                 // Use goto with 'domcontentloaded', increased timeout
//                 await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 }); // Increased timeout

//                 console.log(`Scraper: Waiting for rate selector: ${RATE_SELECTOR}`);
//                 // Wait for the rate element to be visible
//                 // Playwright's waitForSelector is powerful, 'state: "visible"' is good.
//                 await page.waitForSelector(RATE_SELECTOR, { state: 'visible', timeout: 15000 }); // Increased timeout

//                 console.log(`Scraper: Selector found for ${code}-INR. Extracting data...`);

//                 // Extract the rate using page.evaluate()
//                 // This is similar to Puppeteer's page.$eval
//                 const rateText = await page.evaluate((selector) => {
//                     const el = document.querySelector(selector);
//                     if (el) {
//                         // Try data-last-price attribute first, then text content
//                         return el.getAttribute('data-last-price') || el.textContent.trim();
//                     }
//                     return null; // Return null if element not found within evaluate
//                 }, RATE_SELECTOR); // Pass the selector to the evaluate function

//                 if (rateText === null) {
//                      console.warn(`Scraper: Selector ${RATE_SELECTOR} not found on page for ${code}-INR after waiting.`);
//                      failedScrapes.push(code);
//                      continue; // Skip to the next currency
//                 }

//                 const rate = parseFloat(rateText);

//                 if (isNaN(rate)) {
//                     console.warn(`Scraper: Extracted value "${rateText}" for ${code}-INR is not a number. Skipping.`);
//                     failedScrapes.push(code);
//                 } else {
//                     // Store the rate, using the target currency code as the key
//                     scrapedRates[code] = rate;
//                     console.log(`Scraper: Scraped ${code}/INR rate: ${rate}`);
//                 }

//             } catch (error) {
//                 console.error(`Scraper: Error scraping ${code}/INR from ${url}:`, error.message);
//                 failedScrapes.push(code);
//                 // Continue to the next currency even if one fails
//             }
//         }

//         console.log('Scraper: Scraping iteration completed.');
//         if (failedScrapes.length > 0) {
//             console.warn('Scraper: Failed to scrape rates for:', failedScrapes.join(', '));
//         }

//         // Check if any rates were successfully scraped
//         if (Object.keys(scrapedRates).length === 0 && targetCurrencyCodes.length > 0) {
//             console.error('Scraper: No rates were successfully scraped for any currency.');
//             // Return null or throw an error if no data at all is considered a critical failure
//             return null;
//         }

//         console.log('Scraper: Returning scraped rates object:', scrapedRates);
//         return scrapedRates; // Return the object of successfully scraped rates

//     } catch (browserError) {
//         console.error('Scraper: Major error during browser setup or navigation:', browserError);
//         // Return null or throw an error if the browser itself fails
//         return null;
//     } finally {
//         if (context) { // Close context first
//              await context.close();
//         }
//         if (browser) { // Then close the browser
//             await browser.close();
//             console.log('Scraper: Playwright browser closed.');
//         }
//     }
// }

// export default scrapeAllRatesAgainstINR;


// backend/src/utils/scrapeAllRatesAgainstINR.js
// Import the specific browser you want to use (e.g., chromium, firefox, webkit)
import { chromium } from 'playwright'; // We'll use chromium

// --- Configuration ---
const GOOGLE_FINANCE_BASE_URL = 'https://www.google.com/finance/quote/'; // Append CURRENCY_CODE-INR

// Selector (STILL NEEDS TO BE VERIFIED FOR CONSISTENCY ACROSS PAGES!)
// Find a selector that works for the main rate on pages like USD-INR, EUR-INR, GBP-INR, etc.
// Inspect the element on multiple pages to confirm.
const RATE_SELECTOR = 'div[data-last-price]'; // This is a common pattern, but VERIFY IT IS CORRECT AND CONSISTENT!
// Example alternative (likely unstable):
// const RATE_SELECTOR = '.YMlKec.fxKbKc'; // This class is very likely to change and might not be consistent across all pairs!


// --- Scraper Function ---
/**
 * Scrapes exchange rates for a list of target currencies against INR from Google Finance using Playwright.
 * @param {string[]} targetCurrencyCodes - Array of currency codes (e.g., ['USD', 'EUR', 'GBP'])
 * @returns {Promise<{[currencyCode: string]: number} | null>} An object mapping currency code to rate (e.g., { USD: 84.70, EUR: 94.05 }), or null if major failure occurs.
 */
async function scrapeAllRatesAgainstINR(targetCurrencyCodes) {
    if (!targetCurrencyCodes || targetCurrencyCodes.length === 0) {
        console.log('Scraper: No target currency codes provided.');
        return {}; // Return empty object if no currencies to scrape
    }

    let browser;
    let context; // Playwright uses contexts
    const scrapedRates = {};
    const failedScrapes = [];

    console.log('Scraper: Starting Playwright browser (Chromium)...');
    try {
        browser = await chromium.launch({
            headless: true, // Use true for production
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        });
        // Create a new browser context for isolation
        context = await browser.newContext({
             userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' // Set user agent
             // Add other context options if needed (like permissions, ignoreHTTPSErrors)
        });


        // --- Iterate and Scrape Each Currency ---
        for (const code of targetCurrencyCodes) {
            const url = `${GOOGLE_FINANCE_BASE_URL}${code}-INR`;
            console.log(`Scraper: Navigating to ${url}`);

            let page; // Declare page here, will be created for each currency
            try {
                page = await context.newPage(); // <--- Create a NEW page for each currency
                
                // Use goto with 'domcontentloaded', increased timeout
                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 }); // Increased timeout

                console.log(`Scraper: Waiting for rate selector: ${RATE_SELECTOR}`);
                // Wait for the rate element to be visible
                await page.waitForSelector(RATE_SELECTOR, { state: 'visible', timeout: 15000 }); // Increased timeout

                console.log(`Scraper: Selector found for ${code}-INR. Extracting data...`);

                // Extract the rate using page.evaluate()
                const rateText = await page.evaluate((selector) => {
                    const el = document.querySelector(selector);
                    if (el) {
                        // Try data-last-price attribute first, then text content
                        return el.getAttribute('data-last-price') || el.textContent.trim();
                    }
                    return null; // Return null if element not found within evaluate
                }, RATE_SELECTOR); // Pass the selector to the evaluate function

                if (rateText === null) {
                     console.warn(`Scraper: Selector ${RATE_SELECTOR} not found on page for ${code}-INR after waiting.`);
                     failedScrapes.push(code);
                     continue; // Skip to the next currency
                }

                const rate = parseFloat(rateText);

                if (isNaN(rate)) {
                    console.warn(`Scraper: Extracted value "${rateText}" for ${code}-INR is not a number. Skipping.`);
                    failedScrapes.push(code);
                } else {
                    // Store the rate, using the target currency code as the key
                    scrapedRates[code] = rate;
                    console.log(`Scraper: Scraped ${code}/INR rate: ${rate}`);
                }

            } catch (error) {
                console.error(`Scraper: Error scraping ${code}/INR from ${url}:`, error.message);
                failedScrapes.push(code);
                // Continue to the next currency even if one fails
            } finally { // <--- IMPORTANT: Ensure each page is closed after use
                if (page) {
                    try {
                        await page.close();
                    } catch (closeError) {
                        console.warn(`Scraper: Error closing page for ${code}:`, closeError.message);
                    }
                }
            }
        }

        console.log('Scraper: Scraping iteration completed.');
        if (failedScrapes.length > 0) {
            console.warn('Scraper: Failed to scrape rates for:', failedScrapes.join(', '));
        }

        // Check if any rates were successfully scraped
        if (Object.keys(scrapedRates).length === 0 && targetCurrencyCodes.length > 0) {
            console.error('Scraper: No rates were successfully scraped for any currency.');
            // Return null or throw an error if no data at all is considered a critical failure
            return null;
        }

        console.log('Scraper: Returning scraped rates object:', scrapedRates);
        return scrapedRates; // Return the object of successfully scraped rates

    } catch (browserError) {
        console.error('Scraper: Major error during browser setup or navigation:', browserError);
        // Return null or throw an error if the browser itself fails
        return null;
    } finally {
        if (context) { // Close context first
             await context.close();
        }
        if (browser) { // Then close the browser
            await browser.close();
            console.log('Scraper: Playwright browser closed.');
        }
    }
}

export default scrapeAllRatesAgainstINR;

// // backend/src/utils/scrapeAllRatesAgainstINR.js
// import { chromium } from 'playwright';

// const GOOGLE_FINANCE_BASE_URL = 'https://www.google.com/finance/quote/';
// // This selector is CRITICAL. It MUST be present and contain the rate on ALL currency pages (USD-INR, EUR-INR, etc.)
// // If it varies, you'll need a more complex selector strategy.
// const RATE_SELECTOR = 'div[data-last-price]';

// async function scrapeAllRatesAgainstINR(targetCurrencyCodes) {
//     if (!targetCurrencyCodes || targetCurrencyCodes.length === 0) {
//         console.log('Scraper: No target currency codes provided.');
//         return {};
//     }

//     let browser;
//     let context;
//     const scrapedRates = {};
//     const failedScrapes = [];

//     console.log(`Scraper: Starting Playwright browser to scrape ${targetCurrencyCodes.length} currencies...`);
//     try {
//         browser = await chromium.launch({
//             headless: true, // Set to false for visual debugging when a currency fails
//             args: [
//                 '--no-sandbox',
//                 '--disable-setuid-sandbox',
//                 '--disable-dev-shm-usage',
//                 '--disable-accelerated-2d-canvas',
//                 '--no-first-run',
//                 '--no-zygote',
//                 '--disable-gpu'
//             ]
//         });
//         context = await browser.newContext({
//              userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36', // Slightly updated UA
//              // Consider setting a viewport if headless behavior differs
//              // viewport: { width: 1280, height: 800 }
//         });
//         const page = await context.newPage();

//         for (const code of targetCurrencyCodes) {
//             const url = `${GOOGLE_FINANCE_BASE_URL}${code}-INR`;
//             console.log(`Scraper: Navigating to ${url} for ${code}`);

//             try {
//                 // Try 'networkidle' as it's often more reliable for JS-heavy pages, but can be slower.
//                 // Increased timeout for navigation.
//                 await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });

//                 console.log(`Scraper: Waiting for rate selector: "${RATE_SELECTOR}" for ${code}-INR`);
//                 // Increased timeout for selector.
//                 await page.waitForSelector(RATE_SELECTOR, { state: 'visible', timeout: 30000 });

//                 console.log(`Scraper: Selector found for ${code}-INR. Extracting data...`);
//                 const rateText = await page.evaluate((selector) => {
//                     const el = document.querySelector(selector);
//                     if (el) {
//                         // Prefer data-last-price, fallback to textContent
//                         return el.getAttribute('data-last-price') || el.textContent?.trim(); // Added optional chaining
//                     }
//                     console.warn(`Scraper (evaluate): Element with selector "${selector}" not found in DOM after waitForSelector.`);
//                     return null; // Element not found by querySelector inside evaluate
//                 }, RATE_SELECTOR);

//                 if (rateText === null || rateText.trim() === "") { // Check for empty string too
//                      console.warn(`Scraper: Extracted rateText is null or empty for ${code}-INR. Selector: "${RATE_SELECTOR}"`);
//                      failedScrapes.push(code);
//                      // --- START DEBUGGING FOR SPECIFIC FAILURE ---
//                      if (code === 'USD') { // Or any currency that consistently fails
//                          console.log(`Scraper: DEBUG - Taking screenshot and getting content for ${code} due to null/empty rateText.`);
//                          await page.screenshot({ path: `debug_${code}_rateText_null.png`, fullPage: true });
//                          console.log(`Scraper: DEBUG - Screenshot saved: debug_${code}_rateText_null.png`);
//                          const pageContent = await page.content();
//                          console.log(`Scraper: DEBUG - Page content for ${code} (first 2000 chars): \n`, pageContent.substring(0, 2000));
//                      }
//                      // --- END DEBUGGING ---
//                      continue; // Move to next currency
//                 }

//                 const rate = parseFloat(rateText);

//                 if (isNaN(rate)) {
//                     console.warn(`Scraper: Extracted value "${rateText}" for ${code}-INR is not a number. Skipping.`);
//                     failedScrapes.push(code);
//                     // --- START DEBUGGING FOR SPECIFIC FAILURE ---
//                      if (code === 'USD') {
//                          console.log(`Scraper: DEBUG - Taking screenshot and getting content for ${code} due to NaN parse. Original text: "${rateText}"`);
//                          await page.screenshot({ path: `debug_${code}_nan_parse.png`, fullPage: true });
//                          console.log(`Scraper: DEBUG - Screenshot saved: debug_${code}_nan_parse.png`);
//                          const pageContent = await page.content();
//                          console.log(`Scraper: DEBUG - Page content for ${code} (first 2000 chars): \n`, pageContent.substring(0, 2000));
//                      }
//                      // --- END DEBUGGING ---
//                 } else {
//                     scrapedRates[code] = rate;
//                     console.log(`Scraper: Scraped ${code}/INR rate: ${rate}`);
//                 }

//             } catch (error) {
//                 console.error(`Scraper: Error scraping ${code}/INR from ${url}. Message: ${error.message}`);
//                 if (error.stack) console.error("Scraper: Stack trace:", error.stack); // Log stack for more details
//                 failedScrapes.push(code);

//                 // --- START DEBUGGING FOR SPECIFIC FAILURE (IN CATCH BLOCK) ---
//                 if (code === 'USD') { // Or any currency that consistently fails
//                      console.log(`Scraper: DEBUG - Taking screenshot and getting content for ${code} due to error in try block.`);
//                      try {
//                         await page.screenshot({ path: `debug_${code}_error_catch.png`, fullPage: true });
//                         console.log(`Scraper: DEBUG - Screenshot saved: debug_${code}_error_catch.png`);
//                         const pageContent = await page.content();
//                         console.log(`Scraper: DEBUG - Page content for ${code} (first 2000 chars): \n`, pageContent.substring(0, 2000));
//                      } catch (debugPageError) {
//                          console.error(`Scraper: DEBUG - Error while trying to get debug info for ${code}:`, debugPageError.message);
//                      }
//                  }
//                  // --- END DEBUGGING ---
//             }
//         }

//         console.log('Scraper: Scraping iteration completed.');
//         if (failedScrapes.length > 0) {
//             console.warn('Scraper: Failed to scrape rates for:', failedScrapes.join(', '));
//         }
//         if (Object.keys(scrapedRates).length === 0 && targetCurrencyCodes.length > 0) {
//             console.error('Scraper: No rates were successfully scraped for any currency.');
//             return null; // Or consider throwing an error if this is critical
//         }
//         console.log('Scraper: Returning scraped rates object:', scrapedRates);
//         return scrapedRates;

//     } catch (browserError) {
//         console.error('Scraper: Major error during browser setup or initial navigation:', browserError.message);
//         if (browserError.stack) console.error("Scraper: Browser error stack:", browserError.stack);
//         return null; // Or throw
//     } finally {
//         if (context) {
//             try { await context.close(); } catch (e) { console.error("Scraper: Error closing context", e.message); }
//         }
//         if (browser) {
//             try { await browser.close(); } catch (e) { console.error("Scraper: Error closing browser", e.message); }
//         }
//         console.log('Scraper: Playwright browser closed.');
//     }
// }

// export default scrapeAllRatesAgainstINR;