# VonHoltenCodes Website - Main Development Directory

This is the main development directory for the VonHoltenCodes website. All development work should be done here following the modular structure. This directory contains a clean, modular rebuild of the VonHoltenCodes website that has been fully integrated with the production site.

## Development Workflow

1. Make all changes and additions in this directory
2. Test your changes locally
3. Deploy to production using the parent directory's deploy script:
   ```bash
   cd ..
   ./deploy.sh
   ```

## Project Structure

- `/css/` - Stylesheet files
  - `main.css` - Core styles shared across all pages
  - Component-specific CSS files (header.css, footer.css, etc.)

- `/js/` - JavaScript files
  - `main.js` - Core functionality shared across all pages
  - Component-specific JS files (tabs.js, night-mode-toggle.js, etc.)

- `/components/` - Individual site components
  - Each component has its own HTML file for modular inclusion
  - Including: header.html, footer.html, tabs.html, night-mode-toggle.html, etc.

- `/assets/` - Static resources
  - Images, icons, and favicons are stored here

- `/pages/` - Individual site pages
  - APIs, Creation Station, Games Room, Kids Links, Mission Control

## Path Information

Main site path: `/var/www/vonholtencodes.com/public_html/`
Repository path: `/home/traxx/GITHUB/vonholtencodes-site/`

## Features

1. **Core Features**
   - Modular component architecture for easy maintenance and updates
   - Responsive design that works on desktop, tablet, and mobile devices
   - Night mode toggle with machine gun animation and bullet hole effects
   - Custom retro cursor with context-aware styling
   - Dynamic background effects (hydraulic, scanlines, diagonal stripes, circuit lines)
   - 3D rotating VH logo with bullet holes
   - Age counter and world clock widgets

2. **API Integrations**
   - NASA space data API integration
   - USGS earthquake monitoring with interactive maps
   - Weather data from WeatherBit & Open-Meteo
   - Kid-friendly joke generator

3. **Games & Interactive Elements**
   - Minions Escape Game with animated sprites and boss battles
   - Hangman Game with multiple categories and retro styling
   - Combat simulator with turn-based mechanics
   - More games in the Game Room section

4. **Creation Tools**
   - Avatar creator for customizable characters
   - Color mixer with visual interface
   - More creative tools in the Creation Station section

5. **Mission Control**
   - One-way messaging system for feedback and feature requests
   - User registration without email requirement
   - Message status and alerts
   - GitHub repository integration for code collaboration

## Development Guidelines

1. Follow the modular approach
2. Each component should have its own HTML, CSS, and JS files
3. Use shared resources for common functionality
4. Maintain the retro/tech visual style of the site
5. Ensure cross-browser compatibility and responsive design

## Testing

All components should be tested for:
- Functionality in major browsers (Chrome, Firefox, Safari, Edge)
- Responsive design across various device sizes
- Code validity against HTML5, CSS3, and ES6+ standards
- Night mode compatibility
