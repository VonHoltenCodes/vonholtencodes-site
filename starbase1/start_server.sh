#!/bin/bash

# Starbase1_IO CLI Terminal Interface Startup Script
# This script starts the Flask development server as a background process

cd /home/traxx/starbase1_IO

echo ">>> Starting Starbase1_IO CLI Terminal Interface..."

# Kill any existing processes on port 5000
echo "VonHolten2025" | sudo -S lsof -ti:5000 | xargs sudo kill -9 2>/dev/null

# Start the Flask app in the background
nohup python3 app.py > starbase1_io.log 2>&1 &
PID=$!

# Wait a moment for the server to start
sleep 3

# Check if the server is running
if ps -p $PID > /dev/null; then
    echo ">>> Server started successfully (PID: $PID)"
    echo ">>> Dashboard: http://localhost:5000"
    echo ">>> Log file: /home/traxx/starbase1_IO/starbase1_io.log"
    echo ">>> To stop: kill $PID"
    echo "$PID" > starbase1_io.pid
else
    echo "!!! ERROR: Server failed to start"
    cat starbase1_io.log
fi