#!/bin/bash

# VonHoltenCodes.com Setup Script
# This script helps initialize the website on a new server

echo "VonHoltenCodes.com Setup Script"
echo "=============================="

# Create required directories
echo "Creating required directories..."
mkdir -p data/avatars
touch data/avatars/.gitkeep

# Copy template files
echo "Setting up configuration files..."
if [ ! -f "inc/config.php" ]; then
    cp inc/config.template.php inc/config.php
    echo "Created inc/config.php - Please edit with your settings"
fi

if [ ! -f "admin_secure.php" ]; then
    cp admin_secure.template.php admin_secure.php
    echo "Created admin_secure.php - Default credentials: admin/changeme"
    echo "IMPORTANT: Change these credentials immediately!"
fi

if [ ! -f "visitor_counter_secure.php" ]; then
    cp visitor_counter_secure.template.php visitor_counter_secure.php
    echo "Created visitor_counter_secure.php"
fi

# Set permissions
echo "Setting file permissions..."
chmod 755 .
chmod 644 *.php
chmod 755 pages/creation/
chmod 755 data/

echo ""
echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit inc/config.php with your secure data path"
echo "2. Create secure data directory outside web root:"
echo "   mkdir -p /path/to/secure/data/{users,messages,stats,sessions,logs}"
echo "3. Configure your web server to point to this directory"
echo "4. Set up SSL certificates"
echo "5. Login to admin panel and change default credentials"
echo ""
echo "For full instructions, see README.md"