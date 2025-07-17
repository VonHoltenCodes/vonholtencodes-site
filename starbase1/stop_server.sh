#!/bin/bash

# Starbase1_IO CLI Terminal Interface Stop Script

cd /home/traxx/starbase1_IO

echo ">>> Stopping Starbase1_IO CLI Terminal Interface..."

# Stop using PID file if it exists
if [ -f starbase1_io.pid ]; then
    PID=$(cat starbase1_io.pid)
    if ps -p $PID > /dev/null; then
        kill $PID
        echo ">>> Stopped server (PID: $PID)"
        rm starbase1_io.pid
    else
        echo ">>> Server not running (PID: $PID)"
        rm starbase1_io.pid
    fi
else
    echo ">>> No PID file found, trying to kill by port..."
    sudo lsof -ti:5000 | xargs sudo kill -9 2>/dev/null
    echo ">>> Cleared port 5000"
fi

echo ">>> Server stopped"