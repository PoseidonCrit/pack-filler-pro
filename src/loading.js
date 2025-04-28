// This file contains logic for automatically loading all packs on the page.
// It attempts to use site-specific methods (like clicking a 'Load More' button)
// and falls back to scrolling. It also uses a MutationObserver to detect new packs.
// Depends on: Global State (config - declared in main script),
// Constants (SELECTOR - defined in constants.js),
// DOM Helpers (safeQuery, getPackInputs - defined in dom-helpers.js),
// Visual Feedback (showToast - defined in feedback.js),
// UI Enhancements (addTooltips - defined in tooltips.js)


// NOTE: The selectors for site-specific elements (like the 'Load More' button
// and loading spinner) MUST be verified and corrected for the target website
// (ygoprodeck.com/pack-sim/).


/**
 * Attempts to automatically load all packs on the page if the 'loadFullPage'
 * configuration option is enabled.
 * Uses a combination of clicking a 'Load More' button (if found) and scrolling
 * to trigger content loading. Uses a MutationObserver to detect when new packs
 * are added to the DOM.
 * Depends on: config, showToast, getPackInputs, safeQuery, addTooltips, waitForElement
 */
async function loadFullPageIfNeeded() {
    // Check if the auto-load feature is enabled in the configuration.
    if (!config.loadFullPage) {
        console.log("Pack Filler Pro: Auto-load full page is disabled in config.");
        return; // Exit the function if disabled
    }

    showToast('Auto-loading full page...', 'info'); // Notify the user that loading is starting
    console.log("Pack Filler Pro: Attempting to auto-load full page...");

    const initialCount = getPackInputs().length; // Get the initial number of packs
    let lastCount = initialCount; // Keep track of the pack count to detect new packs
    let loadAttempts = 0; // Counter to prevent infinite loading loops
    const maxLoadAttempts = 100; // Maximum number of loading attempts
    const loadButtonSelector = '.load-more-btn'; // *** VERIFY THIS SELECTOR ON THE TARGET SITE ***
    const loadingSpinnerSelector = 'selector-for-loading-spinner'; // *** VERIFY THIS SELECTOR IF SPINNER EXISTS ***
    let loadButtonUsed = false; // Flag to track if we successfully clicked the load button


    // Use a MutationObserver to detect when new pack input elements are added to the DOM.
    // This is a reliable way to know *if* content is being loaded and when it stops.
    const observer = new MutationObserver((mutationsList, obs) => {
         let inputsAdded = 0;
         mutationsList.forEach(mutation => {
             if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                 mutation.addedNodes.forEach(node => {
                     // Check if the added node is or contains a pack input element.
                     // node.matches is a safe way to check if the node itself matches the selector.
                     if (node.matches && node.matches(SELECTOR)) {
                         inputsAdded++;
                         // Add tooltips to the parent element of the newly added input, as the input itself
                         // might not be the element the tooltip should attach to (e.g., a container div).
                         addTooltips(node.parentElement || node); // addTooltips depends on 'tooltips.js'.
                     } else if (node.querySelector) {
                         // If the added node is a container, check for pack inputs inside it.
                         const newInputs = node.querySelectorAll(SELECTOR);
                         if (newInputs.length > 0) {
                             inputsAdded += newInputs.length;
                             newInputs.forEach(input => addTooltips(input.parentElement || input)); // Add tooltips
                         }
                     }
                 });
             }
         });

         if (inputsAdded > 0) {
              const currentCount = getPackInputs().length;
              // Only show a toast if the *total* pack count has increased since the last check.
              // This helps debounce rapid updates during fast loading.
              if (currentCount > lastCount) {
                 // showToast(`Loaded ${currentCount - lastCount} new packs`, 'info', 1500); // Can be too noisy during fast loading
                 lastCount = currentCount; // Update the last count
                 console.log(`Pack Filler Pro: Mutation Observer detected ${inputsAdded} new input(s). Total packs: ${currentCount}`);
              }
              // Optionally, re-apply tooltips globally here if the node-specific calls above
              // are insufficient for some reason, but be mindful of performance.
              // addTooltips();
         }
    });

    // Start observing the document body for additions to child nodes and their descendants.
    observer.observe(document.body, { childList: true, subtree: true });
    console.log('Pack Filler Pro: MutationObserver started for auto-loading.');

    // --- Loading Loop Strategy ---
    // We loop, attempting to trigger loading by clicking a button or scrolling.
    // We check for new content after each attempt. The loop continues as long as
    // new content is detected or we haven't reached the maximum number of attempts.
    let loadInProgress = true;
    while(loadInProgress && loadAttempts < maxLoadAttempts) {
        const currentPackCount = getPackInputs().length; // Get current count before attempting to load more
        console.log(`Pack Filler Pro: Auto-load loop ${loadAttempts + 1}. Packs found: ${currentPackCount}.`);

        const loadButton = safeQuery(loadButtonSelector); // Check for the 'Load More' button
        // Check for a loading indicator (spinner, message, etc.) if one exists on the site.
        const isLoadingIndicatorVisible = safeQuery(loadingSpinnerSelector)?.offsetParent !== null; // offsetParent !== null checks if element is visible

        if (isLoadingIndicatorVisible) {
             // If a loading indicator is visible, wait for it to disappear.
             console.log('Pack Filler Pro: Loading indicator visible, waiting...');
             await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
             loadAttempts++; // Count waiting as an attempt
             continue; // Skip to the next iteration to re-check button/scroll after waiting
        }

        if (loadButton && !loadButton.disabled && loadButton.offsetParent !== null) {
            // If the 'Load More' button exists, is visible, and is not disabled, click it.
            console.log('Pack Filler Pro: Load More button clickable, clicking...');
            loadButton.click(); // Trigger the button click
            loadButtonUsed = true; // Mark that we used the button strategy
            loadAttempts++; // Increment attempt counter
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for the click to trigger content loading
        } else {
            // If the button is not found, not clickable, or we've already used it and it's gone, try scrolling.
            const currentHeight = document.body.scrollHeight; // Get the current scroll height
            window.scrollTo(0, currentHeight); // Scroll to the bottom of the page
            console.log(`Pack Filler Pro: Scrolling to bottom. Height: ${currentHeight}.`);
            loadAttempts++; // Increment attempt counter
            await new Promise(resolve => setTimeout(resolve, 800)); // Wait for scroll animation and potential load
            const newHeight = document.body.scrollHeight; // Get the new scroll height

            // Check if new content was loaded, either by the button click or by scrolling.
            const newPackCount = getPackInputs().length; // Get the pack count again
            if (newPackCount > currentPackCount || newHeight > currentHeight) {
                // If the pack count increased or the page height increased, new content was loaded.
                console.log(`Pack Filler Pro: Detected new content. Pack count: ${newPackCount}. Height: ${newHeight}.`);
                loadAttempts = 0; // Reset attempts if progress is made
                lastCount = newPackCount; // Update last count for the observer toast check
            } else {
                // No new content detected in this attempt.
                console.log('Pack Filler Pro: No new content detected this attempt.');
                // Continue loop, attempts counter will eventually reach maxLoadAttempts.
            }

             // Determine if we should stop the loading loop.
             const updatedLoadButton = safeQuery(loadButtonSelector); // Re-check the button state
             const stillClickable = updatedLoadButton && !updatedLoadButton.disabled && updatedLoadButton.offsetParent !== null;

             if (loadButtonUsed && !stillClickable && newPackCount === currentPackCount && newHeight === currentHeight) {
                  // If we used the button, it's now gone/disabled, and no new content appeared, assume loading is done.
                  console.log('Pack Filler Pro: Button used, now gone/disabled, and no new content. Assuming done.');
                  loadInProgress = false; // Exit loop
             } else if (!loadButtonUsed && newPackCount === currentPackCount && newHeight === currentHeight) {
                 // If we didn't use the button (or it wasn't found) and scrolling didn't add new content, assume loading is done.
                 console.log('Pack Filler Pro: No button used, scrolling added no new content. Assuming done.');
                 loadInProgress = false; // Exit loop
             }
             // Otherwise, loadInProgress remains true and the loop continues if attempts < maxLoadAttempts.
        }
    }

    // Disconnect the MutationObserver once the loading loop has finished.
    observer.disconnect();
    console.log('Pack Filler Pro: MutationObserver disconnected. Auto-load process finished.');

    // Provide final feedback to the user.
    const finalCount = getPackInputs().length;
     if (finalCount === initialCount) {
          showToast('Auto-loading finished. No new packs found beyond initial.', 'info');
     } else {
          showToast(`Auto-loading finished. Total packs found: ${finalCount}`, 'success');
     }

     // A final pass to ensure all elements have tooltips after loading settles,
     // in case the observer missed any or tooltips need re-initialization.
     addTooltips(); // addTooltips depends on 'tooltips.js'.
}

/**
 * Helper function to wait for an element to appear in the DOM.
 * Uses a MutationObserver to efficiently detect element presence without polling.
 * @param {string} selector - The CSS selector for the element to wait for.
 * @param {number} [timeout=10000] - Maximum time to wait in milliseconds before rejecting.
 * @returns {Promise<Element|null>} A promise that resolves with the element when found,
 * or rejects if the timeout is reached.
 */
function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const observer = new MutationObserver((mutations, obs) => {
            const element = document.querySelector(selector);
            if (element) {
                obs.disconnect(); // Stop observing once found
                clearTimeout(timer); // Clear the timeout
                resolve(element); // Resolve the promise with the found element
            }
        });

        // Start observing the document body for additions to child nodes and their descendants.
        // This is efficient as it only runs when the DOM changes.
        observer.observe(document.body, { childList: true, subtree: true });

        // Also check immediately in case the element is already present in the initial DOM.
        const element = document.querySelector(selector);
        if (element) {
            observer.disconnect(); // Stop observing
            resolve(element); // Resolve immediately
            return;
        }

        // Set a timeout to stop observing and reject the promise if the element is not found within the time limit.
        const timer = setTimeout(() => {
            observer.disconnect(); // Stop observing
            // Reject the promise with an error message.
            reject(new Error(`Timeout waiting for element: ${selector}`));
        }, timeout);
    });
}

// Note: This file defines the loadFullPageIfNeeded and waitForElement functions.
// It depends on global state (config), constants, DOM helpers, feedback, and tooltips modules.
// Ensure these dependencies are required before loading.js in the main script.
