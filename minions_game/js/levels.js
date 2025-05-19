// Levels controller
const Levels = {
    settings: {
        1: {
            scrollSpeed: 1.65,      // Increased by 10% (from 1.5)
            enemySpawnRate: 0.002,  // Lowest setting for enemies
            windowSpawnRate: 0.01,  // Increased for more consistent windows
            length: 2000
        },
        2: {
            scrollSpeed: 2.2,       // Increased by 10% (from 2.0)
            enemySpawnRate: 0.002,  // Lowest setting for enemies
            windowSpawnRate: 0.01,  // Increased for more consistent windows
            length: 3000
        },
        3: {
            scrollSpeed: 1.98,      // Increased by 10% (from 1.8)
            enemySpawnRate: 0.002,  // Lowest setting for enemies
            windowSpawnRate: 0.01,  // Increased for more consistent windows
            length: 2500
        }
    },
    bossSpawned: false,
    bossDefeated: false,
    
    // Initialize levels
    init() {
        this.bossSpawned = false;
        this.bossDefeated = false;
        this.startLevel(1);
    },
    
    // Start level
    startLevel(level) {
        // Reset player health for new level
        Player.health = 100;
        
        // Show level notification
        this.showLevelNotification(level);
    },
    
    // Show level notification
    showLevelNotification(level) {
        const ctx = Game.ctx;
        
        // Create a temporary div for level notification
        const notification = document.createElement('div');
        notification.className = 'level-notification';
        notification.textContent = `Level ${level}`;
        notification.style.position = 'absolute';
        notification.style.top = '50%';
        notification.style.left = '50%';
        notification.style.transform = 'translate(-50%, -50%)';
        notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        notification.style.color = '#FFD700';
        notification.style.padding = '20px 40px';
        notification.style.borderRadius = '10px';
        notification.style.fontSize = '2rem';
        notification.style.fontWeight = 'bold';
        notification.style.boxShadow = '0 0 20px #800080';
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
        }, 2000);
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 2500);
    },
    
    // Get current level scroll speed
    getCurrentScrollSpeed() {
        return this.settings[Game.level].scrollSpeed;
    },
    
    // Get current level length
    getCurrentLevelLength() {
        return this.settings[Game.level].length;
    },
    
    // Spawn boss
    spawnBoss() {
        this.bossSpawned = true;
        Enemies.spawnBoss();
    }
};