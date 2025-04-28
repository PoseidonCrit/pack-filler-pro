// This file provides functionality to make a DOM element draggable.
// Depends on: None explicit, but operates on DOM elements.


/**
 * Makes a target DOM element draggable using a header element as the drag handle.
 * Saves the final position by calling a callback function.
 * @param {Element} headerElement - The element that acts as the handle for dragging (e.g., the panel header).
 * @param {Element} dragElement - The element that should be dragged (e.g., the main panel container).
 * @param {function(object)} onDragEnd - Callback function executed when dragging stops, receiving the final position { top: string, left: string }.
 */
function makeDraggable(headerElement, dragElement, onDragEnd) {
     let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

     if (!headerElement || !dragElement) {
          console.error("Pack Filler Pro: Cannot make element draggable, missing header or drag element.");
          return;
     }

     // Attach the mousedown event listener to the header element.
     headerElement.onmousedown = dragMouseDown; // Using traditional onmousedown for simplicity/compatibility

     /** Handles the mousedown event to start dragging. */
     function dragMouseDown(e) {
          e = e || window.event;
          e.preventDefault(); // Prevent default actions like text selection or dragging images

          // Get the mouse cursor position at startup:
          pos3 = e.clientX;
          pos4 = e.clientY;

          // Attach the mouseup and mousemove event listeners to the entire document.
          // This ensures dragging continues even if the cursor moves outside the header or drag element.
          document.onmouseup = closeDragElement;
          document.onmousemove = elementDrag;

          // Add a class to the drag element while dragging for visual feedback (e.g., different cursor).
          dragElement.classList.add('is-dragging');

           // Optional: Store initial position to potentially prevent drag if movement is tiny
           // dragElement.dataset.initialTop = dragElement.style.top;
           // dragElement.dataset.initialLeft = dragElement.style.left;
     }

     /** Handles the mousemove event to update the element's position while dragging. */
     function elementDrag(e) {
          e = e || window.event;
          e.preventDefault();

          // Calculate the new cursor position relative to the last known position:
          pos1 = pos3 - e.clientX;
          pos2 = pos4 - e.clientY;
          // Update the last known cursor position:
          pos3 = e.clientX;
          pos4 = e.clientY;

          // Calculate the element's new top and left positions based on the mouse movement.
          let newTop = (dragElement.offsetTop - pos2);
          let newLeft = (dragElement.offsetLeft - pos1);

          // Optional: Clamp the element's position to the viewport boundaries.
          // This prevents the panel from being dragged off-screen.
          const panelWidth = dragElement.offsetWidth;
          const panelHeight = dragElement.offsetHeight;
          const margin = 10; // Keep element at least 10px from the edge
          const maxX = window.innerWidth - panelWidth - margin;
          const maxY = window.innerHeight - panelHeight - margin;

          newTop = Math.max(margin, Math.min(newTop, maxY));
          newLeft = Math.max(margin, Math.min(newLeft, maxX));


          // Apply the new position to the drag element's style.
          dragElement.style.top = newTop + "px";
          dragElement.style.left = newLeft + "px";
          // Ensure the element has 'position: fixed' or 'position: absolute'
          // for top/left positioning to work. 'fixed' is appropriate for a UI panel.
          dragElement.style.position = 'fixed';
          // Clear 'right' and 'bottom' styles to prevent conflicts if they were previously set.
          dragElement.style.right = 'auto';
          dragElement.style.bottom = 'auto';
     }

     /** Handles the mouseup event to stop dragging. */
     function closeDragElement() {
          // Remove the event listeners from the document to stop dragging.
          document.onmouseup = null;
          document.onmousemove = null;

          // Remove the dragging class from the element.
          dragElement.classList.remove('is-dragging');

          // Capture the final position.
          const finalPos = {
              top: dragElement.style.top,
              left: dragElement.style.left
              // Note: Saving top/left is sufficient if position is always 'fixed'
          };

          // Call the callback function if provided, passing the final position.
          if (onDragEnd) {
               onDragEnd(finalPos);
          }

           // Optional: Reset initial position data attributes
           // delete dragElement.dataset.initialTop;
           // delete dragElement.dataset.initialLeft;
     }
}

// Note: This file defines the makeDraggable function. It does not have explicit
// dependencies on other script files in terms of calling their functions,
// but it operates on DOM elements created by ui-panel.js and updates the config
// via a callback which uses saveConfig (from config.js).
// Ensure ui-panel.js and config.js are required before this file is used
// to make the panel element draggable.
