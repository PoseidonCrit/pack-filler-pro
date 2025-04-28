 This file defines and manages the script's preset configurations.
 Depends on Global State (config - declared in main script),
 Constants (MAX_QTY, TOOLTIP_THEME - defined in constants.js),
 Config Management (saveConfig - defined in config.js),
 Visual Feedback (showToast - defined in feedback.js),
 UI Panel Management (updatePanelUI - defined in ui-panel.js),
 UI Enhancements (addTooltips - defined in tooltips.js)


 --- Smart Presets --- 
 Defines a set of predefined configurations that users can quickly apply.
 Each key is the preset name, and the value is an object matching the structure
 of the 'last...' properties in the DEFAULT_CONFIG.
const PRESETS = {
    'Tournament (24x3)' { lastMode 'fixed', lastCount 24, lastFixedQty 3, lastMinQty 0, lastMaxQty 0, lastClear false },  Set minmax to 0 to avoid inheriting random range from other presets
    'Booster Box (24x9)' { lastMode 'fixed', lastCount 24, lastFixedQty 9, lastMinQty 0, lastMaxQty 0, lastClear false },
    'Random (0-5 All)' { lastMode 'max', lastCount 999, lastFixedQty 0, lastMinQty 0, lastMaxQty 5, lastClear false },  Use a high count like 999 for 'all' effect in Random mode (as calculateFillCount respects available packs)
    'Max (99 All)' { lastMode 'unlimited', lastCount 999, lastFixedQty 99, lastMinQty 0, lastMaxQty 0, lastClear false },  'unlimited' mode uses fixedQty, high count ensures all are targeted
    'Clear All' { lastMode 'clear', lastCount 999, lastFixedQty 0, lastMinQty 0, lastMaxQty 0, lastClear true }  'clear' mode explicitly sets to 0, high count ensures all are targeted
};


  Creates and adds buttons for each defined preset into the specified container element.
  Adds tooltips to the created buttons.
  @param {Element} container - The DOM element where preset buttons should be appended.
  Depends on PRESETS, applyPreset, addTooltips (defined in tooltips.js)
 
function createPresetButtons(container) {
    if (!container) {
         console.error('Pack Filler Pro Preset container not found. Cannot create preset buttons.');
         return;
    }

     Clear any existing buttons in the container before adding new ones.
    container.innerHTML = '';

     Iterate over the PRESETS object to create a button for each preset.
    Object.entries(PRESETS).forEach(([name, cfg]) = {
        const btn = document.createElement('button');
        btn.className = 'pfp-preset-btn';  Apply a CSS class for styling
        btn.textContent = name;  Button text is the preset name

         Create a descriptive tooltip for the button based on the preset's configuration.
        const tooltipContent = `Apply preset strong${name}strongbr${
            cfg.lastMode === 'fixed'  `Mode Fixed Count (${cfg.lastCount})brQty ${Math.min(Math.max(parseInt(cfg.lastFixedQty, 10)  0, 0), MAX_QTY)}`   Clamp for tooltip clarity
            cfg.lastMode === 'max'  `Mode Random RangebrRange ${Math.min(Math.max(parseInt(cfg.lastMinQty, 10)  0, 0), MAX_QTY)}-${Math.min(Math.max(parseInt(cfg.lastMaxQty, 10)  0, 0), MAX_QTY)}brApplies to Top ${cfg.lastCount}`   Clamp for tooltip clarity
            cfg.lastMode === 'unlimited' && !cfg.lastClear  `Mode All Visible PacksbrQty ${Math.min(Math.max(parseInt(cfg.lastFixedQty, 10)  0, 0), MAX_QTY)}`   Clamp for tooltip clarity
            cfg.lastMode === 'clear'  'Mode Clear Only'   Clear mode
            `Mode ${cfg.lastMode}`  Fallback for unexpected modes
        }${cfg.lastClear  'br+ Clear Before Fill'  ''}`;  Add clear status if applicable

        btn.dataset.pfpHelp = tooltipContent;  Store tooltip content in a data attribute (used by Tippy.js)

         Add a click event listener to apply the preset when the button is clicked.
        btn.addEventListener('click', () = applyPreset(cfg));

         Append the created button to the container.
        container.appendChild(btn);
    });

     Add tooltips to all elements within the container that have the data-pfp-help attribute.
    addTooltips(container);  addTooltips depends on 'tooltips.js'. Ensure it's required before presets.js.
    console.log('Pack Filler Pro Preset buttons created and tooltips added.');
}


  Applies a given preset configuration to the script's current configuration.
  Saves the updated configuration and updates the UI.
  @param {object} preset - The preset configuration object to apply.
  Depends on Global State (config), Config Management (saveConfig),
  UI Panel Management (updatePanelUI), Visual Feedback (showToast)
 
function applyPreset(preset) {
     Update the global config variable by merging the preset values over the current config.
     This way, any settings not defined in the preset (like panel position) are preserved.
     Use structuredClone for a deep copy if the config structure becomes complex with nested objectsarrays,
     but a shallow merge is sufficient for the current flat structure.
    config = { ...config, ...preset };

     Save the updated configuration to Tampermonkey storage.
    saveConfig();  saveConfig depends on 'config.js'. Ensure it's required before presets.js.

     Update the panel UI to reflect the newly applied settings.
    updatePanelUI();  updatePanelUI depends on 'ui-panel.js'. Ensure it's required before presets.js.

     Provide feedback to the user via a toast message.
     Construct a user-friendly message summarizing the applied settings.
    showToast(`Preset applied strong${Object.keys(preset).map(k = {
         if (k === 'version') return '';  Don't show the version in the toast
         const val = preset[k];
          Format boolean values as YesNo, otherwise show the value directly.
         return `${k.replace('last', '')} ${typeof val === 'boolean'  (val  'Yes'  'No')  val}`;
    }).filter(Boolean).join(', ')}strong`, 'success');  Filter out empty strings from version key
     console.log('Pack Filler Pro Applied preset', preset);
}

 Note The global 'config' variable is declared in the main script's IIFE.
 Functions in this file will operate on that global variable.
 Dependencies on other modules are noted in the JSDoc comments.
