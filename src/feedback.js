console.log('Pack Filler Pro: src/feedback.js started execution.'); // Log to confirm file loading

// This file provides functions for giving visual feedback to the user, like toast messages.
// Depends on: GM_addStyle (granted in main script), Constants (TOAST_DURATION - defined in constants.js)

// Ensure TOAST_DURATION is available from constants.js
if (typeof TOAST_DURATION === 'undefined') {
    console.error("Pack Filler Pro: TOAST_DURATION constant not available from constants.js! Using default 3000ms.");
    var TOAST_DURATION = 3000; // Fallback default
}

// Add CSS for toast messages if not already added
function addToastCSS() {
    GM_addStyle(`
        .pack-filler-pro-toast-container {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 100000; /* Higher than panel */
            display: flex;
            flex-direction: column;
            align-items: center;
            pointer-events: none; /* Allow clicks to pass through */
        }
        .pack-filler-pro-toast {
            background-color: rgba(50, 50, 50, 0.9);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            margin-bottom: 10px;
            opacity: 0;
            transition: opacity 0.5s ease-in-out;
            font-family: sans-serif;
            font-size: 14px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            pointer-events: all; /* Re-enable clicks on the toast itself */
            max-width: 80%; /* Prevent overly wide toasts on mobile */
            text-align: center;
        }
        .pack-filler-pro-toast.show {
            opacity: 1;
        }
        .pack-filler-pro-toast.info { background-color: rgba(50, 150, 200, 0.9); }
        .pack-filler-pro-toast.success { background-color: rgba(50, 180, 100, 0.9); }
        .pack-filler-pro-toast.warning { background-color: rgba(255, 165, 0, 0.9); }
        .pack-filler-pro-toast.error { background-color: rgba(220, 50, 50, 0.9); }
    `);
}

// Ensure toast container exists or create it
function getOrCreateToastContainer() {
    let container = document.querySelector('.pack-filler-pro-toast-container');
    if (!container) {
        addToastCSS(); // Add CSS when container is first created
        container = document.createElement('div');
        container.classList.add('pack-filler-pro-toast-container');
        document.body.appendChild(container);
    }
    return container;
}


/**
 * Displays a temporary toast message to the user.
 * @param {string} message - The message content (can include basic HTML like <br>).
 * @param {string} [type='info'] - The type of message ('info', 'success', 'warning', 'error').
 * @param {number} [duration=TOAST_DURATION] - How long the toast should be visible in milliseconds.
 * Depends on: getOrCreateToastContainer, TOAST_DURATION
 */
function showToast(message, type = 'info', duration = TOAST_DURATION) {
    console.log(`Pack Filler Pro Toast (${type}):`, message.replace(/<br>/g, ' | ')); // Log toast content to console

    const container = getOrCreateToastContainer();
    const toast = document.createElement('div');
    toast.classList.add('pack-filler-pro-toast', type);
    toast.innerHTML = message; // Use innerHTML to support <br>

    container.appendChild(toast);

    // Trigger show animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });


    // Hide and remove after duration
    setTimeout(() => {
        toast.classList.remove('show');
        // Remove element after transition finishes
        toast.addEventListener('transitionend', () => {
            toast.remove();
            // Optional: Remove container if empty? Might cause re-creation overhead. Keep it for now.
        }, { once: true }); // Use { once: true } to auto-remove listener
    }, duration);
}

// Note: This file defines the showToast function. It requires GM_addStyle
// (granted in the main script) and the TOAST_DURATION constant.
// Ensure constants.js is required before feedback.js.
