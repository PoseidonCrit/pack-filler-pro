// ==UserScript==
// @name         🎴 Pack Filler Pro v19.0 (Further Simplified Debug)
// @namespace    https://ygoprodeck.com
// @version      19.0.3 // Incrementing version for this simplification
// @description  Highly simplified version for debugging panel display and toggle.
// @author       5n0 & Gemini
// @match        https://ygoprodeck.com/pack-sim/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_log
// // @require      https://unpkg.com/tippy.js@6.3.7/dist/tippy-bundle.umd.js // Temporarily commented out
//
// @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/constants.js // Needed for PANEL_ID
// @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/config.js // Needed for basic config load/save (loadConfig, saveConfig)
// // @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/dom-helpers.js // Not needed in this simplified version
// // @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/state-management.js // Not needed in this simplified version
// // @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/performance.js // Not needed in this simplified version
// // @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/fill-logic.js // Not needed in this simplified version
// // @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/presets.js // Not needed in this simplified version
// @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/feedback.js // Needed for showToast
// // @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/loading.js // Not needed in this simplified version
// // @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/tooltips.js // Not needed in this simplified version
// @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/ui-panel-html.js // Needed for panel HTML structure (panelHTML)
// @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/ui-css.js // Needed for panel CSS (addPanelCSS)
// // @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/ui-draggable.js // Not needed in this simplified version
// @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/ui-panel.js // CRITICAL: Contains initPanel, createPanel, addPanelEventListeners, setPanelVisibility, and menu command logic
// // @require      https://raw.githubusercontent.com/PoseidonCrit/pack-filler-pro/main/src/event-listeners.js // Not needed in this simplified version
//
// ==/UserScript==

// --- Global State Variables ---
// Declare these variables using 'var' at the VERY TOP LEVEL of the script,
// OUTSIDE of any function or IIFE. This ensures they are in the scope
// accessible to all @require'd files when Tampermonkey concatenates and runs them.
var config = {}; // Holds the current configuration (basic load/save needed)
var undoStack = []; // Declared but not used in this simplified version
var redoStack = []; // Declared but not used in this simplified version
var isFilling = false; // Declared but not used in this simplified version
var panelElement = null; // Reference to the main panel DOM element (CRITICAL)


// This is the main entry point of the script.
// The code from all @require directives will be loaded and executed before this IIFE runs.
// All functions and variables defined in the required files (outside of their own IIFEs if any)
// will be available within this IIFE's scope.
(function() {
    'use strict';

    console.log('Pack Filler Pro (Simplified): Main script IIFE started.');

    // The global state variables are declared outside this IIFE using 'var'.

    // 1. Load the configuration from storage.
    // Ensure loadConfig is available from config.js
    if (typeof loadConfig === 'function') {
        config = loadConfig();
        console.log("Pack Filler Pro (Simplified): Config loaded.", config);
    } else {
        console.error("Pack Filler Pro (Simplified): loadConfig function not available from config.js!");
        // Use a basic default config if loadConfig is missing
        config = { panelVisible: true, panelPos: { top: '120px', right: '30px' } };
    }


    // --- Simplified Main Initialization Logic ---
    // We'll use a simple DOMContentLoaded listener for this simplified test,
    // similar to the working Simple Panel Test.

    document.addEventListener('DOMContentLoaded', () => {
        console.log('Pack Filler Pro (Simplified): DOMContentLoaded fired, starting panel initialization.');

        // 2. Inject the CSS styles for the UI.
        // Ensure addPanelCSS is available from ui-css.js
        if (typeof addPanelCSS === 'function') {
             addPanelCSS();
        } else {
             console.error("Pack Filler Pro (Simplified): addPanelCSS function not available from ui-css.js!");
        }


        // 3. Initialize the control panel UI.
        // Ensure initPanel is available from ui-panel.js
        if (typeof initPanel === 'function') {
             initPanel(); // initPanel is defined in src/ui-panel.js
        } else {
             console.error("Pack Filler Pro (Simplified): initPanel function not available from ui-panel.js!");
        }

        // The rest of the original initialization logic (waitForElement, tooltips, full page load, global event listeners)
        // is temporarily removed or commented out to simplify the focus.

    });

    console.log('Pack Filler Pro (Simplified): Main script IIFE finished.');

})();
