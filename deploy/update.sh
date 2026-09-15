#!/bin/bash
# =============================================================================
# 3S Saree — Pull latest code, rebuild, and restart
# =============================================================================
# Run after pushing new code to GitHub:
#   ssh your-vm "cd /opt/3s-saree && sudo deploy/update.sh"
#
# This does NOT touch the database or uploaded images.
# =============================================================================

set -euo pipefail

APP_DIR="/opt/3s-saree"
cd "$APP_DIR"

echo "Backing up before update..."
deploy/backup.sh

echo "Pulling latest code..."
git pull --ff-only

echo "Installing server dependencies..."
cd "$APP_DIR/server"
npm install --omit=dev 2>&1 | tail -1

echo "Building client..."
cd "$APP_DIR/client"
npm install 2>&1 | tail -1
npm run build 2>&1 | tail -1

echo "Copying client build..."
rm -rf "$APP_DIR/server/public"
cp -r "$APP_DIR/client/dist" "$APP_DIR/server/public"

echo "Compiling server..."
cd "$APP_DIR/server"
npx tsc

echo "Restarting..."
pm2 restart 3s-saree

echo "Done. Site updated."
pm2 status
