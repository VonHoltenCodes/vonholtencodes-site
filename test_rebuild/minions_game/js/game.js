// Main Game Controller
const Game = {
    canvas: null,
    ctx: null,
    gameState: 'playing', // 'playing', 'gameover', 'win'
    level: 1,
    levelProgress: 0,
    lastTime: 0,
    deltaTime: 0,
    
    // Initialize game
    init() {
        // Get canvas and context
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.gameState = 'loading'; // Start with 'loading' state
        
        // Show loading screen
        this.showLoadingScreen();
        
        // Initialize modules
        Rendering.init();
        
        // Set up a loading check interval
        const loadingCheckInterval = setInterval(() => {
            if (Rendering.assetsLoaded) {
                // Once assets are loaded, initialize the rest of the game
                clearInterval(loadingCheckInterval);
                this.finishInitialization();
            }
        }, 100);
        
        // Start game loop
        this.lastTime = performance.now();
        requestAnimationFrame(this.gameLoop.bind(this));
    },
    
    // Show loading screen
    showLoadingScreen() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw loading background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1a237e'); // Deep blue
        gradient.addColorStop(1, '#4a148c'); // Deep purple
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw loading text
        this.ctx.fillStyle = '#FFD700'; // Yellow
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('Loading Minions Escape Game...', this.canvas.width / 2, this.canvas.height / 2 - 20);
        
        // Draw loading bar outline
        const barWidth = 300;
        const barHeight = 20;
        const barX = (this.canvas.width - barWidth) / 2;
        const barY = this.canvas.height / 2 + 20;
        
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // Store loading bar info for animation
        this.loadingBar = {
            x: barX,
            y: barY,
            width: barWidth,
            height: barHeight,
            progress: 0
        };
    },
    
    // Update loading screen with progress
    updateLoadingScreen() {
        if (!Rendering.assetsLoaded) {
            // Clear just the loading bar area
            this.ctx.clearRect(
                this.loadingBar.x - 1, 
                this.loadingBar.y - 1, 
                this.loadingBar.width + 2, 
                this.loadingBar.height + 2
            );
            
            // Update progress based on loaded assets
            const progress = Rendering.assetCount / Rendering.totalAssets;
            this.loadingBar.progress = progress;
            
            // Draw loading bar outline
            this.ctx.strokeStyle = '#FFFFFF';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(
                this.loadingBar.x, 
                this.loadingBar.y, 
                this.loadingBar.width, 
                this.loadingBar.height
            );
            
            // Draw loading bar fill
            this.ctx.fillStyle = '#00FFFF'; // Cyan
            this.ctx.fillRect(
                this.loadingBar.x + 2, 
                this.loadingBar.y + 2, 
                (this.loadingBar.width - 4) * progress, 
                this.loadingBar.height - 4
            );
            
            // Draw percentage text
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(
                `${Math.floor(progress * 100)}%`, 
                this.canvas.width / 2, 
                this.loadingBar.y + this.loadingBar.height / 2
            );
        }
    },
    
    // Complete initialization after assets are loaded
    finishInitialization() {
        // Initialize other game components now that assets are loaded
        Player.init();
        Enemies.init();
        Obstacles.init();
        Levels.init();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Switch to playing state
        this.gameState = 'playing';
        
        // Play start sound or animation if needed
        console.log('All assets loaded, game starting!');
    },
    
    // Game loop
    gameLoop(currentTime) {
        try {
            // Calculate delta time
            this.deltaTime = (currentTime - this.lastTime) / 1000;
            this.lastTime = currentTime;
            
            // Limit delta time to prevent large jumps
            if (this.deltaTime > 0.1) this.deltaTime = 0.1;
            
            // Handle different game states
            if (this.gameState === 'loading') {
                // Update loading screen with progress
                this.updateLoadingScreen();
            } else if (this.gameState === 'playing') {
                // Wrap update and render in try/catch to prevent crashes
                try {
                    this.update();
                } catch (e) {
                    console.error("Error in update cycle:", e);
                    // Attempt to recover by resetting entities
                    if (Enemies) Enemies.enemies = [];
                    if (Obstacles) Obstacles.windows = [];
                    if (Player) Player.projectiles = [];
                }
                
                try {
                    this.render();
                } catch (e) {
                    console.error("Error in render cycle:", e);
                }
            } else if (this.gameState === 'gameover' || this.gameState === 'win') {
                // Render but don't update
                try {
                    this.render();
                } catch (e) {
                    console.error("Error in render cycle:", e);
                }
            }
        } catch (e) {
            console.error("Critical error in game loop:", e);
        }
        
        // Continue game loop with RAF and error handling
        try {
            requestAnimationFrame((time) => {
                try {
                    this.gameLoop(time);
                } catch (e) {
                    console.error("Error in gameLoop:", e);
                    // Attempt to recover
                    setTimeout(() => requestAnimationFrame(this.gameLoop.bind(this)), 1000);
                }
            });
        } catch (e) {
            console.error("RAF error:", e);
            // Last resort recovery
            setTimeout(() => requestAnimationFrame(this.gameLoop.bind(this)), 2000);
        }
    },
    
    // Update game state
    update() {
        // Update level progress (stops when boss is spawned)
        if (!Levels.bossSpawned) {
            this.levelProgress += Levels.getCurrentScrollSpeed();
        }
        
        // Update game objects
        Player.update(this.deltaTime);
        
        // Update enemies (handle boss fight specially)
        Enemies.update(this.deltaTime, Levels.bossSpawned);
        
        // Only update obstacles if boss hasn't spawned yet
        if (!Levels.bossSpawned) {
            Obstacles.update(this.deltaTime);
        }
        
        // Check for level completion
        if (this.levelProgress >= Levels.getCurrentLevelLength()) {
            if (this.level < 3) {
                this.level++;
                this.levelProgress = 0;
                Levels.startLevel(this.level);
            } else if (this.level === 3 && !Levels.bossDefeated && !Levels.bossSpawned) {
                // Spawn boss and show message
                Levels.spawnBoss();
                this.showBossMessage();
            }
        }
        
        // Check for win condition
        if (Levels.bossDefeated && this.gameState === 'playing') {
            this.win();
        }
        
        // Check for game over
        if (Player.lives <= 0 && this.gameState === 'playing') {
            this.gameOver();
        }
    },
    
    // Show boss message
    showBossMessage() {
        const notification = document.createElement('div');
        notification.className = 'boss-notification';
        notification.textContent = "FINAL BOSS BATTLE!";
        notification.style.position = 'absolute';
        notification.style.top = '50%';
        notification.style.left = '50%';
        notification.style.transform = 'translate(-50%, -50%)';
        notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        notification.style.color = '#FF0000';
        notification.style.padding = '20px 40px';
        notification.style.borderRadius = '10px';
        notification.style.fontSize = '2.5rem';
        notification.style.fontWeight = 'bold';
        notification.style.boxShadow = '0 0 30px #FF0000';
        notification.style.zIndex = '1000';
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s ease-in-out';
        
        document.body.appendChild(notification);
        
        // Animate notification
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 100);
        
        setTimeout(() => {
            notification.style.opacity = '0';
        }, 3000);
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3500);
    },
    
    // Render game
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render game elements
        Rendering.drawBackground();
        Obstacles.render();
        Enemies.render();
        Player.render();
        Rendering.drawHUD();
    },
    
    // Set up event listeners
    setupEventListeners() {
        // Desktop controls
        window.addEventListener('keydown', (e) => {
            Player.handleKeyDown(e);
        });
        
        window.addEventListener('keyup', (e) => {
            Player.handleKeyUp(e);
        });
        
        this.canvas.addEventListener('click', () => {
            if (this.gameState === 'playing') {
                Player.jump();
            }
        });
        
        // Mobile controls
        let touchStartX = 0;
        let touchStartTime = 0;
        let lastTapTime = 0;
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartTime = Date.now();
            
            // Check for double tap (shoot)
            const currentTime = Date.now();
            const tapLength = currentTime - touchStartTime;
            const timeBetweenTaps = currentTime - lastTapTime;
            
            if (timeBetweenTaps < 300 && tapLength < 150) {
                Player.shoot();
            }
            
            lastTapTime = currentTime;
            
            // Single tap (jump)
            if (this.gameState === 'playing') {
                Player.jump();
            }
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.gameState === 'playing') {
                const touch = e.touches[0];
                const touchCurrentX = touch.clientX;
                const deltaX = touchCurrentX - touchStartX;
                
                // Swipe left/right for movement
                if (deltaX < -30) {
                    Player.moveLeft = true;
                    Player.moveRight = false;
                } else if (deltaX > 30) {
                    Player.moveLeft = false;
                    Player.moveRight = true;
                }
            }
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            Player.moveLeft = false;
            Player.moveRight = false;
        });
        
        // Restart buttons
        document.getElementById('restartButton').addEventListener('click', () => {
            this.restart();
        });
        
        document.getElementById('playAgainButton').addEventListener('click', () => {
            this.restart();
        });
    },
    
    // Game over
    gameOver() {
        this.gameState = 'gameover';
        document.getElementById('gameOver').classList.add('active');
    },
    
    // Win
    win() {
        this.gameState = 'win';
        document.getElementById('winScreen').classList.add('active');
    },
    
    // Restart game
    restart() {
        // Reset game state
        this.gameState = 'playing';
        this.level = 1;
        this.levelProgress = 0;
        
        // Hide overlays
        document.getElementById('gameOver').classList.remove('active');
        document.getElementById('winScreen').classList.remove('active');
        
        // Reset modules
        Player.reset();
        Enemies.reset();
        Obstacles.reset();
        Levels.init();
    }
};

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    Game.init();
});