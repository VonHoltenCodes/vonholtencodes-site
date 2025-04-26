#!/bin/bash

echo "Installing and enabling PHP for Apache..."

# Update package lists
sudo apt-get update

# Install PHP and Apache PHP module
sudo apt-get install -y php libapache2-mod-php php-mysql

# Make sure PHP module is enabled
sudo a2enmod php*

# Restart Apache to apply changes
sudo systemctl restart apache2

echo "PHP installation complete. Check if PHP is working by visiting http://vonholtencodes.com/info.php"
echo "If PHP is working correctly, you should see the PHP info page instead of the PHP source code."