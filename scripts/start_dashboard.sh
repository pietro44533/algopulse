#!/bin/bash
cd "$(dirname "$0")/../dashboard"
node server.js > ../scripts/dashboard.log 2>&1 &
echo "Dashboard avviata in background su http://localhost:3000"
echo "Log: scripts/dashboard.log"