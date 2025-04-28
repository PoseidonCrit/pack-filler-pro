console.log('Pack Filler Pro: src/ui-panel-html.js started execution.'); // Log to confirm file loading

// This file contains the HTML structure for the Pack Filler Pro control panel as a string.
// It includes basic elements for configuration inputs, buttons, and a status message area.
// Depends on: Constants (PANEL_ID - defined in constants.js)
// Note: GM_info.script.version is a global variable provided by Tampermonkey.

// The HTML structure for the panel.
// Note: The ID is applied to the outer div when the element is created in ui-panel.js.
const panelHTML = `
    <div class="pfp-header">
        <span class="pfp-title">Pack Filler Pro</span>
        <span class="pfp-version">v${GM_info.script.version}</span>
        <span class="pfp-close" data-pfp-help="Hide Panel">×</span>
    </div>

    <div class="pfp-body">
        <div class="pfp-status-area">
            Status: Initializing...
        </div>

        <div class="pfp-config-section">
            <h5>Fill Configuration</h5>
            <div class="pfp-input-group">
                <label for="pfp-mode" data-pfp-help="Select how packs should be filled.">Mode:</label>
                <select id="pfp-mode">
                    <option value="fixed">Fixed Quantity</option>
                    <option value="max">Random Range</option>
                    <option value="unlimited">Unlimited (Fixed Qty)</option>
                    <option value="clear">Clear Only</option>
                </select>
            </div>

            <div id="pfp-count-group" class="pfp-input-group pfp-mode-specific">
                 <label for="pfp-count" data-pfp-help="Number of packs to fill (0 for all visible).">Count:</label>
                 <input type="number" id="pfp-count" value="24" min="0">
            </div>

            <div id="pfp-fixed-group" class="pfp-input-group pfp-mode-specific">
                 <label for="pfp-fixed" data-pfp-help="Fixed quantity for each pack.">Quantity:</label>
                 <input type="number" id="pfp-fixed" value="9" min="0" max="99">
            </div>

             <div id="pfp-range-inputs" class="pfp-input-group pfp-mode-specific pfp-range-group">
                  <label data-pfp-help="Random quantity range for each pack.">Range (Min-Max):</label>
                  <div class="pfp-range-group-inputs">
                      <input type="number" id="pfp-min" value="0" min="0" max="99">
                      <span>-</span>
                      <input type="number" id="pfp-max" value="5" min="0" max="99">
                  </div>
             </div>


            <div class="pfp-input-group pfp-checkbox-group">
                <input type="checkbox" id="pfp-clear">
                <label for="pfp-clear" data-pfp-help="Clear all pack quantities to 0 before filling.">Clear All First</label>
            </div>

             <div class="pfp-input-group pfp-checkbox-group">
                 <input type="checkbox" id="pfp-load-full-page">
                 <label for="pfp-load-full-page" data-pfp-help="Automatically load all packs on the page when the script runs.">Auto Load Full Page</label>
             </div>

        </div>

        <div class="pfp-button-group">
            <button id="pfp-run" class="pfp-button pfp-button-primary">
                 <span class="button-text">Fill Packs</span>
                 <span class="button-icon"></span>
            </button>
             <button id="pfp-clear-btn" class="pfp-button pfp-button-secondary" data-pfp-help="Set all visible pack quantities to 0.">
                 <span class="button-text">Clear All Visible</span>
                  <span class="button-icon"></span>
             </button>
        </div>

         <div class="pfp-button-group pfp-undo-redo-group">
              <button id="pfp-undo-btn" class="pfp-button pfp-button-secondary" disabled data-pfp-help="Undo the last fill action (Ctrl+Z).">
                  <span class="button-text">Undo (0)</span>
                   <span class="button-icon"></span>
              </button>
               <button id="pfp-redo-btn" class="pfp-button pfp-button-secondary" disabled data-pfp-help="Redo the last undone action (Ctrl+Y or Ctrl+Shift+Z).">
                   <span class="button-text">Redo (0)</span>
                    <span class="button-icon"></span>
               </button>
         </div>

         <div class="pfp-preset-container">
              <h6>Presets:</h6>
              </div>

    </div>
`;

// Note: This file defines the panelHTML constant string. It depends on the
// PANEL_ID constant (used in CSS) and GM_info.script.version (available globally).
// Ensure constants.js is required before ui-panel-html.js.
