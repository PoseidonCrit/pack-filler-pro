// This file contains global event listeners, such as keyboard shortcuts.
// Depends on: State Management (applyUndo, applyRedo - defined in state-management.js)


/**
 * Adds global event listeners to the document.
 * Currently includes keyboard shortcuts for Undo (Ctrl+Z) and Redo (Ctrl+Y or Ctrl+Shift+Z).
 * Depends on: applyUndo, applyRedo
 */
function addGlobalEventListeners() {
    // Listen for keydown events on the entire document.
    document.addEventListener('keydown', (e) => {
        // Check if the Control key (or Command key on macOS) is pressed.
        if (e.ctrlKey || e.metaKey) { // e.metaKey is for Command key on Mac

             // --- Undo Shortcut: Ctrl+Z (or Cmd+Z) ---
            // Check if the pressed key is 'z' AND the Shift key is NOT pressed.
            if (e.key === 'z' && !e.shiftKey) {
                e.preventDefault(); // Prevent the browser's default undo action.
                applyUndo(); // Call the undo function (defined in state-management.js).
            }

             // --- Redo Shortcuts: Ctrl+Y (or Cmd+Y) OR Ctrl+Shift+Z (or Cmd+Shift+Z) ---
            // Check if the pressed key is 'y' OR if the pressed key is 'Z' (which is Shift+z) AND Shift is pressed.
            if (e.key === 'y' || (e.key === 'Z' && e.shiftKey)) {
                 e.preventDefault(); // Prevent the browser's default redo or undo action.
                 applyRedo(); // Call the redo function (defined in state-management.js).
            }
        }
        // Add other global keyboard shortcuts here if needed in the future.
    });

    console.log('Pack Filler Pro: Global event listeners added.');
}

// Immediately call the function to add the listeners when this script file is loaded.
addGlobalEventListeners();

// Note: This file defines and immediately calls the addGlobalEventListeners function.
// It depends on the applyUndo and applyRedo functions from state-management.js.
// Ensure state-management.js is required before event-listeners.js in the main script.
