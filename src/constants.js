console.log('Pack Filler Pro: src/constants.js started execution.'); // Log to confirm file loading

// This file contains constants used throughout the Pack Filler Pro script.

// --- Storage Keys ---
const CONFIG_STORAGE_KEY = 'packFillerProConfig'; // Key for storing the main configuration object

// --- DOM Selectors ---
// These selectors are used to find elements on the target website (ygoprodeck.com/pack-sim/).
// They MUST be accurate for the script to function correctly.
const SELECTOR = 'input.pack-num-input'; // Selector for the pack quantity input fields
// Add other selectors here as needed for features like 'Load More' buttons, etc.
// const LOAD_MORE_BUTTON_SELECTOR = '.load-more-button'; // Example selector for a 'Load More' button
// const LOADING_SPINNER_SELECTOR = '.loading-spinner'; // Example selector for a loading spinner

// --- UI Constants ---
const PANEL_ID = 'pack-filler-pro-panel'; // ID for the main control panel element
const TOAST_DURATION = 3000; // Default duration for toast messages in milliseconds
const UNDO_STACK_SIZE = 50; // Maximum number of states to store for undo/redo
const MAX_QTY = 99; // Maximum allowed quantity for a single pack input

// --- Tooltip Constants ---
const TOOLTIP_THEME = 'pack-filler-pro-tooltip-theme'; // Custom theme name for Tippy.js tooltips

// Note: These constants are made available in the main script's scope
// because this file is loaded via @require.
