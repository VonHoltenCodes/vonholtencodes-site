#!/bin/bash

# Script to update the OpenWeatherMap API key on the live server
# Created on: $(date)

# The new OpenWeatherMap API key
# Generated from OpenWeatherMap account
NEW_API_KEY="ff8b92eed0075c5db3c754a43c08dd0c"

# Create a temporary file with the updated API key
cp /home/traxx/GITHUB/vonholtencodes-site/index.html /tmp/index.html.new
sed -i "s/const weatherApiKey = 'YOUR_API_KEY_HERE';/const weatherApiKey = '$NEW_API_KEY';/g" /tmp/index.html.new

# Display instructions for updating the live site
echo "----------------------------------------------------------------"
echo "To update the API key on the live server, please run:"
echo ""
echo "  sudo cp /tmp/index.html.new /var/www/vonholtencodes.com/public_html/index.html"
echo "  sudo chown www-data:www-data /var/www/vonholtencodes.com/public_html/index.html"
echo ""
echo "The file with the updated API key has been saved to: /tmp/index.html.new"
echo ""
echo "After updating, you can verify it worked with:"
echo "  grep -n \"weatherApiKey\" /var/www/vonholtencodes.com/public_html/index.html"
echo "----------------------------------------------------------------"

# Create a local copy with the API key for development
echo ""
echo "Creating a local development version with the API key..."
if [ -d ".local_backups" ]; then
  # Update the local backup
  cp /tmp/index.html.new .local_backups/index.html.original
  echo "✅ Local backup updated with the API key"
else
  mkdir -p .local_backups
  cp /tmp/index.html.new .local_backups/index.html.original
  echo "✅ Created .local_backups with the API key version"
fi

echo ""
echo "Note: After updating the live server file, run:"
echo "  ./github_restore.sh"
echo "to update your local development copy with the proper API key."
echo "This won't affect the GitHub repository version, which will still use the placeholder."