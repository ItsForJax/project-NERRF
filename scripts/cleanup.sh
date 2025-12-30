#!/bin/sh

echo "========================================="
echo "Starting daily cleanup - $(date)"
echo "========================================="

# Delete all uploaded files
echo "Deleting all uploaded files..."
rm -rf /app/uploads/*
echo "✓ All files deleted"

# Truncate database tables
echo "Truncating database tables..."
PGPASSWORD=$POSTGRES_PASSWORD psql -h postgres -U $POSTGRES_USER -d $POSTGRES_DB <<-EOSQL
    TRUNCATE images, upload_limits CASCADE;
EOSQL
echo "✓ Database tables truncated"

# Delete Elasticsearch index
echo "Deleting Elasticsearch index..."
curl -X DELETE "http://elasticsearch:9200/images" 2>/dev/null
echo ""
echo "✓ Elasticsearch index deleted"

# Recreate Elasticsearch index (will be recreated on next FastAPI restart)
echo "Index will be recreated automatically on next upload"

echo "========================================="
echo "Daily cleanup completed - $(date)"
echo "========================================="
echo ""
