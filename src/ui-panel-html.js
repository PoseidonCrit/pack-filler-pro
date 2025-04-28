// This file contains the HTML structure for the Pack Filler Pro control panel as a constant string.
// Depends on: Constants (PANEL_ID, MAX_QTY - defined in constants.js)

/**
 * HTML string defining the structure of the Pack Filler Pro control panel.
 * Includes form elements, buttons, data attributes for tooltips, and sections.
 * Note: CSS classes (pfp-...) are defined in ui-css.js.
 * JavaScript logic for interacting with these elements is in ui-panel.js.
 * Depends on: PANEL_ID, MAX_QTY
 */
const panelHTML = `
    <div class="pfp-header" data-pfp-help="Drag here to move the panel">
      <span class="pfp-title">🎴 Pack Filler Pro</span>
      <span class="pfp-close" data-pfp-help="Close Panel (Toggle with menu command)">×</span>
    </div>
    <div class="pfp-body">
      <div class="pfp-config-section">
          <h4>Configuration</h4>
        <div class="pfp-form-group">
          <label for="pfp-mode" class="pfp-label">Fill Mode:</label>
          <select id="pfp-mode" class="pfp-select" data-pfp-help="Choose how packs are filled.<br>- Fixed Count: Fill a set number of packs with a specific quantity.<br>- Random Count: Fill a set number of packs with a random quantity within a range.<br>- All Visible Packs: Fill all currently loaded packs with a specific quantity.<br>- Clear Only: Set all visible pack quantities to 0.">
            <option value="fixed">Fixed Count</option>
            <option value="max">Random Count (Range)</option>
            <option value="unlimited">All Visible Packs</option>
            <option value="clear">Clear Only</option> </select>
        </div>

        <div class="pfp-form-group pfp-mode-specific" id="pfp-count-group">
          <label for="pfp-count" class="pfp-label">Number of Packs to Fill:</label>
          <input type="number" id="pfp-count" min="1" list="pfp-count-list" class="pfp-input" placeholder="e.g., 24" data-pfp-help="Sets how many packs (starting from the top) the fill action applies to in Fixed Count and Random Count modes.">
        </div>

        <div class="pfp-form-group pfp-mode-specific" id="pfp-fixed-group">
          <label for="pfp-fixed" class="pfp-label">Copies per Pack:</label>
          <input type="number" id="pfp-fixed" min="0" max="${MAX_QTY}" list="pfp-fixed-list" class="pfp-input" placeholder="e.g., 3" data-pfp-help="The exact quantity to set for each selected pack in Fixed Count or All Visible modes.">
        </div>

        <div id="pfp-range-inputs" class="pfp-mode-specific">
             <div class="pfp-form-group pfp-range-group">
              <label for="pfp-min" class="pfp-label">Min Copies (Random):</label>
              <input type="number" id="pfp-min" min="0" max="${MAX_QTY}" list="pfp-range-list" class="pfp-input" placeholder="e.g., 1" data-pfp-help="The minimum quantity a pack can receive in Random Count mode.">
             </div>
             <div class="pfp-form-group pfp-range-group">
              <label for="pfp-max" class="pfp-label">Max Copies (Random):</label>
              <input type="number" id="pfp-max" min="0" max="${MAX_QTY}" list="pfp-range-list" class="pfp-input" placeholder="e.g., 5" data-pfp-help="The maximum quantity a pack can receive in Random Count mode.">
             </div>
        </div>

        <div class="pfp-options-divider">Options</div>

        <div class="pfp-form-check">
          <input type="checkbox" id="pfp-clear" class="pfp-checkbox" data-pfp-help="Check this to set all pack quantities to 0 before applying the fill action.">
          <label for="pfp-clear" class="pfp-label pfp-label-inline">Clear inputs before filling</label>
        </div>

        <div class="pfp-form-check">
          <input type="checkbox" id="pfp-load-full-page" class="pfp-checkbox" data-pfp-help="Automatically try to load all packs by clicking 'Load More' and/or scrolling when the page first loads. Requires page reload to enable/disable.">
          <label for="pfp-load-full-page" class="pfp-label pfp-label-inline">Auto-load all packs on page entry</label>
        </div>
      </div>

      <div class="pfp-actions-section">
           <h4>Actions</h4>
           <div class="pfp-form-actions"> <button id="pfp-run" class="pfp-button pfp-button-primary" data-pfp-help="Apply the configured fill settings to the selected packs."><span class="button-text">Fill Packs</span></button>
              <button id="pfp-clear-btn" class="pfp-button pfp-button-secondary" data-pfp-help="Set all currently visible pack inputs to zero.">Clear All Visible</button>
          </div>
           <div class="pfp-history-buttons"> <button id="pfp-undo-btn" class="pfp-button pfp-button-history" disabled data-pfp-help="Undo the last fill or clear action. (Ctrl+Z)"><span class="button-text">Undo (0)</span></button>
               <button id="pfp-redo-btn" class="pfp-button pfp-button-history" disabled data-pfp-help="Redo the action that was just undone. (Ctrl+Y or Ctrl+Shift+Z)"><span class="button-text">Redo (0)</span></button>
           </div>
      </div>

       <div class="pfp-presets-section">
           <h4>Presets</h4>
           <div class="pfp-preset-container">
               </div>
       </div>

        <datalist id="pfp-count-list">
          <option value="1"><option value="5"><option value="10"><option value="24"><option value="50"><option value="100"><option value="999">
        </datalist>
        <datalist id="pfp-fixed-list">
          <option value="0"><option value="1"><option value="3"><option value="5"><option value="10"><option value="20"><option value="50"><option value="99">
        </datalist>
        <datalist id="pfp-range-list">
          <option value="0"><option value="1"><option value="2"><option value="3"><option value="5"><option value="10"><option value="20"><option value="50"><option value="99">
        </datalist>
      </div>
    <div class="pfp-footer">
        <span data-pfp-help="Current version of the script.">v${GM_info.script.version}</span>
        <span>|</span>
        <a href="https://github.com/YourGithubLinkHere" target="_blank" data-pfp-help="View script source code and documentation on GitHub. Replace with your actual link.">GitHub</a> </div>
  `;

// Note: This file only contains the HTML string constant.
// JavaScript logic for creating, adding, and managing the panel element
// is in ui-panel.js. CSS styling is in ui-css.js.
// Dependencies on constants (PANEL_ID, MAX_QTY) are noted.
