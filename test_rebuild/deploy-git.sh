#!/bin/bash

# Git-based Deployment Script for VonholtenCodes Site
# Created by Claude

echo "VonholtenCodes Site Git Deployment Script"
echo "========================================="

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
GIT_REPO="https://github.com/VonHoltenCodes/vonholtencodes-site.git"
GIT_BRANCH="main"

# Install necessary packages
echo "Installing required packages..."
apt update
apt install -y git nginx php$PHP_VERSION-fpm php$PHP_VERSION-common php$PHP_VERSION-mysql php$PHP_VERSION-xml php$PHP_VERSION-mbstring php$PHP_VERSION-curl

# Create site directory if it doesn't exist
echo "Setting up web directories..."
mkdir -p $SITE_DIR

# Clone the repository
echo "Cloning git repository..."
if [ -d "$SITE_DIR/.git" ]; then
    echo "Git repository already exists. Updating..."
    cd $SITE_DIR
    git fetch --all
    git reset --hard origin/$GIT_BRANCH
else
    echo "Fresh clone of the repository..."
    # Clear directory first if it exists and has content
    if [ -d "$SITE_DIR" ] && [ "$(ls -A $SITE_DIR)" ]; then
        rm -rf $SITE_DIR/*
    fi
    git clone -b $GIT_BRANCH $GIT_REPO $SITE_DIR
fi

# Move files from test_rebuild to root if needed
if [ -d "$SITE_DIR/test_rebuild" ]; then
    echo "Moving files from test_rebuild to site root..."
    cp -r $SITE_DIR/test_rebuild/* $SITE_DIR/
    # Handle any PHP files in the parent directory that are needed
    cp -n $SITE_DIR/*.php $SITE_DIR/ 2>/dev/null || true
fi

# Fix permissions
echo "Setting proper permissions..."
chown -R www-data:www-data $SITE_DIR
find $SITE_DIR -type d -exec chmod 755 {} \;
find $SITE_DIR -type f -exec chmod 644 {} \;

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
    echo ""
    echo "Don't forget to:"
    echo "1. Update the server_name in $NGINX_CONF to your domain"
    echo "2. Set up SSL with Let's Encrypt using: sudo certbot --nginx -d yourdomain.com"
    echo "3. Consider setting up a git hook for automatic deployments"
else
    echo "Error in Nginx configuration. Please fix the issues and restart Nginx manually."
fi

# Setup automatic deployment with webhook (optional)
echo ""
echo "Would you like to set up automatic deployment via webhook? (y/n)"
read -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Setting up webhook for automatic deployment..."
    apt install -y webhook

    # Create deployment script
    WEBHOOK_SCRIPT="/opt/webhook-scripts/deploy-vonholtencodes.sh"
    mkdir -p /opt/webhook-scripts
    
    cat > $WEBHOOK_SCRIPT << 'EOF'
#!/bin/bash
cd /var/www/html/vonholtencodes
git pull origin main
EOF

    chmod +x $WEBHOOK_SCRIPT
    
    # Create webhook configuration
    mkdir -p /etc/webhook
    
    cat > /etc/webhook/hooks.json << EOF
[
  {
    "id": "deploy-vonholtencodes",
    "execute-command": "$WEBHOOK_SCRIPT",
    "command-working-directory": "$SITE_DIR",
    "response-message": "Deploying website..."
  }
]
EOF

    # Setup webhook service
    cat > /etc/systemd/system/webhook.service << EOF
[Unit]
Description=Webhook for automatic deployment
After=network.target

[Service]
ExecStart=/usr/bin/webhook -hooks /etc/webhook/hooks.json -hotreload -port 9000

[Install]
WantedBy=multi-user.target
EOF

    # Enable and start webhook service
    systemctl enable webhook
    systemctl start webhook
    
    echo "Webhook setup complete!"
    echo "You can trigger deployments with: curl http://your-server-ip:9000/hooks/deploy-vonholtencodes"
    echo "For security, consider adding a secret token or setting up nginx as a reverse proxy with basic auth"
fi