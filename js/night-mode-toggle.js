/**
 * Night Mode Toggle for VonHoltenCodes site
 * Controls night mode and machine gun animation
 */

document.addEventListener('DOMContentLoaded', function() {
    initNightModeToggle();
});

/**
 * Initialize the night mode toggle
 */
function initNightModeToggle() {
    console.log('Night mode toggle initialized');
    
    // Get the toggle button
    const toggleButton = document.querySelector('.night-mode-toggle .toggle-button');
    
    if (!toggleButton) {
        console.error('Night mode toggle button not found');
        return;
    }
    
    // Create bullet hole container if it doesn't exist
    if (!document.querySelector('.bullet-hole-container')) {
        const bulletHoleContainer = document.createElement('div');
        bulletHoleContainer.className = 'bullet-hole-container';
        document.body.appendChild(bulletHoleContainer);
    }
    
    // Add click event to toggle night mode
    toggleButton.addEventListener('click', function() {
        // Toggle night mode class on body
        document.body.classList.toggle('night-mode');
        
        // Save preference to localStorage
        const isNightMode = document.body.classList.contains('night-mode');
        localStorage.setItem('nightMode', isNightMode ? 'true' : 'false');
        
        // Play machine gun animation if switching to night mode
        if (isNightMode) {
            playMachineGunAnimation();
        }
        
        // Update cursor and logo for night mode if those functions exist
        if (typeof updateCursorForNightMode === 'function') {
            updateCursorForNightMode(isNightMode);
        }
        
        // Update site theme based on night mode
        updateSiteThemeForNightMode(isNightMode);
    });
    
    // Check if night mode was previously enabled
    const savedNightMode = localStorage.getItem('nightMode');
    if (savedNightMode === 'true') {
        document.body.classList.add('night-mode');
        
        // Update cursor for night mode if custom cursor is active
        if (typeof updateCursorForNightMode === 'function') {
            updateCursorForNightMode(true);
        }
        
        // Update site theme based on night mode
        updateSiteThemeForNightMode(true);
    }
}

/**
 * Play machine gun animation when toggling to night mode
 */
function playMachineGunAnimation() {
    const bulletHoleContainer = document.querySelector('.bullet-hole-container');
    const toggle = document.querySelector('.night-mode-toggle');
    
    if (!bulletHoleContainer || !toggle) {
        return;
    }
    
    // Get position of the toggle button for muzzle flash origin
    const toggleRect = toggle.getBoundingClientRect();
    const flashOriginX = toggleRect.right;
    const flashOriginY = toggleRect.top + (toggleRect.height / 2);
    
    // Create and animate muzzle flash
    const muzzleFlash = document.createElement('div');
    muzzleFlash.className = 'muzzle-flash';
    muzzleFlash.style.left = `${flashOriginX}px`;
    muzzleFlash.style.top = `${flashOriginY}px`;
    document.body.appendChild(muzzleFlash);
    
    // Fire sequence with random shots
    const shotCount = 5 + Math.floor(Math.random() * 5); // 5-10 shots
    
    let currentShot = 0;
    
    // Function to fire a single shot
    function fireShot() {
        // Activate muzzle flash
        muzzleFlash.classList.add('active');
        
        // Create a bullet hole at a random position
        createBulletHole();
        
        // Reset muzzle flash after animation completes
        setTimeout(() => {
            muzzleFlash.classList.remove('active');
        }, 100);
        
        // Continue firing if there are shots remaining
        currentShot++;
        if (currentShot < shotCount) {
            // Random delay between shots for realism
            setTimeout(fireShot, 50 + Math.random() * 100);
        } else {
            // Remove muzzle flash element after shooting sequence
            setTimeout(() => {
                muzzleFlash.remove();
            }, 200);
        }
    }
    
    // Start the firing sequence
    fireShot();
}

/**
 * Create a bullet hole at a random position on the screen
 */
function createBulletHole() {
    const bulletHoleContainer = document.querySelector('.bullet-hole-container');
    
    if (!bulletHoleContainer) {
        return;
    }
    
    // Create a bullet hole element
    const bulletHole = document.createElement('div');
    bulletHole.className = 'bullet-hole';
    
    // Random position (weighted towards the center of the screen)
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const spreadX = window.innerWidth * 0.3;
    const spreadY = window.innerHeight * 0.3;
    
    const x = centerX + (Math.random() - 0.5) * spreadX;
    const y = centerY + (Math.random() - 0.5) * spreadY;
    
    // Random size variation
    const size = 8 + Math.random() * 4;
    
    // Set position and size
    bulletHole.style.left = `${x}px`;
    bulletHole.style.top = `${y}px`;
    bulletHole.style.width = `${size}px`;
    bulletHole.style.height = `${size}px`;
    
    // Add to container
    bulletHoleContainer.appendChild(bulletHole);
    
    // Remove bullet holes after some time to prevent too many elements
    setTimeout(() => {
        if (bulletHoleContainer.children.length > 20) {
            bulletHoleContainer.removeChild(bulletHoleContainer.firstChild);
        }
    }, 3000);
}

/**
 * Update various site elements for night mode
 * @param {boolean} isNightMode - True if night mode is active
 */
function updateSiteThemeForNightMode(isNightMode) {
    // Get the VH logo faces (if they exist)
    const logoFront = document.querySelector('.vh-logo-3d .front');
    const logoBack = document.querySelector('.vh-logo-3d .back');
    
    if (logoFront && logoBack) {
        if (isNightMode) {
            // Night mode: green front, orange back
            logoFront.style.color = '#00ff00';
            logoFront.style.textShadow = '0 0 5px rgba(0, 255, 0, 0.7)';
            logoFront.style.borderColor = '#00ff00';
            logoFront.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.5)';
            
            logoBack.style.color = '#ff4500';
            logoBack.style.textShadow = '0 0 5px rgba(255, 69, 0, 0.7)';
            logoBack.style.borderColor = '#ff4500';
            logoBack.style.boxShadow = '0 0 10px rgba(255, 69, 0, 0.5)';
        } else {
            // Day mode: orange front, green back
            logoFront.style.color = '#ff4500';
            logoFront.style.textShadow = '0 0 5px rgba(255, 69, 0, 0.7)';
            logoFront.style.borderColor = '#ff4500';
            logoFront.style.boxShadow = '0 0 10px rgba(255, 69, 0, 0.5)';
            
            logoBack.style.color = '#00ff00';
            logoBack.style.textShadow = '0 0 5px rgba(0, 255, 0, 0.7)';
            logoBack.style.borderColor = '#00ff00';
            logoBack.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.5)';
        }
    }
    
    // Update bullet holes in the logo
    const bulletHoles = document.querySelectorAll('.vh-logo-3d .bullet-hole');
    bulletHoles.forEach(hole => {
        if (isNightMode) {
            hole.style.boxShadow = 'inset 0 0 2px #000, 0 0 4px rgba(0, 255, 0, 0.8)';
        } else {
            hole.style.boxShadow = 'inset 0 0 2px #000, 0 0 4px rgba(255, 69, 0, 0.8)';
        }
    });
}