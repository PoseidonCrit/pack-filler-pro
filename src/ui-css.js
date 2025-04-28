// This file contains the CSS styles for the Pack Filler Pro control panel and related elements.
// It uses GM_addStyle to inject the CSS into the page.
// Depends on: GM_addStyle (granted in main script), Constants (PANEL_ID, TOOLTIP_THEME - defined in constants.js)

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
        --pfp-panel-width: 300px; /* Slightly narrower */
        --pfp-border-radius: 10px; /* Slightly less rounded */
        --pfp-focus-color: var(--pfp-primary-color);
        --pfp-focus-shadow: rgba(78, 102, 255, 0.2);
        --pfp-toast-info: #17a2b8;
        --pfp-toast-success: #28a745;
        --pfp-toast-warning: #ffc107;
        --pfp-toast-error: #dc3545;
    }

    /* --- Panel Styles --- */
    #${PANEL_ID} {
        position: fixed;
        width: var(--pfp-panel-width);
        background: var(--pfp-bg-color);
        border-radius: var(--pfp-border-radius);
        box-shadow: 0 10px 30px var(--pfp-shadow-color), 0 0 0 1px var(--pfp-border-color);
        font-family: 'Roboto', 'Segoe UI', Tahoma, sans-serif;
        color: var(--pfp-text-color);
        z-index: 1000001; /* Ensure it's above most site elements */
        transition: transform 0.35s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.3s ease;
        backdrop-filter: blur(8px); /* Slightly less blur */
        -webkit-backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.3); /* Slightly stronger white border */
        overflow: hidden;
        box-sizing: border-box;
    }

    #${PANEL_ID}.hidden {
        transform: translateX(110%) scale(0.95);
        opacity: 0;
        pointer-events: none;
    }

    #${PANEL_ID}.is-dragging {
        /* Optional styles when dragging, e.g., different cursor or visual cue */
        /* cursor: grabbing !important; */ /* May not work due to 'move' on header */
        user-select: none; /* Prevent selecting text while dragging */
    }


    .pfp-header {
        background: linear-gradient(135deg, var(--pfp-primary-color), var(--pfp-primary-hover));
        color: #fff;
        padding: 12px 18px; /* Adjusted padding */
        cursor: move;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        border-top-left-radius: var(--pfp-border-radius); /* Match panel radius */
        border-top-right-radius: var(--pfp-border-radius);
    }

    .pfp-title {
        margin: 0;
        font-size: 16px; /* Slightly smaller title */
        font-weight: 600;
        letter-spacing: 0.5px;
    }

    .pfp-close {
        cursor: pointer;
        color: #fff;
        font-size: 22px; /* Slightly smaller */
        font-weight: bold;
        line-height: 1;
        transition: transform 0.2s ease, color 0.2s ease, background-color 0.2s ease;
        opacity: 0.9;
        padding: 0 4px; /* Easier to click */
        border-radius: 50%;
        margin-left: 8px; /* Space from title */
    }
    .pfp-close:hover {
        transform: scale(1.1) rotate(90deg);
        opacity: 1;
        background-color: rgba(255, 255, 255, 0.15);
    }

    .pfp-body {
        padding: 16px 18px; /* Adjusted padding */
        display: flex;
        flex-direction: column;
        gap: 14px; /* Space between sections */
        max-height: calc(95vh - 100px); /* Prevent excessive height, adjust as needed */
        overflow-y: auto; /* Allow scrolling if content exceeds height */
        box-sizing: border-box;
    }
    /* Custom scrollbar styling (optional) */
    .pfp-body::-webkit-scrollbar { width: 6px; }
    .pfp-body::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); border-radius: 3px;}
    .pfp-body::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.2); border-radius: 3px; }
    .pfp-body::-webkit-scrollbar-thumb:hover { background-color: rgba(0,0,0,0.3); }


     .pfp-config-section,
     .pfp-actions-section,
     .pfp-presets-section {
         display: flex; /* Use flex for consistent gap */
         flex-direction: column;
         gap: 10px; /* Space between elements within a section */
         padding-bottom: 10px; /* Add bottom padding */
         border-bottom: 1px solid var(--pfp-border-color);
     }
     .pfp-presets-section {
         border-bottom: none; /* Last section */
         padding-bottom: 0;
     }


    .pfp-config-section h4,
    .pfp-actions-section h4,
    .pfp-presets-section h4 {
        margin: 0; /* Use gap for spacing */
        font-size: 13px; /* Smaller header */
        font-weight: 600;
        color: var(--pfp-label-color);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding-bottom: 6px; /* Space below header */
        border-bottom: 1px dotted rgba(0, 0, 0, 0.1);
    }

    .pfp-form-group { margin-bottom: 0; display: flex; flex-direction: column; } /* Use gap */

    .pfp-label {
        display: block;
        margin-bottom: 5px; /* Adjusted margin */
        font-size: 13px; /* Adjusted font size */
        font-weight: 500;
        color: var(--pfp-label-color);
    }

    .pfp-input,
    .pfp-select {
        width: 100%;
        padding: 8px 10px; /* Adjusted padding */
        border: 1px solid var(--pfp-border-color);
        border-radius: 5px; /* Adjusted radius */
        box-sizing: border-box;
        font-size: 13px; /* Adjusted font size */
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
        background-color: rgba(255, 255, 255, 0.95); /* Slightly more opaque */
        color: var(--pfp-text-color);
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    .pfp-input::placeholder { color: #aab; }
    .pfp-input:hover, .pfp-select:hover { border-color: rgba(0, 0, 0, 0.2); }

    .pfp-input:focus,
    .pfp-select:focus {
        outline: none;
        border-color: var(--pfp-focus-color);
        box-shadow: 0 0 0 3px var(--pfp-focus-shadow);
        background-color: #fff;
    }

     .pfp-select {
         appearance: none; /* Remove default dropdown arrow */
         /* Using data URI for SVG arrow. Fill color is hardcoded to a dark grey. */
         background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23333'%3E%3Cpath fill-rule='evenodd' d='M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z' clip-rule='evenodd'/%3E%3C/svg%3E");
         background-repeat: no-repeat;
         background-position: right 8px center; /* Adjusted position */
         background-size: 14px 14px; /* Adjusted size */
         padding-right: 30px; /* Make space for the custom arrow */
         cursor: pointer;
     }
     /* Note: Updating SVG fill on focus via pure CSS is not possible with data URI. */


    /* Style containers for mode-specific inputs */
    .pfp-mode-specific { display: none; } /* Controlled by JS */
    #pfp-range-inputs {
        padding: 10px; /* Adjusted padding */
        border: 1px dashed rgba(0, 0, 0, 0.1); /* Adjusted border */
        border-radius: 6px;
        margin-top: 5px;
        background-color: rgba(0, 0, 0, 0.02);
        display: flex; /* Use flex for gap */
        flex-direction: column;
        gap: 8px; /* Adjusted space */
    }
     .pfp-range-group { margin-bottom: 0 !important; } /* Use gap */


    .pfp-options-divider { /* Simple divider */
        border-top: 1px solid var(--pfp-border-color);
        margin-top: 5px;
        padding-top: 14px; /* Adjusted padding */
        font-size: 11px; /* Smaller text */
        font-weight: 600;
        color: var(--pfp-label-color);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .pfp-form-check {
        display: flex;
        align-items: center;
        cursor: pointer;
        padding: 3px 0; /* Adjusted padding */
    }

    .pfp-checkbox {
        margin-right: 8px; /* Adjusted margin */
        cursor: pointer;
        height: 16px; /* Slightly smaller */
        width: 16px;
        appearance: none;
        background-color: rgba(255, 255, 255, 0.95);
        border: 1px solid rgba(0, 0, 0, 0.25);
        border-radius: 4px;
        transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        position: relative;
        display: inline-block;
        vertical-align: middle; /* Align with label text */
        flex-shrink: 0; /* Prevent shrinking */
    }

    .pfp-checkbox:checked {
        background-color: var(--pfp-primary-color);
        border-color: var(--pfp-primary-color);
    }

    .pfp-checkbox:checked::after {
        content: '';
        position: absolute;
        left: 4px; /* Adjusted position */
        top: 1px; /* Adjusted position */
        width: 4px;
        height: 8px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
    }

    .pfp-checkbox:focus {
         outline: none;
         box-shadow: 0 0 0 3px var(--pfp-focus-shadow);
    }


    .pfp-label-inline {
        display: inline-block;
        margin-bottom: 0;
        vertical-align: middle;
        font-size: 13px; /* Adjusted font size */
        color: var(--pfp-text-color);
        user-select: none; /* Prevent text selection on click */
        line-height: 1.4;
    }
    .pfp-form-check:hover .pfp-checkbox {
        border-color: var(--pfp-primary-color);
    }
    .pfp-form-check:hover .pfp-label-inline {
        color: var(--pfp-primary-color);
    }

    .pfp-actions-section {
        display: flex;
        flex-direction: column;
        gap: 10px; /* Space between fill/clear and history */
    }

    .pfp-form-actions { /* Container for Fill and Clear buttons */
        display: flex;
        gap: 8px; /* Space between buttons */
        justify-content: space-between;
    }

     .pfp-history-buttons { /* Container for Undo and Redo buttons */
         display: flex;
         gap: 8px; /* Space between buttons */
         justify-content: space-between;
     }

    .pfp-button {
        padding: 9px 14px; /* Adjusted padding */
        border: none;
        border-radius: 5px; /* Adjusted radius */
        cursor: pointer;
        font-size: 13px; /* Adjusted font size */
        font-weight: 500;
        transition: background-color 0.2s ease, box-shadow 0.2s ease, transform 0.1s ease;
        flex-grow: 1;
        text-align: center;
        text-decoration: none; /* For potential links styled as buttons */
        display: inline-flex; /* Align text/icon */
        align-items: center;
        justify-content: center;
         min-width: 0; /* Allow shrinking in flex container */
    }
     .pfp-button .button-text {
         white-space: nowrap; /* Prevent text wrap in buttons */
         overflow: hidden;
         text-overflow: ellipsis;
     }

     .pfp-button:active { transform: scale(0.98); }
     .pfp-button:focus { outline: none; box-shadow: 0 0 0 3px var(--pfp-focus-shadow); }


    .pfp-button-primary {
        background-color: var(--pfp-primary-color);
        color: white;
        box-shadow: 0 3px 8px rgba(78, 102, 255, 0.2);
    }
    .pfp-button-primary:hover:not(:disabled) {
        background-color: var(--pfp-primary-hover);
        box-shadow: 0 5px 12px rgba(78, 102, 255, 0.3);
    }

    .pfp-button-secondary {
        background-color: var(--pfp-secondary-color);
        color: var(--pfp-secondary-text);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .pfp-button-secondary:hover:not(:disabled) {
        background-color: var(--pfp-secondary-hover);
        color: #444;
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
    }

     .pfp-button-history {
         background-color: #6c757d; /* Grey */
         color: white;
         box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
     }
     .pfp-button-history:hover:not(:disabled) {
         background-color: #5a6268; /* Darker grey */
         box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
     }


    button:disabled {
        background-color: #cccccc !important; /* Light grey, override hover */
        color: #999999 !important; /* Dark grey text */
        cursor: not-allowed;
        box-shadow: none !important;
    }


    .pfp-presets-section .pfp-preset-container {
         display: flex;
         flex-wrap: wrap; /* Allow buttons to wrap */
         gap: 6px; /* Space between buttons */
    }
    .pfp-preset-btn {
         background: #dddddd; /* Light grey */
         color: #333;
         border: 1px solid rgba(0, 0, 0, 0.1);
         border-radius: 4px;
         padding: 4px 8px; /* Smaller padding */
         cursor: pointer;
         font-size: 12px;
         transition: background-color 0.2s ease, border-color 0.2s ease;
    }
     .pfp-preset-btn:hover {
          background: #cccccc;
          border-color: rgba(0, 0, 0, 0.2);
     }
     .pfp-preset-btn:active { transform: scale(0.98); }


    .pfp-footer {
         background: rgba(0,0,0,0.03); /* Slightly transparent dark */
         padding: 8px 18px; /* Adjusted padding */
         font-size: 11px;
         color: var(--pfp-label-color);
         display: flex;
         justify-content: space-between;
         align-items: center;
         border-top: 1px solid var(--pfp-border-color);
    }
    .pfp-footer a {
         color: var(--pfp-label-color);
         text-decoration: none;
         transition: color 0.2s ease;
    }
     .pfp-footer a:hover {
          color: var(--pfp-primary-color);
          text-decoration: underline;
     }


    /* Toast Styles */
    .pfp-toast {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        background: #333;
        color: white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 1000002; /* Above panel */
        opacity: 0; /* Start hidden */
        transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out; /* Fade and slide */
        transform: translateX(100px); /* Start off-screen */
        min-width: 200px; /* Ensure readability */
        max-width: calc(100vw - 40px);
        box-sizing: border-box;
    }
     .pfp-toast.show {
          opacity: 1; /* Fade in */
          transform: translateX(0); /* Slide in */
     }
     .pfp-toast.pfp-info { background-color: var(--pfp-toast-info); }
     .pfp-toast.pfp-success { background-color: var(--pfp-toast-success); }
     .pfp-toast.pfp-warning { background-color: var(--pfp-toast-warning); color: #333; } /* Yellow */
     .pfp-toast.pfp-error { background-color: var(--pfp-toast-error); }


    /* Tippy.js Styles */
    .tippy-box[data-theme="${TOOLTIP_THEME}"] {
        background-color: #333; /* Darker background */
        color: white;
        border-radius: 4px;
        font-size: 11px; /* Smaller tooltip font */
        padding: 5px 8px;
        line-height: 1.4;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        text-align: left; /* Ensure multi-line text aligns left */
    }
     /* Arrow */
    .tippy-box[data-theme="${TOOLTIP_THEME}"][data-placement^="top"] > .tippy-arrow { border-top-color: #333; }
    .tippy-box[data-theme="${TOOLTIP_THEME}"][data-placement^="bottom"] > .tippy-arrow { border-bottom-color: #333; }
    .tippy-box[data-theme="${TOOLTIP_THEME}"][data-placement^="left"] > .tippy-arrow { border-left-color: #333; }
    .tippy-box[data-theme="${TOOLTIP_THEME}"][data-placement^="right"] > .tippy-arrow { border-right-color: #333; }


`);
}

// Helper function to convert CSS variable color to hex for SVG fill in select arrow
// This is a workaround due to limitations with SVG data URIs and CSS variables.
// It's not strictly necessary if using a fixed color for the arrow.
/*
function varToHex(varName) {
   try {
       const tempDiv = document.createElement('div');
       tempDiv.style.setProperty('color', `var(${varName})`);
       tempDiv.style.display = 'none';
       document.body.appendChild(tempDiv);
       const color = window.getComputedStyle(tempDiv).color;
       document.body.removeChild(tempDiv);
       // Convert rgb(x, y, z) to hex. Basic conversion, handles only basic rgb.
       const rgbMatch = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
       if (rgbMatch) {
           const toHex = (c) => parseInt(c).toString(16).padStart(2, '0');
           return `${toHex(rgbMatch[1])}${toHex(rgbMatch[2])}${toHex(rgbMatch[3])}`;
       }
       if (color.startsWith('#')) return color.slice(1); // Handle hex
       console.warn("Pack Filler Pro: Could not convert CSS variable color to hex for SVG:", color);
       return '333'; // Default dark hex
   } catch (e) {
       console.warn("Pack Filler Pro: Error converting CSS variable color to hex:", e);
       return '333'; // Default dark hex
   }
}
*/

// Note: This file defines the addPanelCSS function. It requires GM_addStyle
// (granted in the main script) and constants (PANEL_ID, TOOLTIP_THEME).
// Ensure constants.js is required before ui-css.js.
