#!/bin/sh

# Set permissions for volumes
chown -R jukebox:jukebox /app/logs /app/cache

# Execute Docker's CMD as jukebox user
exec sudo -E -u jukebox "$@"
