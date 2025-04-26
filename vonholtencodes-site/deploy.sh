#!/bin/bash

# Deploy script for vonholtencodes.com
echo "Starting deployment of VonHoltenCodes website..."

# Ask for password upfront
echo "Please enter your sudo password:"
read -s PASSWORD

# Create target directory if it doesn't exist
echo $PASSWORD | sudo -S mkdir -p /var/www/vonholtencodes.com/public_html/

# Copy all necessary files
echo "Copying files to server..."
echo $PASSWORD | sudo -S cp /home/traxx/GITHUB/vonholtencodes-site/index.html /var/www/vonholtencodes.com/public_html/
echo $PASSWORD | sudo -S cp /home/traxx/GITHUB/vonholtencodes-site/counter.txt /var/www/vonholtencodes.com/public_html/
echo $PASSWORD | sudo -S cp /home/traxx/GITHUB/vonholtencodes-site/get_counter.php /var/www/vonholtencodes.com/public_html/
echo $PASSWORD | sudo -S cp /home/traxx/GITHUB/vonholtencodes-site/admin.php /var/www/vonholtencodes.com/public_html/
echo $PASSWORD | sudo -S cp /home/traxx/GITHUB/vonholtencodes-site/moon_lander.html /var/www/vonholtencodes.com/public_html/
echo $PASSWORD | sudo -S cp /home/traxx/GITHUB/vonholtencodes-site/info.php /var/www/vonholtencodes.com/public_html/
echo $PASSWORD | sudo -S cp /home/traxx/GITHUB/vonholtencodes-site/server_status.php /var/www/vonholtencodes.com/public_html/
echo $PASSWORD | sudo -S cp /home/traxx/GITHUB/vonholtencodes-site/.htaccess /var/www/vonholtencodes.com/public_html/
echo $PASSWORD | sudo -S cp /home/traxx/GITHUB/vonholtencodes-site/.htpasswd /var/www/vonholtencodes.com/

# Set correct permissions
echo "Setting correct permissions..."
echo $PASSWORD | sudo -S chown -R www-data:www-data /var/www/vonholtencodes.com/public_html/
echo $PASSWORD | sudo -S chmod 644 /var/www/vonholtencodes.com/public_html/{index.html,counter.txt,get_counter.php,admin.php,moon_lander.html,info.php,server_status.php,.htaccess}
echo $PASSWORD | sudo -S chmod 644 /var/www/vonholtencodes.com/.htpasswd
echo $PASSWORD | sudo -S chmod 755 /var/www/vonholtencodes.com/public_html/

# Check if PHP is installed and enabled in Apache
echo "Checking and enabling PHP..."
if ! dpkg -l | grep -q "php"; then
    echo "PHP not found. Installing PHP..."
    echo $PASSWORD | sudo -S apt-get update
    echo $PASSWORD | sudo -S apt-get install -y php libapache2-mod-php php-mysql
fi

# Enable PHP module in Apache if not already enabled
if [ ! -f /etc/apache2/mods-enabled/php*.load ]; then
    echo "Enabling PHP module in Apache..."
    echo $PASSWORD | sudo -S a2enmod php*
    echo $PASSWORD | sudo -S service apache2 restart
fi

echo "Deployment complete!"
echo "Website can be accessed at: http://vonholtencodes.com/"
echo "Admin panel: http://vonholtencodes.com/admin.php"
# Note: This is a redacted version for GitHub. Server paths, usernames, and specific commands
# may need to be modified for your environment.

# Note: This is a redacted version for GitHub. Server paths, usernames, and specific commands
# may need to be modified for your environment.
