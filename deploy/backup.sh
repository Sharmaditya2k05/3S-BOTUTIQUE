#!/bin/bash
# Daily backup of the JSON database and uploaded images.
# Add to crontab:  0 3 * * * /opt/3s-saree/deploy/backup.sh
#
# Keeps the last 14 backups. Stored in /opt/3s-saree/backups/.

set -e

BACKUP_DIR="/opt/3s-saree/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/3s-saree-$TIMESTAMP.tar.gz"

mkdir -p "$BACKUP_DIR"

tar -czf "$BACKUP_FILE" \
    -C /opt/3s-saree/server \
    data/db.json \
    uploads/

# Remove backups older than 14 days
find "$BACKUP_DIR" -name "3s-saree-*.tar.gz" -mtime +14 -delete

echo "Backup saved: $BACKUP_FILE"
