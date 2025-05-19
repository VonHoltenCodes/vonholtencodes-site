// Enemies controller
const Enemies = {
    enemies: [],
    
    // Initialize enemies
    init() {
        this.enemies = [];
    },
    
    // Reset enemies
    reset() {
        this.enemies = [];
    },
    
    // Update enemies
    update(deltaTime, isBossFight) {
        // Move enemies differently depending on boss fight status
        this.enemies.forEach(enemy => {
            if (isBossFight) {
                // During boss fight, only move if it's not the boss (for minions summoned by boss)
                if (!enemy.isBoss) {
                    enemy.x -= enemy.speed;
                } else {
                    // Boss movement pattern: slight vertical movement
                    enemy.y += Math.sin(Game.lastTime / 500) * 0.8;
                }
            } else {
                // Regular level movement
                enemy.x -= enemy.speed + Levels.getCurrentScrollSpeed();
            }
        });
        
        // Remove enemies that are off screen (except boss)
        this.enemies = this.enemies.filter(enemy => 
            enemy.isBoss || enemy.x > -enemy.width
        );
        
        // Spawn new enemies
        if (Game.gameState === 'playing') {
            if (isBossFight) {
                // During boss fight, occasionally spawn minions from the boss
                if (this.enemies.length < 3 && Math.random() < 0.01 && this.hasBoss()) {
                    this.spawnMinionFromBoss();
                }
            } else if (!Levels.bossSpawned) {
                const currentLevel = Levels.settings[Game.level];
                
                // Randomly spawn enemies based on level settings
                if (Math.random() < currentLevel.enemySpawnRate) {
                    this.spawnEnemy();
                }
            }
        }
    },
    
    // Check if boss exists
    hasBoss() {
        return this.enemies.some(enemy => enemy.isBoss);
    },
    
    // Spawn a minion from the boss
    spawnMinionFromBoss() {
        const boss = this.enemies.find(enemy => enemy.isBoss);
        if (!boss) return;
        
        const enemy = {
            x: boss.x,
            y: boss.y + boss.height/2,
            width: 48,
            height: 48,
            speed: 2,
            health: 1,
            type: 'minion',
            isBoss: false
        };
        
        this.enemies.push(enemy);
    },
    
    // Render enemies
    render() {
        const ctx = Game.ctx;
        
        // Early return if assets aren't loaded
        if (!Rendering.assetsLoaded) return;
        
        this.enemies.forEach(enemy => {
            if (enemy.isBoss) {
                // Boss rendering with sprite
                ctx.drawImage(
                    Rendering.assets.gremlin_boss,
                    enemy.x,
                    enemy.y,
                    enemy.width,
                    enemy.height
                );
                
                // Add glow effect
                ctx.shadowColor = '#FF0000';
                ctx.shadowBlur = 10;
                ctx.globalAlpha = 0.3;
                ctx.drawImage(
                    Rendering.assets.gremlin_boss,
                    enemy.x - 2,
                    enemy.y - 2,
                    enemy.width + 4,
                    enemy.height + 4
                );
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 1.0;
                
                // Health bar
                const healthBarWidth = enemy.width;
                const healthPercent = enemy.health / 10;
                
                ctx.fillStyle = '#555555';
                ctx.fillRect(enemy.x, enemy.y - 15, healthBarWidth, 5);
                
                ctx.fillStyle = '#FF0000';
                ctx.fillRect(enemy.x, enemy.y - 15, healthBarWidth * healthPercent, 5);
            } else if (enemy.type === 'gremlin') {
                // Purple gremlin with sprite
                ctx.drawImage(
                    Rendering.assets.gremlin_purple,
                    enemy.x,
                    enemy.y,
                    enemy.width,
                    enemy.height
                );
                
                // Add glow effect
                ctx.shadowColor = '#800080';
                ctx.shadowBlur = 8;
                ctx.globalAlpha = 0.3;
                ctx.drawImage(
                    Rendering.assets.gremlin_purple,
                    enemy.x - 2,
                    enemy.y - 2,
                    enemy.width + 4,
                    enemy.height + 4
                );
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 1.0;
            } else if (enemy.type === 'minion') {
                // Yellow minion enemy with sprite
                ctx.drawImage(
                    Rendering.assets.minion_yellow,
                    enemy.x,
                    enemy.y,
                    enemy.width,
                    enemy.height
                );
                
                // Add glow effect
                ctx.shadowColor = '#FFA500';
                ctx.shadowBlur = 5;
                ctx.globalAlpha = 0.3;
                ctx.drawImage(
                    Rendering.assets.minion_yellow,
                    enemy.x - 1,
                    enemy.y - 1,
                    enemy.width + 2,
                    enemy.height + 2
                );
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 1.0;
            }
        });
    },
    
    // Spawn an enemy
    spawnEnemy() {
        const canvas = Game.canvas;
        
        // Limit the total number of enemies on screen to prevent crashing
        if (this.enemies.length >= 5) {
            return;
        }
        
        const enemyType = Math.random() < 0.6 ? 'gremlin' : 'minion';
        
        // Position enemies on the ground level, not in the sky
        // Use a narrower range for Y positions, keeping them in the lower part of screen
        const groundLevel = canvas.height - 100; // Base ground level
        const minY = groundLevel - 70;  // Allow some variation but keep them near ground
        const maxY = groundLevel;
        const y = Math.random() * (maxY - minY) + minY;
        
        let enemy;
        
        if (enemyType === 'gremlin') {
            enemy = {
                x: canvas.width,
                y: y,
                width: 64,        // Doubled size (200%)
                height: 64,       // Doubled size (200%)
                speed: 1.5,       // Maintain same speed
                health: 2,
                type: 'gremlin',
                isBoss: false
            };
        } else {
            enemy = {
                x: canvas.width,
                y: y,
                width: 48,        // Doubled size (200%)
                height: 48,       // Doubled size (200%)
                speed: 1,         // Maintain same speed
                health: 1,
                type: 'minion',
                isBoss: false
            };
        }
        
        this.enemies.push(enemy);
        
        // Add a slight delay between spawns to avoid clustering
        const currentLevel = Levels.settings[Game.level];
        currentLevel.enemySpawnRate *= 0.9; // Temporarily reduce spawn rate
        
        // Reset spawn rate after a short delay
        setTimeout(() => {
            if (Game.gameState === 'playing') {
                currentLevel.enemySpawnRate /= 0.9;
            }
        }, 1000);
    },
    
    // Spawn boss
    spawnBoss() {
        const canvas = Game.canvas;
        
        // Clear all other enemies when the boss spawns
        this.enemies = [];
        
        const boss = {
            x: canvas.width - 200,  // Position boss further from right edge
            y: canvas.height - 160,  // Position boss on ground level
            width: 128,              // Doubled size (200%)
            height: 128,             // Doubled size (200%)
            speed: 0,
            health: 5,               // Reduced health for easier boss fight
            type: 'gremlin',
            isBoss: true
        };
        
        this.enemies.push(boss);
    }
};