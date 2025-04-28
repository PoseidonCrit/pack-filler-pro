//src/config.js
// This file handles loading and saving the script's configuration.
// It includes logic for migrating configuration from older versions.
// Depends on: Global variable 'config' (declared in main script),
// Constants (CONFIG_KEY, DEFAULT_CONFIG - defined in constants.js),
// Visual Feedback (showToast - defined in feedback.js)

/**
 * Loads the configuration from Tampermonkey storage.
 * Handles migration from older config versions.
 * @returns {object} The loaded or default configuration object.
 */
function loadConfig() {
    const raw = GM_getValue(CONFIG_KEY);
    let cfg = { ...DEFAULT_CONFIG }; // Start with defaults

    if (raw) {
        try {
            const parsed = JSON.parse(raw);

            // --- Config Migration Logic ---
            // Compares the saved config version with the current script's default version.
            if (parsed.version && parsed.version >= DEFAULT_CONFIG.version) {
                // Saved config is the same version or newer - load directly (merge over defaults)
                cfg = { ...cfg, ...parsed };
            } else {
                // Saved config is older - selectively merge known compatible fields.
                // This prevents errors if the structure of older configs is very different.
                console.warn(`Pack Filler Pro: Migrating config from v${parsed.version || 'unknown'} to v${DEFAULT_CONFIG.version}`);
                cfg = {
                    ...cfg, // Keep new defaults for potentially new/changed fields
                    // Explicitly list fields you want to carry over from older versions:
                    lastMode: parsed.lastMode ?? cfg.lastMode, // Use ?? to keep default if parsed value is null/undefined
                    lastCount: parsed.lastCount ?? cfg.lastCount,
                    lastFixedQty: parsed.lastFixedQty ?? cfg.lastFixedQty,
                    lastMinQty: parsed.lastMinQty ?? cfg.lastMinQty,
                    lastMaxQty: parsed.lastMaxQty ?? cfg.lastMaxQty,
                    lastClear: parsed.lastClear ?? cfg.lastClear,
                    loadFullPage: parsed.loadFullPage ?? cfg.loadFullPage,
                    panelVisible: parsed.panelVisible ?? cfg.panelVisible,
                    // Panel position might change format, default might be safer if migration is complex
                    panelPos: parsed.panelPos ?? cfg.panelPos,
                    // Add other fields here as config evolves in future versions
                };
                // Update the version number in the config after migration
                cfg.version = DEFAULT_CONFIG.version;
                console.log("Pack Filler Pro: Config migration complete. Saving new config.");
                saveConfig(cfg); // Save the migrated config immediately
            }
        } catch (e) {
            console.error("Pack Filler Pro: Error parsing config, using defaults.", e);
            // showToast is called here, but depends on 'feedback.js'.
            // Ensure feedback.js is required before config.js in the main script if you uncomment this.
            // showToast('Error loading configuration. Using defaults.', 'error');
        }
    }

    // Final check to ensure critical fields exist, even after loading/migration
    cfg.panelPos = cfg.panelPos ?? { top: '120px', right: '30px' };
    cfg.version = DEFAULT_CONFIG.version; // Ensure version is always current in the loaded config object
    return cfg;


/**
 * Saves the current configuration to Tampermonkey storage.
 * @param {object} [cfg=config] - The configuration object to save. Defaults to the global config variable.
 */
function saveConfig(cfg = config) {
    // Ensure the current version is always saved
    cfg.version = DEFAULT_CONFIG.version;
    try {
        GM_setValue(CONFIG_KEY, JSON.stringify(cfg));
        // console.log("Pack Filler Pro: Config saved."); // Can be noisy, uncomment for debugging
    } catch (e) {
        console.error("Pack Filler Pro: Error saving config.", e);
        // showToast is called here, but depends on 'feedback.js'.
        // Ensure feedback.js is required before config.js in the main script if you uncomment this.
        // showToast('Error saving configuration.', 'error');
    }
}

// Note: The global 'config' variable is declared in the main script's IIFE.
// These functions will operate on that global variable when called from the main script.
