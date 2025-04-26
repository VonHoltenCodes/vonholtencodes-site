#!/bin/bash

# Script to prepare the repository for GitHub by replacing sensitive files with redacted versions

echo "Preparing repository for GitHub..."

# Create backups of original files
mkdir -p .local_backups
cp admin.php .local_backups/admin.php.original
cp .htpasswd .local_backups/.htpasswd.original
cp index.html .local_backups/index.html.original
cp deploy.sh .local_backups/deploy.sh.original

# Run the redact_files script to create redacted versions
./redact_files.sh

# Replace original files with redacted versions
mv admin.php.github admin.php
mv .htpasswd.github .htpasswd
mv index.html.github index.html
mv deploy.sh.github deploy.sh

# Also redact API key from backup files - for security
if [ -f index.html.bak.20250426005454 ]; then
  echo "Redacting sensitive data from backup file..."
  sed -i "s/const weatherApiKey = '[a-zA-Z0-9]*';/const weatherApiKey = 'YOUR_API_KEY_HERE';/g" index.html.bak.20250426005454
fi

# Check for common sensitive data patterns
echo ""
echo "Checking for potentially sensitive data..."
FOUND_SENSITIVE=false

check_pattern() {
    local pattern=$1
    local file_pattern=$2
    
    echo "Checking for '$pattern' in $file_pattern files..."
    RESULTS=$(grep -r "$pattern" --include="$file_pattern" . 2>/dev/null)
    
    if [ ! -z "$RESULTS" ]; then
        echo "⚠️  WARNING: Found potential sensitive data:"
        echo "$RESULTS"
        FOUND_SENSITIVE=true
    else
        echo "✓ No '$pattern' patterns found in $file_pattern files"
    fi
}

# Check for common patterns
check_pattern "apiKey.*=[^Y]" "*.html"
check_pattern "apiKey = '[^Y]" "*.html"
check_pattern "password.*=[^R]" "*.php"
check_pattern "username.*=[^R]" "*.php"
check_pattern "token" "*.js"
check_pattern "secret" "*.js"
# Skip examining backup files and documentation about the fix
check_pattern "2512cd4aeac664aaefe7e1338c48b0ba" "*.html"
check_pattern "2512cd4aeac664aaefe7e1338c48b0ba" "*.js"
check_pattern "2512cd4aeac664aaefe7e1338c48b0ba" "*.php"

echo ""
if [ "$FOUND_SENSITIVE" = true ]; then
    echo "⚠️  WARNING: Potential sensitive data was found in the files."
    echo "    Review the warnings above and fix any remaining sensitive data."
    echo "    Then run this script again before pushing to GitHub."
    echo ""
    echo "    To proceed anyway, run: git add . && git commit && git push"
else
    echo "✓ No obvious sensitive data was found. Repository is ready for GitHub."
    echo "  Original files have been backed up to .local_backups/"
    echo ""
    echo "To commit to GitHub:"
    echo "  git add ."
    echo "  git commit -m \"Update site with redacted sensitive information\""
    echo "  git push origin main"
    echo ""
    echo "To restore original files after GitHub push:"
    echo "  ./github_restore.sh"
fi