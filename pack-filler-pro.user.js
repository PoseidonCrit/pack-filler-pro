// ==UserScript==
// @name         🎴 Pack Filler Pro v19.0
// @namespace    https://ygoprodeck.com
// @version      19.0
// @description  Advanced pack filling with robust config, beautiful UI, Undo/Redo, Presets, and Full Page Loading.
// @author       5n0 & Gemini
// @match        https://ygoprodeck.com/pack-sim/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_log
// @require      https://unpkg.com/tippy.js@6.3.7/dist/tippy-bundle.umd.js
//
// @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/constants.js
// @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/config.js
// @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/dom-helpers.js
// @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/state-management.js
// @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/performance.js
// @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/fill-logic.js
// @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/presets.js
// @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/feedback.js
// @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/loading.js
// @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/tooltips.js
// @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/ui-panel-html.js
// @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/ui-css.js
// @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/ui-draggable.js
// @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/ui-panel.js
// @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/event-listeners.js // Global Event Listeners
//
// ==/UserScript==

// This is the main entry point of the script.
// The code from all @require directives will be loaded and executed before this IIFE runs.
// All functions and variables defined in the required files (outside of their own IIFEs if any)
// will be available within this IIFE's scope.
(function() {
    'use strict';

    // --- Global State Variables ---
    // These variables are declared here in the main script's IIFE scope
    // so they can be accessed and modified by functions from different required modules.
    let config = {}; // Holds the current configuration (used by config, fill-logic, presets, ui-panel, loading)
    let undoStack = []; // Stores states for undo (used by state-management, ui-panel)
    let redoStack = []; // Stores states for redo (used by state-management, ui-panel)
    let isFilling = false; // Flag for batch updates/filling process (used by performance, state-management, fill-logic, ui-panel)
    let panelElement = null; // Reference to the main panel DOM element (used by ui-panel, ui-draggable)


    // --- Main Initialization Logic ---
    // This is the sequence of steps to initialize the script when the page loads.

    // 1. Load the configuration from storage.
    config = loadConfig(); // loadConfig is defined in src/config.js
    console.log("Pack Filler Pro v" + GM_info.script.version + " Initializing...");
    console.log("Pack Filler Pro: Config loaded.", config);

    // 2. Inject the CSS styles for the UI.
    addPanelCSS(); // addPanelCSS is defined in src/ui-css.js

    // 3. Wait for a key element (the pack input fields) to be present in the DOM.
    // This ensures the script doesn't try to interact with elements before they exist,
    // which is common on dynamic websites.
    waitForElement(SELECTOR, 15000).then(inputElement => { // SELECTOR is from src/constants.js, waitForElement is from src/loading.js
        // This block runs if the target element is found within the timeout.
        console.log('Pack Filler Pro: Target element found, initializing UI and features...');

        // 4. Initialize the control panel UI.
        initPanel(); // initPanel is defined in src/ui-panel.js

        // 5. Add tooltips to initial elements on the page (including the panel).
        addTooltips(); // addTooltips is defined in src/tooltips.js

        // 6. Trigger the auto-load full page process if enabled in the config.
        // This function handles checking the config internally.
        loadFullPageIfNeeded(); // loadFullPageIfNeeded is defined in src/loading.js

    }).catch(error => {
        // This block runs if the target element is NOT found within the timeout.
         console.error('Pack Filler Pro: Could not find target element within timeout.', error);
         // Show an error toast to the user.
         showToast('Pack Filler Pro: Could not find pack inputs on the page. Script functionality limited.', 'error', 5000); // showToast is from src/feedback.js

         // Still initialize the panel even if no inputs were found, so the user can
         // potentially change settings or see the UI.
         initPanel(); // initPanel is defined in src/ui-panel.js
         // Tooltips will be added to the panel during initPanel.
    });

    // 7. Global event listeners (like keyboard shortcuts for Undo/Redo) are handled
    // by the code in src/event-listeners.js, which is loaded via @require.
    // No explicit call is needed here, the event listener is attached when that file runs.


    // The IIFE finishes execution here after setting up the initialization sequence.

})();
