 This file integrates the Tippy.js library to provide enhanced tooltips.
 Depends on Tippy.js library (@require in main script),
 Constants (TOOLTIP_THEME - defined in constants.js)



  Initializes Tippy.js tooltips for elements with the 'data-pfp-help' attribute.
  Can target a specific container or the entire document.
  Destroys existing Tippy instances on targeted elements to prevent duplicates.
  @param {Element} [container=document] - The DOM element to search within for elements with 'data-pfp-help'. Defaults to the entire document.
  Depends on Tippy.js library, TOOLTIP_THEME
 
function addTooltips(container = document) {
     Select all elements within the container that have the 'data-pfp-help' attribute.
    const elementsWithHelp = container.querySelectorAll('[data-pfp-help]');

     Destroy any existing Tippy.js instances on these elements to prevent duplicates or conflicts.
     This is important when calling addTooltips multiple times (e.g., after dynamic content loads).
     elementsWithHelp.forEach(el = {
         if (el._tippy) {  Check if Tippy has been initialized on this element
             el._tippy.destroy();  Destroy the existing Tippy instance
         }
     });


     Initialize new Tippy.js tooltips for the selected elements.
    tippy(elementsWithHelp, {
         The content of the tooltip is taken from the 'data-pfp-help' attribute.
        content(reference) {
            return reference.getAttribute('data-pfp-help');
        },
        allowHTML true,  Allow HTML content in tooltips (for br, strong, etc.)
        placement 'right',  Default placement of the tooltip (can be overridden by data-tippy-placement)
        theme TOOLTIP_THEME,  Use the custom theme defined in the CSS
        interactive false,  Tooltip hides when the mouse leaves the reference element (not the tooltip itself)
        appendTo document.body,  Append tooltips to the body to prevent clipping issues with overflow hidden
        delay [100, 50]  Small delay before showing (100ms) and a quicker delay before hiding (50ms)
    });
     console.log('Pack Filler Pro Tooltips addedupdated in container.', container);  Can be noisy
}

 Note This file defines the addTooltips function. It requires the Tippy.js library
 to be loaded via @require in the main script. It depends on the TOOLTIP_THEME constant.
 Ensure constants.js and the Tippy.js library are required before tooltips.js.
