# VonHoltenCodes.com

A personal website featuring interactive components, games, and family-friendly content.

## Features

- **Interactive Components**
  - Bio section with personal information
  - Time widgets (birthday counter, world clock)
  - Weather API integration
  - Visitor counter
  
- **Games Room**
  - Minions game
  - Combat simulator
  - Hangman
  
- **Creation Station**
  - Avatar creator
  - Color mixer tools
  
- **Mission Control**
  - Family member portal
  - Secure authentication
  
- **Kids Links**
  - Curated educational resources

## Technology Stack

- Frontend: HTML5, CSS3, JavaScript
- Backend: PHP 7.4+
- Server: Apache 2.4
- SSL: Let's Encrypt

## Project Structure

```
├── css/                  # Stylesheets
├── js/                   # JavaScript files
├── components/           # Reusable HTML components
├── pages/               # Individual site sections
│   ├── apis/           # API integration demos
│   ├── creation/       # Creation tools
│   ├── games/          # Game room
│   ├── kids/           # Kids section
│   └── mission/        # Mission control
├── assets/              # Images and icons
├── inc/                 # PHP includes
└── data/               # User-generated content
```

## Setup Instructions

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/vonholtencodes.git
```

2. **Configure the environment**
```bash
cd vonholtencodes
cp inc/config.template.php inc/config.php
# Edit config.php with your settings
```

3. **Set up secure data directory**
```bash
# Create secure directory outside web root
mkdir -p /path/to/secure/data/{users,messages,stats,sessions,logs}
chmod -R 750 /path/to/secure/data
```

4. **Configure web server**
- Point Apache document root to the project directory
- Enable mod_rewrite and mod_headers
- Set up SSL certificates

5. **Initialize admin panel**
```bash
cp admin_secure.template.php admin_secure.php
# First login: username "admin", password "changeme"
# IMPORTANT: Change credentials immediately
```

## Security Features

- Password hashing with bcrypt
- CSRF protection
- Session security
- Rate limiting on login attempts
- Security headers
- HTTPS enforcement

## API Integrations

The site integrates with:
- Weather API (requires API key)
- Future integrations planned

## Contributing

This is a personal project, but suggestions and bug reports are welcome.

## License

This project is for educational and personal use.

## Notes

- Never commit sensitive files (config.php, .htaccess, etc.)
- Keep user data outside the web root
- Regularly update dependencies
- Monitor security logs

---

For more information, visit [vonholtencodes.com](https://vonholtencodes.com)