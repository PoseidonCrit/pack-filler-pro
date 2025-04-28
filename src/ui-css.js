console.log('Pack Filler Pro: src/ui-css.js started execution.'); // Log to confirm file loading

// This file contains the CSS styles for the Pack Filler Pro control panel and related elements.
// It uses GM_addStyle to inject the CSS into the page.
// Depends on: GM_addStyle (granted in main script), Constants (PANEL_ID, TOOLTIP_THEME - defined in constants.js)

// Ensure PANEL_ID and TOOLTIP_THEME are available from constants.js
if (typeof PANEL_ID === 'undefined') {
    console.error("Pack Filler Pro: PANEL_ID constant not available from constants.js!");
    var PANEL_ID = 'pack-filler-pro-panel'; // Fallback default
}
if (typeof TOOLTIP_THEME === 'undefined') {
     console.error("Pack Filler Pro: TOOLTIP_THEME constant not available from constants.js! Using default 'light'.");
     var TOOLTIP_THEME = 'light'; // Fallback default
}

/**
 * Injects the CSS styles for the Pack Filler Pro UI into the document head.
 * Uses CSS variables for easier theming.
 * Depends on: GM_addStyle, PANEL_ID, TOOLTIP_THEME
 */
function addPanelCSS() {
    GM_addStyle(`
    /* --- CSS Variables --- */
    :root {
        --pfp-bg-color: rgba(248, 249, 253, 0.9); /* Slightly less opaque */
        --pfp-border-color: rgba(0, 0, 0, 0.08);
        --pfp-shadow-color: rgba(0, 0, 0, 0.15);
        --pfp-text-color: #2c3e50;
        --pfp-label-color: #34495e;
        --pfp-primary-color: #5e5cff;
        --pfp-primary-hover: #4a48d8;
        --pfp-secondary-color: #e0e0e0;
        --pfp-secondary-hover: #cccccc;
        --pfp-secondary-text: #555;
        --pfp-panel-width: 280px; /* Increased width slightly */
        --pfp-panel-padding: 15px;
        --pfp-border-radius: 8px;
        --pfp-header-bg: rgba(240, 240, 240, 0.9); /* Subtle header background */
        --pfp-header-border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        --pfp-input-border: #ccc;
        --pfp-input-focus-border: #5e5cff;
        --pfp-button-padding: 10px 15px;
        --pfp-button-border-radius: 4px;
        --pfp-button-font-size: 14px;
        --pfp-button-transition: background-color 0.2s ease, opacity 0.2s ease;
        --pfp-disabled-opacity: 0.6;
        --pfp-status-color: #555;
        --pfp-status-font-size: 12px;
        --pfp-status-border-bottom: 1px dashed rgba(0, 0, 0, 0.1);
        --pfp-status-padding-bottom: 8px;
        --pfp-section-margin-bottom: 15px;
        --pfp-section-border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        --pfp-section-padding-bottom: 10px;
    }

    /* --- Panel Styles --- */
    #${PANEL_ID} {
        position: fixed;
        /* Default position, can be overridden by saved config */
        top: 120px;
        right: 30px;
        left: auto;
        bottom: auto;

        width: var(--pfp-panel-width);
        background-color: var(--pfp-bg-color);
        border: 1px solid var(--pfp-border-color);
        border-radius: var(--pfp-border-radius);
        box-shadow: 0 4px 12px var(--pfp-shadow-color);
        z-index: 99999; /* High z-index to be on top */
        font-family: sans-serif;
        color: var(--pfp-text-color);
        display: flex;
        flex-direction: column;
        overflow: hidden; /* Contains border-radius */
        resize: both; /* Allow resizing */
        min-width: 200px;
        min-height: 150px;
        max-width: 95vw; /* Prevent panel from exceeding viewport width */
        max-height: 95vh; /* Prevent panel from exceeding viewport height */
    }

    #${PANEL_ID}.hidden {
        opacity: 0;
        pointer-events: none; /* Prevent interaction when hidden */
    }

    #${PANEL_ID}.is-dragging {
         cursor: grabbing !important; /* Indicate dragging */
         user-select: none; /* Prevent text selection while dragging */
    }


    /* --- Header Styles --- */
    #${PANEL_ID} .pfp-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px var(--pfp-panel-padding);
        background-color: var(--pfp-header-bg);
        border-bottom: var(--pfp-header-border-bottom);
        cursor: grab; /* Indicate draggable handle */
        user-select: none; /* Prevent text selection */
    }

    #${PANEL_ID} .pfp-title {
        font-weight: bold;
        font-size: 16px;
        color: var(--pfp-label-color);
    }

     #${PANEL_ID} .pfp-version {
          font-size: 10px;
          color: #777;
          margin-left: 5px;
     }

    #${PANEL_ID} .pfp-close {
        font-size: 20px;
        cursor: pointer;
        color: #aaa;
        transition: color 0.2s ease;
        line-height: 1; /* Prevent extra space below the 'x' */
    }
    #${PANEL_ID} .pfp-close:hover {
        color: #777;
    }

    /* --- Body Styles --- */
    #${PANEL_ID} .pfp-body {
        padding: var(--pfp-panel-padding);
        display: flex;
        flex-direction: column;
        gap: 15px; /* Space between sections */
        overflow-y: auto; /* Add scroll if content overflows vertically */
    }

    /* --- Status Area Styles --- */
     #${PANEL_ID} .pfp-status-area {
         font-size: var(--pfp-status-font-size);
         color: var(--pfp-status-color);
         padding-bottom: var(--pfp-status-padding-bottom);
         border-bottom: var(--pfp-status-border-bottom);
         white-space: pre-wrap; /* Allow line breaks from <br> */
     }


    /* --- Config Section Styles --- */
    #${PANEL_ID} .pfp-config-section {
        display: flex;
        flex-direction: column;
        gap: 10px; /* Space between input groups */
        margin-bottom: var(--pfp-section-margin-bottom);
        padding-bottom: var(--pfp-section-padding-bottom);
        border-bottom: var(--pfp-section-border-bottom);
    }

    #${PANEL_ID} .pfp-config-section h5 {
        margin: 0 0 5px 0;
        font-size: 14px;
        color: var(--pfp-label-color);
        border-bottom: 1px solid rgba(0,0,0,0.03); /* Subtle separator */
        padding-bottom: 5px;
    }

    #${PANEL_ID} .pfp-input-group {
        display: flex;
        flex-direction: column;
        gap: 5px; /* Space between label and input */
    }

    #${PANEL_ID} label {
        font-size: 13px;
        color: var(--pfp-label-color);
        font-weight: bold;
    }

    #${PANEL_ID} input[type="number"],
    #${PANEL_ID} select {
        padding: 8px;
        border: 1px solid var(--pfp-input-border);
        border-radius: 4px;
        font-size: 14px;
        width: 100%; /* Make input/select fill container */
        box-sizing: border-box; /* Include padding and border in element's total width */
        color: var(--pfp-text-color);
        background-color: #fff;
        transition: border-color 0.2s ease;
    }

     #${PANEL_ID} input[type="number"]:focus,
     #${PANEL_ID} select:focus {
          outline: none;
          border-color: var(--pfp-input-focus-border);
          box-shadow: 0 0 0 2px rgba(94, 92, 255, 0.2); /* Focus ring */
     }


    /* Style for the Random Range inputs */
    #${PANEL_ID} .pfp-range-group-inputs {
         display: flex;
         align-items: center;
         gap: 5px;
    }

     #${PANEL_ID} .pfp-range-group-inputs input[type="number"] {
          flex-grow: 1; /* Allow inputs to take available space */
          width: auto; /* Override 100% width */
     }

     #${PANEL_ID} .pfp-range-group-inputs span {
          font-size: 14px;
          color: var(--pfp-text-color);
     }


    /* Style for Checkbox groups */
    #${PANEL_ID} .pfp-checkbox-group {
        flex-direction: row; /* Align checkbox and label horizontally */
        align-items: center;
        gap: 8px;
    }

     #${PANEL_ID} .pfp-checkbox-group input[type="checkbox"] {
          width: auto; /* Reset width */
          margin: 0; /* Reset margin */
     }

     #${PANEL_ID} .pfp-checkbox-group label {
          margin: 0; /* Reset margin */
          font-weight: normal; /* Less bold for checkbox labels */
     }


    /* --- Button Group Styles --- */
    #${PANEL_ID} .pfp-button-group {
        display: flex;
        gap: 10px; /* Space between buttons */
        margin-bottom: var(--pfp-section-margin-bottom);
        padding-bottom: var(--pfp-section-padding-bottom);
        border-bottom: var(--pfp-section-border-bottom);
        flex-wrap: wrap; /* Allow buttons to wrap on smaller panel sizes */
    }

     #${PANEL_ID} .pfp-button-group:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none; /* No border on the last group */
     }

    #${PANEL_ID} .pfp-button {
        padding: var(--pfp-button-padding);
        border: none;
        border-radius: var(--pfp-button-border-radius);
        cursor: pointer;
        font-size: var(--pfp-button-font-size);
        transition: var(--pfp-button-transition);
        display: flex; /* Align text and icon if present */
        align-items: center;
        justify-content: center;
        gap: 5px; /* Space between text and icon */
        flex-grow: 1; /* Allow buttons to grow to fill space */
    }

    #${PANEL_ID} .pfp-button-primary {
        background-color: var(--pfp-primary-color);
        color: white;
    }
    #${PANEL_ID} .pfp-button-primary:hover:not(:disabled) {
        background-color: var(--pfp-primary-hover);
    }

    #${PANEL_ID} .pfp-button-secondary {
        background-color: var(--pfp-secondary-color);
        color: var(--pfp-secondary-text);
    }
    #${PANEL_ID} .pfp-button-secondary:hover:not(:disabled) {
        background-color: var(--pfp-secondary-hover);
    }

    #${PANEL_ID} .pfp-button:disabled {
        cursor: not-allowed;
        opacity: var(--pfp-disabled-opacity);
    }

     /* Style for Undo/Redo group to prevent excessive stretching */
     #${PANEL_ID} .pfp-undo-redo-group .pfp-button {
          flex-grow: 0; /* Prevent stretching */
          flex-basis: auto; /* Allow content to determine size */
     }


    /* --- Presets Styles --- */
    #${PANEL_ID} .pfp-preset-container h6 {
         margin: 0 0 8px 0;
         font-size: 13px;
         color: var(--pfp-label-color);
    }

    #${PANEL_ID} .pfp-preset-container {
        display: flex;
        flex-direction: column;
        gap: 8px; /* Space between preset buttons */
    }

    #${PANEL_ID} .pfp-preset-button {
        padding: 6px 10px;
        background-color: rgba(94, 92, 255, 0.1); /* Light primary color background */
        color: var(--pfp-primary-color);
        border: 1px solid rgba(94, 92, 255, 0.2);
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
        transition: background-color 0.2s ease, border-color 0.2s ease;
        text-align: left;
    }

    #${PANEL_ID} .pfp-preset-button:hover {
        background-color: rgba(94, 92, 255, 0.2);
        border-color: rgba(94, 92, 255, 0.3);
    }


    /* --- Tippy.js Custom Theme --- */
    .tippy-box[data-theme='${TOOLTIP_THEME}'] {
        background-color: rgba(50, 50, 50, 0.95);
        color: white;
        font-size: 12px;
        padding: 5px 10px;
        border-radius: 4px;
        line-height: 1.4;
        white-space: pre-wrap; /* Allow line breaks */
    }

    .tippy-box[data-theme='${TOOLTIP_THEME}'] .tippy-arrow {
        color: rgba(50, 50, 50, 0.95);
    }

    /* Hide elements that are mode-specific by default */
    .pfp-mode-specific {
        display: none;
    }

    `);
}

// Note: This file defines the addPanelCSS function. It requires GM_addStyle
// (granted in the main script) and the PANEL_ID and TOOLTIP_THEME constants.
// Ensure constants.js is required before ui-css.js.
