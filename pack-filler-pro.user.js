// ==UserScript==
// @name         🎴 Pack Filler Pro v19.0 (Improved Debug)
// @namespace    https://ygoprodeck.com
// @version      19.0.8 // Incrementing version for fixing @require URLs again
// @description  Improved and corrected version for debugging panel display and toggle.
// @author       5n0 & Gemini
// @match        https://ygoprodeck.com/pack-sim/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_log
//
// --- External Libraries ---
// @require      https://unpkg.com/tippy.js@6.3.7/dist/tippy-bundle.umd.js // Tippy.js for enhanced tooltips
//
// --- Project Modules (@require order matters for dependencies) ---
// @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/constants.js // Defines script-wide constants (IDs, selectors, keys)
// @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/config.js // Handles configuration loading and saving (depends on constants)
// // @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/dom-helpers.js // Provides utility functions for DOM manipulation/selection (depends on constants) - Commented out for simplified debug
// // @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/state-management.js // Manages undo/redo state (depends on dom-helpers, constants, performance, feedback, ui-panel) - Commented out for simplified debug
// // @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/performance.js // Contains performance optimizations (e.g., batch updates) (depends on dom-helpers, ui-panel) - Commented out for simplified debug
// // @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/fill-logic.js // Contains the core pack filling logic (depends on config, constants, dom-helpers, state-management, performance, feedback) - Commented out for simplified debug
// // @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/presets.js // Manages preset configurations (depends on config, constants, feedback, ui-panel, tooltips) - Commented out for simplified debug
// @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/feedback.js // Provides user feedback mechanisms (e.g., toasts) (depends on GM_addStyle, constants)
// // @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/loading.js // Handles page loading and element waiting (depends on config, constants, dom-helpers, feedback, tooltips) - Commented out for simplified debug
// @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/tooltips.js // Integrates Tippy.js for tooltips (depends on Tippy.js, constants) - Kept for basic tooltip functionality if Tippy.js is loaded
// @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/ui-panel-html.js // Contains the HTML structure string for the panel (depends on constants)
// @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/ui-css.js // Contains the CSS styles for the UI (depends on GM_addStyle, constants)
// // @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/ui-draggable.js // Makes the panel draggable (depends on dom-helpers, config) - Commented out for simplified debug
// @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/ui-panel.js // Contains the core panel creation, management, and event logic (depends on many other modules and global state)
// // @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/event-listeners.js // Handles global event listeners (e.g., keyboard shortcuts) (depends on state-management, ui-panel) - Commented out for simplified debug
//
// ==/UserScript==

// --- Global State Variables ---
// Declare these variables using 'var' at the VERY TOP LEVEL of the script,
// OUTSIDE of any function or IIFE. This is the corrected and robust approach
// to ensure they are in the scope accessible to all @require'd files when
// Tampermonkey concatenates and runs them, even in strict mode.
var config = {}; // Holds the current configuration loaded from storage. Accessible by config, fill-logic, presets, ui-panel, loading modules.
var undoStack = []; // Stores states for undo functionality. Accessible by state-management, ui-panel modules.
var redoStack = []; // Stores states for redo functionality. Accessible by state-management, ui-panel modules.
var isFilling = false; // Flag to indicate if a fill/update process is currently running. Accessible by performance, state-management, fill-logic, ui-panel modules.
var panelElement = null; // Reference to the main panel DOM element once created. Accessible by ui-panel, ui-draggable modules.


// This is the main entry point of the script.
// The code from all @require directives will be loaded and executed before this IIFE runs.
// All functions and variables defined in the required files (outside of their own IIFEs if any)
// will be available within this IIFE's scope.
(function() {
    'use strict';

    console.log('Pack Filler Pro (Improved Debug): Main script IIFE started.');

    // --- Core Script Initialization Sequence ---
    // This sequence runs once the main script file starts executing, after all @require'd files have been loaded.

    // 1. Load the configuration from storage.
    // This function is expected to be available from src/config.js
    if (typeof loadConfig === 'function') {
        config = loadConfig();
        console.log("Pack Filler Pro (Improved Debug): Config loaded.", config);
    } else {
        console.error("Pack Filler Pro (Improved Debug): loadConfig function not available from config.js! Using default config.");
        // Define a basic fallback config if loadConfig is missing
        config = { panelVisible: true, panelPos: { top: '120px', right: '30px' } };
        // Ensure showToast is available to report this error visually
        if (typeof showToast === 'function') {
            showToast("Error loading config. Using default settings.", 'error', 4000);
        }
    }


    // 2. Wait for the DOM to be fully loaded before proceeding with UI creation and interaction.
    // Using DOMContentLoaded is sufficient for this simplified test.
    document.addEventListener('DOMContentLoaded', () => {
        console.log('Pack Filler Pro (Improved Debug): DOMContentLoaded fired, starting UI initialization.');

        // --- UI Initialization Steps ---
        // These steps create and set up the user interface elements.

        // 2a. Inject the CSS styles for the UI.
        // This function is expected to be available from src/ui-css.js
        if (typeof addPanelCSS === 'function') {
             addPanelCSS();
             console.log("Pack Filler Pro (Improved Debug): addPanelCSS function called.");
        } else {
             console.error("Pack Filler Pro (Improved Debug): addPanelCSS function not available from ui-css.js! UI may not be styled correctly.");
             // Ensure showToast is available to report this error visually
             if (typeof showToast === 'function') {
                 showToast("Error loading UI styles. Panel may look broken.", 'error', 4000);
             }
        }

        // 2b. Initialize the control panel UI.
        // This function is expected to be available from src/ui-panel.js
        // It handles creating the panel element, adding listeners, updating UI, etc.
        if (typeof initPanel === 'function') {
             initPanel();
             console.log("Pack Filler Pro (Improved Debug): initPanel function called.");
        } else {
             console.error("Pack Filler Pro (Improved Debug): initPanel function not available from ui-panel.js! Panel will not be created.");
             // Ensure showToast is available to report this error visually
             if (typeof showToast === 'function') {
                 showToast("Error initializing panel. Panel will not appear.", 'error', 5000);
             }
        }

        // Note: In the full script, steps like waiting for specific DOM elements (pack inputs),
        // initializing tooltips on page elements, and triggering auto-load would happen here
        // after DOMContentLoaded and before or during initPanel. For this simplified debug,
        // we focus only on panel creation and menu command registration.

    }); // End of DOMContentLoaded listener


    // 3. Global event listeners (like keyboard shortcuts for Undo/Redo) are typically
    // attached by code within the src/event-listeners.js file.
    // No explicit call is needed here if that file handles its own setup upon loading.


    console.log('Pack Filler Pro (Improved Debug): Main script IIFE finished. Waiting for DOMContentLoaded...');

})();
