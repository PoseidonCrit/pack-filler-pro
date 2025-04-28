// This file contains the JavaScript logic for creating, managing, and updating the UI panel.
// It handles creating the panel element, adding event listeners, updating UI elements
// based on config/state, and initializing the panel lifecycle.
// Depends on: Global State (config, undoStack, redoStack, isFilling, panelElement - declared in main script),
// Constants (PANEL_ID - defined in constants.js),
// Config Management (saveConfig - defined in config.js),
// DOM Helpers (safeQuery, safeQueryAll - defined in dom-helpers.js),
// State Management (applyUndo, applyRedo - defined in state-management.js),
// Fill Logic (fillPacks - defined in fill-logic.js),
// Presets (createPresetButtons, applyPreset - defined in presets.js),
// Visual Feedback (showToast - defined in feedback.js),
// UI Enhancements (addTooltips - defined in tooltips.js),
// UI Panel Structure (panelHTML - defined in ui-panel-html.js),
// UI Draggable (makeDraggable - defined in ui-draggable.js)
// GM_registerMenuCommand (granted in main script)


/**
 * Creates the main panel element and appends it to the document body.
 * Sets initial position and visibility based on the current configuration.
 * Makes the panel header draggable.
 * @returns {Element|null} The created panel element or null if creation failed.
 * Depends on: Global State (config, panelElement), Constants (PANEL_ID),
 * UI Panel Structure (panelHTML), makeDraggable, safeQuery, showToast
 */
function createPanel() {
    if (panelElement) {
         console.log('Pack Filler Pro: Panel already exists.');
        return panelElement; // Return existing panel if already created
    }

    // Create a temporary container to parse the panelHTML string.
    const panelContainer = document.createElement('div');
    panelContainer.innerHTML = panelHTML.trim(); // Use trim() to remove leading/trailing whitespace

    // Get the actual panel element (the first child inside the temporary container).
    panelElement = panelContainer.firstElementChild;

    // Validate that the element was created and has the correct ID.
    if (!panelElement || panelElement.id !== PANEL_ID) {
         console.error("Pack Filler Pro: Error creating panel element from HTML structure.");
         showToast("Error creating UI panel.", 'error'); // Depends on showToast
         panelElement = null; // Reset the global variable if creation failed
         return null;
    }

    panelElement.id = PANEL_ID; // Ensure the ID is correctly assigned


    // Set initial position based on the loaded configuration.
    // Ensure position is 'fixed' and clear conflicting 'right'/'bottom' styles for draggable compatibility.
    panelElement.style.position = 'fixed';
    panelElement.style.top = config.panelPos.top;
    panelElement.style.left = config.panelPos.left || 'auto'; // Use left if saved, default to auto (allows right anchor)
    panelElement.style.right = config.panelPos.right || 'auto'; // Use right if saved, default to auto
    panelElement.style.bottom = config.panelPos.bottom || 'auto'; // Use bottom if saved, default to auto

     // Prioritize saved 'right' if 'left' is auto, etc. A more complex logic might be needed
     // depending on desired anchoring behavior. For simplicity, we assume top/right or top/left.
     // If both left and right are 'auto', browser default applies. If both are set, 'left' usually wins.
     // If only one of left/right is 'auto', the other fixed value anchors it.
     // Let's ensure a default if neither top/left/right/bottom is set meaningfully (though config provides defaults).


    // Set initial visibility based on the loaded configuration.
    if (!config.panelVisible) {
        panelElement.classList.add('hidden');
    }

    // Append the created panel element to the document body.
    document.body.appendChild(panelElement);

    // Make the panel draggable by dragging its header.
    const headerElement = safeQuery('.pfp-header', panelElement); // safeQuery depends on dom-helpers.js
    if (headerElement) {
        // Pass the draggable element and a callback to save the new position.
        makeDraggable(headerElement, panelElement, (newPos) => { // makeDraggable depends on ui-draggable.js
             // Callback executed after dragging ends.
             // Update the panelPos in the global config variable and save it.
             config.panelPos = newPos;
             saveConfig(); // saveConfig depends on config.js
        });
    } else {
        console.warn("Pack Filler Pro: Panel header element not found, dragging disabled.");
    }

    console.log('Pack Filler Pro: Panel created and added to DOM.');
    return panelElement;
}

/**
 * Adds event listeners to the controls within the panel (buttons, inputs, selects, checkboxes).
 * Updates the configuration and saves it when relevant inputs change.
 * Triggers core actions (fill, clear, undo, redo, apply preset).
 * Depends on: Global State (config), safeQuery, safeQueryAll, fillPacks, clearAllInputs,
 * applyUndo, applyRedo, applyPreset, saveConfig, updatePanelUI, createPresetButtons, addTooltips
 */
function addPanelEventListeners() {
    // Ensure the panel element exists before trying to add listeners.
    if (!panelElement) {
        console.error('Pack Filler Pro: Cannot add listeners, panel element not found.');
        return;
    }

    // Event Listener for the Close button: Hide the panel and save visibility state.
    safeQuery('.pfp-close', panelElement)?.addEventListener('click', () => { // safeQuery depends on dom-helpers.js
        panelElement.classList.add('hidden');
        config.panelVisible = false; // Update global config
        saveConfig(); // Save config (depends on config.js)
        console.log('Pack Filler Pro: Panel hidden.');
    });

    // Event Listeners for configuration input changes (mode, count, qty, range, checkboxes):
    // Iterate over all input, select, and checkbox elements within the config section.
    panelElement.querySelectorAll('.pfp-config-section input, .pfp-config-section select').forEach(input => {
        input.addEventListener('change', (e) => {
            const target = e.target; // The input/select element that changed
            const id = target.id; // Get the element's ID (e.g., 'pfp-mode', 'pfp-count')
            let value;

            // Determine the value based on the input type.
             if (target.type === 'checkbox') {
                 value = target.checked; // Checkbox value is boolean
             } else if (target.type === 'number') {
                  // For number inputs, parse as float initially. Keep original value if parsing fails (user typed non-number).
                  // Validation/clamping happens in core logic functions (chooseQuantity, calculateFillCount).
                  value = parseFloat(target.value);
                  if (isNaN(value)) value = target.value; // Keep original string if NaN
             }
             else {
                 value = target.value; // Value for select or text inputs
             }

            // Map the element ID to the corresponding property name in the config object.
            // Assumes IDs are 'pfp-propName' and config properties are 'lastPropName'.
            const prop = id.replace('pfp-', 'last'); // e.g., 'pfp-mode' becomes 'lastMode'

            // Check if the property exists in the config object before updating.
            if (config.hasOwnProperty(prop)) {
                config[prop] = value; // Update the global config variable
                saveConfig(); // Save the updated config (depends on config.js)
                updatePanelUI(); // Update the panel UI (e.g., show/hide mode-specific inputs)
                // console.log(`Pack Filler Pro: Config updated: ${prop} = ${value}`); // Can be noisy
            } else {
                console.warn(`Pack Filler Pro: Attempted to set unknown config property: ${prop} from element #${id}`);
            }
        });
    });

    // Event Listener for the "Fill Packs" button: Trigger the main fill logic.
    safeQuery('#pfp-run', panelElement)?.addEventListener('click', fillPacks); // fillPacks depends on fill-logic.js

    // Event Listener for the "Clear All Visible" button: Trigger the clear all inputs utility.
    // Pass true to record the state before clearing for undo functionality.
    safeQuery('#pfp-clear-btn', panelElement)?.addEventListener('click', () => clearAllInputs(true)); // clearAllInputs depends on dom-helpers.js

    // Event Listener for the "Undo" button: Trigger the undo state management function.
    safeQuery('#pfp-undo-btn', panelElement)?.addEventListener('click', applyUndo); // applyUndo depends on state-management.js

    // Event Listener for the "Redo" button: Trigger the redo state management function.
    safeQuery('#pfp-redo-btn', panelElement)?.addEventListener('click', applyRedo); // applyRedo depends on state-management.js

    // Add event listeners to the preset buttons.
    // This is handled by the createPresetButtons function itself, which adds listeners
    // when the buttons are created. We just need to ensure createPresetButtons is called
    // after the panel is added to the DOM and listeners are attached.
    // createPresetButtons depends on presets.js and addTooltips (tooltips.js).

    console.log('Pack Filler Pro: Panel event listeners added.');
}

/**
 * Updates the state of UI elements in the panel to match the current configuration and script state.
 * This includes setting input/checkbox values, showing/hiding mode-specific inputs,
 * and enabling/disabling buttons (Undo/Redo/Fill) based on state (undoStack, redoStack, isFilling).
 * Depends on: Global State (config, undoStack, redoStack, isFilling),
 * DOM Helpers (safeQuery), Constants (MAX_QTY)
 */
function updatePanelUI() {
    // Ensure the panel element exists before trying to update its UI.
    if (!panelElement) {
        console.error('Pack Filler Pro: Cannot update UI, panel element not found.');
        return;
    }

    // --- Update Input/Select/Checkbox Values from Config ---

    // Update mode select element's value.
    const modeSelect = safeQuery('#pfp-mode', panelElement);
    if (modeSelect) modeSelect.value = config.lastMode;

    // Update number input values.
    const countInput = safeQuery('#pfp-count', panelElement);
    if (countInput) countInput.value = config.lastCount; // Value is stored as is, validation/clamping on use

    const fixedQtyInput = safeQuery('#pfp-fixed', panelElement);
    if (fixedQtyInput) fixedQtyInput.value = config.lastFixedQty; // Value is stored as is

    const minQtyInput = safeQuery('#pfp-min', panelElement);
    if (minQtyInput) minQtyInput.value = config.lastMinQty; // Value is stored as is

    const maxQtyInput = safeQuery('#pfp-max', panelElement);
    if (maxQtyInput) maxQtyInput.value = config.lastMaxQty; // Value is stored as is

    // Update checkbox states.
    const clearCheckbox = safeQuery('#pfp-clear', panelElement);
    if (clearCheckbox) clearCheckbox.checked = config.lastClear;

    const loadFullPageCheckbox = safeQuery('#pfp-load-full-page', panelElement);
    if (loadFullPageCheckbox) loadFullPageCheckbox.checked = config.loadFullPage;


    // --- Update Input/Group Visibility Based on Mode ---

    const mode = config.lastMode;
    // Get all elements/groups that are mode-specific.
    panelElement.querySelectorAll('.pfp-mode-specific').forEach(el => {
        el.style.display = 'none'; // Hide all mode-specific groups initially
    });

    // Show the relevant groups based on the currently selected mode.
    if (mode === 'fixed') {
        // Show count and fixed quantity inputs for 'fixed' mode.
        const countGroup = safeQuery('#pfp-count-group', panelElement);
        if (countGroup) countGroup.style.display = 'flex'; // Use flex as per CSS layout
        const fixedGroup = safeQuery('#pfp-fixed-group', panelElement);
        if (fixedGroup) fixedGroup.style.display = 'flex';
    } else if (mode === 'max') { // 'max' mode corresponds to the Random Range UI.
        // Show count and min/max range inputs for 'max' mode.
        const countGroup = safeQuery('#pfp-count-group', panelElement);
        if (countGroup) countGroup.style.display = 'flex';
        const rangeInputs = safeQuery('#pfp-range-inputs', panelElement);
        if (rangeInputs) rangeInputs.style.display = 'flex'; // Container for min/max inputs
    } else if (mode === 'unlimited') {
         // Show only the fixed quantity input for 'unlimited' mode (it uses fixedQty).
         const fixedGroup = safeQuery('#pfp-fixed-group', panelElement);
         if (fixedGroup) fixedGroup.style.display = 'flex';
    }
     // 'clear' mode doesn't need any specific inputs shown (other than the clear checkbox itself).


    // --- Update Button States (Enabled/Disabled, Text) ---

    // Update the state of the Undo button.
    const undoBtn = safeQuery('#pfp-undo-btn', panelElement);
    if (undoBtn) {
         // Disable if the undo stack is empty or if an update is in progress.
         undoBtn.disabled = undoStack.length === 0 || isFilling;
         // Update the button text to show the number of available undo states.
         undoBtn.querySelector('.button-text').textContent = `Undo (${undoStack.length})`;
    }

     // Update the state of the Redo button.
     const redoBtn = safeQuery('#pfp-redo-btn', panelElement);
     if (redoBtn) {
          // Disable if the redo stack is empty or if an update is in progress.
          redoBtn.disabled = redoStack.length === 0 || isFilling;
          // Update the button text to show the number of available redo states.
          redoBtn.querySelector('.button-text').textContent = `Redo (${redoStack.length})`;
     }

    // Update the state of the main "Fill Packs" button.
    const fillBtn = safeQuery('#pfp-run', panelElement);
     if (fillBtn) {
          // Disable the button if an update is already in progress.
          fillBtn.disabled = isFilling;
          // Change the button text while an update is running.
          fillBtn.querySelector('.button-text').textContent = isFilling ? 'Filling...' : 'Fill Packs';
     }

    // Update the state of the "Clear All Visible" button.
    const clearBtn = safeQuery('#pfp-clear-btn', panelElement);
     if (clearBtn) {
         // Disable the button if an update is already in progress.
         clearBtn.disabled = isFilling;
         // The text doesn't change, but could if needed.
     }

    // Console log for debugging/tracking UI updates.
    // console.log('Pack Filler Pro: Panel UI updated.');
}

/**
 * Initializes the control panel lifecycle.
 * Creates the panel element, adds event listeners to its controls,
 * updates the UI to reflect current config/state, creates preset buttons,
 * and adds tooltips to panel elements.
 * Also registers a Tampermonkey menu command to toggle panel visibility.
 * Depends on: createPanel, addPanelEventListeners, updatePanelUI, createPresetButtons,
 * addTooltips, safeQuery, Global State (config, panelElement), saveConfig, showToast,
 * GM_registerMenuCommand (granted in main script)
 */
function initPanel() {
    // Attempt to create the panel element. Abort initialization if creation fails.
    const panel = createPanel(); // Depends on createPanel (defined above)
    if (!panel) {
        console.error("Pack Filler Pro: Panel initialization failed because panel element could not be created.");
        return; // Stop initialization
    }

    // Add event listeners to the panel's interactive elements.
    addPanelEventListeners(); // Depends on addPanelEventListeners (defined above)

    // Update the UI elements (input values, checkbox states, visibility, button states)
    // to match the currently loaded configuration and script state.
    updatePanelUI(); // Depends on updatePanelUI (defined above)

    // Create and add the preset buttons to their container within the panel.
    const presetContainer = safeQuery('.pfp-preset-container', panelElement); // safeQuery depends on dom-helpers.js
    if(presetContainer) {
         createPresetButtons(presetContainer); // createPresetButtons depends on presets.js
    } else {
         console.error('Pack Filler Pro: Preset container element not found in panel after creation.');
    }

    // Add tooltips to all elements within the panel that have the data-pfp-help attribute.
    addTooltips(panel); // addTooltips depends on tooltips.js

     // Register a Tampermonkey menu command to easily toggle the panel's visibility.
     if (typeof GM_registerMenuCommand !== 'undefined') {
         GM_registerMenuCommand("🎴 Toggle Pack Filler Pro Panel", () => {
              // Check if the panel element exists and toggle its 'hidden' class.
              if (panelElement) {
                   const isHidden = panelElement.classList.contains('hidden');
                   if (isHidden) {
                        panelElement.classList.remove('hidden'); // Show the panel
                        config.panelVisible = true; // Update config state
                        showToast('Pack Filler Pro Panel Shown', 'info', 1500); // Depends on showToast
                   } else {
                        panelElement.classList.add('hidden'); // Hide the panel
                        config.panelVisible = false; // Update config state
                        showToast('Pack Filler Pro Panel Hidden', 'info', 1500); // Depends on showToast
                   }
                   saveConfig(); // Save the updated visibility state (depends on config.js)
              } else {
                   // If the panel element is null, try initializing it again in case something went wrong earlier.
                   showToast('Attempting to initialize panel...', 'info', 1500); // Depends on showToast
                   initPanel(); // Recursive call
                   // If initialization was successful this time, show the panel and save state.
                   if(panelElement && !config.panelVisible) { // Check config.panelVisible in case it was already true
                        panelElement.classList.remove('hidden');
                        config.panelVisible = true;
                        saveConfig();
                   }
              }
         });
     } else {
          console.warn("Pack Filler Pro: GM_registerMenuCommand not available. Panel toggle via menu disabled.");
          // A fallback method for toggling could be added here (e.g., double-click body),
          // but it's generally less reliable and can interfere with website functionality.
     }

    console.log('Pack Filler Pro: Panel initialization complete.');
}


// Note: This file defines the main JavaScript logic for the UI panel.
// It depends heavily on global state variables and functions from many other modules.
// Ensure all dependencies are required before ui-panel.js in the main script.
