console.log('Pack Filler Pro (Simplified): src/config.js started execution.'); // <-- THIS MUST BE THE VERY FIRST LINE OF CODE

// This file handles loading and saving the script's configuration using Tampermonkey's storage API.
// Depends on: GM_getValue, GM_setValue (granted in main script), Constants (CONFIG_STORAGE_KEY - defined in constants.js)

// --- Default Configuration ---
// This object defines the default settings for the script.
// These defaults are used if no configuration is found in storage.
const DEFAULT_CONFIG = {
    version: GM_info.script.version, // Store the script version with the config
    panelVisible: true, // Whether the panel should be visible by default
    panelPos: { top: '120px', right: '30px', left: 'auto', bottom: 'auto' }, // Default panel position

    // Last used fill settings
    lastMode: 'fixed', // 'fixed', 'max', 'unlimited', 'clear'
    lastCount: 24, // Number of packs to fill (0 for all visible)
    lastFixedQty: 9, // Fixed quantity for 'fixed' and 'unlimited' modes
    lastMinQty: 0, // Minimum quantity for 'max' mode
    lastMaxQty: 5, // Maximum quantity for 'max' mode
    lastClear: false, // Whether to clear packs before filling

    // Other settings
    loadFullPage: false, // Whether to automatically load all packs on page load
};

// Ensure CONFIG_STORAGE_KEY is available from constants.js
if (typeof CONFIG_STORAGE_KEY === 'undefined') {
     console.error("Pack Filler Pro: CONFIG_STORAGE_KEY constant not available from constants.js!");
     // Define a fallback key if constants.js failed to load
     var CONFIG_STORAGE_KEY = 'packFillerProConfig'; // Use var for fallback global scope
}


/**
 * Loads the configuration from Tampermonkey storage.
 * Merges saved config with default config to ensure all properties exist.
 * Handles potential parsing errors or outdated config versions.
 * @returns {object} The loaded or default configuration object.
 * Depends on: GM_getValue, CONFIG_STORAGE_KEY, DEFAULT_CONFIG
 */
function loadConfig() {
    console.log('Pack Filler Pro (Simplified): Loading config from storage...');
    let savedConfig = GM_getValue(CONFIG_STORAGE_KEY, null); // Get saved config (or null if none)
    let configToUse = { ...DEFAULT_CONFIG }; // Start with default config

    if (savedConfig !== null) {
        try {
            // Attempt to parse the saved string as JSON
            // GM_getValue with a default of null might return the string directly,
            // or Tampermonkey might handle JSON parsing depending on version/environment.
            // Explicitly parsing ensures consistency.
            const parsedConfig = typeof savedConfig === 'string' ? JSON.parse(savedConfig) : savedConfig;

            // Merge saved config over defaults.
            // This preserves new default properties if the saved config is older.
            configToUse = { ...configToUse, ...parsedConfig };

            // Optional: Handle config version migration if needed in the future
            // if (configToUse.version !== GM_info.script.version) {
            //     console.log(`Pack Filler Pro: Migrating config from v${configToUse.version} to v${GM_info.script.version}`);
            //     // Add migration logic here if config structure changes between versions
            //     configToUse.version = GM_info.script.version; // Update version
            //     saveConfig(configToUse); // Save the migrated config
            // }

            console.log('Pack Filler Pro (Simplified): Config loaded and merged.', configToUse);

        } catch (e) {
            console.error('Pack Filler Pro (Simplified): Failed to parse saved config, using default.', e);
            // If parsing fails, stick with the default configToUse
            // Show a toast message about the error
            // Ensure showToast is available (from feedback.js)
            if (typeof showToast === 'function') {
                 showToast('Error loading saved settings. Using defaults.', 'error', 3000);
            }
        }
    } else {
        console.log('Pack Filler Pro (Simplified): No saved config found, using default.');
    }

    // Ensure panelPos has all expected properties, even if not fully saved
     if (!configToUse.panelPos) {
          configToUse.panelPos = { top: '120px', right: '30px', left: 'auto', bottom: 'auto' };
     } else {
          // Ensure all position properties exist, merging saved over defaults
          configToUse.panelPos = {
               top: configToUse.panelPos.top || DEFAULT_CONFIG.panelPos.top,
               right: configTouse.panelPos.right || DEFAULT_CONFIG.panelPos.right,
               left: configToUse.panelPos.left || DEFAULT_CONFIG.panelPos.left,
               bottom: configToUse.panelPos.bottom || DEFAULT_CONFIG.panelPos.bottom,
          };
     }


    return configToUse;
}

/**
 * Saves the current configuration object to Tampermonkey storage.
 * @param {object} [configObj=config] - The configuration object to save. Defaults to the global config variable.
 * Depends on: GM_setValue, CONFIG_STORAGE_KEY, Global State (config)
 */
function saveConfig(configObj = config) {
    console.log('Pack Filler Pro (Simplified): Saving config to storage...');
    try {
        // GM_setValue can often handle objects directly, but stringifying is safer
        // for compatibility across different Tampermonkey versions/browsers.
        const configString = JSON.stringify(configObj);
        GM_setValue(CONFIG_STORAGE_KEY, configString);
        console.log('Pack Filler Pro (Simplified): Config saved successfully.');
         // Show a toast message about successful save
         // Ensure showToast is available (from feedback.js)
         if (typeof showToast === 'function') {
              // showToast('Settings saved.', 'success', 1000); // Can be noisy, maybe only on explicit save action
         }
    } catch (e) {
        console.error('Pack Filler Pro (Simplified): Failed to save config.', e);
         // Show a toast message about the error
         // Ensure showToast is available (from feedback.js)
         if (typeof showToast === 'function') {
              showToast('Error saving settings.', 'error', 2000);
         }
    }
}

// Note: The global 'config' variable is declared with var in the main script's IIFE.
// Functions in this file (loadConfig, saveConfig) operate on that global variable.
// Ensure constants.js is required before config.js.
// Ensure feedback.js is required before config.js if using showToast fallback.
