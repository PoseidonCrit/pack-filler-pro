// This file contains the simplified JavaScript logic for creating, managing, and updating the UI panel.
// It focuses only on panel creation, basic event listeners (close), and menu command registration.
// Dependencies are reduced for debugging purposes.
// Depends on: Global State (config, panelElement - declared with var in main script),
// Constants (PANEL_ID - defined in constants.js),
// Config Management (saveConfig - defined in config.js), // Needed for saving panel visibility
// Visual Feedback (showToast - defined in feedback.js), // Needed for toast messages
// UI Panel Structure (panelHTML - defined in ui-panel-html.js),
// GM_registerMenuCommand (granted in main script)


/**
 * Creates the main panel element and appends it to the document body.
 * Sets initial position and visibility based on the current configuration.
 * (Dragging is disabled in this simplified version).
 * @returns {Element|null} The created panel element or null if creation failed.
 * Depends on: Global State (config, panelElement), Constants (PANEL_ID),
 * UI Panel Structure (panelHTML), showToast, saveConfig
 */
function createPanel() {
    console.log('Pack Filler Pro (Simplified): Starting createPanel()...');
    // Check if panelElement is already set (declared with var at top level)
    if (panelElement) {
         console.log('Pack Filler Pro (Simplified): Panel already exists (global variable is set).');
        return panelElement; // Return existing panel if already created
    }

    console.log('Pack Filler Pro (Simplified): Attempting to create panel element...');
    // Create a temporary container to parse the panelHTML string.
    const panelContainer = document.createElement('div');
    // Ensure panelHTML is available from ui-panel-html.js
    if (typeof panelHTML !== 'string') {
         console.error("Pack Filler Pro (Simplified): panelHTML string not available from ui-panel-html.js!");
         showToast("Error creating UI panel: HTML missing.", 'error'); // Depends on showToast
         return null;
    }
    panelContainer.innerHTML = panelHTML.trim(); // Use trim() to remove leading/trailing whitespace

    // Get the actual panel element (the first child inside the temporary container).
    // Assign it to the global panelElement variable (declared with var in main script).
    panelElement = panelContainer.firstElementChild;

    // Validate that the element was created and has the correct ID.
    // Ensure PANEL_ID is available from constants.js
     if (typeof PANEL_ID === 'undefined') {
          console.error("Pack Filler Pro (Simplified): PANEL_ID constant not available from constants.js!");
          showToast("Error creating UI panel: Constants missing.", 'error'); // Depends on showToast
          panelElement = null; // Reset the global variable if creation failed
          return null;
     }

    if (!panelElement || panelElement.id !== PANEL_ID) {
         console.error("Pack Filler Pro (Simplified): Error creating panel element from HTML structure or ID mismatch.");
         showToast("Error creating UI panel.", 'error'); // Depends on showToast
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
         console.log('Pack Filler Pro (Simplified): Panel position set from config.');
    } else {
         console.warn('Pack Filler Pro (Simplified): Config or panelPos missing, using default position.');
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
             console.log('Pack Filler Pro (Simplified): Panel initially hidden based on config.');
        } else {
             console.log('Pack Filler Pro (Simplified): Panel initially visible based on config.');
        }
    } else {
         console.warn('Pack Filler Pro (Simplified): panelVisible config missing, panel will be visible by default.');
         // Default to visible if config.panelVisible is missing
         panelElement.classList.remove('hidden');
    }


    // Append the created panel element to the document body.
    document.body.appendChild(panelElement);

    // Draggable functionality is commented out in this simplified version.
    // const headerElement = panelElement.querySelector('.pfp-header');
    // if (headerElement) {
    //     makeDraggable(headerElement, panelElement, (newPos) => {
    //          config.panelPos = newPos;
    //          // Ensure saveConfig is available from config.js
    //          if (typeof saveConfig === 'function') {
    //               saveConfig();
    //               console.log('Pack Filler Pro (Simplified): Panel position saved.');
    //          } else {
    //               console.error("Pack Filler Pro (Simplified): saveConfig function not available!");
    //          }
    //     });
    // } else {
    //     console.warn("Pack Filler Pro (Simplified): Panel header element not found, dragging disabled.");
    // }

    console.log('Pack Filler Pro (Simplified): Panel created and added to DOM.');
    return panelElement;
}

/**
 * Adds basic event listeners to the controls within the panel (only close button in this simplified version).
 * (Other event listeners are commented out).
 * Depends on: Global State (panelElement), saveConfig (from config.js), setPanelVisibility (defined below)
 */
function addPanelEventListeners() {
    // Ensure the panel element exists before trying to add listeners.
    if (!panelElement) {
        console.error('Pack Filler Pro (Simplified): Cannot add listeners, panel element not found.');
        return;
    }

    console.log('Pack Filler Pro (Simplified): Adding basic panel event listeners...');

    // Event Listener for the Close button: Hide the panel and save visibility state.
    const closeButton = panelElement.querySelector('.pfp-close');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            setPanelVisibility(false); // Hide the panel (setPanelVisibility defined below)
        });
         console.log('Pack Filler Pro (Simplified): Close button listener added.');
    } else {
         console.warn('Pack Filler Pro (Simplified): Close button element not found.');
    }


    // Event Listeners for configuration input changes (mode, count, qty, range, checkboxes)
    // are commented out in this simplified version.
    // panelElement.querySelectorAll('.pfp-config-section input, .pfp-config-section select').forEach(input => { /* ... */ });

    // Event Listener for the "Fill Packs" button is commented out.
    // const runButton = panelElement.querySelector('#pfp-run');
    // if (runButton) runButton.addEventListener('click', fillPacks);

    // Event Listener for the "Clear All Visible" button is commented out.
    // const clearButton = panelElement.querySelector('#pfp-clear-btn');
    // if (clearButton) clearButton.addEventListener('click', () => clearAllInputs(true));

    // Event Listeners for Undo/Redo buttons are commented out.
    // const undoBtn = panelElement.querySelector('#pfp-undo-btn');
    // if (undoBtn) undoBtn.addEventListener('click', applyUndo);
    // const redoBtn = panelElement.querySelector('#pfp-redo-btn');
    // if (redoBtn) redoBtn.addEventListener('click', applyRedo);

    // Preset button listeners are handled by createPresetButtons, which is commented out.

    console.log('Pack Filler Pro (Simplified): Basic panel event listeners added.');
}

/**
 * Sets the panel's visibility (shows or hides it) and saves the state to storage.
 * This is a simplified version only dealing with the 'hidden' class and config saving.
 * @param {boolean} isVisible - True to show the panel, false to hide it.
 * Depends on: Global State (panelElement, config), saveConfig (from config.js), showToast (from feedback.js)
 */
function setPanelVisibility(isVisible) {
    if (!panelElement) {
        console.error('Pack Filler Pro (Simplified): Panel element not found to set visibility.');
        return;
    }

    if (isVisible) {
        panelElement.classList.remove('hidden');
        console.log('Pack Filler Pro (Simplified): Panel shown.');
        // Ensure showToast is available from feedback.js
        if (typeof showToast === 'function') showToast('Pack Filler Pro Panel Shown', 'info', 1500);
    } else {
        panelElement.classList.add('hidden');
        console.log('Pack Filler Pro (Simplified): Panel hidden.');
         // Ensure showToast is available from feedback.js
        if (typeof showToast === 'function') showToast('Pack Filler Pro Panel Hidden', 'info', 1500);
    }

    // Update config state and save.
    // Ensure config and saveConfig are available
    if (config && typeof saveConfig === 'function') {
         config.panelVisible = isVisible; // Update global config variable
         saveConfig(); // Save the updated visibility state
         console.log('Pack Filler Pro (Simplified): Panel visibility state saved:', isVisible);
    } else {
         console.error('Pack Filler Pro (Simplified): Cannot save panel visibility state, config or saveConfig missing.');
    }
}


/**
 * Initializes the control panel lifecycle in this simplified version.
 * Creates the panel element, adds basic event listeners, sets initial visibility,
 * and registers the Tampermonkey menu command.
 * (Other initialization steps are commented out).
 * Depends on: createPanel, addPanelEventListeners, setPanelVisibility,
 * GM_registerMenuCommand (granted in main script), Global State (config, panelElement),
 * showToast (from feedback.js), saveConfig (from config.js)
 */
function initPanel() {
    console.log('Pack Filler Pro (Simplified): Starting initPanel()...');

    // Attempt to create the panel element. Abort initialization if creation fails.
    // Ensure createPanel is available (defined above)
    if (typeof createPanel !== 'function') {
         console.error("Pack Filler Pro (Simplified): createPanel function not available!");
         showToast("Error initializing panel: createPanel missing.", 'error');
         return;
    }
    const panel = createPanel(); // createPanel defined above
    if (!panel) {
        console.error("Pack Filler Pro (Simplified): Panel initialization failed because panel element could not be created.");
        // showToast is called inside createPanel if it fails
        return; // Stop initialization
    }

    // Add basic event listeners to the panel's interactive elements.
    // Ensure addPanelEventListeners is available (defined above)
    if (typeof addPanelEventListeners === 'function') {
         addPanelEventListeners(); // addPanelEventListeners defined above
    } else {
         console.error("Pack Filler Pro (Simplified): addPanelEventListeners function not available!");
    }


    // Set the initial visibility of the panel based on the saved state.
    // This is handled inside createPanel now based on the loaded config.
    // We just need to ensure the config was loaded before calling createPanel.

    // Presets creation, tooltips beyond basic CSS, and draggable are commented out.
    // const presetContainer = panelElement.querySelector('.pfp-preset-container');
    // if(presetContainer && typeof createPresetButtons === 'function') {
    //      createPresetButtons(presetContainer);
    // } else if (!presetContainer) {
    //      console.warn('Pack Filler Pro (Simplified): Preset container element not found in panel.');
    // } else {
    //      console.warn('Pack Filler Pro (Simplified): createPresetButtons function not available.');
    // }
    // if (typeof addTooltips === 'function') addTooltips(panel);


     // Register a Tampermonkey menu command to easily toggle the panel's visibility.
     console.log('Pack Filler Pro (Simplified): Checking for GM_registerMenuCommand...');
     if (typeof GM_registerMenuCommand !== 'undefined') {
          console.log('Pack Filler Pro (Simplified): GM_registerMenuCommand available, registering menu command...');
         GM_registerMenuCommand("🎴 Toggle Pack Filler Pro Panel", () => {
              console.log('Pack Filler Pro (Simplified): Menu command triggered.');
              // Check if the global panelElement variable is set.
              if (panelElement) {
                   const isHidden = panelElement.classList.contains('hidden');
                   // Ensure setPanelVisibility is available (defined above)
                   if (typeof setPanelVisibility === 'function') {
                        setPanelVisibility(!isHidden); // Toggle visibility
                   } else {
                        console.error("Pack Filler Pro (Simplified): setPanelVisibility function not available!");
                   }
              } else {
                   // If the panel element is null, try creating and initializing it again.
                   console.warn('Pack Filler Pro (Simplified): Panel element null in menu command, attempting re-initialization...');
                   // Ensure showToast is available
                   if (typeof showToast === 'function') showToast('Attempting to initialize panel...', 'info', 1500);
                   initPanel(); // Recursive call - guarded by panelElement check and function availability checks
                   // If initialization was successful this time, show the panel and save state.
                   // Check panelElement again after initPanel call
                   if(panelElement && typeof setPanelVisibility === 'function' && !config.panelVisible) {
                        setPanelVisibility(true); // Show the panel if init was successful and it wasn't already visible
                   } else if (!panelElement && typeof showToast === 'function') {
                        showToast('Panel initialization failed again.', 'error', 2000);
                   }
              }
         });
     } else {
          console.warn("Pack Filler Pro (Simplified): GM_registerMenuCommand not available. Panel toggle via menu disabled.");
     }

    console.log('Pack Filler Pro (Simplified): Panel initialization complete.');
}


// Note: This file defines the core panel logic functions and the main initialization function.
// It depends on global state variables (declared with var in main script) and functions/constants from other modules.
// Ensure dependencies (constants.js, config.js, feedback.js, ui-panel-html.js) are required before ui-panel.js.
