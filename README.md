# VonHoltenCodes Website

This repository contains the code for the VonHoltenCodes.com website.

## Project Structure

The website is organized using a modular approach:

```
/mnt/websites/vonholtencodes.com/
├── public_html/               # Web root directory
│   ├── css/                  # Stylesheet files
│   ├── js/                   # JavaScript files  
│   ├── components/           # Reusable site components
│   ├── assets/              # Static resources (images, icons, etc.)
│   ├── pages/               # Individual site pages
│   │   ├── apis/            # API integration demos
│   │   ├── creation/        # Creation Station tools
│   │   ├── games/          # Games Room
│   │   ├── kids/           # Kids Links section
│   │   └── mission/        # Mission Control
│   ├── inc/                # PHP includes and configuration
│   └── data/               # User-generated content (avatars, etc.)
└── secure_data/             # Sensitive data (outside web root)
    ├── admin_users.json     # Admin credentials
    ├── users/              # User data files
    ├── messages/           # Message storage
    ├── sessions/           # PHP session files
    └── stats/              # Visitor statistics
        ├── counter.txt     # Visitor counter
        └── logs/           # Visitor logs
```

## Hosting Information

- **Domain**: vonholtencodes.com, www.vonholtencodes.com
- **Server**: Ubuntu Linux (starbase1.starbasemainframe.com)
- **Web Server**: Apache 2.4.52
- **PHP Version**: PHP 7.4+
- **SSL**: Let's Encrypt certificates (auto-renewal configured)
- **IP Address**: 73.45.199.105
- **DNS Provider**: Porkbun
- **Dynamic DNS**: TP-Link DDNS for starbase1.starbasemainframe.com

## Security Features

### Authentication & Access Control
- Secure admin panel with password hashing (admin_secure.php)
- CSRF protection on all forms
- Session security with custom secure session handler
- Login attempt limiting (5 attempts, 15-minute lockout)
- .htaccess protection for sensitive files
- Basic authentication for legacy admin files

### Data Security
- All sensitive data stored outside web root (`/mnt/websites/vonholtencodes.com/secure_data/`)
- Secure session storage
- HTTP security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- HTTPS enforced via .htaccess
- Input validation and sanitization

### File Structure Security
```
.htaccess                    # Security rules, HTTPS redirect
inc/config.php              # Configuration with secure paths
inc/secure_session.php      # Enhanced session management
```

## Features

### Visitor Tracking
- Real-time visitor counter (bottom-right corner)
- Tracks unique visitors by IP address
- Daily visitor statistics
- Admin dashboard with detailed analytics
- Counter data stored securely outside web root

### Admin Panel
- Secure authentication system
- Dashboard with quick access to:
  - Visitor statistics with graphs
  - Message viewing
  - Server status
- Session timeout and regeneration

### Interactive Components
- Bio section with personal information
- Time widgets (birthday counter, world clock)
- Weather API integration
- Games Room with interactive games
- Creation Station with avatar creator
- Mission Control for family members
- Kids Links section

## Development

### Deployment
To deploy changes, use the deployment script:
```bash
./deploy.sh
```

### Adding New Pages
1. Create the page in the appropriate directory
2. Include necessary CSS and JavaScript files
3. Update navigation if needed
4. Test security implications

### Security Updates
- Admin credentials stored in `/mnt/websites/vonholtencodes.com/secure_data/admin_users.json`
- To change admin password, update the hashed password in the JSON file
- Run `php -r "echo password_hash('newpassword', PASSWORD_DEFAULT);"` to generate hash

## Maintenance

### SSL Certificate
- Auto-renewal configured via Certbot
- Test renewal: `sudo certbot renew --dry-run`
- Certificates located in `/etc/letsencrypt/live/vonholtencodes.com/`

### Backups
Recommended backup locations:
- `/mnt/websites/vonholtencodes.com/secure_data/` - User data and statistics
- `/mnt/websites/vonholtencodes.com/public_html/` - Website files

### Monitoring
- Visitor statistics available in admin panel
- Consider setting up uptime monitoring (UptimeRobot, Pingdom)
- Apache logs in `/var/log/apache2/`

## Recent Updates (May 2025)

1. **DNS Configuration**
   - Fixed DNS records for both root and www domains
   - Disabled Porkbun proxy that was causing 404 errors

2. **Security Enhancements**
   - Implemented secure admin authentication with password hashing
   - Added CSRF protection
   - Created secure session management
   - Moved sensitive files outside web root
   - Added .htaccess security rules

3. **Visitor Tracking**
   - Implemented real-time visitor counter
   - Created admin statistics dashboard
   - Added unique visitor tracking by IP/day
   - Visitor data stored securely

4. **SSL/HTTPS**
   - Configured Let's Encrypt certificates
   - Set up auto-renewal
   - Forced HTTPS redirect

## Troubleshooting

### Common Issues

1. **500 Internal Server Error**
   - Check Apache error logs: `/var/log/apache2/error.log`
   - Verify .htaccess syntax
   - Check file permissions

2. **Session Issues**
   - Ensure session directory exists and is writable
   - Check PHP session configuration

3. **Visitor Counter Not Updating**
   - Clear browser localStorage
   - Check file permissions on stats directory
   - Verify PHP can write to secure_data directory

### Important Files
- `/home/traxx/VONHOLTENCODES_LAUNCH_PLAN.md` - Original launch plan
- `/home/traxx/VONHOLTENCODES_USER_ACTION_ROADMAP.md` - Implementation roadmap
- `/var/log/apache2/vonholtencodes.com-error.log` - Site-specific error log

## Contact

For issues or questions about the website, contact the administrator.

---

Last updated: May 19, 2025