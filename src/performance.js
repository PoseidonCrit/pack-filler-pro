// This file contains functions aimed at improving performance,
// specifically for updating multiple DOM elements efficiently.
// Depends on: Global State (isFilling - declared in main script),
// DOM Helpers (updateInput - defined in dom-helpers.js),
// UI Panel Management (updatePanelUI - defined in ui-panel.js)


/**
 * Updates multiple input elements in batches using requestAnimationFrame.
 * This can lead to smoother visual updates compared to updating all elements synchronously.
 * Sets and clears the global 'isFilling' flag.
 * @param {HTMLInputElement[]} inputs - An array of input elements to update.
 * @param {string[]} values - An array of corresponding values to set. Must match the inputs array length.
 * @param {function} [onComplete] - A callback function to execute after all updates are complete.
 * Depends on: isFilling, updateInput, updatePanelUI
 */
function batchInputUpdates(inputs, values, onComplete) {
    if (inputs.length !== values.length) {
        console.error('Pack Filler Pro: Input and value arrays must match size for batch update.');
        // Call completion callback even on error
        if (onComplete) onComplete();
        return;
    }

    console.log(`Pack Filler Pro: Starting batch update for ${inputs.length} inputs.`);
    let i = 0;
    const totalInputs = inputs.length;

    // Set the flag to indicate an update is in progress and update the UI
    isFilling = true;
    updatePanelUI(); // updatePanelUI depends on 'ui-panel.js'. Ensure it's required before performance.js.

    function updateNext() {
        if (i < totalInputs) {
             // Only update if the value is different to minimize DOM writes
            if (parseInt(inputs[i].value, 10) !== parseInt(values[i], 10)) { // Compare as numbers
                 // Use the updateInput helper to ensure events are dispatched
                 updateInput(inputs[i], values[i]); // updateInput depends on 'dom-helpers.js'. Ensure it's required before performance.js.
            }
            i++;
            // Schedule the next update for the next animation frame.
            // This yields control back to the browser, allowing it to render between updates.
            requestAnimationFrame(updateNext);
        } else {
             // All inputs updated
             console.log('Pack Filler Pro: Batch input update complete.');
             // Clear the flag and update the UI
             isFilling = false;
             // Call the completion callback if provided
             if (onComplete) onComplete();
             updatePanelUI(); // updatePanelUI depends on 'ui-panel.js'. Ensure it's required before performance.js.
        }
    }

    // Start the update process
    updateNext();
}

// Note: The global 'isFilling' variable is declared in the main script's IIFE.
// Functions in this file will operate on that global variable.
// Dependencies on other modules are noted in the JSDoc comments.
