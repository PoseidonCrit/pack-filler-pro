// This file contains functions for providing visual feedback to the user, primarily using toast messages.
// Depends on: Constants (TOAST_DURATION - defined in constants.js)

/**
 * Displays a non-intrusive toast message to the user.
 * @param {string} message - The HTML content of the message.
 * @param {'info'|'success'|'warning'|'error'} [type='info'] - The type of message (affects styling).
 * @param {number} [duration=TOAST_DURATION] - How long the toast should be visible in milliseconds.
 * Depends on: TOAST_DURATION
 */
function showToast(message, type = 'info', duration = TOAST_DURATION) {
    // Optional: Remove any existing toasts of the same type or all toasts
    // to prevent message overload. For now, we allow multiple toasts.
    // safeQueryAll('.pfp-toast').forEach(toast => toast.remove());

    const toast = document.createElement('div');
    toast.className = `pfp-toast pfp-${type}`; // Apply base class and type class for styling
    toast.innerHTML = message; // Use innerHTML to allow basic HTML tags (like <br>, <strong>)
    document.body.appendChild(toast); // Add the toast element to the end of the body

    // Force a reflow (recalculation of layout) to ensure the browser recognizes
    // the element is now in the DOM before applying the transition class.
    void toast.offsetWidth;

    // Add the 'show' class to trigger the fade-in and slide-in transition.
    requestAnimationFrame(() => {
         toast.classList.add('show');
    });

    // Set a timeout to start the fade-out transition after the specified duration.
    setTimeout(() => {
        toast.classList.remove('show'); // Remove the 'show' class to trigger fade-out and slide-out
        // Remove the element from the DOM after the transition completes.
        // Use { once: true } to ensure the event listener is removed automatically after it fires once.
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, duration);
}

// Note: This file defines the showToast function. It needs to be required
// before any other file that calls showToast (e.g., config.js, dom-helpers.js, etc.).
// Dependencies on other modules are noted in the JSDoc comments.
