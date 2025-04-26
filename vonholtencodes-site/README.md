# VonHoltenCodes.com

A personal website for VonHoltenCodes featuring a fighter pilot-inspired retro user interface.

## Features

- MiG-21 pixel art entrance animation
- Custom HUD-style cursor
- Military-themed clock and timer displays
- "Night Ops" mode with nightvision green color scheme 
- Machine gun animation for toggling between display modes
- Hydraulic pipes background design
- 3x3 grid of interactive applications
- Avatar creator with customizable SVG elements
- Color mixer tool with RGB/HSL conversion
- Weather app with OpenWeatherMap integration
- Hangman game with military terminology
- Moon Lander game with realistic physics
- Retro "Surfers" visitor counter in footer
- Fully responsive for mobile devices

## File Structure

### Core Website Files
- `index.html` - Current version with fighter pilot theme
- `index.html.bak` - Original version (MVP) for reference
- `moon_lander.html` - Moon Lander game implementation
- `get_counter.php` - Visitor counter script
- `counter.txt` - Visitor count storage file
- `admin.php` - Admin panel for site management
- `.htaccess` - Apache configuration for security
- `.htpasswd` - Password file for admin authentication

### Server Deployment & Configuration
- `deploy.sh` - Deployment script to update the live site
- `install_php.sh` - Script to install and configure PHP if needed
- `info.php` - PHP information diagnostic page
- `server_status.php` - Server configuration diagnostic tool

### Development & Documentation
- `CLAUDE.md` - Helper notes for website maintenance and updates
- `README.md` - Project documentation (this file)
- `.gitignore` - Files to exclude from Git repository

### Security & GitHub Preparation
- `redact_files.sh` - Creates redacted versions of sensitive files
- `github_prep.sh` - Prepares repository for GitHub by replacing sensitive files with redacted versions
- `github_restore.sh` - Restores original files after pushing to GitHub

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript
- Canvas API for Moon Lander game
- SVG for avatar creator and UI elements
- Pixel art for MiG-21 fighter jet
- CSS Grid for pixel art rendering
- LocalStorage for saving user preferences
- OpenWeatherMap API for weather data
- HTML5 iframes for embedding games

## Recent Updates

- Added secure admin panel with protected access for site management
- Created automated deployment script with password-based authentication
- Added PHP installation and configuration script for server setup
- Added diagnostic tools for server and PHP configuration
- Implemented Apache security with .htaccess and .htpasswd protection
- Added retro "Surfers" visitor counter in site footer with blinking effect
- Implemented persistent counter with session-based tracking to prevent duplicate counts
- Added Moon Lander game with realistic physics and responsive controls
- Integrated Moon Lander into the main application grid as the 8th application
- Fixed avatar creator bug: Solved issue where element references were lost after second edit
- Optimized SVG rendering by updating the entire avatar SVG at once instead of individual elements
- Improved avatar element selection with refreshed DOM references after each update

## Security Note

For security reasons, the following files have been redacted in the public GitHub repository:
- `admin.php` - Contains redacted username/password
- `.htpasswd` - Contains redacted authentication details
- `index.html` - API keys replaced with placeholder
- `deploy.sh` - Contains notes about environment-specific configurations

Scripts included to help manage these redactions:
- `redact_files.sh` - Creates redacted versions of sensitive files
- `github_prep.sh` - Backs up original files and replaces them with redacted versions for GitHub
- `github_restore.sh` - Restores original files after pushing to GitHub

## Created By

VonHoltenCodes 2025