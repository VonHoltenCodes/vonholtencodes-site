# Minions Escape Game

A 2D side-scrolling HTML5 canvas game featuring a minion character who must navigate through windows, defeat enemies, and escape with Gru at the end.

## Game Overview

The game is a 2D side-scroller built with HTML5 canvas, JavaScript, and CSS3, styled with a vibrant, chaotic Minions aesthetic. The background scrolls automatically at a fixed speed per level, ensuring steady progression on both mobile and desktop.

### Features

- 3 progressively challenging levels
- Automatic scrolling background with parallax effect
- Player character (Minion) with jumping and shooting abilities
- Enemy characters (Purple Gremlins and Yellow Minions)
- Final boss battle in Level 3
- Interactive obstacles (window frames to jump through)
- Responsive design for both desktop and mobile play
- Health and lives system

## Controls

### Desktop:
- **Arrow Left/Right**: Move the minion
- **Arrow Up or Click**: Jump
- **Spacebar**: Shoot fart gun

### Mobile:
- **Tap**: Jump
- **Double-Tap**: Shoot fart gun
- **Swipe Left/Right**: Move the minion

## Asset Requirements

The following pixel art assets are required for the game:

### Character & Enemies
- `minion_idle.png` - Player character (32x32px)
- `minion_jump.png` - Player character jumping (32x32px)
- `gremlin_purple.png` - Purple enemy (32x32px)
- `minion_yellow.png` - Yellow enemy (24x24px)
- `gremlin_boss.png` - Boss character (64x64px)
- `fart_cloud.png` - Projectile (16x8px)

### Environment
- `window_frame.png` - Obstacle (64x128px)
- `bg_sky.png` - Background sky (800x600px)
- `bg_clouds.png` - Midground clouds (800x600px)
- `bg_city.png` - Foreground city (800x600px)

### HUD
- `heart.png` - Health icon (16x16px)
- `life.png` - Life icon (16x16px)

Place all assets in the `assets/sprites/` directory.

## Setup Instructions

1. Create/source the pixel art assets following the above specifications
2. Place all assets in the `assets/sprites/` directory
3. Run the game via a local server (e.g., `python -m http.server`)
4. Test on both mobile and desktop devices

## Integration with VonHoltenCodes Website

To embed this game into the VonHoltenCodes website:

1. Ensure all assets are correctly placed in the `assets/sprites/` directory
2. Embed the game using an iframe:

```html
<iframe src="minions_game/index.html" width="800" height="600" frameborder="0"></iframe>
```

3. Alternatively, link directly to the game page from the main site

## Development Notes

- The game uses a modular JavaScript structure for clarity
- No external libraries are required
- All game mechanics are implemented with vanilla JavaScript
- The game is responsive and works on both mobile and desktop

## Customization

- Adjust level difficulties in `js/levels.js`
- Modify player properties in `js/player.js`
- Add or change enemies in `js/enemies.js`