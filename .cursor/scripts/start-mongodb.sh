#!/usr/bin/env bash
set -euo pipefail

# Start MongoDB if not already running
if ! pgrep -x mongod > /dev/null 2>&1; then
  mkdir -p /data/db
  mongod --dbpath /data/db --bind_ip 127.0.0.1 --fork --logpath /tmp/mongod.log
fi

# Wait for MongoDB to be ready
for i in $(seq 1 30); do
  if mongosh --quiet --eval "db.runCommand({ ping: 1 }).ok" > /dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! mongosh --quiet --eval "db.runCommand({ ping: 1 }).ok" > /dev/null 2>&1; then
  echo "MongoDB failed to start" >&2
  exit 1
fi

echo "MongoDB is ready"
