# Claude Code Helper Notes

This document contains important information for Claude when helping with the VonHoltenCodes website.

## Server Configuration

The website is served from:
- `/var/www/vonholtencodes.com/public_html/`

## Key Files

- Main HTML file: `/var/www/vonholtencodes.com/public_html/index.html`
- Visitor tracking script: `/var/www/vonholtencodes.com/public_html/track-visitor.php`
- Visitor counter script: `/var/www/vonholtencodes.com/public_html/get_counter.php`
- Visitor counter storage: `/var/www/vonholtencodes.com/public_html/counter.txt`
- Moon Lander game: `/var/www/vonholtencodes.com/public_html/moon_lander.html`
- Admin view page: `/var/www/vonholtencodes.com/public_html/admin/view-logs.php`

## Development Repository

The development repository is located at:
- Local: `/home/traxx/GITHUB/vonholtencodes-site/`
- Remote: `git@github.com:VonHoltenCodes/vonholtencodes-site.git`
- GitHub URL: `https://github.com/VonHoltenCodes/vonholtencodes-site`

## Commands to Run After Changes

After making changes in the development repository, use these commands to update the live website:

```bash
# Copy changes to the live server
sudo cp /home/traxx/GITHUB/vonholtencodes-site/index.html /var/www/vonholtencodes.com/public_html/

# Commit and push changes to GitHub
cd /home/traxx/GITHUB/vonholtencodes-site
git add .
git commit -m "Description of your changes"
git push origin main
```

## Site Features

The site includes:
1. Interactive F-14 entry animation
2. 3x3 button grid with various interactive applications
3. Color mixer tool - interactive RGB/HSL color mixing and conversion
4. Night mode toggle with machine gun animation
5. Hangman game with military-themed words
6. Avatar creator with customizable SVG elements
7. Weather app using OpenWeatherMap API
8. Moon Lander game - Canvas-based physics game with Arrow key controls
9. World clock display with multiple time zones
10. Visitor tracking system with retro "Surfers" counter
11. HUD-style custom cursor

## API Keys and Security

- Weather API key should NOT be committed to GitHub
- In the public GitHub repository, replace the actual API key with: `YOUR_API_KEY_HERE`
- The actual API key is: Check `/var/www/vonholtencodes.com/public_html/index.html` for the live key

## Bug Fixes and Known Issues

- Avatar creator: Fixed issue where selecting options stops working after the second edit
- Solution: Update entire SVG at once rather than individual elements
- Weather app: API key activation takes a few hours after registration

## Admin Access

Admin tools are available at:
- `/var/www/vonholtencodes.com/public_html/admin/view-logs.php`
- Default password: `vonholtencodes2025` (change this for security)