#!/bin/bash
# Backend wrapper script - runs Node.js with auto-restart
cd /var/www/html/backend
export PORT=9090
while true; do
    echo "[$(date)] Starting Node.js backend on port $PORT..."
    node server/app.js
    exit_code=$?
    echo "[$(date)] Backend exited with code $exit_code. Restarting in 5 seconds..."
    sleep 5
done
