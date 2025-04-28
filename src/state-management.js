// This file contains functions for managing the script's state history (Undo/Redo).
// Depends on: Global State (undoStack, redoStack, isFilling - declared in main script),
// Constants (UNDO_STACK_SIZE - defined in constants.js),
// DOM Helpers (getPackInputs - defined in dom-helpers.js),
// Performance (batchInputUpdates - defined in performance.js),
// Visual Feedback (showToast - defined in feedback.js),
// UI Panel Management (updatePanelUI - defined in ui-panel.js)


/**
 * Records the current state of all pack input values onto the undo stack.
 * Clears the redo stack when a new state is recorded.
 * Depends on: getPackInputs, undoStack, redoStack, UNDO_STACK_SIZE, updatePanelUI
 */
function recordState() {
    const state = getPackInputs().map(i => i.value);
    // Only record if the current state is different from the last state on the undo stack
    // This prevents recording identical states if no changes were made.
    if (undoStack.length === 0 || JSON.stringify(state) !== JSON.stringify(undoStack[0])) {
         undoStack = [state, ...undoStack].slice(0, UNDO_STACK_SIZE);
         redoStack = []; // Clear the redo stack because a new action occurred
         console.log(`Pack Filler Pro: Recorded state. Undo stack size: ${undoStack.length}, Redo stack size: ${redoStack.length}`);
         updatePanelUI(); // Update the UI (e.g., enable/disable undo/redo buttons)
    } else {
         console.log("Pack Filler Pro: Current state identical to last, not recording.");
    }
}

/**
 * Applies the last recorded state from the undo stack.
 * Moves the current state onto the redo stack.
 * Depends on: undoStack, redoStack, isFilling, getPackInputs, batchInputUpdates, showToast, updatePanelUI
 */
function applyUndo() {
    if (undoStack.length === 0) {
        showToast('No more states to undo', 'warning');
        return;
    }
     if (isFilling) {
         showToast('Cannot undo while an update is in progress.', 'warning');
         return;
     }

    // Record current state before undoing, so it can be redone later
    const currentState = getPackInputs().map(i => i.value);
    redoStack.unshift(currentState); // Push current state onto the redo stack
    redoStack = redoStack.slice(0, UNDO_STACK_SIZE); // Limit redo stack size

    // Get and remove the state to apply from the undo stack
    const stateToApply = undoStack.shift();
    console.log(`Pack Filler Pro: Applying undo state. Remaining undo stack: ${undoStack.length}, Redo stack: ${redoStack.length}`);

    // Apply the state using the batch update function for performance
    batchInputUpdates(getPackInputs(), stateToApply, () => {
         showToast('Undo applied (Ctrl+Z)', 'success');
         updatePanelUI(); // Update button states after batch update completes
    });
}

/**
 * Applies the last state from the redo stack.
 * Moves the current state onto the undo stack.
 * Depends on: redoStack, undoStack, isFilling, getPackInputs, batchInputUpdates, showToast, updatePanelUI
 */
function applyRedo() {
      if (redoStack.length === 0) {
           showToast('No more states to redo', 'warning');
           return;
      }
       if (isFilling) {
          showToast('Cannot redo while an update is in progress.', 'warning');
          return;
      }

      // Record current state before redoing, so it can be undone again
      const currentState = getPackInputs().map(i => i.value);
      undoStack.unshift(currentState); // Push current state onto the undo stack
      undoStack = undoStack.slice(0, UNDO_STACK_SIZE); // Limit undo stack size


      // Get and remove the state to apply from the redo stack
      const stateToApply = redoStack.shift();
      console.log(`Pack Filler Pro: Applying redo state. Remaining undo stack: ${undoStack.length}, Redo stack: ${redoStack.length}`);

      // Apply the state using the batch update function
      batchInputUpdates(getPackInputs(), stateToApply, () => {
           showToast('Redo applied (Ctrl+Y or Ctrl+Shift+Z)', 'success');
           updatePanelUI(); // Update button states after batch update completes
      });
}

// Note: Global state variables (undoStack, redoStack, isFilling) are declared in the main script's IIFE.
// Functions in this file will operate on those global variables.
// Dependencies on other modules are noted in the JSDoc comments.
