/**
 * Background effects for VonHoltenCodes site
 * Creates animated circuit lines
 */

document.addEventListener('DOMContentLoaded', function() {
    initBackground();
});

/**
 * Initialize the background effects
 */
function initBackground() {
    console.log('Background effects initialized');
    
    // Create circuit lines
    createCircuitLines();
}

/**
 * Create animated circuit lines in the background
 */
function createCircuitLines() {
    const circuitLinesContainer = document.querySelector('.circuit-lines');
    
    if (!circuitLinesContainer) {
        console.error('Circuit lines container not found');
        return;
    }
    
    // Create horizontal lines
    for (let i = 0; i < 8; i++) {
        const line = document.createElement('div');
        line.className = 'circuit-line circuit-line-horizontal';
        
        // Random positioning and timing
        const topPosition = Math.floor(Math.random() * 100);
        const delay = Math.floor(Math.random() * 10);
        const duration = 15 + Math.floor(Math.random() * 10);
        
        line.style.top = `${topPosition}%`;
        line.style.animationDelay = `${delay}s`;
        line.style.animationDuration = `${duration}s`;
        
        circuitLinesContainer.appendChild(line);
    }
    
    // Create vertical lines
    for (let i = 0; i < 8; i++) {
        const line = document.createElement('div');
        line.className = 'circuit-line circuit-line-vertical';
        
        // Random positioning and timing
        const leftPosition = Math.floor(Math.random() * 100);
        const delay = Math.floor(Math.random() * 10);
        const duration = 15 + Math.floor(Math.random() * 10);
        
        line.style.left = `${leftPosition}%`;
        line.style.animationDelay = `${delay}s`;
        line.style.animationDuration = `${duration}s`;
        
        circuitLinesContainer.appendChild(line);
    }
}