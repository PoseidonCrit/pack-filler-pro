// This file contains the core logic for calculating quantities and filling the pack inputs.
// Depends on: Global State (config, isFilling - declared in main script),
// Constants (MAX_QTY - defined in constants.js),
// Config Management (config - loaded into global state),
// DOM Helpers (getPackInputs, clearAllInputs - defined in dom-helpers.js),
// State Management (recordState - defined in state-management.js),
// Performance (batchInputUpdates - defined in performance.js),
// Visual Feedback (showToast - defined in feedback.js)


/**
 * Calculates the number of packs to fill based on the selected mode and available inputs.
 * @param {string} mode - The filling mode ('fixed', 'max', 'unlimited', 'clear').
 * @param {number|string} requestedCount - The count specified by the user (relevant for 'fixed' and 'max').
 * @param {number} availablePackCount - The total number of pack inputs found on the page.
 * @returns {number} The actual number of packs to fill.
 */
function calculateFillCount(mode, requestedCount, availablePackCount) {
    // If 'unlimited' or 'clear' mode, the target is all available packs.
    if (mode === 'unlimited' || mode === 'clear') {
        return availablePackCount;
    }
    // Otherwise, calculate based on requested count, ensuring it's a valid number.
    const count = parseInt(requestedCount, 10); // Parse the user's input
     if (isNaN(count) || count <= 0) {
         // If the parsed count is invalid or zero, we fill 0 packs.
         return 0;
     }
    // Return the minimum of the valid requested count and the available packs.
    return Math.min(count, availablePackCount);
}

/**
 * Determines the quantity to set for a single pack based on the selected mode and config.
 * Handles clamping quantities within the valid range [0, MAX_QTY].
 * @param {string} mode - The filling mode ('fixed', 'max', 'unlimited', 'clear').
 * @param {number|string} fixedQty - The fixed quantity from config (used for 'fixed' and 'unlimited').
 * @param {number|string} minQty - The minimum quantity from config (used for 'max'/'random').
 * @param {number|string} maxQty - The maximum quantity from config (used for 'max'/'random').
 * @returns {number} The calculated quantity for a pack.
 * Depends on: Constants (MAX_QTY)
 */
function chooseQuantity(mode, fixedQty, minQty, maxQty) {
    // Parse quantities from config, providing defaults if invalid AFTER getting from config.
    const fQty = parseInt(fixedQty, 10);
    const mnQty = parseInt(minQty, 10);
    const mxQty = parseInt(maxQty, 10);

    switch (mode) {
        case 'fixed':
        case 'unlimited': // 'unlimited' mode uses the 'fixedQty' field for its quantity setting.
            // Clamp quantity, defaulting invalid inputs to 0.
            return Math.min(Math.max(isNaN(fQty) ? 0 : fQty, 0), MAX_QTY);
        case 'max': // 'max' mode corresponds to the Random Range UI settings.
            // Ensure min <= max, defaulting invalid inputs. Clamp range bounds.
            const min = Math.min(Math.max(isNaN(mnQty) ? 0 : mnQty, 0), MAX_QTY); // Default min to 0 if invalid
            const max = Math.min(Math.max(isNaN(mxQty) ? 0 : mxQty, 0), MAX_QTY); // Default max to 0 if invalid
             // Ensure effective min <= effective max for the random range calculation.
            const effectiveMin = Math.min(min, max);
            const effectiveMax = Math.max(min, max);

            // Generate a random integer between effectiveMin and effectiveMax (inclusive).
            return Math.floor(Math.random() * (effectiveMax - effectiveMin + 1)) + effectiveMin;
        case 'clear': // 'clear' mode explicitly sets quantity to 0.
             return 0;
        default:
             console.warn(`Pack Filler Pro: Unknown fill mode: ${mode}. Using default quantity 0.`);
            return 0; // Fallback quantity for unknown modes.
    }
}

/**
 * The main function to trigger the pack filling process based on current configuration.
 * Handles getting inputs, recording state, clearing (if configured), calculating quantities,
 * and using batch updates to apply changes. Provides detailed feedback via toasts.
 * Depends on: Global State (config, isFilling), Constants (MAX_QTY),
 * DOM Helpers (getPackInputs, clearAllInputs), State Management (recordState),
 * Performance (batchInputUpdates), Visual Feedback (showToast), calculateFillCount, chooseQuantity
 */
function fillPacks() {
    // Prevent starting a new fill operation if one is already in progress.
    if (isFilling) {
         showToast('Pack update in progress, please wait.', 'warning');
         return;
    }

    // Destructure config for easier access to current settings.
    const { lastMode: mode, lastCount: count, lastFixedQty: fixedQty, lastMinQty: minQty, lastMaxQty: maxQty, lastClear: clear } = config;

    // Get all currently visible pack input elements.
    const inputs = getPackInputs();
    const availablePacks = inputs.length; // Total pack inputs found on the page

    // Abort if no pack inputs are found.
    if (availablePacks === 0) {
        showToast('No pack inputs found on the page.', 'error');
        console.error("Fill operation aborted: No pack inputs found.");
        return;
    }

    // Record the current state *before* making any changes for undo functionality.
    recordState(); // Depends on 'state-management.js'. Ensure it's required before fill-logic.js.

    // Clear inputs if requested BEFORE calculating 'toFill' (as clearing affects all inputs).
    if (clear) {
         console.log("Fill operation: Clearing inputs before filling.");
         // clearAllInputs handles setting values to 0 and dispatching events.
         // We pass false for recordUndo here because we already recorded the state above.
        clearAllInputs(false); // Depends on 'dom-helpers.js'. Ensure it's required before fill-logic.js.
    }


    // Calculate how many packs to fill based on the selected mode and available inputs.
    const toFill = calculateFillCount(mode, count, availablePacks);

    // Abort if the calculated number of packs to fill is zero.
    if (toFill === 0) {
         let reason = "";
         const parsedCount = parseInt(count, 10);
         if ((mode === 'fixed' || mode === 'max') && (isNaN(parsedCount) || parsedCount <= 0)) {
              reason = `The requested count (${count}) is zero or invalid.`;
         } else if (availablePacks === 0) {
             reason = "No pack inputs found on the page."; // Should ideally be caught by the check above
         } else {
              reason = "Calculated fill count is zero (unexpected state).";
         }
         showToast(`Nothing to fill. ${reason}`, 'warning'); // Depends on 'feedback.js'. Ensure it's required before fill-logic.js.
         console.warn(`Fill operation aborted: Nothing to fill. Reason: ${reason}`);
         return;
    }

    console.log(`Pack Filler Pro: Filling packs with mode: ${mode}, target count: ${toFill}/${availablePacks}`);

    const valuesToSet = [];

    // Determine the quantity for each input up to the 'toFill' count.
    inputs.forEach((input, index) => {
        let value = parseInt(input.value, 10) || 0; // Get current value or 0 as a starting point

        if (index < toFill) { // Only apply the fill logic to the targeted number of packs
            // Choose quantity based on mode and config, clamped within [0, MAX_QTY].
             value = chooseQuantity(mode, fixedQty, minQty, maxQty); // Depends on chooseQuantity (defined above)
        }
        // If index >= toFill or the mode doesn't set quantities (like 'clear' if not using the checkbox),
        // the value remains the original value (or 0 if parsing failed).
        valuesToSet.push(value);
    });

    // Use the batch update function to apply the calculated values to the DOM inputs.
    batchInputUpdates(inputs, valuesToSet, () => { // Depends on 'performance.js'. Ensure it's required before fill-logic.js.
         // This callback runs AFTER the batch update is visually complete.
         // Provide detailed feedback using toasts.
         let feedbackModeDesc = "";
         let feedbackQuantityDesc = "";

         switch (mode) {
             case 'fixed':
                 feedbackModeDesc = `Fixed Count`;
                 // Re-clamp fixedQty for feedback clarity in case user entered invalid number
                 feedbackQuantityDesc = `Set ${toFill} pack(s) to ${Math.min(Math.max(parseInt(fixedQty, 10) || 0, 0), MAX_QTY)} copies each.`;
                 break;
             case 'max': // Corresponds to Random Range mode in the UI
                 feedbackModeDesc = `Random Range`;
                  // Re-clamp min/max for feedback clarity
                  const mn = Math.min(Math.max(parseInt(minQty, 10) || 0, 0), MAX_QTY);
                  const mx = Math.min(Math.max(parseInt(maxQty, 10) || 0, 0), MAX_QTY);
                 feedbackQuantityDesc = `Set ${toFill} pack(s) to random copies (${Math.min(mn,mx)}-${Math.max(mn,mx)}) each.`;
                 break;
             case 'unlimited':
                 feedbackModeDesc = `All Visible`;
                 // Re-clamp fixedQty for feedback clarity
                 feedbackQuantityDesc = `Set all ${toFill} visible pack(s) to ${Math.min(Math.max(parseInt(fixedQty, 10) || 0, 0), MAX_QTY)} copies each.`;
                 break;
             case 'clear': // 'clear' mode in the select box triggers this logic path
                  feedbackModeDesc = `Clear Only`;
                  feedbackQuantityDesc = `Set ${toFill} pack(s) to 0 copies each.`;
                  break;
             default:
                 feedbackModeDesc = `Mode: ${mode}`; // Fallback for unexpected modes
                 feedbackQuantityDesc = `Filled ${toFill} pack(s).`;
         }

         const clearStatus = clear ? " (Cleared First)" : ""; // Add clear status if checkbox was checked
         const successMessage = `✅ Fill Complete!${clearStatus}<br>` +
                                `Mode: ${feedbackModeDesc}<br>` +
                                `Targeted: ${toFill} / ${availablePacks} pack inputs<br>` +
                                `Action: ${feedbackQuantityDesc}`;

         showToast(successMessage, 'success', TOAST_DURATION + 2000); // Show success toast (depends on 'feedback.js')
         console.log(`Pack Filler Pro: ${successMessage.replace(/<br>/g, ' | ')}`); // Log summary to console
    });
}

// Note: Global variables (config, isFilling) are declared in the main script's IIFE.
// Functions in this file will operate on those global variables.
// Dependencies on other modules are noted in the JSDoc comments.
