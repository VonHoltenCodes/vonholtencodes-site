// Rendering controller
const Rendering = {
    // Background positions for parallax effect
    backgroundX: {
        sky: 0,
        clouds: 0,
        city: 0
    },
    
    // Asset placeholders
    assets: {
        sky: null,
        clouds: null,
        city: null,
        heart: null,
        life: null,
        minion_idle: null,
        minion_jump: null,
        gremlin_purple: null,
        gremlin_boss: null,
        fart_cloud: null,
        window_frame: null,
        minion_yellow: null
    },
    
    assetsLoaded: false,
    assetCount: 0,
    totalAssets: 11, // Total number of sprite assets being loaded
    
    // Initialize rendering
    init() {
        // Load all image assets
        this.loadAssets();
    },
    
    // Load assets
    loadAssets() {
        // Background images
        this.assets.sky = new Image();
        this.assets.sky.src = 'assets/sprites/bg_sky.png';
        this.assets.sky.onload = () => this.assetLoaded();
        
        this.assets.clouds = new Image();
        this.assets.clouds.src = 'assets/sprites/bg_clouds.png';
        this.assets.clouds.onload = () => this.assetLoaded();
        
        this.assets.city = new Image();
        this.assets.city.src = 'assets/sprites/bg_city.png';
        this.assets.city.onload = () => this.assetLoaded();
        
        // UI elements
        this.assets.heart = new Image();
        this.assets.heart.src = 'assets/sprites/heart.png';
        this.assets.heart.onload = () => this.assetLoaded();
        
        this.assets.life = new Image();
        this.assets.life.src = 'assets/sprites/life.png';
        this.assets.life.onload = () => this.assetLoaded();
        
        // Player sprites
        this.assets.minion_idle = new Image();
        this.assets.minion_idle.src = 'assets/sprites/minion_idle.png';
        this.assets.minion_idle.onload = () => this.assetLoaded();
        
        this.assets.minion_jump = new Image();
        this.assets.minion_jump.src = 'assets/sprites/minion_jump.png';
        this.assets.minion_jump.onload = () => this.assetLoaded();
        
        // Enemy sprites
        this.assets.gremlin_purple = new Image();
        this.assets.gremlin_purple.src = 'assets/sprites/gremlin_purple.png';
        this.assets.gremlin_purple.onload = () => this.assetLoaded();
        
        this.assets.gremlin_boss = new Image();
        this.assets.gremlin_boss.src = 'assets/sprites/gremlin_boss.png';
        this.assets.gremlin_boss.onload = () => this.assetLoaded();
        
        this.assets.minion_yellow = new Image();
        this.assets.minion_yellow.src = 'assets/sprites/minion_yellow.png';
        this.assets.minion_yellow.onload = () => this.assetLoaded();
        
        // Other game elements
        this.assets.fart_cloud = new Image();
        this.assets.fart_cloud.src = 'assets/sprites/fart_cloud.png';
        this.assets.fart_cloud.onload = () => this.assetLoaded();
        
        this.assets.window_frame = new Image();
        this.assets.window_frame.src = 'assets/sprites/window_frame.png';
        this.assets.window_frame.onload = () => this.assetLoaded();
    },
    
    // Called when an asset is loaded
    assetLoaded() {
        this.assetCount++;
        if (this.assetCount >= this.totalAssets) {
            this.assetsLoaded = true;
            console.log('All assets loaded!');
        }
    },
    
    // Draw background with parallax effect (with duplicates)
    drawBackground() {
        if (!this.assetsLoaded) return;
        
        try {
            const ctx = Game.ctx;
            const canvas = Game.canvas;
            
            // Update background positions
            this.backgroundX.clouds -= Levels.getCurrentScrollSpeed() * 0.3;
            this.backgroundX.city -= Levels.getCurrentScrollSpeed() * 0.5;
            
            // Wrap backgrounds when they go offscreen
            if (this.backgroundX.clouds <= -canvas.width) {
                this.backgroundX.clouds = 0;
            }
            
            if (this.backgroundX.city <= -canvas.width) {
                this.backgroundX.city = 0;
            }
            
            // Draw sky (static background)
            ctx.drawImage(this.assets.sky, 0, 0, canvas.width, canvas.height);
            
            // Draw clouds (midground) - with duplicates for seamless scrolling
            ctx.drawImage(this.assets.clouds, this.backgroundX.clouds, 0, canvas.width, canvas.height);
            ctx.drawImage(this.assets.clouds, this.backgroundX.clouds + canvas.width, 0, canvas.width, canvas.height);
            
            // Draw cityscape (foreground) - with duplicates for seamless scrolling
            ctx.drawImage(this.assets.city, this.backgroundX.city, 0, canvas.width, canvas.height);
            ctx.drawImage(this.assets.city, this.backgroundX.city + canvas.width, 0, canvas.width, canvas.height);
            
            // Remove stars completely as requested
        } catch (e) {
            console.error("Error in drawBackground:", e);
        }
    },
    
    // Draw HUD (Head-Up Display)
    drawHUD() {
        if (!this.assetsLoaded) return;
        
        try {
            const ctx = Game.ctx;
            const canvas = Game.canvas;
            
            // Level indicator
            ctx.fillStyle = '#FFD700'; // Yellow
            ctx.font = '20px Arial';
            ctx.textBaseline = 'top';
            ctx.fillText(`Level: ${Game.level}`, 20, 20);
            
            // Lives - simplified to just a number instead of icons
            ctx.fillText(`Lives: ${Player.lives}`, 20, 50);
            
            // Health
            const healthWidth = 150;
            const healthHeight = 15;
            const healthX = 20;
            const healthY = 80;
            
            // Background
            ctx.fillStyle = '#444444';
            ctx.fillRect(healthX, healthY, healthWidth, healthHeight);
            
            // Health bar
            const healthPercent = Player.health / 100;
            ctx.fillStyle = healthPercent > 0.5 ? '#00FF00' : (healthPercent > 0.25 ? '#FFFF00' : '#FF0000');
            ctx.fillRect(healthX, healthY, healthWidth * healthPercent, healthHeight);
            
            // Progress bar for level completion - simpler version
            const progressWidth = 150;
            const progressHeight = 10;
            const progressX = canvas.width - progressWidth - 20;
            const progressY = 20;
            
            // Background
            ctx.fillStyle = '#444444';
            ctx.fillRect(progressX, progressY, progressWidth, progressHeight);
            
            // Progress
            const progressPercent = Game.levelProgress / Levels.getCurrentLevelLength();
            ctx.fillStyle = '#00FFFF'; // Cyan
            ctx.fillRect(progressX, progressY, progressWidth * progressPercent, progressHeight);
            
            // Level completion percentage (rounded to avoid constant changes)
            const levelPercent = Math.floor(progressPercent * 10) * 10; // Round to nearest 10%
            ctx.fillText(`${levelPercent}%`, progressX + progressWidth + 5, progressY + 9);
        } catch (e) {
            console.error("Error in drawHUD:", e);
        }
    }
};