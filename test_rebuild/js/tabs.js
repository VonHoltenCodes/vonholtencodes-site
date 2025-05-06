/**
 * Tabs component functionality for VonHoltenCodes site
 * Controls the behavior of the industrial-style navigation tabs
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the tabs
    initTabs();
});

/**
 * Initialize tabs component functionality
 */
function initTabs() {
    console.log('Tabs component initialized');
    
    // Get all tab links
    const tabLinks = document.querySelectorAll('.tab-link');
    
    // Set active tab based on current page
    setActiveTab();
    
    // Add click events for tabs if needed for special behavior
    tabLinks.forEach(tab => {
        tab.addEventListener('click', function(e) {
            // Any special handling before navigation can go here
            console.log('Tab clicked: ' + this.textContent);
            
            // If there's any client-side tab switching (without page navigation),
            // you would handle that here
        });
    });
}

/**
 * Set the active tab based on the current page
 */
function setActiveTab() {
    const currentPath = window.location.pathname;
    const tabLinks = document.querySelectorAll('.tab-link');
    
    // Remove active class from all tabs
    tabLinks.forEach(tab => tab.classList.remove('active'));
    
    // Set active class based on current path
    tabLinks.forEach(tab => {
        const tabPath = tab.getAttribute('href');
        
        // Check if current path includes the tab path or is the index page
        if ((tabPath && currentPath.includes(tabPath)) || 
            (currentPath.endsWith('index.html') && tab.classList.contains('tab-apis'))) {
            tab.classList.add('active');
        }
    });
}