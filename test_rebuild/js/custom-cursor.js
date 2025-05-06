/**
 * Custom crosshair cursor functionality for VonHoltenCodes site
 */

document.addEventListener('DOMContentLoaded', function() {
    initCustomCursor();
});

/**
 * Initialize the custom crosshair cursor
 */
function initCustomCursor() {
    console.log('Custom cursor initialized');
    
    // Create cursor elements
    createCursorElements();
    
    // Enable the custom cursor
    document.body.classList.add('custom-cursor');
    
    // Add event listeners
    setupCursorEvents();
}

/**
 * Create and append cursor elements to the DOM
 */
function createCursorElements() {
    // Create container for all cursor elements
    const cursorContainer = document.createElement('div');
    cursorContainer.className = 'cursor-container';
    
    // Create crosshair cursor
    const crosshair = document.createElement('div');
    crosshair.className = 'crosshair';
    
    // Horizontal line
    const horizontal = document.createElement('div');
    horizontal.className = 'crosshair-horizontal';
    
    // Vertical line
    const vertical = document.createElement('div');
    vertical.className = 'crosshair-vertical';
    
    // Center dot
    const center = document.createElement('div');
    center.className = 'crosshair-center';
    
    // Corner brackets
    const topLeft = document.createElement('div');
    topLeft.className = 'crosshair-corner crosshair-top-left';
    
    const topRight = document.createElement('div');
    topRight.className = 'crosshair-corner crosshair-top-right';
    
    const bottomLeft = document.createElement('div');
    bottomLeft.className = 'crosshair-corner crosshair-bottom-left';
    
    const bottomRight = document.createElement('div');
    bottomRight.className = 'crosshair-corner crosshair-bottom-right';
    
    // Click animation element
    const clickAnim = document.createElement('div');
    clickAnim.className = 'crosshair-click';
    
    // Append all elements
    crosshair.appendChild(horizontal);
    crosshair.appendChild(vertical);
    crosshair.appendChild(center);
    crosshair.appendChild(topLeft);
    crosshair.appendChild(topRight);
    crosshair.appendChild(bottomLeft);
    crosshair.appendChild(bottomRight);
    crosshair.appendChild(clickAnim);
    
    cursorContainer.appendChild(crosshair);
    document.body.appendChild(cursorContainer);
}

/**
 * Set up event listeners for cursor movement and clicks
 */
function setupCursorEvents() {
    const crosshair = document.querySelector('.crosshair');
    const clickAnim = document.querySelector('.crosshair-click');
    
    if (!crosshair || !clickAnim) {
        console.error('Cursor elements not found');
        return;
    }
    
    // Update cursor position on mouse move
    document.addEventListener('mousemove', function(e) {
        // Update position without any delay for precise targeting
        crosshair.style.left = `${e.clientX}px`;
        crosshair.style.top = `${e.clientY}px`;
    });
    
    // Handle click animation
    document.addEventListener('mousedown', function() {
        // Trigger click animation
        clickAnim.classList.add('active');
        
        // Remove animation class after it completes
        setTimeout(function() {
            clickAnim.classList.remove('active');
        }, 300);
    });
    
    // Scale cursor slightly on hover over clickable elements
    const clickableElements = document.querySelectorAll('a, button, input[type="submit"], input[type="button"], .clickable');
    
    clickableElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            crosshair.style.transform = 'scale(1.2)';
        });
        
        element.addEventListener('mouseleave', function() {
            crosshair.style.transform = 'scale(1)';
        });
    });
}

/**
 * Toggle the custom cursor on/off
 * @param {boolean} enable - Whether to enable or disable the cursor
 */
function toggleCustomCursor(enable) {
    if (enable) {
        document.body.classList.add('custom-cursor');
    } else {
        document.body.classList.remove('custom-cursor');
    }
}

/**
 * Update cursor for night mode
 * @param {boolean} isNightMode - Whether night mode is active
 */
function updateCursorForNightMode(isNightMode) {
    const crosshairElements = document.querySelectorAll('.crosshair-horizontal, .crosshair-vertical, .crosshair-center');
    const crosshairBorders = document.querySelectorAll('.crosshair-corner, .crosshair-click');
    
    if (crosshairElements.length === 0 || crosshairBorders.length === 0) {
        return;
    }
    
    if (isNightMode) {
        // Night mode: green cursor
        crosshairElements.forEach(el => {
            el.style.backgroundColor = '#00ff00';
        });
        
        crosshairBorders.forEach(el => {
            el.style.borderColor = '#00ff00';
        });
    } else {
        // Day mode: gold cursor
        crosshairElements.forEach(el => {
            el.style.backgroundColor = '#FFD700';
        });
        
        crosshairBorders.forEach(el => {
            el.style.borderColor = '#FFD700';
        });
    }
}