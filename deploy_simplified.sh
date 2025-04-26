#!/bin/bash

# Deploy script for vonholtencodes.com with simplified sudo handling
echo "Starting deployment of VonHoltenCodes website..."

# Function to run a command with sudo and display status
run_sudo_command() {
    local command="$1"
    local description="$2"
    
    echo "- $description..."
    
    # We only ask for the password once and cache it with sudo -v
    sudo -v && eval "sudo $command"
    
    if [ $? -eq 0 ]; then
        echo "  ✓ Success"
    else
        echo "  ✗ Failed"
        exit 1
    fi
}

# Ask for password once at the beginning and cache it
echo "Please enter your sudo password (will be cached for this script):"
sudo -v

# If sudo validation failed, exit
if [ $? -ne 0 ]; then
    echo "Failed to validate sudo access. Exiting."
    exit 1
fi

# Create target directory if it doesn't exist
run_sudo_command "mkdir -p /var/www/vonholtencodes.com/public_html/" "Creating target directory"

# Copy all necessary files
echo "Copying files to server..."
files=(
    "index.html"
    "counter.txt"
    "get_counter.php"
    "admin.php"
    "moon_lander.html"
    "info.php"
    "server_status.php"
    ".htaccess"
)

for file in "${files[@]}"; do
    run_sudo_command "cp /home/traxx/GITHUB/vonholtencodes-site/$file /var/www/vonholtencodes.com/public_html/" "Copying $file"
done

# Copy htpasswd to parent directory
run_sudo_command "cp /home/traxx/GITHUB/vonholtencodes-site/.htpasswd /var/www/vonholtencodes.com/" "Copying .htpasswd"

# Set correct permissions
run_sudo_command "chown -R www-data:www-data /var/www/vonholtencodes.com/public_html/" "Setting ownership"
run_sudo_command "chmod 644 /var/www/vonholtencodes.com/public_html/{index.html,counter.txt,get_counter.php,admin.php,moon_lander.html,info.php,server_status.php,.htaccess}" "Setting file permissions"
run_sudo_command "chmod 644 /var/www/vonholtencodes.com/.htpasswd" "Setting .htpasswd permissions"
run_sudo_command "chmod 755 /var/www/vonholtencodes.com/public_html/" "Setting directory permissions"

# Check if PHP is installed and enabled in Apache
echo "Checking for PHP..."
if ! dpkg -l | grep -q "php"; then
    run_sudo_command "apt-get update" "Updating package lists"
    run_sudo_command "apt-get install -y php libapache2-mod-php php-mysql" "Installing PHP"
fi

# Enable PHP module in Apache if not already enabled
if [ ! -f /etc/apache2/mods-enabled/php*.load ]; then
    run_sudo_command "a2enmod php*" "Enabling PHP module"
    run_sudo_command "service apache2 restart" "Restarting Apache"
fi

echo "Deployment complete!"
echo "Website can be accessed at: http://vonholtencodes.com/"
echo "Admin panel: http://vonholtencodes.com/admin.php"