# 🚀 VonHoltenCodes.com

[![Website](https://img.shields.io/website?url=https%3A%2F%2Fvonholtencodes.com)](https://vonholtencodes.com)
[![GitHub](https://img.shields.io/github/license/VonHoltenCodes/vonholtencodes-site)](LICENSE)
[![PHP](https://img.shields.io/badge/PHP-7.4%2B-777BB4?logo=php)](https://php.net)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

A dynamic, family-friendly personal website featuring interactive components, educational games, and creative tools. Built with modern web technologies and a focus on user experience and security.

![VonHoltenCodes Banner](https://via.placeholder.com/800x200?text=VonHoltenCodes.com)

## 📚 Documentation

Each major section of the site has its own comprehensive documentation:

- **[APIs Section](pages/apis/README.md)** - Real-time data integrations and API demonstrations
- **[Game Room](pages/games/README.md)** - Browser-based games collection and game development
- **[Creation Station](pages/creation/README.md)** - Creative tools for digital art and design
- **[Mission Control](pages/mission/README.md)** - Communication hub and collaboration features
- **[Kids Links](pages/kids/README.md)** - Curated collection of educational websites

## 🌟 Features

### 🎮 Interactive Games Room
- **Minions Adventure Game** - A platform-style game featuring everyone's favorite yellow characters
- **Combat Simulator** - Strategic battle simulator with multiple difficulty levels
- **Classic Hangman** - Educational word-guessing game with themed categories

### 🎨 Creation Station
- **Avatar Creator** - Design and customize personal avatars with extensive options
- **Color Mixer Lab** - Interactive tool for learning color theory and mixing
- **Pixel Art Studio** - Create and save pixel art masterpieces

### 📊 Dashboard & APIs
- **Live Weather Widget** - Real-time weather data integration
- **Birthday Countdown Timer** - Dynamic age calculator with precise timing
- **World Clock Display** - Multiple timezone support
- **Visitor Analytics** - Track and display site statistics

### 👨‍👩‍👧‍👦 Family Features
- **Mission Control** - Secure family member portal with individual accounts
- **Kids Links** - Curated collection of educational and safe websites
- **Message Board** - Family communication system

### 🔐 Security & Admin
- **Secure Admin Panel** - Protected administrative interface
- **User Authentication** - Multi-level access control
- **Session Management** - Secure session handling
- **Visitor Tracking** - Anonymous visitor statistics

## 🛠️ Technology Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) |
| **Backend** | PHP 7.4+ |
| **Server** | Apache 2.4 with mod_rewrite |
| **Database** | JSON file storage (upgradeable to MySQL) |
| **Security** | SSL/TLS, CSRF protection, bcrypt hashing |
| **APIs** | Weather API, Geolocation services |

## 📁 Project Structure

```
vonholtencodes-site/
├── 📁 assets/               # Static resources
│   └── 📁 icons/           # Favicons and UI icons
├── 📁 components/          # Reusable HTML components
│   ├── header.html        # Site header
│   ├── footer.html        # Site footer
│   └── ...               # Other components
├── 📁 css/                # Stylesheets
│   ├── main.css          # Core styles
│   ├── themes/           # Theme variations
│   └── components/       # Component-specific styles
├── 📁 js/                 # JavaScript modules
│   ├── main.js           # Core functionality
│   ├── games/           # Game engines
│   └── widgets/         # Interactive widgets
├── 📁 pages/             # Main content pages
│   ├── 🎮 [games/](pages/games/)        # Games room ([README](pages/games/README.md))
│   ├── 🎨 [creation/](pages/creation/)  # Creation station ([README](pages/creation/README.md))
│   ├── 👶 [kids/](pages/kids/)          # Kids section ([README](pages/kids/README.md))
│   ├── 🚀 [mission/](pages/mission/)    # Mission control ([README](pages/mission/README.md))
│   └── 📊 [apis/](pages/apis/)          # API demonstrations ([README](pages/apis/README.md))
├── 📁 inc/              # PHP includes
│   ├── config.template.php
│   └── secure_session.php
├── 📄 index.html        # Main entry point
├── 🔐 admin_secure.template.php
├── 📊 visitor_counter_secure.template.php
└── 📝 README.md         # You are here!
```

## 🚀 Quick Start

### Prerequisites

- PHP 7.4 or higher
- Apache 2.4+ with mod_rewrite enabled
- SSL certificate (Let's Encrypt recommended)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/VonHoltenCodes/vonholtencodes-site.git
   cd vonholtencodes-site
   ```

2. **Run Setup Script**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

3. **Configure Environment**
   ```bash
   # Copy and edit configuration
   cp inc/config.template.php inc/config.php
   nano inc/config.php
   ```

4. **Set Up Secure Data Directory**
   ```bash
   # Create secure directory structure (outside web root)
   sudo mkdir -p /var/lib/vonholtencodes/{users,messages,stats,sessions,logs}
   sudo chown -R www-data:www-data /var/lib/vonholtencodes
   sudo chmod -R 750 /var/lib/vonholtencodes
   ```

5. **Configure Apache Virtual Host**
   ```apache
   <VirtualHost *:443>
       ServerName vonholtencodes.com
       DocumentRoot /var/www/vonholtencodes.com/public_html
       
       <Directory /var/www/vonholtencodes.com/public_html>
           Options -Indexes +FollowSymLinks
           AllowOverride All
           Require all granted
       </Directory>
       
       SSLEngine on
       SSLCertificateFile /etc/letsencrypt/live/vonholtencodes.com/fullchain.pem
       SSLCertificateKeyFile /etc/letsencrypt/live/vonholtencodes.com/privkey.pem
   </VirtualHost>
   ```

6. **Initialize Admin Panel**
   ```bash
   # Set up admin authentication
   cp admin_secure.template.php admin_secure.php
   
   # First login credentials:
   # Username: admin
   # Password: changeme
   # ⚠️ CHANGE THESE IMMEDIATELY!
   ```

## 🔧 Configuration

### Essential Settings

Edit `inc/config.php` to configure:

```php
// Secure data paths
define('SECURE_DATA_PATH', '/var/lib/vonholtencodes/');

// API Keys
define('WEATHER_API_KEY', 'your_api_key_here');

// Session settings
define('SESSION_TIMEOUT', 1800); // 30 minutes
define('MAX_LOGIN_ATTEMPTS', 5);
```

### Security Configuration

1. **SSL/TLS Setup**
   ```bash
   sudo certbot --apache -d vonholtencodes.com -d www.vonholtencodes.com
   ```

2. **Firewall Rules**
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

3. **File Permissions**
   ```bash
   find . -type f -exec chmod 644 {} \;
   find . -type d -exec chmod 755 {} \;
   chmod 600 inc/config.php
   ```

## 🎨 Customization

### Themes

The site supports multiple color themes. To create a custom theme:

1. Copy `css/themes/default.css` to `css/themes/your-theme.css`
2. Modify CSS variables:
   ```css
   :root {
       --primary-color: #4caf50;
       --secondary-color: #333;
       --background-color: #1a1a1a;
   }
   ```

### Adding New Games

1. Create game directory: `pages/games/your-game/`
2. Add HTML, CSS, and JS files
3. Update games index: `pages/games/index.html`
4. Add navigation link

### Custom Widgets

Create new widgets by:
1. Adding HTML component in `components/`
2. Creating JS module in `js/widgets/`
3. Styling in `css/components/`

## 🔐 Security Features

### Authentication & Authorization
- Bcrypt password hashing
- Session-based authentication
- Role-based access control
- Login attempt rate limiting
- Account lockout protection

### Data Protection
- CSRF token validation
- XSS prevention headers
- SQL injection protection
- Secure session storage
- HTTPS enforcement

### Best Practices
- Sensitive data stored outside web root
- Configuration files excluded from version control
- Regular security updates
- Comprehensive error logging
- Input validation and sanitization

## 📊 Monitoring & Analytics

### Built-in Analytics
- Visitor counter with unique visitor tracking
- Page view statistics
- User agent analysis
- Referrer tracking
- Geographic distribution (IP-based)

### Performance Monitoring
- Page load time tracking
- Resource usage statistics
- Error logging and reporting
- Uptime monitoring integration

## 🚦 API Integrations

### Weather API
```javascript
// Example usage
fetch('/api/weather?city=Austin')
  .then(response => response.json())
  .then(data => console.log(data));
```

### Visitor Counter API
```javascript
// Get current count
fetch('/visitor_counter_secure.php')
  .then(response => response.json())
  .then(data => console.log(`Visitors: ${data.count}`));
```

## 🧪 Testing

### Unit Tests
```bash
# Run PHP tests
phpunit tests/

# Run JavaScript tests
npm test
```

### Security Testing
```bash
# Check for vulnerabilities
npm audit

# PHP security check
composer audit
```

## 📈 Performance Optimization

- Minified CSS and JavaScript
- Optimized images (WebP format)
- Browser caching enabled
- Gzip compression
- Lazy loading for images
- CDN ready

## 🤝 Contributing

While this is a personal project, contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style Guidelines

- Follow PSR-12 for PHP code
- Use ESLint configuration for JavaScript
- Maintain consistent indentation (2 spaces)
- Comment complex logic
- Write descriptive commit messages

## 📝 Changelog

### Version 2.0 (May 2025)
- 🔐 Enhanced security with secure admin panel
- 📊 Added visitor tracking and analytics
- 🎮 Improved game performance
- 🎨 New Creation Station tools
- 🌐 SSL/HTTPS implementation
- 📱 Mobile responsiveness improvements

### Version 1.0 (2024)
- Initial release
- Basic game implementations
- Family portal functionality

## 🐛 Known Issues

- Weather widget requires API key configuration
- Some games may not work on older browsers
- Avatar creator has limited mobile support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Weather data provided by [OpenWeatherMap](https://openweathermap.org/)
- Icons from [Font Awesome](https://fontawesome.com/)
- Minions characters © Universal Studios
- Inspired by classic arcade games

## 📞 Contact

- **Website**: [vonholtencodes.com](https://vonholtencodes.com)
- **GitHub**: [@VonHoltenCodes](https://github.com/VonHoltenCodes)
- **Email**: Contact through website

---

<p align="center">
  Made with ❤️ by VonHolten
  <br>
  <a href="https://vonholtencodes.com">vonholtencodes.com</a>
</p>