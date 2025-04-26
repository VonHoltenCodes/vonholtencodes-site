#!/bin/bash

# Script to redact sensitive information from files before pushing to GitHub

echo "Creating redacted versions of files for GitHub..."

# Create GitHub-ready versions of files
echo "Creating GitHub-ready admin.php..."
cp admin.php admin.php.github
sed -i 's/traxx/REDACTED_USERNAME/g' admin.php.github
sed -i 's/VonHolten2025/REDACTED_PASSWORD/g' admin.php.github

echo "Creating GitHub-ready .htpasswd..."
echo "username:REDACTED_PASSWORD_HASH" > .htpasswd.github

echo "Creating GitHub-ready index.html..."
cp index.html index.html.github
# Replace any API keys in the index.html file
sed -i 's/apiKey="\([a-zA-Z0-9]*\)"/apiKey="YOUR_API_KEY_HERE"/g' index.html.github
sed -i 's/api_key="\([a-zA-Z0-9]*\)"/api_key="YOUR_API_KEY_HERE"/g' index.html.github
sed -i 's/key="\([a-zA-Z0-9]*\)"/key="YOUR_API_KEY_HERE"/g' index.html.github
# Replace the OpenWeatherMap API key
sed -i "s/const weatherApiKey = '[a-zA-Z0-9]*';/const weatherApiKey = 'YOUR_API_KEY_HERE';/g" index.html.github

echo "Creating GitHub-ready deploy.sh..."
cp deploy.sh deploy.sh.github
echo "" >> deploy.sh.github
echo "# Note: This is a redacted version for GitHub. Server paths, usernames, and specific commands" >> deploy.sh.github
echo "# may need to be modified for your environment." >> deploy.sh.github

echo "Done creating redacted versions."
echo ""
echo "Instructions for committing to GitHub:"
echo "1. Rename the *.github files to replace the originals:"
echo "   mv admin.php.github admin.php"
echo "   mv .htpasswd.github .htpasswd"
echo "   mv index.html.github index.html"
echo "   mv deploy.sh.github deploy.sh"
echo ""
echo "2. Commit and push to GitHub:"
echo "   git add ."
echo "   git commit -m \"Update site with redacted sensitive information\""
echo "   git push origin main"
echo ""
echo "3. After pushing to GitHub, you can restore the original files if needed."