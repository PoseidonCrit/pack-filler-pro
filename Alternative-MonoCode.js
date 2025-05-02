// ==UserScript==
// @name         🎴 5.27 Pack Filler Pro - Dynamic Controls
// @namespace    https://ygoprodeck.com
// @version      5.27
// @description  Fixes dynamic control visibility when changing modes. Trimmed down code, hide functionality removed (panel always visible). Load Full Page enabled by default. Refined Potato Mode. All controls visible based on mode/distribution. Dark, blurred panel fixed at the bottom.
// @author       [Your Name Here - Optional]
// @match        https://ygoprodeck.com/pack-sim/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        unsafeWindow
// ==/UserScript==

/*
 * SimplexNoise 2.4.0 - A Modern Perlin Noise alternative.
 * Embedded directly into the userscript.
 * (Keeping the original SimplexNoise library code largely intact for stability)
 * Based on http://staffwww.sbs.ox.ac.uk/frodsham/javascript/SimplexNoise.java by Stefan Gustavson, Public Domain.
 * Modified by Jonas Wagner.
 *
 * Note: For the current distribution logic (using noise2D(i, 0)),
 * only the 2D noise function is used. 3D and 4D functions are included
 * in the library but not currently called by this script's core logic.
 */
var SimplexNoise = (function() {
    var F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
    var G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
    var F3 = 1.0 / 3.0;
    var G3 = 1.0 / 6.0;
    var F4 = (Math.sqrt(5.0) - 1.0) / 4.0;
    var G4 = (5.0 - Math.sqrt(5.0)) / 20.0;

    var GRADIENTS_2D = [
        [1, 1], [-1, 1], [1, -1], [-1, -1],
        [1, 0], [-1, 0], [0, 1], [0, -1]
    ]; // 8 gradients

     var GRADIENTS_3D = [
        [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
        [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
        [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
    ]; // 12 gradients

    var GRADIENTS_4D = [
        [ 0, 1, 1, 1], [ 0, 1, 1,-1], [ 0, 1,-1, 1], [ 0, 1,-1,-1],
        [ 0,-1, 1, 1], [ 0,-1, 1,-1], [ 0,-1,-1, 1], [ 0,-1,-1,-1],
        [ 1, 0, 1, 1], [ 1, 0, 1,-1], [ 1, 0,-1, 1], [ 1, 0,-1,-1],
        [-1, 0, 1, 1], [-1, 0, 1,-1], [-1, 0,-1, 1], [-1, 0,-1,-1],
        [ 1, 1, 0, 1], [ 1, 1, 0,-1], [ 1,-1, 0, 1], [ 1,-1, 0,-1],
        [-1, 1, 0, 1], [-1, 1, 0,-1], [-1,-1, 0, 1], [-1,-1, 0,-1],
        [ 1, 1, 1, 0], [ 1, 1,-1, 0], [ 1,-1, 1, 0], [ 1,-1,-1, 0],
        [-1, 1, 1, 0], [-1, 1,-1, 0], [-1,-1, 1, 0], [-1,-1,-1, 0]
    ]; // 32 gradients


    var buildPermutationTable = function(random) {
        var i;
        var p = new Uint8Array(256);
        for (i = 0; i < 256; i++) {
            p[i] = i;
        }
        for (i = 0; i < 255; i++) {
            var r = (random.next() * (256 - i)) | 0;
            var swap = p[i];
            p[i] = p[r + i];
            p[r + i] = swap;
        }
        return p;
    };

    var SimplexNoise = function(random) {
        if (typeof random == 'number') {
            this.random = new (function(seed) { // Simple LCG PRNG
                this.seed = (seed || 0) % 2147483647;
                if (this.seed <= 0) this.seed += 2147483646;
                this.next = function() {
                    this.seed = (this.seed * 16807) % 2147483647;
                    return (this.seed - 1) / 2147483646;
                };
            })(random);
        } else if (random && typeof random.next == 'function') {
            this.random = random;
        } else {
            this.random = {
                next: function() {
                    return Math.random();
                }
            };
        }

        this.perm = buildPermutationTable(this.random);
        this.permMod12 = new Uint8Array(512); // Used for 2D and 3D gradients
        this.permMod32 = new Uint8Array(512); // Used for 4D gradients
        for (var i = 0; i < 512; i++) {
            this.permMod12[i] = this.perm[i] % 12; // Indices 0-11 for GRADIENTS_3D (also used for 2D)
            this.permMod32[i] = this.perm[i] % 32; // Indices 0-31 for GRADIENTS_4D
        }
    };

    function dot2D(g, x, y) {
        return g[0] * x + g[1] * y;
    }

    function dot3D(g, x, y, z) {
        return g[0] * x + g[1] * y + g[2] * z;
    }

    function dot4D(g, x, y, z, w) {
        return g[0] * x + g[1] * y + g[2] * z + g[3] * w;
    }


    SimplexNoise.prototype = {
        constructor: SimplexNoise,
        noise2D: function(x, y) {
            var perm = this.perm;
            var permMod12 = this.permMod12;
            var s = (x + y) * F2;
            var i = Math.floor(x + s);
            var j = Math.floor(y + s);
            var t = (i + j) * G2;
            var X0 = i - t;
            var Y0 = j - t;
            var x0 = x - X0;
            var y0 = y - Y0;
            var i1, j1;
            if (x0 > y0) { i1 = 1; j1 = 0; } else { i1 = 0; j1 = 1; }
            var i2 = 1; var j2 = 1;
            var ii = i & 255;
            var jj = j & 255;
            var gi0 = permMod12[ii + perm[jj]];
            var gi1 = permMod12[ii + i1 + perm[jj + j1]];
            var gi2 = permMod12[ii + i2 + perm[jj + j2]];
            var t0 = 0.5 - x0 * x0 - y0 * y0;
            var t1 = 0.5 - (x0 - i1) * (x0 - i1) - (y0 - j1) * (y0 - j1);
            var t2 = 0.5 - (x0 - i2) * (x0 - i2) - (y0 - j2) * (y0 - j2);
            var n0 = 0, n1 = 0, n2 = 0;
            if (t0 >= 0) { t0 *= t0; n0 = t0 * t0 * dot2D(GRADIENTS_3D[gi0], x0, y0); }
            if (t1 >= 0) { t1 *= t1; n1 = t1 * t1 * dot2D(GRADIENTS_3D[gi1], x0 - i1, y0 - j1); }
            if (t2 >= 0) { t2 *= t2; n2 = t2 * t2 * dot2D(GRADIENTS_3D[gi2], x0 - i2, y0 - j2); }
            return 70.0 * (n0 + n1 + n2);
        },
        noise3D: function(x, y, z) {
             var perm = this.perm;
             var permMod12 = this.permMod12;
            var s = (x + y + z) * F3;
            var i = Math.floor(x + s);
            var j = Math.floor(y + s);
            var k = Math.floor(z + s);
            var t = (i + j + k) * G3;
            var X0 = i - t;
            var Y0 = j - t;
            var Z0 = k - t;
            var x0 = x - X0;
            var y0 = y - Y0;
            var z0 = z - Z0;
            var i1, j1, k1;
            var i2, j2, k2;
            if (x0 >= y0) {
                if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
                else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; }
                else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; }
            } else {
                if (y0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; }
                else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
                else { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; }
            }
             var ii = i & 255;
             var jj = j & 255;
             var kk = k & 255;
             var gi0 = permMod12[ii + perm[jj + perm[kk]]];
             var gi1 = permMod12[ii + i1 + perm[jj + j1 + perm[kk + k1]]];
             var gi2 = permMod12[ii + i2 + perm[jj + j2 + perm[kk + k2]]];
             var gi3 = permMod12[ii + 1 + perm[jj + 1 + perm[kk + 1]]];
            var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
            var t1 = 0.6 - (x0 - i1) * (x0 - i1) - (y0 - j1) * (y0 - j1) - (z0 - k1) * (z0 - k1);
            var t2 = 0.6 - (x0 - i2) * (x0 - i2) - (y0 - j2) * (y0 - j2) - (z0 - k2) * (z0 - k2);
            var t3 = 0.6 - (x0 - 1.0) * (x0 - 1.0) - (y0 - 1.0) * (y0 - 1.0) - (z0 - 1.0) * (z0 - 1.0);
            var n0 = 0, n1 = 0, n2 = 0, n3 = 0;
            if (t0 >= 0) { t0 *= t0; n0 = t0 * t0 * dot3D(GRADIENTS_3D[gi0], x0, y0, z0); }
            if (t1 >= 0) { t1 *= t1; n1 = t1 * t1 * dot3D(GRADIENTS_3D[gi1], x0 - i1, y0 - j1, z0 - k1); }
            if (t2 >= 0) { t2 *= t2; n2 = t2 * t2 * dot3D(GRADIENTS_3D[gi2], x0 - i2, y0 - j2, z0 - k2); }
            if (t3 >= 0) { t3 *= t3; n3 = t3 * t3 * dot3D(GRADIENTS_3D[gi3], x0 - 1.0, y0 - 1.0, z0 - 1.0); }
            return 32.0 * (n0 + n1 + n2 + n3);
        },
        noise4D: function(x, y, z, w) {
            var perm = this.perm;
            var permMod32 = this.permMod32;
            var s = (x + y + z + w) * F4;
            var i = Math.floor(x + s);
            var j = Math.floor(y + s);
            var k = Math.floor(z + s);
            var l = Math.floor(w + s);
            var t = (i + j + k + l) * G4;
            var X0 = i - t;
            var Y0 = j - t;
            var Z0 = k - t;
            var W0 = l - t;
            var x0 = x - X0;
            var y0 = y - Y0;
            var z0 = z - Z0;
            var w0 = w - W0;
            var rankx = 0; if (x0 > y0) rankx++; if (x0 > z0) rankx++; if (x0 > w0) rankx++;
            var ranky = 0; if (y0 > x0) ranky++; if (y0 > z0) ranky++; if (y0 > w0) ranky++;
            var rankz = 0; if (z0 > x0) rankz++; if (z0 > y0) rankz++; if (z0 > w0) rankz++;
            var rankw = 0; if (w0 > x0) rankw++; if (w0 > y0) rankw++; if (w0 > z0) rankw++;
            var i1, j1, k1, l1;
            var i2, j2, k2, l2;
            var i3, j3, k3, l3;
            if (rankx > ranky || rankx > rankz || rankx > rankw) { i1 = 1; j1 = 0; k1 = 0; l1 = 0; } else if (ranky > rankx || ranky > rankz || ranky > rankw) { i1 = 0; j1 = 1; k1 = 0; l1 = 0; } else if (rankz > rankx || rankz > ranky || rankz > rankw) { i1 = 0; j1 = 0; k1 = 1; l1 = 0; } else { i1 = 0; j1 = 0; k1 = 0; l1 = 1; }
            var delta0, delta1, delta2;
            delta0 = rankx > ranky ? rankx - ranky : ranky - rankx;
            delta1 = rankx > rankz ? rankx - rankz : rankz - rankx;
            delta2 = rankx > rankw ? rankx - rankw : rankw - rankx;
            if (delta0 > delta1 || delta0 > delta2) {
                i2 = 1; j2 = 0; k2 = 0; l2 = 0;
                if (delta1 > delta2) { i3 = 0; j3 = 0; k3 = 1; l3 = 0; } else { i3 = 0; j3 = 0; k3 = 0; l3 = 1; }
            } else if (delta1 > delta0 || delta1 > delta2) {
                i2 = 0; j2 = 1; k2 = 0; l2 = 0;
                if (delta0 > delta2) { i3 = 1; j3 = 0; k3 = 0; l3 = 0; } else { i3 = 0; j3 = 0; k3 = 0; l3 = 1; }
            } else {
                i2 = 0; j2 = 0; k2 = 0; l2 = 1;
                if (delta0 > delta1) { i3 = 1; j3 = 0; k3 = 0; l3 = 0; } else { i3 = 0; j3 = 1; k3 = 0; l3 = 0; }
            }
            var i4 = 1; var j4 = 1; var k4 = 1; var l4 = 1;
            var ii = i & 255;
            var jj = j & 255;
            var kk = k & 255;
            var ll = l & 255;
            var gi0 = permMod32[ii + perm[jj + perm[kk + perm[ll]]]];
            var gi1 = permMod32[ii + i1 + perm[jj + j1 + perm[kk + k1 + perm[ll + l1]]]];
            var gi2 = permMod32[ii + i2 + perm[jj + j2 + perm[kk + k2 + perm[ll + l2]]]];
            var gi3 = permMod32[ii + i3 + perm[jj + j3 + perm[kk + k3 + perm[ll + l3]]]];
            var gi4 = permMod32[ii + i4 + perm[jj + j4 + perm[kk + k4 + perm[ll + l4]]]];
            var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0 - w0 * w0;
            var t1 = 0.6 - (x0 - i1) * (x0 - i1) - (y0 - j1) * (y0 - j1) - (z0 - k1) * (z0 - k1) - (w0 - l1) * (w0 - l1);
            var t2 = 0.6 - (x0 - i2) * (x0 - i2) - (y0 - j2) * (y0 - j2) - (z0 - k2) * (z0 - k2) - (w0 - l2) * (w0 - l2);
            var t3 = 0.6 - (x0 - i3) * (x0 - i3) - (y0 - j3) * (y0 - j3) - (z0 - k3) * (z0 - k3) - (w0 - l3) * (w0 - l3);
            var t4 = 0.6 - (x0 - 1.0) * (x0 - 1.0) - (y0 - 1.0) * (y0 - 1.0) - (z0 - 1.0) * (z0 - 1.0) - (w0 - 1.0) * (w0 - 1.0);
            var n0 = 0, n1 = 0, n2 = 0, n3 = 0, n4 = 0;
            if (t0 >= 0) { t0 *= t0; n0 = t0 * t0 * dot4D(GRADIENTS_4D[gi0], x0, y0, z0, w0); }
            if (t1 >= 0) { t1 *= t1; n1 = t1 * t1 * dot4D(GRADIENTS_4D[gi1], x0 - i1, y0 - j1, z0 - k1, w0 - l1); }
            if (t2 >= 0) { t2 *= t2; n2 = t2 * t2 * dot4D(GRADIENTS_4D[gi2], x0 - i2, y0 - j2, z0 - k2, w0 - l2); }
            if (t3 >= 0) { t3 *= t3; n3 = t3 * t3 * dot4D(GRADIENTS_4D[gi3], x0 - 1.0, y0 - 1.0, z0 - 1.0, w0 - 1.0); }
            if (t4 >= 0) { t4 *= t4; n4 = t4 * t4 * dot4D(GRADIENTS_4D[gi4], x0 - 1.0, y0 - 1.0, z0 - 1.0, w0 - 1.0); }
            return 27.0 * (n0 + n1 + n2 + n3 + n4);
        }
    };
    return SimplexNoise;
})();
// End of embedded SimplexNoise library


(function() {
    'use strict';

    // --- Constants ---
    const PANEL_ID = 'pack-filler-panel';
    const STATUS_ID = 'pack-filler-status';
    const POTATO_MODE_CLASS = 'pf-potato-mode-enabled'; // Class to apply to body
    // Removed EXPANDED_CLASS as hide is disabled
    const CONFIG_STORAGE_KEY = 'packFillerConfig';
    const MAX_PACK_QTY = 99;
    const MIN_PACK_QTY = 0;
    const MIN_SIMPEX_SCALE = 0.001;
    const MIN_COUNT = 1;
    const STATUS_CLEAR_DELAY = 5000; // ms

    // --- Seedable Pseudo-Random Number Generator (Basic LCG) ---
    class SeededRandom {
        constructor(seed) {
            let s = Math.abs(Math.floor(seed || 0));
            s = (s === 0) ? 1 : s * 16807 % 2147483647;
            this.seed = s;
        }
        next() {
            this.seed = (this.seed * 16807) % 2147483647;
            return (this.seed - 1) / 2147483646;
        }
        shuffle(array) {
            let count = array.length;
            while (count > 0) {
                let index = Math.floor(this.next() * count);
                count--;
                let temp = array[count];
                array[count] = array[index];
                array[index] = temp;
            }
            return array;
        }
    }

    // --- Configuration Management ---
    const Config = {
        defaults: {
            mode: 'random', // 'random', 'fixed', 'allVisible', 'pattern', 'alternating'
            count: 25,
            fixedQty: 1,
            allVisibleQty: 1,
            usePackCount: false,
            minQty: 1,
            maxQty: 5,
            clearFirst: false,
            loadFullPage: true, // Default to true
            distribution: 'weighted', // 'uniform', 'weighted', 'exponential', 'simplex', 'gradient'
            randomSeed: 0,
            simplexScale: 0.05,
            gradientStartQty: 1,
            gradientEndQty: 5,
            pattern: '1,3,5',
            patternAllVisible: false,
            alternateHigh: 3,
            alternateLow: 1,
            alternateAllVisible: false,
            // Removed 'expanded' state as panel is always visible
            enablePotatoMode: false,
        },
        current: {},
        load: function() {
            try {
                const saved = GM_getValue(CONFIG_STORAGE_KEY);
                const loadedConfig = saved ? JSON.parse(saved) : {};
                this.current = { ...this.defaults };
                Object.keys(this.defaults).forEach(key => {
                    if (loadedConfig.hasOwnProperty(key)) {
                        const loadedValue = loadedConfig[key];
                        const defaultValue = this.defaults[key];
                        const valueType = typeof defaultValue;

                        if (valueType === 'number') {
                            const numberValue = parseFloat(loadedValue);
                            const min = key === 'simplexScale' ? MIN_SIMPEX_SCALE : (key === 'count' ? MIN_COUNT : MIN_PACK_QTY);
                            if (typeof numberValue === 'number' && isFinite(numberValue) && numberValue >= min) {
                                this.current[key] = numberValue;
                            } else {
                                console.warn(`Pack Filler Pro: Invalid number value for key "${key}":`, loadedValue, `Using default: ${defaultValue}`);
                            }
                        } else if (valueType === 'boolean') {
                            if (typeof loadedValue === 'boolean') {
                                this.current[key] = loadedValue;
                            } else {
                                console.warn(`Pack Filler Pro: Invalid boolean value for key "${key}":`, loadedValue, `Using default: ${defaultValue}`);
                            }
                        } else if (valueType === 'string') {
                            if (typeof loadedValue === 'string') {
                                this.current[key] = loadedValue;
                            } else {
                                console.warn(`Pack Filler Pro: Invalid string value for key "${key}":`, loadedValue, `Using default: ${defaultValue}`);
                            }
                        } else {
                             this.current[key] = loadedValue;
                        }
                    }
                });

                const validModes = ['random', 'fixed', 'allVisible', 'pattern', 'alternating'];
                if (!validModes.includes(this.current.mode)) {
                     console.warn(`Pack Filler Pro: Invalid mode "${this.current.mode}". Using default: ${this.defaults.mode}`);
                    this.current.mode = this.defaults.mode;
                }

                const validDistributions = ['uniform', 'weighted', 'exponential', 'simplex', 'gradient'];
                if (!validDistributions.includes(this.current.distribution)) {
                     console.warn(`Pack Filler Pro: Invalid distribution "${this.current.distribution}". Using default: ${this.defaults.distribution}`);
                    this.current.distribution = this.defaults.distribution;
                }

                console.log('Pack Filler Pro: Config loaded', this.current);
            } catch (e) {
                console.error('Pack Filler Pro: Error loading config, using defaults:', e);
                this.current = { ...this.defaults };
            }
            return this.current;
        },
        save: function() {
            try {
                GM_setValue(CONFIG_STORAGE_KEY, JSON.stringify(this.current));
            } catch (e) {
                console.error('Pack Filler Pro: Error saving config:', e);
            }
        }
    };
    Config.load();


    // --- Global Styles (Modern Dark, Blurred, Fixed) ---
    GM_addStyle(`
        /* --- CSS Variables for easy theming --- */
        :root {
            --pf-bg-color: rgba(30, 30, 30, 0.9);
            --pf-border-color: rgba(90, 90, 90, 0.5);
            --pf-text-color: #e0e0e0;
            --pf-label-color: #b0b0b0;
            --pf-input-bg: #333;
            --pf-input-border: #555;
            --pf-input-text: #e0e0e0;
            --pf-input-placeholder: #999;
            --pf-focus-color: #007bff;
            --pf-button-primary-bg: #007bff;
            --pf-button-primary-text: white;
            --pf-button-danger-bg: #dc3545;
            --pf-button-danger-text: white;
            --pf-button-secondary-bg: #555;
            --pf-button-secondary-text: #e0e0e0;
            --pf-disabled-bg: #444;
            --pf-disabled-text: #999;
            --pf-shadow: 0 8px 30px rgba(0,0,0,0.7);
            --pf-border-radius: 10px;
            --pf-padding: 15px;
            --pf-gap: 15px;
            --pf-transition-duration: 0.2s;
        }


        /* --- Panel and Core Layout --- */
        #${PANEL_ID} {
            /* Aggressively reset some inherited styles */
            all: unset;
            position: fixed !important;
            bottom: 10px !important;
            left: 10px !important;
            right: 10px !important;
            margin: auto !important;
            max-width: 600px !important;
            z-index: 9999 !important; /* Ensure it's on top */
            background-color: var(--pf-bg-color) !important;
            backdrop-filter: blur(10px) !important;
            -webkit-backdrop-filter: blur(10px) !important;
            border: 1px solid var(--pf-border-color) !important;
            border-radius: var(--pf-border-radius) !important;
            box-shadow: var(--pf-shadow) !important;
            color: var(--pf-text-color) !important;
            padding: var(--pf-padding) !important;
            display: flex !important;
            flex-direction: column !important;
            gap: var(--pf-gap) !important;
            visibility: visible !important;
            opacity: 1 !important;
            tabindex: -1;
            /* No overflow hidden anymore as body is always visible */
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            font-size: 14px !important;
            line-height: 1.5 !important;
            box-sizing: border-box !important;
        }

        #${PANEL_ID} * {
             /* Apply resets to all children */
             box-sizing: border-box !important;
             font-family: inherit !important;
             font-size: inherit !important;
             line-height: inherit !important;
             margin: 0 !important;
             padding: 0 !important;
        }

        /* Headings if used (not currently) */
        #${PANEL_ID} h1, #${PANEL_ID} h2, #${PANEL_ID} h3 {
             color: var(--pf-text-color) !important;
             margin-bottom: calc(var(--pf-gap) / 2) !important;
        }


        /* --- Layout Sections --- */
        #${PANEL_ID} .pf-header,
        #${PANEL_ID} .pf-body,
        #${PANEL_ID} .pf-buttons,
        #${PANEL_ID} .pf-status {
             display: flex !important;
             flex-direction: column !important;
             gap: calc(var(--pf-gap) / 2) !important;
        }

        #${PANEL_ID} .pf-header {
             flex-direction: row !important;
             justify-content: space-between !important;
             align-items: center !important;
             flex-wrap: wrap !important;
             padding-bottom: calc(var(--pf-gap) / 2) !important;
             border-bottom: 1px solid var(--pf-border-color) !important;
        }

        #${PANEL_ID} .pf-header > .pack-filler-group {
            flex-grow: 1 !important;
            flex-basis: 150px !important;
             gap: 4px !important;
        }
         /* Removed button styling specific to header */


        #${PANEL_ID} .pf-controls {
             display: grid !important;
             grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)) !important;
             gap: 10px !important;
             align-items: start !important;
        }

         #${PANEL_ID} .pf-buttons {
              flex-direction: row !important;
              justify-content: flex-end !important;
              flex-wrap: wrap !important;
              padding-top: calc(var(--pf-gap) / 2) !important;
              border-top: 1px solid var(--pf-border-color) !important;
         }
         #${PANEL_ID} .pf-buttons button {
             flex-grow: 1 !important;
             max-width: 150px !important;
             padding: 8px 15px !important;
         }

        #${PANEL_ID} .pf-status {
            text-align: center !important;
            font-size: 0.9em !important;
            color: var(--pf-label-color) !important;
            min-height: 1em !important;
        }

        /* --- Control Group and Input Styles --- */
        #${PANEL_ID} .pack-filler-group {
            /* Base state: Hidden by default, shown by specific rules below */
            display: none !important;
            opacity: 0;
            transition: opacity var(--pf-transition-duration) ease !important;
            flex-direction: column !important;
            gap: 4px !important;
        }
         #${PANEL_ID} .pack-filler-group[data-type="checkbox"] {
              flex-direction: row !important;
              align-items: center !important;
              gap: 8px !important;
         }

        #${PANEL_ID} label {
             display: block !important;
             color: var(--pf-label-color) !important;
             font-weight: 500 !important;
             cursor: pointer !important;
        }

        #${PANEL_ID} input:not([type="checkbox"]),
        #${PANEL_ID} select {
            width: 100% !important;
            padding: 8px 10px !important;
            border: 1px solid var(--pf-input-border) !important;
            background-color: var(--pf-input-bg) !important;
            color: var(--pf-input-text) !important;
            border-radius: 4px !important;
            transition: border-color var(--pf-transition-duration) ease, box-shadow var(--pf-transition-duration) ease, background-color var(--pf-transition-duration) ease !important;
             min-height: 32px !important;
        }
         #${PANEL_ID} input::placeholder {
             color: var(--pf-input-placeholder) !important;
             opacity: 1 !important;
         }

         /* Custom checkbox styling */
         #${PANEL_ID} input[type="checkbox"] {
             flex-shrink: 0 !important;
             width: 18px !important;
             height: 18px !important;
             cursor: pointer !important;
             position: relative !important;
             -webkit-appearance: none !important;
             -moz-appearance: none !important;
             appearance: none !important;
             background-color: var(--pf-input-bg) !important;
             border: 1px solid var(--pf-input-border) !important;
             border-radius: 4px !important;
             transition: background-color var(--pf-transition-duration) ease, border-color var(--pf-transition-duration) ease !important;
         }
          #${PANEL_ID} input[type="checkbox"]:checked {
             background-color: var(--pf-focus-color) !important;
             border-color: var(--pf-focus-color) !important;
          }
           #${PANEL_ID} input[type="checkbox"]:focus {
              outline: none !important;
              box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.4) !important;
           }
          #${PANEL_ID} input[type="checkbox"]:checked::after {
             content: '✓' !important;
             position: absolute !important;
             top: 50% !important;
             left: 50% !important;
             transform: translate(-50%, -50%) !important;
             color: white !important;
             font-size: 14px !important;
             line-height: 1 !important;
          }

        /* --- Button Styles --- */
        #${PANEL_ID} button {
             border: none !important;
             font-weight: 500 !important;
             cursor: pointer !important;
             display: flex !important;
             justify-content: center !important;
             align-items: center !important;
             border-radius: 4px !important;
             transition: background-color var(--pf-transition-duration) ease, opacity var(--pf-transition-duration) ease, box-shadow var(--pf-transition-duration) ease !important;
             min-height: 32px !important;
        }

        #${PANEL_ID} button.btn-primary { background-color: var(--pf-button-primary-bg) !important; color: var(--pf-button-primary-text) !important; }
        #${PANEL_ID} button.btn-danger { background-color: var(--pf-button-danger-bg) !important; color: var(--pf-button-danger-text) !important; }
        #${PANEL_ID} button.btn-secondary { background-color: var(--pf-button-secondary-bg) !important; color: var(--pf-button-secondary-text) !important; border: 1px solid rgba(255,255,255,0.2) !important; }

        /* Hover/Active Effects */
        #${PANEL_ID} button:not(:disabled):hover { opacity: 0.9 !important; }
        #${PANEL_ID} button:not(:disabled):active { opacity: 0.8 !important; }


        /* --- Focus Styles (Inputs/Selects/Buttons) --- */
        #${PANEL_ID} input:not([type="checkbox"]):focus,
        #${PANEL_ID} select:focus {
             border-color: var(--pf-focus-color) !important;
             box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.4) !important;
             background-color: #444 !important;
             outline: none !important;
        }
         #${PANEL_ID} button:focus:not([type="checkbox"]) {
             outline: 2px solid var(--pf-focus-color) !important;
             outline-offset: 2px !important;
         }


        /* --- Disabled Styles --- */
        #${PANEL_ID} input:disabled,
        #${PANEL_ID} select:disabled,
        #${PANEL_ID} button:disabled {
            background-color: var(--pf-disabled-bg) !important;
            cursor: not-allowed !important;
            color: var(--pf-disabled-text) !important;
            opacity: 0.6 !important;
            box-shadow: none !important;
            border-color: var(--pf-disabled-bg) !important;
        }
         #${PANEL_ID} .pack-filler-group input:disabled + label {
             color: var(--pf-disabled-text) !important;
             cursor: not-allowed !important;
         }


        /* --- Visibility Control (Controls are visible if they match mode/dist or are global) --- */
        /* Header controls (Mode, Count) are always visible */
        #${PANEL_ID} .pf-header .pack-filler-group[data-key="mode"],
        #${PANEL_ID} .pf-header .pack-filler-group[data-key="count"] {
             display: flex !important;
             opacity: 1 !important;
        }

         /* Global controls (Clear First, Load Full Page, Potato Mode) are always visible in the body */
        #${PANEL_ID} .pf-controls .pack-filler-group.pf-global-control,
        #${PANEL_ID} .pf-buttons .pack-filler-group.pf-global-control {
             display: flex !important;
             opacity: 1 !important;
        }

        /* Show mode-specific controls if the mode matches */
        #${PANEL_ID}[data-pf-mode="random"] .pf-controls .pack-filler-group.pf-mode-random,
        #${PANEL_ID}[data-pf-mode="fixed"] .pf-controls .pack-filler-group.pf-mode-fixed,
        #${PANEL_ID}[data-pf-mode="allVisible"] .pf-controls .pack-filler-group.pf-mode-allVisible,
        #${PANEL_ID}[data-pf-mode="pattern"] .pf-controls .pack-filler-group.pf-mode-pattern,
        #${PANEL_ID}[data-pf-mode="alternating"] .pf-controls .pack-filler-group.pf-mode-alternating {
             display: flex !important;
             opacity: 1 !important;
        }

         /* Show distribution controls only if in Random mode AND distribution matches */
        #${PANEL_ID}[data-pf-mode="random"] .pf-controls .pack-filler-group.pf-dist-uniform,
        #${PANEL_ID}[data-pf-mode="random"][data-pf-distribution="weighted"] .pf-controls .pack-filler-group.pf-dist-weighted,
        #${PANEL_ID}[data-pf-mode="random"][data-pf-distribution="exponential"] .pf-controls .pack-filler-group.pf-dist-exponential,
        #${PANEL_ID}[data-pf-mode="random"][data-pf-distribution="simplex"] .pf-controls .pack-filler-group.pf-dist-simplex,
        #${PANEL_ID}[data-pf-mode="random"][data-pf-distribution="gradient"] .pf-controls .pack-filler-group.pf-dist-gradient {
             display: flex !important;
             opacity: 1 !important;
        }


        /* --- Panel Body (Always Visible) --- */
         #${PANEL_ID} .pf-body {
             display: flex !important; /* Ensure body is always displayed */
             flex-direction: column !important; /* Maintain column layout */
             overflow: visible !important; /* Content should not be hidden */
             max-height: none !important; /* Prevent collapsing via max-height */
             opacity: 1 !important; /* Ensure full opacity */
             transition: none !important; /* No transition for showing/hiding */
             padding-top: calc(var(--pf-gap) / 2) !important; /* Ensure correct internal spacing */
             padding-bottom: 0 !important; /* No bottom padding for body itself */
             margin-top: 0 !important;
             margin-bottom: 0 !important;
         }

         /* Removed specific toggle button CSS as the button is removed */

        /* --- Refined Potato Mode CSS (Targeting specific image types on the main page) --- */

        /* Selectors that match image elements OUTSIDE the panel */
        body.${POTATO_MODE_CLASS} img:not(#${PANEL_ID} *)[src$=".jpg"],
        body.${POTATO_MODE_CLASS} img:not(#${PANEL_ID} *)[src$=".jpeg"],
        body.${POTATO_MODE_CLASS} img:not(#${PANEL_ID} *)[src$=".png"],
        body.${POTATO_MODE_CLASS} img:not(#${PANEL_ID} *)[src$=".svg"],
        body.${POTATO_MODE_CLASS} img:not(#${PANEL_ID} *)[src$=".webp"],
        /* Selectors that match elements with background images OUTSIDE the panel */
        body.${POTATO_MODE_CLASS} [style*="background-image"]:not(#${PANEL_ID} *)[style*=".jpg"],
        body.${POTATO_MODE_CLASS} [style*="background-image"]:not(#${PANEL_ID} *)[style*=".jpeg"],
        body.${POTATO_MODE_CLASS} [style*="background-image"]:not(#${PANEL_ID} *)[style*=".png"],
        body.${POTATO_MODE_CLASS} [style*="background-image"]:not(#${PANEL_ID} *)[style*=".svg"],
        body.${POTATO_MODE_CLASS} [style*="background-image"]:not(#${PANEL_ID} *)[style*=".webp"]
        {
             display: none !important;
             visibility: hidden !important;
        }
    `);

    // Apply potato mode class if enabled initially
    if (Config.current.enablePotatoMode) {
        document.body.classList.add(POTATO_MODE_CLASS);
        console.log("Pack Filler Pro: Refined Experimental Potato Mode enabled. Only specific images on the main page should be hidden.");
        console.warn("Refined Potato Mode is experimental and targets specific image types outside the panel. It may not hide all visual elements you consider non-essential or could hide unintended elements depending on site updates. Disable if issues occur.");
    }


    // --- DOM Utilities ---
    const DomUtils = {
        getInputs: () => [...document.querySelectorAll('input.pack-num-input')]
            .filter(el => el.offsetParent !== null),

        updateInputs: (inputs, valueFn) => {
            if (!inputs || inputs.length === 0) return 0;
            let updatedCount = 0;
            const updates = [];
            inputs.forEach((input, index) => {
                const qty = Math.min(MAX_PACK_QTY, Math.max(MIN_PACK_QTY, Math.round(valueFn(index, inputs.length))));
                if (parseInt(input.value, 10) !== qty) {
                    updates.push({ input, qty });
                }
            });
            if (updates.length > 0) {
                updates.forEach(({ input, qty }) => {
                    input.value = qty;
                    if (typeof unsafeWindow.jQuery === 'function' && typeof unsafeWindow.jQuery(input).trigger === 'function') {
                         unsafeWindow.jQuery(input).trigger('input');
                    } else {
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                });
                console.log(`Pack Filler Pro: Updated ${updates.length} packs.`);
                updatedCount = updates.length;
            }
            return updatedCount;
        },

        clearAll: () => {
            const inputs = DomUtils.getInputs();
            const clearedCount = DomUtils.updateInputs(inputs, () => 0);
            return clearedCount;
        },

        getControlElement: (key) => document.querySelector(`#${PANEL_ID} [data-key="${key}"]`),
        getControlInput: (key) => document.querySelector(`#${PANEL_ID} [data-key="${key}"] input, #${PANEL_ID} [data-key="${key}"] select`),
        getStatusElement: () => document.getElementById(STATUS_ID),

        updatePotatoModeClass: () => {
            if (Config.current.enablePotatoMode) {
                document.body.classList.add(POTATO_MODE_CLASS);
            } else {
                document.body.classList.remove(POTATO_MODE_CLASS);
            }
        },
         // Add/remove data attribute to panel for CSS targeting
        updatePanelState: () => {
             const panelElement = document.getElementById(PANEL_ID);
             if (panelElement) {
                 panelElement.dataset.pfMode = Config.current.mode;
                 panelElement.dataset.pfDistribution = Config.current.distribution;
                 console.log(`Pack Filler Pro: Panel state updated: mode=${Config.current.mode}, dist=${Config.current.distribution}`); // Added logging
             } else {
                  console.warn("Pack Filler Pro: Panel element not found to update state.");
             }
        }
    };

    // --- Page Loader ---
    const PageLoader = {
        loadFullPage: async () => {
            // Check the config setting before deciding to load full page
            const needsFullLoad = Config.current.loadFullPage && (
                Config.current.mode === 'random' ||
                (Config.current.mode === 'alternating' && Config.current.alternateAllVisible) ||
                (Config.current.mode === 'pattern' && Config.current.patternAllVisible) ||
                (Config.current.mode === 'fixed' && Config.current.usePackCount)
                // Add other modes that might require full load here if needed
            );


            if (!needsFullLoad) {
                 console.log("Pack Filler Pro: Full page load not required or disabled.");
                 return DomUtils.getInputs();
            }

            console.log("Pack Filler Pro: Starting full page load...");
            let lastCount = 0;
            let attempts = 0;
            const maxAttempts = 200; // Increased attempts for more robust loading
            const scrollInterval = 50;
            const statusElement = DomUtils.getStatusElement();

            const updateStatus = (count) => {
                if (statusElement) statusElement.textContent = `Loading packs... (${count} found)`;
            };

            updateStatus(DomUtils.getInputs().length);

            return new Promise((resolve) => {
                const scroll = () => {
                    const currentInputs = DomUtils.getInputs();
                    const currentCount = currentInputs.length;

                    if (currentCount > lastCount) {
                        lastCount = currentCount;
                        updateStatus(currentCount);
                        // Scroll to the last found input element for better loading
                        const lastInput = currentInputs[currentInputs.length - 1];
                        if (lastInput) {
                            lastInput.scrollIntoView({ behavior: 'smooth', block: 'end' });
                        } else {
                             // Fallback to scrolling to the bottom if no inputs yet
                             window.scrollTo(0, document.body.scrollHeight);
                        }
                        attempts = 0; // Reset attempts on finding new content
                        setTimeout(scroll, scrollInterval);
                    } else if (attempts < maxAttempts) {
                        attempts++;
                         // Still try scrolling to the bottom even if no new inputs were found
                         window.scrollTo(0, document.body.scrollHeight);
                         setTimeout(scroll, scrollInterval);
                    } else {
                        console.log(`Pack Filler Pro: Stopped loading after ${maxAttempts} attempts with no new packs. Found ${currentCount} packs.`);
                         if (statusElement) statusElement.textContent = `Loading complete. Found ${currentCount} packs.`; // Use template literal
                         setTimeout(() => { if (statusElement) statusElement.textContent = ''; }, STATUS_CLEAR_DELAY);

                        resolve(currentInputs);
                    }
                };
                 // Initial scroll to start the loading process
                 window.scrollTo(0, document.body.scrollHeight);
                 setTimeout(scroll, scrollInterval);
            });
        }
    };

    const selectRandomSubset = (arr, count, seed) => {
        const numToSelect = Math.min(count, arr.length);
        if (numToSelect <= 0) return [];

        const seededRandom = new SeededRandom(seed);
        const shuffled = [...arr];
        seededRandom.shuffle(shuffled);
        return shuffled.slice(0, numToSelect);
    };


    // --- Distribution System ---
    const Distributor = {
        getTargets: async () => {
             // *** Page load happens HERE before selecting targets ***
            const allInputs = await PageLoader.loadFullPage();
            const numInputs = allInputs.length;
            const currentConfig = Config.current;
            if (numInputs === 0) {
                 console.warn("Pack Filler Pro: No target inputs found to fill.");
                 return [];
            }

            switch (currentConfig.mode) {
                case 'random':
                    return selectRandomSubset(allInputs, currentConfig.count, currentConfig.randomSeed);
                case 'allVisible':
                    return allInputs;
                case 'fixed':
                    return currentConfig.usePackCount ? allInputs : allInputs.slice(0, Math.min(currentConfig.count, numInputs));
                case 'alternating':
                    return currentConfig.alternateAllVisible ? allInputs : allInputs.slice(0, Math.min(currentConfig.count, numInputs));
                case 'pattern':
                    return currentConfig.patternAllVisible ? allInputs : allInputs.slice(0, Math.min(currentConfig.count, numInputs));
                default:
                    console.warn(`Pack Filler Pro: Unknown mode: ${currentConfig.mode}. Defaulting to random selection.`);
                    return selectRandomSubset(allInputs, Config.defaults.count, currentConfig.randomSeed);
            }
        },

        getQuantityFn: () => {
            const currentConfig = Config.current;
            const seededRandomForDistribution = new SeededRandom(currentConfig.randomSeed);
            const simplexNoiseGenerator = new SimplexNoise(currentConfig.randomSeed);

            return (i, total) => {
                if (i < 0 || i >= total) return 0;
                const min = Math.min(currentConfig.minQty, currentConfig.maxQty);
                const max = Math.max(currentConfig.minQty, currentConfig.maxQty);
                const range = max - min;

                switch (currentConfig.mode) {
                    case 'allVisible':
                         return Math.max(MIN_PACK_QTY, Math.round(currentConfig.allVisibleQty));
                    case 'fixed':
                         return Math.max(MIN_PACK_QTY, Math.round(currentConfig.fixedQty));
                     case 'pattern': {
                        const pattern = String(currentConfig.pattern || '')
                                            .split(',')
                                            .map(s => parseInt(s.trim(), 10))
                                            .filter(n => !isNaN(n) && n >= MIN_PACK_QTY);
                        return pattern.length > 0 ? pattern[i % pattern.length] : MIN_PACK_QTY;
                    }
                     case 'alternating':
                        const high = Math.max(MIN_PACK_QTY, Math.round(currentConfig.alternateHigh));
                        const low = Math.max(MIN_PACK_QTY, Math.round(currentConfig.alternateLow));
                        return i % 2 ? high : low;

                    case 'random':
                    default:
                        switch (currentConfig.distribution) {
                            case 'uniform':
                                return min + Math.floor(seededRandomForDistribution.next() * (range + 1));
                            case 'weighted':
                                const progress_weighted = total > 1 ? i / (total - 1) : 0;
                                return min + range * progress_weighted ** 2;
                            case 'exponential':
                                const u = Math.max(1e-6, 1 - seededRandomForDistribution.next());
                                const lambda = 0.5 / (range > 0 ? range : 1);
                                let expValue = -Math.log(u) / lambda;
                                return Math.min(max, Math.max(min, Math.round(min + expValue)));
                            case 'simplex':
                                const noiseValue_s = simplexNoiseGenerator.noise2D(i * currentConfig.simplexScale, 0);
                                const scaledNoise_s = (noiseValue_s + 1) / 2;
                                return Math.min(max, Math.max(min, Math.round(min + range * scaledNoise_s)));
                            case 'gradient':
                                const start = Math.max(MIN_PACK_QTY, Math.round(currentConfig.gradientStartQty));
                                const end = Math.max(MIN_PACK_QTY, Math.round(currentConfig.gradientEndQty));
                                const progress_gradient = total > 1 ? i / (total - 1) : 0;
                                return Math.round(start + progress_gradient * (end - start));
                            default:
                                console.warn(`Pack Filler Pro: Unknown distribution: ${currentConfig.distribution}. Defaulting to uniform.`);
                                return min + Math.floor(seededRandomForDistribution.next() * (range + 1));
                        }
                }
            };
        }
    };

    // --- Core Functionality ---
    const PackFiller = {
        execute: async () => {
            const statusElement = DomUtils.getStatusElement();
            if (statusElement) statusElement.textContent = 'Loading packs...';

            try {
                if (Config.current.clearFirst) {
                    const cleared = DomUtils.clearAll();
                    console.log(`Pack Filler Pro: Cleared ${cleared} packs.`);
                    if (statusElement) statusElement.textContent = `Cleared ${cleared} packs. Loading...`;
                     await new Promise(r => setTimeout(r, 100));
                }

                // Page loading now happens inside Distributor.getTargets()
                const targets = await Distributor.getTargets();
                if (!targets || targets.length === 0) {
                    console.warn("Pack Filler Pro: No target inputs found to fill.");
                    if (statusElement) statusElement.textContent = 'No packs found or selected!';
                    return;
                }

                const initialStatusText = `Applying ${Config.current.mode} mode to ${targets.length} packs...`;
                if (statusElement) statusElement.textContent = initialStatusText;
                console.log(`Pack Filler Pro: ${initialStatusText}`);

                const quantityFn = Distributor.getQuantityFn();
                const updatedCount = DomUtils.updateInputs(targets, quantityFn);

                const finalStatusText = `Filled ${updatedCount} packs (${Config.current.mode}).`;
                if (statusElement) statusElement.textContent = finalStatusText;
                console.log(`Pack Filler Pro: ${finalStatusText}`);

            } catch (error) {
                console.error('PackFiller execution error:', error);
                if (statusElement) statusElement.textContent = 'Error filling packs!';
            } finally {
                setTimeout(() => {
                    if (statusElement) statusElement.textContent = '';
                }, STATUS_CLEAR_DELAY);
            }
        }
    };

    // --- UI Creation and Management ---
    const UI = (() => {
        const panel = document.createElement('div');
        panel.id = PANEL_ID;
        panel.tabIndex = -1;

        const header = document.createElement('div');
        header.classList.add('pf-header');

        const body = document.createElement('div');
        body.classList.add('pf-body');

        const controlsContainer = document.createElement('div');
        controlsContainer.classList.add('pf-controls');

        const buttonRow = document.createElement('div');
        buttonRow.classList.add('pf-buttons');

        const statusMessage = document.createElement('div');
        statusMessage.id = STATUS_ID;
        statusMessage.classList.add('pf-status');


        const createInputGroup = (label, key, type, options = {}) => {
            const container = document.createElement('div');
            container.classList.add('pack-filler-group');
            container.dataset.key = key;
            container.dataset.type = type;
             if (options.mode) container.classList.add(`pf-mode-${options.mode}`);
             if (options.distribution) {
                  if (Array.isArray(options.distribution)) {
                       options.distribution.forEach(dist => container.classList.add(`pf-dist-${dist}`));
                  } else {
                       container.classList.add(`pf-dist-${options.distribution}`);
                  }
             }
             if (options.global) container.classList.add(`pf-global-control`);


            const labelElement = document.createElement('label');
            labelElement.textContent = label;
            labelElement.htmlFor = `pf-${key}`;

            let inputElement;
            if (type === 'select') {
                inputElement = document.createElement('select');
                options.options.forEach(optValue => {
                    const option = document.createElement('option');
                    option.value = optValue;
                    option.textContent = optValue === 'allVisible' ? 'All Visible' :
                                         optValue.replace(/([A-Z])/g, ' $1').trim().replace(/^\w/, c => c.toUpperCase());
                    inputElement.appendChild(option);
                });
                inputElement.value = Config.current[key];
            } else if (type === 'checkbox') {
                inputElement = document.createElement('input');
                inputElement.type = 'checkbox';
                inputElement.checked = Config.current[key];
            } else {
                inputElement = document.createElement('input');
                inputElement.type = type || 'text';
                inputElement.value = Config.current[key];
                if (options.placeholder) inputElement.placeholder = options.placeholder;
                if (options.min !== undefined) inputElement.min = options.min;
                if (options.max !== undefined) inputElement.max = options.max;
                if (options.step !== undefined) inputElement.step = options.step;
                 if (options.disabledKey) {
                      inputElement.disabled = Config.current[options.disabledKey];
                 }
            }
            inputElement.id = `pf-${key}`;

            container.append(labelElement, inputElement);
            return container;
        };

        const createButton = (text, btnType = 'secondary') => {
            const button = document.createElement('button');
            button.textContent = text;
            button.classList.add(`btn-${btnType}`);
            return button;
        };

        const controls = {
            modeSelectGroup: createInputGroup('Mode', 'mode', 'select', {
                options: ['random', 'fixed', 'allVisible', 'pattern', 'alternating']
            }),
            countInputGroup: createInputGroup('Packs to Affect', 'count', 'number', {
                min: MIN_COUNT,
                placeholder: 'Count'
            }),
            // Removed toggleButton creation

            random_distribution: createInputGroup('Distribution', 'distribution', 'select', {
                options: ['uniform', 'weighted', 'exponential', 'simplex', 'gradient'],
                mode: 'random'
            }),
            random_minQty: createInputGroup('Min Quantity', 'minQty', 'number', {
                min: MIN_PACK_QTY,
                mode: 'random', distribution: ['uniform', 'weighted', 'exponential', 'simplex']
            }),
            random_maxQty: createInputGroup('Max Quantity', 'maxQty', 'number', {
                min: MIN_PACK_QTY,
                 mode: 'random', distribution: ['uniform', 'weighted', 'exponential', 'simplex']
            }),
            random_randomSeed: createInputGroup('Seed', 'randomSeed', 'number', {
                min: 0,
                 mode: 'random', distribution: ['uniform', 'exponential', 'simplex', 'weighted', 'gradient']
            }),
            random_simplexScale: createInputGroup('Simplex Scale', 'simplexScale', 'number', {
                min: MIN_SIMPEX_SCALE, step: 0.01,
                 mode: 'random', distribution: ['simplex']
            }),
            random_gradientStartQty: createInputGroup('Gradient Start', 'gradientStartQty', 'number', {
                min: MIN_PACK_QTY,
                 mode: 'random', distribution: ['gradient']
            }),
            random_gradientEndQty: createInputGroup('Gradient End', 'gradientEndQty', 'number', {
                min: MIN_PACK_QTY,
                 mode: 'random', distribution: ['gradient']
            }),

            fixed_usePackCount: createInputGroup('Use Pack Count (Overrides "Packs to Affect")', 'usePackCount', 'checkbox', {
                 mode: 'fixed'
            }),
            fixed_fixedQty: createInputGroup('Fixed Quantity', 'fixedQty', 'number', {
                 min: MIN_PACK_QTY, disabledKey: 'usePackCount',
                 mode: 'fixed'
            }),

            allVisible_allVisibleQty: createInputGroup('Copies per Pack', 'allVisibleQty', 'number', {
                 min: MIN_PACK_QTY,
                 mode: 'allVisible'
            }),

            pattern_pattern: createInputGroup('Pattern (e.g. 1,3,5)', 'pattern', 'text', {
                 placeholder: '1,2,3',
                 mode: 'pattern'
            }),
            pattern_patternAllVisible: createInputGroup('Affect All Visible (Overrides "Packs to Affect")', 'patternAllVisible', 'checkbox', {
                 mode: 'pattern'
            }),

            alternating_alternateAllVisible: createInputGroup('Affect All Visible (Overrides "Packs to Affect")', 'alternateAllVisible', 'checkbox', {
                 mode: 'alternating'
            }),
            alternating_alternateHigh: createInputGroup('High Value', 'alternateHigh', 'number', {
                 min: MIN_PACK_QTY,
                 mode: 'alternating'
            }),
            alternating_alternateLow: createInputGroup('Low Value', 'alternateLow', 'number', {
                 min: MIN_PACK_QTY,
                 mode: 'alternating'
            }),

            global_clearFirst: createInputGroup('Clear First', 'clearFirst', 'checkbox', { global: true }),
            global_loadFullPage: createInputGroup('Load Full Page', 'loadFullPage', 'checkbox', { global: true }),
            global_enablePotatoMode: createInputGroup('Enable Potato Mode (Experimental)', 'enablePotatoMode', 'checkbox', { global: true }),
        };

        // Append mode and count to header
        header.append(controls.modeSelectGroup, controls.countInputGroup);
        // Removed toggle button from header append

        // Append all other controls to the body's controls container
        Object.values(controls).forEach(controlEl => {
             // Skip controls already added to the header
             if (!['mode', 'count'].includes(controlEl.dataset.key)) {
                  controlsContainer.appendChild(controlEl);
             }
        });
        body.append(controlsContainer);

        // Add the Fill/Clear buttons directly to the body's button row
        const fillButton = createButton('Fill Packs', 'primary');
        const clearButton = createButton('Clear All', 'danger');
        buttonRow.append(fillButton, clearButton); // Append to the button row container
        body.append(buttonRow); // Append the button row container to the body


        panel.append(
            header,
            body, // Body contains controls and buttons
            statusMessage
        );

        const updateUIState = () => {
             // Panel is always conceptually expanded as hide is disabled
             const currentConfig = Config.current;
             const currentMode = currentConfig.mode;
             const currentDistribution = currentConfig.distribution; // Get current distribution

             // Update data attributes on the panel itself for CSS targeting
             DomUtils.updatePanelState();

              const fixedQtyInput = DomUtils.getControlInput('fixedQty');
             if(fixedQtyInput) {
                 fixedQtyInput.disabled = Config.current.usePackCount;
             }

             // Count input visibility logic remains the same, always visible now unless overridden
             const hideCountInput = currentMode === 'allVisible' ||
                 (currentMode === 'alternating' && currentConfig.alternateAllVisible) ||
                 (currentMode === 'fixed' && currentConfig.usePackCount) ||
                 (currentMode === 'pattern' && currentConfig.patternAllVisible);
             const countGroupElement = DomUtils.getControlElement('count');
             if (countGroupElement) {
                countGroupElement.style.display = hideCountInput ? 'none' : 'flex';
             }

             // Removed toggle button text update

             // Ensure the body content is visible via inline style, overriding potential external CSS
              body.style.display = 'flex';
              body.style.maxHeight = 'none';
              body.style.opacity = '1';
              body.style.overflow = 'visible';
               // Reapply padding/margin to body just in case
              body.style.paddingTop = `calc(var(--pf-gap) / 2)`;
              body.style.paddingBottom = `0`;
              body.style.marginTop = `0`;
              body.style.marginBottom = `0`;

              // Force display 'flex' or 'none' on all control groups within the body based on state
               document.querySelectorAll(`#${PANEL_ID} .pf-controls .pack-filler-group`).forEach(groupEl => {
                   const key = groupEl.dataset.key;
                   const isGlobal = groupEl.classList.contains('pf-global-control');
                   const isModeSpecific = groupEl.classList.contains(`pf-mode-${currentMode}`);
                   // Check for distribution classes carefully - a group might support multiple dists
                   const supportsCurrentDist = Array.from(groupEl.classList).some(cls => cls.startsWith('pf-dist-'));

                   let shouldBeVisible = false;
                   // Global controls are always visible
                   if (isGlobal) {
                       shouldBeVisible = true;
                   } else { // Check mode/distribution specifics
                       if (isModeSpecific) {
                           // For random mode, the group must match the mode class AND EITHER have no dist classes OR match the current dist class
                           if (currentMode === 'random') {
                               const hasDistClasses = Array.from(groupEl.classList).some(cls => cls.startsWith('pf-dist-'));
                               if (!hasDistClasses || supportsCurrentDist) {
                                    shouldBeVisible = true;
                               }
                           } else {
                               // For non-random modes, just matching the mode class is enough
                               shouldBeVisible = true;
                           }
                       }
                   }

                   // Ensure display and opacity are set correctly
                   groupEl.style.display = shouldBeVisible ? 'flex' : 'none';
                   groupEl.style.opacity = shouldBeVisible ? '1' : '0';
               });

               // Ensure buttons in the button row are visible (they are global controls implicitly)
               document.querySelectorAll(`#${PANEL_ID} .pf-buttons button`).forEach(buttonEl => {
                   buttonEl.style.display = 'flex';
                   buttonEl.style.opacity = '1';
               });
         };


        const handleConfigChange = (event) => {
            const element = event.target;
            // Ensure the event came from inside our panel
            if (!panel.contains(element)) return;

            const container = element.closest('[data-key]');
            if (!container) return;

            const key = container.dataset.key;
            const type = container.dataset.type;
            const currentValue = Config.current[key];

            let newValue;
            if (type === 'checkbox') {
                newValue = element.checked;
            } else if (type === 'number') {
                const value = parseFloat(element.value);
                const min = element.min ? parseFloat(element.min) : (key === 'count' ? MIN_COUNT : MIN_PACK_QTY);
                if (typeof value === 'number' && isFinite(value) && value >= min) {
                     if (['fixedQty', 'allVisibleQty', 'minQty', 'maxQty', 'gradientStartQty', 'gradientEndQty', 'alternateHigh', 'alternateLow'].includes(key)) {
                          newValue = Math.min(MAX_PACK_QTY, value);
                          if (element.value != newValue) {
                               element.value = newValue; // Update input value if it was capped
                          }
                     } else {
                          newValue = value;
                     }
                } else {
                     console.warn(`Pack Filler Pro: Invalid number input for key: ${key}`, element.value, `Reverting to ${currentValue}`);
                     element.value = currentValue; // Revert input value
                     return; // Stop processing if input is invalid
                }
            } else { // text or select
                newValue = element.value;
            }

            // Only update config and UI if the value actually changed
            if (Config.current[key] !== newValue) {
                 console.log(`Pack Filler Pro: Config change: ${key} from "${currentValue}" to "${newValue}"`); // Log the change
                Config.current[key] = newValue;

                 // If the mode or distribution changed, trigger a full UI update
                 if (key === 'mode' || key === 'distribution') {
                      console.log(`Pack Filler Pro: Mode or Distribution changed, updating UI state.`); // Log mode/dist change
                      updateUIState();
                 } else {
                     // For other changes, a lighter update might be sufficient,
                     // but calling updateUIState is safe and ensures all controls react.
                      updateUIState();
                 }


                if (key === 'enablePotatoMode') {
                     DomUtils.updatePotatoModeClass();
                     alert("Changing Potato Mode requires a page reload to take effect fully.");
                }

                Config.save(); // Save changes
            } else {
                 console.log(`Pack Filler Pro: Input change for ${key} did not result in config change (value was the same or invalid).`); // Log no change
            }
        };


        panel.addEventListener('input', handleConfigChange, { passive: true });
        panel.addEventListener('change', handleConfigChange, { passive: true }); // Added change listener for selects


        fillButton.addEventListener('click', PackFiller.execute);
        clearButton.addEventListener('click', DomUtils.clearAll);


        document.body.appendChild(panel);
        // Initial UI state update after panel is added and config loaded
        updateUIState();

         requestAnimationFrame(() => {
              setTimeout(() => {
                   panel.focus();
                   console.log("Pack Filler Pro UI panel appended and focus attempted.");
              }, 150);
         });


        console.log("Pack Filler Pro UI panel added and initialized.");

        return panel;
    })();
})();
