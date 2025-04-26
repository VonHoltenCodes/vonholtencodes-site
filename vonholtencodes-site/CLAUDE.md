# Claude Code Helper Notes

This document contains important information for Claude when helping with the VonHoltenCodes website.

## Server Configuration

The website is served from:
- `/var/www/vonholtencodes.com/public_html/`

## Key Files

- Main HTML file: `/var/www/vonholtencodes.com/public_html/index.html`
- Visitor tracking script: `/var/www/vonholtencodes.com/public_html/track-visitor.php`
- Admin view page: `/var/www/vonholtencodes.com/public_html/admin/view-logs.php`

## Development Repository

The development repository is located at:
- `/home/traxx/GITHUB/vonholtencodes-site/`

## Commands to Run After Changes

After making changes in the development repository, use these commands to update the live website:

```bash
# Copy changes to the live server
sudo cp /home/traxx/GITHUB/vonholtencodes-site/index.html /var/www/vonholtencodes.com/public_html/
```

## Site Features

The site includes:
1. Interactive F-14 entry animation
2. 3x3 button grid with various interactive applications
3. Color mixer tool
4. Night mode toggle
5. Hangman game
6. Avatar creator
7. Weather app
8. World clock display
9. Visitor tracking system

## Admin Access

Admin tools are available at:
- `/var/www/vonholtencodes.com/public_html/admin/view-logs.php`
- Default password: `vonholtencodes2025` (change this for security)