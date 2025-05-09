# Claude Code Helper Notes

This document contains important information for Claude when helping with the VonHoltenCodes website.

## Security Note

When working with this repository, be aware that some files need to be redacted before pushing to GitHub:

1. Use the `redact_files.sh` script to create GitHub-safe versions of sensitive files
2. For local development, use the original files
3. Before committing to public GitHub, use the redacted versions
4. Never commit real API keys, passwords, or usernames to the public repository

## Server Configuration

The website is served from:
- `/var/www/vonholtencodes.com/public_html/`

## Key Files

- Main HTML file: `/var/www/vonholtencodes.com/public_html/index.html`
- Visitor tracking script: `/var/www/vonholtencodes.com/public_html/track-visitor.php`
- Visitor counter script: `/var/www/vonholtencodes.com/public_html/get_counter.php`
- Visitor counter storage: `/var/www/vonholtencodes.com/public_html/counter.txt`
- Moon Lander game: `/var/www/vonholtencodes.com/public_html/moon_lander.html`
- Pixel Art Creator: `/var/www/vonholtencodes.com/public_html/pixel_art.html`
- Admin panel: `/var/www/vonholtencodes.com/public_html/admin.php`
- Server info diagnostic: `/var/www/vonholtencodes.com/public_html/info.php`
- Server status: `/var/www/vonholtencodes.com/public_html/server_status.php`

## Development Repository

The development repository is located at:
- Local: `/home/traxx/GITHUB/vonholtencodes-site/`
- Remote: `git@github.com:VonHoltenCodes/vonholtencodes-site.git`
- GitHub URL: `https://github.com/VonHoltenCodes/vonholtencodes-site`

## Commands to Run After Changes

After making changes in the development repository, use the deployment script to update the live website:

```bash
# Run the deployment script to update all files on the server
cd /home/traxx/GITHUB/vonholtencodes-site
./deploy.sh

# Prepare files for GitHub (removes sensitive information)
./github_prep.sh

# Commit and push changes to GitHub
git add .
git commit -m "Description of your changes"
git push origin main

# Restore original files with actual credentials after pushing
./github_restore.sh
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
9. Pixel Art Creator - Canvas-based drawing tool with color picker and localStorage saving
10. World clock display with multiple time zones
11. Visitor tracking system with retro "Surfers" counter
12. HUD-style custom cursor

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