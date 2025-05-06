/**
 * Header component functionality for VonHoltenCodes site
 * Controls the behavior of the 3D rotating logo
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the header
    initHeader();
});

/**
 * Initialize header component functionality
 */
function initHeader() {
    console.log('Header component initialized');
    
    // Add event listeners for logo interaction if needed
    const logo = document.querySelector('.vh-logo-3d');
    
    if (logo) {
        // Optional: Pause animation on hover
        logo.addEventListener('mouseenter', function() {
            this.style.animationPlayState = 'paused';
        });
        
        logo.addEventListener('mouseleave', function() {
            this.style.animationPlayState = 'running';
        });
        
        // Optional: Add click handler for the logo
        logo.addEventListener('click', function() {
            // For example, could trigger an easter egg or refresh the page
            console.log('VH Logo clicked');
        });
    }
}

/**
 * Update the logo colors based on night mode state
 * @param {boolean} isNightMode - Whether night mode is active
 */
function updateLogoForNightMode(isNightMode) {
    const logo = document.querySelector('.vh-logo-3d');
    
    if (logo) {
        if (isNightMode) {
            const frontFace = logo.querySelector('.front');
            const backFace = logo.querySelector('.back');
            
            if (frontFace) {
                frontFace.style.color = '#00ff00';
                frontFace.style.borderColor = '#00ff00';
                frontFace.style.textShadow = '0 0 5px rgba(0, 255, 0, 0.7)';
                frontFace.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.5)';
            }
            
            if (backFace) {
                backFace.style.color = '#ff4500';
                backFace.style.borderColor = '#ff4500';
                backFace.style.textShadow = '0 0 5px rgba(255, 69, 0, 0.7)';
                backFace.style.boxShadow = '0 0 10px rgba(255, 69, 0, 0.5)';
            }
        } else {
            const frontFace = logo.querySelector('.front');
            const backFace = logo.querySelector('.back');
            
            if (frontFace) {
                frontFace.style.color = '#ff4500';
                frontFace.style.borderColor = '#ff4500';
                frontFace.style.textShadow = '0 0 5px rgba(255, 69, 0, 0.7)';
                frontFace.style.boxShadow = '0 0 10px rgba(255, 69, 0, 0.5)';
            }
            
            if (backFace) {
                backFace.style.color = '#00ff00';
                backFace.style.borderColor = '#00ff00';
                backFace.style.textShadow = '0 0 5px rgba(0, 255, 0, 0.7)';
                backFace.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.5)';
            }
        }
    }
}