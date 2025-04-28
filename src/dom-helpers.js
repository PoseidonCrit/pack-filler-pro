// This file contains helper functions for interacting with the DOM,
// particularly for finding and updating pack input elements.
// Depends on: Constants (SELECTOR, MAX_QTY - defined in constants.js),
// Global State (isFilling - indirectly via clearAllInputs, declared in main script),
// State Management (recordState - via clearAllInputs, defined in state-management.js),
// Performance (batchInputUpdates - via clearAllInputs, defined in performance.js),
// Visual Feedback (showToast - via clearAllInputs, defined in feedback.js)


/**
 * Safely queries the DOM for a single element.
 * @param {string} selector - The CSS selector string.
 * @param {Element} [parent=document] - The parent element to search within.
 * @returns {Element|null} The found element or null if not found.
 */
function safeQuery(selector, parent = document) {
    const el = parent.querySelector(selector);
    // Optional: Log a warning if element is missing. Can be noisy during development.
    // if (!el) { console.warn(`Pack Filler Pro: Element missing: ${selector}`); }
    return el;
}

/**
 * Safely queries the DOM for all elements matching a selector.
 * @param {string} selector - The CSS selector string.
 * @param {Element} [parent=document] - The parent element to search within.
 * @returns {Element[]} An array of found elements (empty array if none found).
 */
function safeQueryAll(selector, parent = document) {
     const els = parent.querySelectorAll(selector);
     // Optional: Log a warning if no elements are found. Can be noisy.
     // if (!els.length) { console.warn(`Pack Filler Pro: No elements found for: ${selector}`); }
     return Array.from(els); // Convert NodeList to Array
}

/**
 * Gets all currently visible pack input elements on the page.
 * @returns {HTMLInputElement[]} An array of pack input elements.
 */
function getPackInputs() {
    // Query the DOM for currently visible pack inputs using the global SELECTOR constant.
    return safeQueryAll(SELECTOR);
}

/**
 * Updates a single input element's value and dispatches necessary events.
 * Clamps the quantity to be within the valid range [0, MAX_QTY].
 * @param {HTMLInputElement} input - The input element to update.
 * @param {number|string} qty - The desired quantity value.
 */
function updateInput(input, qty) {
    // Ensure qty is a number within bounds [0, MAX_QTY] using the global MAX_QTY constant.
    const v = Math.min(Math.max(parseInt(qty, 10) || 0, 0), MAX_QTY);
    const valueStr = String(v);
    // Only update and dispatch events if the value actually changes to avoid unnecessary work.
    if (input.value !== valueStr) {
        input.value = valueStr;
        // Dispatch 'input' and 'change' events to ensure the website's own JavaScript
        // framework (like React, Vue, etc.) detects the change and updates its state/UI.
        // bubbles: true allows the event to bubble up the DOM tree.
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }
}

/**
 * Sets the value of all currently visible pack inputs to 0.
 * Optionally records the state before clearing for undo functionality.
 * @param {boolean} [recordUndo=true] - Whether to record the state before clearing.
 * Depends on: getPackInputs, updateInput, recordState (defined in state-management.js),
 * batchInputUpdates (defined in performance.js), showToast (defined in feedback.js)
 */
function clearAllInputs(recordUndo = true) {
    const inputs = getPackInputs();
    if (inputs.length === 0) {
         console.log("Clear All: No pack inputs found to clear.");
         // showToast is called here, but depends on 'feedback.js'.
         // Ensure feedback.js is required before dom-helpers.js if you uncomment this.
         // showToast('No pack inputs found to clear.', 'warning');
         return;
    }

    // recordState depends on 'state-management.js'. Ensure it's required before this file.
    if (recordUndo) recordState();

    const valuesToSet = Array(inputs.length).fill(0);

    // batchInputUpdates depends on 'performance.js'. Ensure it's required before this file.
    batchInputUpdates(inputs, valuesToSet, () => {
         // showToast is called here, but depends on 'feedback.js'.
         // Ensure feedback.js is required before dom-helpers.js if you uncomment this.
         // showToast(`Cleared ${inputs.length} pack input(s).`, 'success');
    });
}

// Note: This file defines functions. They will be available in the scope
// where this file is @required. Global variables like 'config' or state stacks
// are assumed to be declared in the main script's IIFE or other required files.
