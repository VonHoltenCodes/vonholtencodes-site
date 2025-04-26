#!/bin/bash

# Script to restore original files after pushing to GitHub

echo "Restoring original files after GitHub push..."

if [ -d ".local_backups" ]; then
    # Restore original files
    cp .local_backups/admin.php.original admin.php
    cp .local_backups/.htpasswd.original .htpasswd
    cp .local_backups/index.html.original index.html
    cp .local_backups/deploy.sh.original deploy.sh
    
    echo "Original files have been restored."
else
    echo "Error: Backup directory .local_backups not found."
    echo "Make sure you ran github_prep.sh first."
    exit 1
fi