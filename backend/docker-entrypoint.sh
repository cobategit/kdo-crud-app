#!/bin/sh
set -e
echo "Menjalankan migrasi database..."
bun dist/db/migrate.js
if [ "$RUN_SEED" = "true" ]; then
  echo "Menjalankan seeder (idempoten)..."
  bun dist/db/seed.js
fi
exec bun dist/index.js
