// This file contains constants and default configuration for Pack Filler Pro.

/* --- 1. Constants --- */
// These are fixed values used throughout the script.
const SELECTOR = 'input.pack-num-input'; // CSS selector for the pack quantity input fields
const MAX_QTY = 99; // The maximum allowed quantity for a pack
const CONFIG_KEY = 'packFillerProConfig_v19'; // Key used for storing/retrieving config with GM_setValue/GM_getValue
const PANEL_ID = 'pack-filler-pro-panel'; // The HTML ID for the main control panel element
const UNDO_STACK_SIZE = 30; // The maximum number of states to keep in the undo/redo history
const TOAST_DURATION = 3000; // How long toast messages are displayed (in milliseconds)
const TOOLTIP_THEME = 'pfp'; // Custom theme name for Tippy.js tooltips

/* --- 2. Default Configuration --- */
// This object defines the initial settings for the script.
// It includes a version number for future compatibility and migration.
const DEFAULT_CONFIG = {
    version: 4, // Config version control (increment this if you make breaking changes to the config structure)
    lastMode: 'fixed', // Default filling mode ('fixed', 'max'/'random', 'unlimited', 'clear')
    lastCount: 24, // Default count for 'fixed' mode
    lastFixedQty: 3, // Default fixed quantity OR quantity for 'unlimited' mode
    lastMinQty: 1, // Default minimum quantity for 'random' mode
    lastMaxQty: 9, // Default maximum quantity for 'random' mode
    lastClear: false, // Default state of the 'clear before fill' checkbox
    loadFullPage: true, // Default state of the 'auto-load full page' checkbox
    panelVisible: true, // Default state of the panel visibility
    panelPos: { top: '120px', right: '30px' } // Default panel position on the screen
};

// Note: Global state variables (config, undoStack, etc.) will be declared in the main script's IIFE,
// as they are modified by multiple modules.
