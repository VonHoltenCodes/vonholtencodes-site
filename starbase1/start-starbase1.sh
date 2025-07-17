#!/bin/bash

# Starbase1 IO Security Monitor Startup Script
# Runs the Flask application on port 5001

cd /mnt/websites/vonholtencodes.com/public_html/starbase1

# Kill any existing process on port 5001
pkill -f "python3.*app.py.*5001" 2>/dev/null || true
pkill -f "gunicorn.*starbase1" 2>/dev/null || true

# Wait for process to stop
sleep 2

# Set environment variables
export FLASK_APP=app.py
export FLASK_ENV=production

# Start with Gunicorn for production
echo "Starting Starbase1 IO on port 5001..."
cd /mnt/websites/vonholtencodes.com/public_html/starbase1
PYTHONPATH=/mnt/websites/vonholtencodes.com/public_html/starbase1 /home/traxx/.local/bin/gunicorn -w 4 -b 127.0.0.1:5001 --daemon --pid /tmp/starbase1.pid app:app

echo "Starbase1 IO started on http://127.0.0.1:5001"
echo "Access via: https://starbase1.vonholtencodes.com"