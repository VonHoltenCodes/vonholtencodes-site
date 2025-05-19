/**
 * Main JavaScript file for the VonHoltenCodes site rebuild
 * This file contains core functionality shared across all pages
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('VonHoltenCodes Test Rebuild Environment loaded');
    
    // Initialize components as they're implemented
    initPlaceholders();
    
    // Load and initialize the visitor counter
    loadComponent('components/visitor-counter.html', 'visitor-counter-container')
        .then(() => {
            updateVisitorCounter();
        });
});

/**
 * Initializes placeholder components with click handlers
 */
function initPlaceholders() {
    const placeholders = document.querySelectorAll('.placeholder');
    
    placeholders.forEach(placeholder => {
        placeholder.addEventListener('click', function() {
            const componentName = this.querySelector('h3').textContent;
            alert(`The ${componentName} component is not yet implemented in this test environment.`);
        });
    });
}

/**
 * Updates the visitor counter display
 */
function updateVisitorCounter() {
    // First time visitor - increment the counter
    const shouldIncrement = !localStorage.getItem('vonholtencodes_visited');
    
    fetch('/visitor_counter_secure.php' + (shouldIncrement ? '?increment=1' : ''))
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const countElement = document.getElementById('visitor-count');
                if (countElement) {
                    countElement.textContent = data.count.toLocaleString();
                }
                
                // Mark as visited to prevent multiple increments
                if (shouldIncrement) {
                    localStorage.setItem('vonholtencodes_visited', 'true');
                }
            }
        })
        .catch(error => {
            console.error('Failed to update visitor counter:', error);
            const countElement = document.getElementById('visitor-count');
            if (countElement) {
                countElement.textContent = '---';
            }
        });
}

/**
 * Helper function to load component HTML into a container
 * @param {string} url - The URL of the component HTML file
 * @param {string} containerId - The ID of the container to load the component into
 * @returns {Promise} - A promise that resolves when the component is loaded
 */
async function loadComponent(url, containerId) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load component from ${url}`);
        }
        const html = await response.text();
        document.getElementById(containerId).innerHTML = html;
        return true;
    } catch (error) {
        console.error('Error loading component:', error);
        return false;
    }
}