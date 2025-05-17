#!/bin/bash

# VonholtenCodes Site Installation Script
# Created by Claude

echo "VonholtenCodes Site Installation Script"
echo "======================================="

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root (sudo)" 
   exit 1
fi

# Set variables
INSTALL_DIR="/var/www/html"
SITE_NAME="vonholtencodes"
SITE_DIR="$INSTALL_DIR/$SITE_NAME"
NGINX_CONF="/etc/nginx/sites-available/$SITE_NAME"
PHP_VERSION="7.4"  # Adjust as needed

# Create site directory
echo "Creating site directory..."
mkdir -p $SITE_DIR

# Extract main site files
echo "Extracting site files..."
tar -xzf vonholtencodes-site.tar.gz -C $SITE_DIR

# Extract PHP files
echo "Extracting PHP files..."
tar -xzf vonholtencodes-php.tar.gz -C $SITE_DIR
mv $SITE_DIR/php_files/* $SITE_DIR/
rmdir $SITE_DIR/php_files

# Fix permissions
echo "Setting proper permissions..."
chown -R www-data:www-data $SITE_DIR
find $SITE_DIR -type d -exec chmod 755 {} \;
find $SITE_DIR -type f -exec chmod 644 {} \;

# Install Nginx and PHP if not already installed
echo "Checking and installing required packages..."
apt update
apt install -y nginx php$PHP_VERSION-fpm php$PHP_VERSION-common php$PHP_VERSION-mysql php$PHP_VERSION-xml php$PHP_VERSION-mbstring php$PHP_VERSION-curl

# Create Nginx configuration
echo "Creating Nginx configuration..."
cat > $NGINX_CONF << 'EOF'
server {
    listen 80;
    server_name localhost;  # Change to your domain name

    root /var/www/html/vonholtencodes;
    index index.html index.php;

    location / {
        try_files $uri $uri/ =404;
    }

    # PHP processing
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;  # Adjust PHP version if needed
    }

    # Cache control
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 1d;
    }
}
EOF

# Enable the site
echo "Enabling site..."
ln -sf $NGINX_CONF /etc/nginx/sites-enabled/

# Test Nginx configuration
echo "Testing Nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo "Restarting Nginx..."
    systemctl restart nginx
    echo "Installation complete! Access your site at http://localhost"
    echo "Don't forget to:"
    echo "1. Update the server_name in $NGINX_CONF to your domain"
    echo "2. Set up SSL with Let's Encrypt if needed"
    echo "3. Adjust PHP settings if required"
else
    echo "Error in Nginx configuration. Please fix the issues and restart Nginx manually."
fi