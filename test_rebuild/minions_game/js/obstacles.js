// Obstacles controller
const Obstacles = {
    windows: [],
    
    // Initialize obstacles
    init() {
        this.windows = [];
    },
    
    // Reset obstacles
    reset() {
        this.windows = [];
    },
    
    // Update obstacles
    update(deltaTime) {
        // Move windows
        this.windows.forEach(window => {
            window.x -= Levels.getCurrentScrollSpeed();
        });
        
        // Remove windows that are off screen
        this.windows = this.windows.filter(window => window.x > -window.width);
        
        // Spawn new windows
        if (Game.gameState === 'playing') {
            const currentLevel = Levels.settings[Game.level];
            
            // Randomly spawn windows based on level settings
            if (Math.random() < currentLevel.windowSpawnRate) {
                this.spawnWindow();
            }
        }
    },
    
    // Render obstacles (more visible)
    render() {
        const ctx = Game.ctx;
        
        // Early return if assets aren't loaded
        if (!Rendering.assetsLoaded) return;
        
        try {
            // Limit the number of windows rendered to improve performance
            const windowsToRender = this.windows.slice(0, 3); // Only render up to 3 windows
            
            windowsToRender.forEach(window => {
                // Add back a simple glow effect for better visibility
                ctx.shadowColor = '#00FFFF'; // Cyan glow
                ctx.shadowBlur = 5;         // Reduced blur amount for performance
                
                // Draw top part of window frame with more visible color
                ctx.fillStyle = '#4A90E2'; // Brighter blue for window
                ctx.fillRect(window.x, 0, window.width, window.gapY);
                
                // Draw bottom part of window frame
                ctx.fillRect(
                    window.x, 
                    window.gapY + window.gapHeight, 
                    window.width, 
                    Game.canvas.height - (window.gapY + window.gapHeight)
                );
                
                // Turn off shadow for lines
                ctx.shadowBlur = 0;
                
                // Add a thicker, more visible line to highlight the gap
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 4;  // Thicker line
                
                // Draw edges around the gap
                ctx.beginPath();
                // Top edge of gap
                ctx.moveTo(window.x - 2, window.gapY);
                ctx.lineTo(window.x + window.width + 2, window.gapY);
                // Bottom edge of gap
                ctx.moveTo(window.x - 2, window.gapY + window.gapHeight);
                ctx.lineTo(window.x + window.width + 2, window.gapY + window.gapHeight);
                ctx.stroke();
                
                // Add vertical lines on sides of gap for visibility
                ctx.beginPath();
                ctx.moveTo(window.x, window.gapY);
                ctx.lineTo(window.x, window.gapY + window.gapHeight);
                ctx.moveTo(window.x + window.width, window.gapY);
                ctx.lineTo(window.x + window.width, window.gapY + window.gapHeight);
                ctx.stroke();
            });
        } catch (e) {
            console.error("Error in obstacle rendering:", e);
        }
    },
    
    // Spawn a window
    spawnWindow() {
        // Limit the maximum number of windows to prevent performance issues
        if (this.windows.length >= 5) {
            return;
        }
        
        // Don't spawn windows too close to each other
        const lastWindow = this.windows[this.windows.length - 1];
        if (lastWindow && lastWindow.x > Game.canvas.width - 350) {
            return;  // Skip spawning if the last window is too close (increased spacing)
        }
        
        const canvas = Game.canvas;
        
        // Window properties - further reduced as requested
        const windowWidth = 20;       // Reduced by another 20% (from 25px to 20px)
        const gapHeight = 200;        // Keep the same gap height for easy passage
        
        // Position windows at ground level
        // The gap should be in the range where the player can access it
        const playerJumpHeight = 240;  // Approximate max jump height of player
        const groundLevel = canvas.height - 100;
        
        // Position gap lower so player can jump through it more easily
        const windowBottom = groundLevel - 10; // Position closer to ground level
        const gapY = windowBottom - gapHeight; // Fixed position that works with player jump height
        
        const window = {
            x: canvas.width,
            width: windowWidth,
            gapY: gapY,
            gapHeight: gapHeight
        };
        
        this.windows.push(window);
    }
};