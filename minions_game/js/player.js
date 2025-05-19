// Player object
const Player = {
    x: 150,
    y: 450,           // Moved lower to ground level
    width: 64,        // Doubled size (200%)
    height: 64,       // Doubled size (200%)
    speed: 6,         // Slightly faster to compensate for larger size
    dy: 0,
    gravity: 0.3,    
    jumpPower: -12,   // Stronger jump to compensate for larger character
    health: 100,
    lives: 3,
    isJumping: false,
    moveLeft: false,
    moveRight: false,
    isFacingRight: true,
    hitFlash: 0,
    invincible: 0,    // Invincibility frames after taking damage
    lastShootTime: 0,
    shootCooldown: 350, // Increased cooldown to prevent spamming
    projectiles: [],
    
    // Initialize player
    init() {
        this.reset();
    },
    
    // Reset player
    reset() {
        this.x = 150;
        this.y = 450;         // Match the new ground level position
        this.dy = 0;
        this.health = 100;
        this.lives = 3;
        this.isJumping = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.isFacingRight = true;
        this.hitFlash = 0;
        this.invincible = 120; // Start with invincibility to give player time to react
        this.lastShootTime = 0;
        this.projectiles = [];
    },
    
    // Update player state
    update(deltaTime) {
        try {
            // Movement
            if (this.moveLeft) {
                this.x -= this.speed;
                this.isFacingRight = false;
            }
            if (this.moveRight) {
                this.x += this.speed;
                this.isFacingRight = true;
            }
            
            // Enforce minimum x position (no backtracking past a point)
            if (this.x < 100) {
                this.x = 100;
            }
            
            // Enforce maximum x position (can't go too far ahead)
            if (this.x > Game.canvas.width - 100) {
                this.x = Game.canvas.width - 100;
            }
            
            // Apply gravity with deltaTime to make physics consistent
            this.dy += this.gravity * (deltaTime * 60); // Scale by target 60fps
            this.y += this.dy * (deltaTime * 60);
            
            // Floor collision
            if (this.y > Game.canvas.height - this.height) {
                this.y = Game.canvas.height - this.height;
                this.dy = 0;
                this.isJumping = false;
            }
            
            // Ceiling collision
            if (this.y < 0) {
                this.y = 0;
                this.dy = 0;
            }
            
            // Update projectiles (limit total projectiles to prevent performance issues)
            if (this.projectiles.length > 10) {
                this.projectiles = this.projectiles.slice(-10); // Keep only the 10 most recent
            }
            
            for (let i = this.projectiles.length - 1; i >= 0; i--) {
                const projectile = this.projectiles[i];
                projectile.x += projectile.speed * (deltaTime * 60);
                
                // Remove projectiles that are off screen
                if (projectile.x > Game.canvas.width || projectile.x < 0) {
                    this.projectiles.splice(i, 1);
                }
            }
            
            // Check collisions with enemies (safely)
            if (Enemies && Enemies.enemies) {
                for (let i = Enemies.enemies.length - 1; i >= 0; i--) {
                    const enemy = Enemies.enemies[i];
                    
                    // Skip invalid enemies
                    if (!enemy) continue;
                    
                    // Collision with enemy
                    if (this.checkCollision(enemy)) {
                        // Player is above enemy (bounce on enemy)
                        if (this.dy > 0 && this.y + this.height < enemy.y + enemy.height / 2) {
                            this.bounce();
                            enemy.health--;
                            if (enemy.health <= 0) {
                                Enemies.enemies.splice(i, 1);
                            }
                        } else {
                            // Player takes damage
                            this.takeDamage(15); // Reduced damage
                        }
                    }
                    
                    // Projectile collision with enemy
                    for (let j = this.projectiles.length - 1; j >= 0; j--) {
                        const projectile = this.projectiles[j];
                        
                        if (!projectile) continue;
                        
                        if (this.checkProjectileCollision(projectile, enemy)) {
                            // Make fart gun instantly eliminate enemies except for boss
                            if (enemy.isBoss) {
                                enemy.health--;
                                if (enemy.health <= 0) {
                                    Levels.bossDefeated = true;
                                    Enemies.enemies.splice(i, 1);
                                }
                            } else {
                                // Regular enemies vanish immediately on hit
                                Enemies.enemies.splice(i, 1);
                            }
                            // Remove the projectile
                            this.projectiles.splice(j, 1);
                        }
                    }
                }
            }
            
            // Check collisions with obstacles
            if (Obstacles && Obstacles.windows) {
                for (const window of Obstacles.windows) {
                    if (this.checkWindowCollision(window)) {
                        this.takeDamage(15); // Reduced damage
                    }
                }
            }
            
            // Reduce hit flash
            if (this.hitFlash > 0) {
                this.hitFlash--;
            }
            
            // Invincibility frames after taking damage
            if (this.invincible > 0) {
                this.invincible--;
            }
        } catch (error) {
            console.error("Error in Player update:", error);
            // Recover from error by resetting potential problematic states
            this.projectiles = [];
            this.hitFlash = 0;
        }
    },
    
    // Render player
    render() {
        const ctx = Game.ctx;
        
        // Early return if assets aren't loaded
        if (!Rendering.assetsLoaded) return;
        
        // Draw projectiles
        this.projectiles.forEach(projectile => {
            try {
                // Draw fart cloud projectile
                ctx.drawImage(
                    Rendering.assets.fart_cloud,
                    projectile.x - projectile.width / 2, 
                    projectile.y - projectile.height / 2,
                    projectile.width,
                    projectile.height
                );
                
                // Add particle trail effect
                ctx.globalAlpha = 0.5;
                for (let i = 1; i <= 3; i++) {
                    ctx.drawImage(
                        Rendering.assets.fart_cloud,
                        projectile.x - (i * 5) - projectile.width / 2, 
                        projectile.y - projectile.height / 2,
                        projectile.width * (1 - i * 0.2),
                        projectile.height * (1 - i * 0.2)
                    );
                }
                ctx.globalAlpha = 1.0;
            } catch (e) {
                console.error("Error rendering projectile:", e);
            }
        });
        
        // Apply invincibility effect (blinking)
        if (this.invincible > 0 && (this.invincible % 6 < 3)) {
            ctx.globalAlpha = 0.6; // Make player semi-transparent when invincible
        }
        
        // Apply hit flash effect (red overlay when hit)
        if (this.hitFlash > 0 && this.hitFlash % 2 === 0) {
            ctx.globalAlpha = 0.7;
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        
        // Draw player based on state (jumping or standing)
        if (this.isJumping) {
            // Use jumping sprite
            ctx.drawImage(
                Rendering.assets.minion_jump,
                this.x,
                this.y,
                this.width,
                this.height
            );
        } else {
            // Use idle/standing sprite
            ctx.drawImage(
                Rendering.assets.minion_idle,
                this.x,
                this.y,
                this.width,
                this.height
            );
        }
        
        // If player is facing left, flip the sprite horizontally
        if (!this.isFacingRight) {
            ctx.save();
            ctx.translate(this.x + this.width, this.y);
            ctx.scale(-1, 1);
            
            if (this.isJumping) {
                ctx.drawImage(
                    Rendering.assets.minion_jump,
                    0,
                    0,
                    this.width,
                    this.height
                );
            } else {
                ctx.drawImage(
                    Rendering.assets.minion_idle,
                    0,
                    0,
                    this.width,
                    this.height
                );
            }
            
            ctx.restore();
        }
        
        // Draw fart gun when shooting
        if (Date.now() - this.lastShootTime < 150) {
            const gunWidth = 16;
            const gunHeight = 8;
            const gunY = this.y + this.height / 2 - gunHeight / 2;
            
            if (this.isFacingRight) {
                ctx.drawImage(
                    Rendering.assets.fart_cloud,
                    this.x + this.width,
                    gunY,
                    gunWidth,
                    gunHeight
                );
            } else {
                ctx.drawImage(
                    Rendering.assets.fart_cloud,
                    this.x - gunWidth,
                    gunY,
                    gunWidth,
                    gunHeight
                );
            }
        }
    },
    
    // Jump
    jump() {
        // Only jump if on ground
        if (!this.isJumping) {
            this.dy = this.jumpPower;
            this.isJumping = true;
        }
    },
    
    // Bounce (smaller jump after enemy bounce)
    bounce() {
        this.dy = this.jumpPower * 0.7;
        this.isJumping = true;
    },
    
    // Shoot fart gun
    shoot() {
        const currentTime = Date.now();
        
        // Check cooldown
        if (currentTime - this.lastShootTime >= this.shootCooldown) {
            const projectile = {
                x: this.isFacingRight ? this.x + this.width : this.x,
                y: this.y + this.height / 2,
                width: 32,   // Doubled size (200%)
                height: 16,  // Doubled size (200%)
                speed: this.isFacingRight ? 15 : -15  // Increased speed for better gameplay
            };
            
            this.projectiles.push(projectile);
            this.lastShootTime = currentTime;
        }
    },
    
    // Take damage
    takeDamage(amount) {
        // Skip damage if player is invincible
        if (this.invincible > 0) {
            return;
        }
        
        this.health -= amount;
        this.hitFlash = 20;      // Extended flash effect
        this.invincible = 60;    // About 1 second of invincibility at 60fps
        
        if (this.health <= 0) {
            this.lives--;
            
            if (this.lives > 0) {
                this.health = 100;
                this.invincible = 120; // Longer invincibility after losing a life
            }
        }
    },
    
    // Handle keyboard input
    handleKeyDown(e) {
        // Prevent default browser scrolling for game controls
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
            e.preventDefault();
        }
        
        switch (e.key) {
            case 'ArrowLeft':
                this.moveLeft = true;
                break;
            case 'ArrowRight':
                this.moveRight = true;
                break;
            case ' ':
                this.shoot();
                break;
            case 'ArrowUp':
            case 'w':  // Add 'w' key as an alternative jump control
                this.jump();
                break;
        }
    },
    
    handleKeyUp(e) {
        // Prevent default browser scrolling for game controls
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
            e.preventDefault();
        }
        
        switch (e.key) {
            case 'ArrowLeft':
                this.moveLeft = false;
                break;
            case 'ArrowRight':
                this.moveRight = false;
                break;
        }
    },
    
    // Check collision with enemy
    checkCollision(enemy) {
        return (
            this.x < enemy.x + enemy.width &&
            this.x + this.width > enemy.x &&
            this.y < enemy.y + enemy.height &&
            this.y + this.height > enemy.y
        );
    },
    
    // Check projectile collision with enemy
    checkProjectileCollision(projectile, enemy) {
        return (
            projectile.x < enemy.x + enemy.width &&
            projectile.x + projectile.width > enemy.x &&
            projectile.y < enemy.y + enemy.height &&
            projectile.y + projectile.height > enemy.y
        );
    },
    
    // Check collision with window
    checkWindowCollision(window) {
        // Skip if player is within the gap
        if (this.y + this.height > window.gapY && this.y < window.gapY + window.gapHeight) {
            return false;
        }
        
        // Check collision with window frame
        return (
            this.x < window.x + window.width &&
            this.x + this.width > window.x &&
            ((this.y < window.gapY) || (this.y + this.height > window.gapY + window.gapHeight))
        );
    }
};