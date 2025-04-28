console.log('Pack Filler Pro: src/ui-panel.js started execution.'); // Log to confirm file loading

// This file contains the JavaScript logic for creating, managing, and interacting with the UI panel.
// It handles creating the panel element, adding event listeners, updating UI elements
// based on config/state, and initializing the panel lifecycle.
// Depends on: Global State (config, undoStack, redoStack, isFilling, panelElement - declared with var in main script),
// Constants (PANEL_ID, MAX_QTY - defined in constants.js),
// Config Management (saveConfig - defined in config.js),
// DOM Helpers (safeQuery, safeQueryAll, clearAllInputs - defined in dom-helpers.js), // safeQuery, safeQueryAll needed for finding elements
// State Management (applyUndo, applyRedo - defined in state-management.js), // Needed for undo/redo button listeners
// Fill Logic (fillPacks - defined in fill-logic.js), // Needed for fill button listener
// Presets (createPresetButtons, applyPreset - defined in presets.js), // Needed for presets functionality
// Visual Feedback (showToast - defined in feedback.js), // Needed for toast messages
// UI Enhancements (addTooltips - defined in tooltips.js), // Needed for adding tooltips
// UI Panel Structure (panelHTML - defined in ui-panel-html.js),
// UI Draggable (makeDraggable - defined in ui-draggable.js), // Needed for making panel draggable
// GM_registerMenuCommand (granted in main script),
// GM_info (global Tampermonkey object)

// Global variable to hold the status message element reference
var statusAreaElement = null; // Declared with var at the top level of the file

// Ensure necessary dependencies are available (basic checks)
if (typeof PANEL_ID === 'undefined') console.error("Pack Filler Pro: Dependency missing: PANEL_ID from constants.js");
if (typeof saveConfig === 'undefined') console.error("Pack Filler Pro: Dependency missing: saveConfig from config.js");
if (typeof showToast === 'undefined') console.error("Pack Filler Pro: Dependency missing: showToast from feedback.js");
if (typeof panelHTML === 'undefined') console.error("Pack Filler Pro: Dependency missing: panelHTML from ui-panel-html.js");
// Note: Other dependencies like safeQuery, fillPacks, etc., will be checked before use if needed.


/**
 * Updates the status message displayed in the panel's status area.
 * @param {string} message - The message to display.
 * @param {boolean} [append=false] - If true, append the message; otherwise, replace the current message.
 */
function updateStatus(message, append = false) {
    // Ensure the status area element exists
    if (!statusAreaElement) {
        // Fallback to console log if the UI element isn't ready or found
        console.log('Pack Filler Pro Status (UI not ready):', message);
        return;
    }

    if (append) {
        statusAreaElement.innerHTML += '<br>' + message; // Use innerHTML to allow line breaks
    } else {
        statusAreaElement.innerHTML = message;
    }
     console.log('Pack Filler Pro Status:', message); // Always log status to console
}


/**
 * Creates the main panel element and appends it to the document body.
 * Sets initial position and visibility based on the current configuration.
 * Makes the panel header draggable.
 * @returns {Element|null} The created panel element or null if creation failed.
 * Depends on: Global State (config, panelElement), Constants (PANEL_ID),
 * UI Panel Structure (panelHTML), makeDraggable (from ui-draggable.js),
 * safeQuery (from dom-helpers.js), showToast (from feedback.js), saveConfig (from config.js),
 * updateStatus (defined above)
 */
function createPanel() {
    console.log('Pack Filler Pro: Starting createPanel()...');
    updateStatus('Creating panel...'); // Update status

    // Check if panelElement is already set (declared with var at top level in main script)
    if (panelElement) {
         console.log('Pack Filler Pro: Panel already exists (global variable is set).');
         updateStatus('Panel already exists.'); // Update status
        return panelElement; // Return existing panel if already created
    }

    console.log('Pack Filler Pro: Attempting to create panel element...');
    // Create a temporary container to parse the panelHTML string.
    const panelContainer = document.createElement('div');
    // Ensure panelHTML is available from ui-panel-html.js
    if (typeof panelHTML !== 'string') {
         console.error("Pack Filler Pro: panelHTML string not available from ui-panel-html.js!");
         if (typeof showToast === 'function') showToast("Error creating UI panel: HTML missing.", 'error');
         updateStatus('Error: Panel HTML missing.', false); // Update status
         return null;
    }
    panelContainer.innerHTML = panelHTML.trim(); // Use trim() to remove leading/trailing whitespace

    // Get the actual panel element (the first child inside the temporary container).
    // Assign it to the global panelElement variable (declared with var in main script).
    panelElement = panelContainer.firstElementChild;

    // Store the status area element reference globally
    if (panelElement) {
        statusAreaElement = panelElement.querySelector('.pfp-status-area');
         if (!statusAreaElement) {
              console.warn('Pack Filler Pro: Status area element .pfp-status-area not found in panel HTML.');
              // Continue without status updates if element is missing
         } else {
              console.log('Pack Filler Pro: Status area element found.');
         }
    }


    // Validate that the element was created and has the correct ID.
    // Ensure PANEL_ID is available from constants.js
     if (typeof PANEL_ID === 'undefined') {
          console.error("Pack Filler Pro: PANEL_ID constant not available from constants.js!");
          if (typeof showToast === 'function') showToast("Error creating UI panel: Constants missing.", 'error');
          updateStatus('Error: Constants missing.', false); // Update status
          panelElement = null; // Reset the global variable if creation failed
          return null;
     }

    if (!panelElement || panelElement.id !== PANEL_ID) {
         console.error("Pack Filler Pro: Error creating panel element from HTML structure or ID mismatch.");
         if (typeof showToast === 'function') showToast("Error creating UI panel.", 'error');
         updateStatus('Error: Panel creation failed.', false); // Update status
         panelElement = null; // Reset the global variable if creation failed
         return null;
    }

    panelElement.id = PANEL_ID; // Ensure the ID is correctly assigned


    // Set initial position based on the loaded configuration.
    // Ensure config is available (declared with var in main script and loaded)
    if (config && config.panelPos) {
        panelElement.style.position = 'fixed';
        panelElement.style.top = config.panelPos.top;
        panelElement.style.left = config.panelPos.left || 'auto';
        panelElement.style.right = config.panelPos.right || 'auto';
        panelElement.style.bottom = config.panelPos.bottom || 'auto';
         console.log('Pack Filler Pro: Panel position set from config.');
         updateStatus('Position set from config.', true); // Append status
    } else {
         console.warn('Pack Filler Pro: Config or panelPos missing, using default position.');
          updateStatus('Using default position.', true); // Append status
         // Apply a basic default position if config is not available
         panelElement.style.position = 'fixed';
         panelElement.style.top = '120px';
         panelElement.style.right = '30px';
         panelElement.style.left = 'auto';
         panelElement.style.bottom = 'auto';
    }


    // Set initial visibility based on the loaded configuration.
    // Ensure config is available
    if (config && config.hasOwnProperty('panelVisible')) {
        if (!config.panelVisible) {
            panelElement.classList.add('hidden');
             console.log('Pack Filler Pro: Panel initially hidden based on config.');
             updateStatus('Panel initially hidden.', true); // Append status
        } else {
             console.log('Pack Filler Pro: Panel initially visible based on config.');
             updateStatus('Panel initially visible.', true); // Append status
        }
    } else {
         console.warn('Pack Filler Pro: panelVisible config missing, panel will be visible by default.');
          updateStatus('Config missing, panel visible.', true); // Append status
         // Default to visible if config.panelVisible is missing
         panelElement.classList.remove('hidden');
    }


    // Append the created panel element to the document body.
    document.body.appendChild(panelElement);

    // Make the panel draggable by dragging its header.
    // Ensure safeQuery is available from dom-helpers.js and makeDraggable from ui-draggable.js
     if (typeof safeQuery === 'function' && typeof makeDraggable === 'function') {
          const headerElement = safeQuery('.pfp-header', panelElement);
          if (headerElement) {
              makeDraggable(headerElement, panelElement, (newPos) => {
                   // Ensure config and saveConfig are available from config.js
                   if (config && typeof saveConfig === 'function') {
                        config.panelPos = newPos;
                        saveConfig();
                        console.log('Pack Filler Pro: Panel position saved.');
                        // updateStatus('Position saved.', true); // Can be noisy
                   } else {
                        console.error("Pack Filler Pro: Cannot save panel position, config or saveConfig missing.");
                        updateStatus('Error: Cannot save position.', true); // Append status
                   }
              });
               console.log('Pack Filler Pro: Panel header found, dragging enabled.');
               updateStatus('Dragging enabled.', true); // Append status
          } else {
              console.warn("Pack Filler Pro: Panel header element not found, dragging disabled.");
              updateStatus('Warning: Header not found, dragging disabled.', true); // Append status
          }
     } else {
          console.warn("Pack Filler Pro: Dependencies for dragging missing (safeQuery or makeDraggable), dragging disabled.");
           updateStatus('Warning: Dragging dependencies missing.', true); // Append status
     }


    console.log('Pack Filler Pro: Panel created and added to DOM.');
    updateStatus('Panel created successfully.'); // Update status
    return panelElement;
}

/**
 * Adds event listeners to the controls within the panel (buttons, inputs, selects, checkboxes).
 * Updates the configuration and saves it when relevant inputs change.
 * Triggers core actions (fill, clear, undo, redo, apply preset).
 * Depends on: Global State (config, undoStack, redoStack, isFilling, panelElement),
 * safeQuery, safeQueryAll (from dom-helpers.js), fillPacks (from fill-logic.js),
 * clearAllInputs (from dom-helpers.js), applyUndo, applyRedo (from state-management.js),
 * applyPreset, createPresetButtons (from presets.js), saveConfig (from config.js),
 * updatePanelUI (defined below), addTooltips (from tooltips.js), updateStatus (defined above)
 */
function addPanelEventListeners() {
    console.log('Pack Filler Pro: Starting addPanelEventListeners()...');
    updateStatus('Adding event listeners...'); // Update status
    // Ensure the panel element exists before trying to add listeners.
    if (!panelElement) {
        console.error('Pack Filler Pro: Cannot add listeners, panel element not found.');
        updateStatus('Error: Panel element not found for listeners.', true); // Append status
        return;
    }

    console.log('Pack Filler Pro: Adding panel event listeners...');

    // Event Listener for the Close button: Hide the panel and save visibility state.
    // Ensure safeQuery is available from dom-helpers.js
    if (typeof safeQuery === 'function') {
        safeQuery('.pfp-close', panelElement)?.addEventListener('click', () => {
            setPanelVisibility(false); // Hide the panel (setPanelVisibility defined below)
        });
         console.log('Pack Filler Pro: Close button listener added.');
         updateStatus('Close button listener added.', true); // Append status

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
                 // Ensure config and saveConfig are available
                 if (config && config.hasOwnProperty(prop) && typeof saveConfig === 'function') {
                     config[prop] = value; // Update the global config variable
                     saveConfig(); // Save the updated config
                     updatePanelUI(); // Update the panel UI (e.g., show/hide mode-specific inputs)
                     // console.log(`Pack Filler Pro: Config updated: ${prop} = ${value}`); // Can be noisy
                 } else {
                     console.warn(`Pack Filler Pro: Attempted to set unknown config property: ${prop} from element #${id} or config/saveConfig missing.`);
                 }
             });
         });
          console.log('Pack Filler Pro: Config input listeners added.');
          updateStatus('Config input listeners added.', true); // Append status


         // Event Listener for the "Fill Packs" button: Trigger the main fill logic.
         // Ensure fillPacks is available from fill-logic.js
         const runButton = safeQuery('#pfp-run', panelElement);
         if (runButton && typeof fillPacks === 'function') {
              runButton.addEventListener('click', fillPacks);
              console.log('Pack Filler Pro: Fill Packs button listener added.');
              updateStatus('Fill button listener added.', true); // Append status
         } else if (runButton) {
              console.warn('Pack Filler Pro: fillPacks function not available, Fill button disabled.');
               runButton.disabled = true; // Disable button if function is missing
               updateStatus('Warning: Fill logic missing.', true); // Append status
         } else {
              console.warn('Pack Filler Pro: Fill Packs button not found.');
               updateStatus('Warning: Fill button not found.', true); // Append status
         }


         // Event Listener for the "Clear All Visible" button: Trigger the clear all inputs utility.
         // Pass true to record the state before clearing for undo functionality.
         // Ensure clearAllInputs is available from dom-helpers.js
         const clearButton = safeQuery('#pfp-clear-btn', panelElement);
         if (clearButton && typeof clearAllInputs === 'function') {
              clearButton.addEventListener('click', () => clearAllInputs(true));
               console.log('Pack Filler Pro: Clear All Visible button listener added.');
               updateStatus('Clear button listener added.', true); // Append status
         } else if (clearButton) {
              console.warn('Pack Filler Pro: clearAllInputs function not available, Clear button disabled.');
               clearButton.disabled = true; // Disable button if function is missing
               updateStatus('Warning: Clear logic missing.', true); // Append status
         } else {
               console.warn('Pack Filler Pro: Clear All Visible button not found.');
                updateStatus('Warning: Clear button not found.', true); // Append status
         }


         // Event Listeners for Undo/Redo buttons: Trigger state management functions.
         // Ensure applyUndo and applyRedo are available from state-management.js
         const undoBtn = safeQuery('#pfp-undo-btn', panelElement);
         if (undoBtn && typeof applyUndo === 'function') {
              undoBtn.addEventListener('click', applyUndo);
              console.log('Pack Filler Pro: Undo button listener added.');
              updateStatus('Undo listener added.', true); // Append status
         } else if (undoBtn) {
              console.warn('Pack Filler Pro: applyUndo function not available, Undo button disabled.');
               undoBtn.disabled = true; // Disable button if function is missing
               updateStatus('Warning: Undo logic missing.', true); // Append status
         } else {
              console.warn('Pack Filler Pro: Undo button not found.');
               updateStatus('Warning: Undo button not found.', true); // Append status
         }

         const redoBtn = safeQuery('#pfp-redo-btn', panelElement);
         if (redoBtn && typeof applyRedo === 'function') {
              redoBtn.addEventListener('click', applyRedo);
              console.log('Pack Filler Pro: Redo button listener added.');
              updateStatus('Redo listener added.', true); // Append status
         } else if (redoBtn) {
              console.warn('Pack Filler Pro: applyRedo function not available, Redo button disabled.');
               redoBtn.disabled = true; // Disable button if function is missing
               updateStatus('Warning: Redo logic missing.', true); // Append status
         } else {
              console.warn('Pack Filler Pro: Redo button not found.');
               updateStatus('Warning: Redo button not found.', true); // Append status
         }


         // Add event listeners to the preset buttons (handled by createPresetButtons).
         // Ensure createPresetButtons is available from presets.js
         const presetContainer = safeQuery('.pfp-preset-container', panelElement);
         if(presetContainer && typeof createPresetButtons === 'function') {
              createPresetButtons(presetContainer); // createPresetButtons adds its own listeners
               console.log('Pack Filler Pro: Preset container found, createPresetButtons called.');
               updateStatus('Preset buttons added.', true); // Append status
         } else if (!presetContainer) {
              console.warn('Pack Filler Pro: Preset container element not found in panel.');
               updateStatus('Warning: Preset container not found.', true); // Append status
         } else {
              console.warn('Pack Filler Pro: createPresetButtons function not available.');
               updateStatus('Warning: Preset logic missing.', true); // Append status
         }


    } else {
         console.error('Pack Filler Pro: safeQuery function not available from dom-helpers.js! Cannot add panel event listeners.');
         updateStatus('Error: DOM helpers missing.', true); // Append status
    }


    console.log('Pack Filler Pro: Panel event listeners added.');
    updateStatus('Event listeners setup complete.'); // Update status
}

/**
 * Updates the state of UI elements in the panel to match the current configuration and script state.
 * This includes setting input/checkbox values, showing/hiding mode-specific inputs,
 * and enabling/disabling buttons (Undo/Redo/Fill) based on state (undoStack, redoStack, isFilling).
 * Depends on: Global State (config, undoStack, redoStack, isFilling, panelElement),
 * safeQuery (from dom-helpers.js), Constants (MAX_QTY), updateStatus (defined above)
 */
function updatePanelUI() {
    // console.log('Pack Filler Pro: Starting updatePanelUI()...'); // Can be noisy
    // Ensure the panel element exists before trying to update its UI.
    if (!panelElement) {
        console.error('Pack Filler Pro: Cannot update UI, panel element not found.');
         updateStatus('Error: Panel element not found for UI update.', true); // Append status
        return;
    }
    // Ensure safeQuery is available from dom-helpers.js
    if (typeof safeQuery !== 'function') {
         console.error('Pack Filler Pro: safeQuery function not available from dom-helpers.js! Cannot update panel UI.');
         updateStatus('Error: DOM helpers missing for UI update.', true); // Append status
         return;
    }


    // console.log('Pack Filler Pro: Updating panel UI...'); // Can be noisy

    // --- Update Input/Select/Checkbox Values from Config ---
    // Ensure config is available
    if (config) {
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

          // console.log('Pack Filler Pro: UI inputs updated from config.'); // Can be noisy
    } else {
         console.warn('Pack Filler Pro: Config object not available for UI update.');
          updateStatus('Warning: Config missing for UI update.', true); // Append status
    }


    // --- Update Input/Group Visibility Based on Mode ---

    const mode = config ? config.lastMode : null; // Use mode from config if available
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
    // Ensure undoStack, redoStack, isFilling are available (declared with var in main script)

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
    // console.log('Pack Filler Pro: Panel UI updated.'); // Can be noisy
}

/**
 * Sets the panel's visibility (shows or hides it) and saves the state to storage.
 * This is a simplified version only dealing with the 'hidden' class and config saving.
 * @param {boolean} isVisible - True to show the panel, false to hide it.
 * Depends on: Global State (panelElement, config), saveConfig (from config.js), showToast (from feedback.js), updateStatus (defined above)
 */
function setPanelVisibility(isVisible) {
    console.log('Pack Filler Pro: Starting setPanelVisibility()...', isVisible);
    if (!panelElement) {
        console.error('Pack Filler Pro: Panel element not found to set visibility.');
        updateStatus('Error: Panel element not found for visibility change.', true); // Append status
        return;
    }

    if (isVisible) {
        panelElement.classList.remove('hidden');
        console.log('Pack Filler Pro: Panel shown.');
        updateStatus('Panel shown.', false); // Replace status
        // Ensure showToast is available from feedback.js
        if (typeof showToast === 'function') showToast('Pack Filler Pro Panel Shown', 'info', 1500);
    } else {
        panelElement.classList.add('hidden');
        console.log('Pack Filler Pro: Panel hidden.');
        updateStatus('Panel hidden.', false); // Replace status
         // Ensure showToast is available from feedback.js
        if (typeof showToast === 'function') showToast('Pack Filler Pro Panel Hidden', 'info', 1500);
    }

    // Update config state and save.
    // Ensure config and saveConfig are available
    if (config && typeof saveConfig === 'function') {
         config.panelVisible = isVisible; // Update global config variable
         saveConfig(); // Save the updated visibility state
         console.log('Pack Filler Pro: Panel visibility state saved:', isVisible);
         updateStatus('Visibility state saved.', true); // Append status
    } else {
         console.error('Pack Filler Pro: Cannot save panel visibility state, config or saveConfig missing.');
         updateStatus('Error: Cannot save visibility state.', true); // Append status
    }
}


/**
 * Initializes the control panel lifecycle.
 * Creates the panel element, adds event listeners to its controls,
 * updates the UI to reflect current config/state, creates preset buttons,
 * and adds tooltips to panel elements.
 * Also registers a Tampermonkey menu command to toggle panel visibility.
 * Depends on: createPanel, addPanelEventListeners, updatePanelUI, createPresetButtons (from presets.js),
 * addTooltips (from tooltips.js), safeQuery (from dom-helpers.js),
 * GM_registerMenuCommand (granted in main script), Global State (config, panelElement),
 * showToast (from feedback.js), saveConfig (from config.js), updateStatus (defined above)
 */
function initPanel() {
    console.log('Pack Filler Pro: Starting initPanel()...');
    updateStatus('Starting panel initialization...'); // Update status

    // Attempt to create the panel element. Abort initialization if creation fails.
    // Ensure createPanel is available (defined above)
    if (typeof createPanel !== 'function') {
         console.error("Pack Filler Pro: createPanel function not available!");
         if (typeof showToast === 'function') showToast("Error initializing panel: createPanel missing.", 'error');
         updateStatus('Error: createPanel function missing.', false); // Update status
         return;
    }
    const panel = createPanel(); // createPanel defined above
    if (!panel) {
        console.error("Pack Filler Pro: Panel initialization failed because panel element could not be created.");
        // showToast and updateStatus are called inside createPanel if it fails
        return; // Stop initialization
    }

    // Add event listeners to the panel's interactive elements.
    // Ensure addPanelEventListeners is available (defined above)
    if (typeof addPanelEventListeners === 'function') {
         addPanelEventListeners(); // addPanelEventListeners defined above
    } else {
         console.error("Pack Filler Pro: addPanelEventListeners function not available!");
         updateStatus('Error: addPanelEventListeners function missing.', true); // Append status
    }

    // Update the UI elements (input values, checkbox states, visibility, button states)
    // to match the currently loaded configuration and script state.
    // Ensure updatePanelUI is available (defined below)
     if (typeof updatePanelUI === 'function') {
          updatePanelUI(); // updatePanelUI defined below
           console.log('Pack Filler Pro: updatePanelUI called.');
           updateStatus('UI updated from config.', true); // Append status
     } else {
          console.error("Pack Filler Pro: updatePanelUI function not available!");
          updateStatus('Error: updatePanelUI function missing.', true); // Append status
     }


    // Create and add the preset buttons to their container within the panel.
    // Ensure safeQuery is available from dom-helpers.js and createPresetButtons from presets.js
     if (typeof safeQuery === 'function' && typeof createPresetButtons === 'function') {
          const presetContainer = safeQuery('.pfp-preset-container', panelElement);
          if(presetContainer) {
               createPresetButtons(presetContainer); // createPresetButtons depends on presets.js
                console.log('Pack Filler Pro: Preset container found, createPresetButtons called.');
                updateStatus('Preset buttons added.', true); // Append status
          } else {
               console.warn('Pack Filler Pro: Preset container element not found in panel after creation.');
               updateStatus('Warning: Preset container not found.', true); // Append status
          }
     } else if (typeof safeQuery === 'function') {
          console.warn('Pack Filler Pro: createPresetButtons function not available, presets disabled.');
           updateStatus('Warning: Preset logic missing.', true); // Append status
     } else {
          console.warn('Pack Filler Pro: safeQuery function not available, presets disabled.');
           updateStatus('Warning: DOM helpers missing for presets.', true); // Append status
     }


    // Add tooltips to all elements within the panel that have the data-pfp-help attribute.
    // Ensure addTooltips is available from tooltips.js
     if (typeof addTooltips === 'function') {
          addTooltips(panel); // addTooltips depends on tooltips.js
           console.log('Pack Filler Pro: addTooltips called for panel.');
           updateStatus('Tooltips added.', true); // Append status
     } else {
          console.warn('Pack Filler Pro: addTooltips function not available, tooltips disabled.');
           updateStatus('Warning: Tooltip logic missing.', true); // Append status
     }


     // Register a Tampermonkey menu command to easily toggle the panel's visibility.
     console.log('Pack Filler Pro: Checking for GM_registerMenuCommand...');
     updateStatus('Checking for menu command support...', true); // Append status
     if (typeof GM_registerMenuCommand !== 'undefined') {
          console.log('Pack Filler Pro: GM_registerMenuCommand available, registering menu command...');
           updateStatus('Registering menu command...', true); // Append status
         GM_registerMenuCommand("🎴 Toggle Pack Filler Pro Panel", () => {
              console.log('Pack Filler Pro: Menu command triggered.');
              // Check if the global panelElement variable is set.
              if (panelElement) {
                   const isHidden = panelElement.classList.contains('hidden');
                   // Ensure setPanelVisibility is available (defined above)
                   if (typeof setPanelVisibility === 'function') {
                        setPanelVisibility(!isHidden); // Toggle visibility
                   } else {
                        console.error("Pack Filler Pro: setPanelVisibility function not available!");
                        updateStatus('Error: setPanelVisibility function missing.', true); // Append status
                   }
              } else {
                   // If the panel element is null, try creating and initializing it again.
                   console.warn('Pack Filler Pro: Panel element null in menu command, attempting re-initialization...');
                   updateStatus('Panel missing, attempting re-init...', false); // Replace status
                   // Ensure showToast is available
                   if (typeof showToast === 'function') showToast('Attempting to initialize panel...', 'info', 1500);
                   // Ensure initPanel is available (defined above)
                   if (typeof initPanel === 'function') {
                        initPanel(); // Recursive call - guarded by panelElement check and function availability checks
                        // If initialization was successful this time, show the panel and save state.
                        // Check panelElement again after initPanel call
                        if(panelElement && typeof setPanelVisibility === 'function' && config.panelVisible !== undefined && !config.panelVisible) { // Added check for config.panelVisible existence
                             setPanelVisibility(true); // Show the panel if init was successful and it wasn't already visible
                        } else if (!panelElement && typeof showToast === 'function') {
                             showToast('Panel initialization failed again.', 'error', 2000);
                              updateStatus('Panel re-init failed.', false); // Replace status
                        }
                   } else {
                         console.error("Pack Filler Pro: initPanel function not available for re-initialization!");
                         updateStatus('Error: initPanel function missing for re-init.', false); // Replace status
                         if (typeof showToast === 'function') showToast('Panel re-initialization failed.', 'error', 2000);
                   }
              }
         });
          console.log('Pack Filler Pro: Menu command registered.');
           updateStatus('Menu command registered.', true); // Append status
     } else {
          console.warn("Pack Filler Pro: GM_registerMenuCommand not available. Panel toggle via menu disabled.");
           updateStatus('Menu command not available.', true); // Append status
     }

    console.log('Pack Filler Pro: Panel initialization complete.');
    updateStatus('Panel initialization complete.'); // Update status
}


// Note: This file defines the core panel logic functions and the main initialization function.
// It depends on global state variables (declared with var in main script) and functions/constants from other modules.
// Ensure dependencies (constants.js, config.js, feedback.js, ui-panel-html.js, dom-helpers.js, state-management.js, fill-logic.js, presets.js, tooltips.js, ui-draggable.js) are required before ui-panel.js.
