#!/bin/bash

# Railway startup script for etcetera.exchange

echo "🚀 Starting etcetera.exchange..."

# Check if we need to run database migrations
if [ "$RAILWAY_ENVIRONMENT" = "production" ] && [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "📊 Running database migrations..."
    cd packages/database && npm run migrate
    cd ../..
fi

# Check if we need to generate objects
if [ "$RAILWAY_ENVIRONMENT" = "production" ] && [ "$GENERATE_OBJECTS" = "true" ]; then
    echo "🎲 Generating object catalog..."
    cd packages/scripts && npm run generate:batch
    cd ../..
fi

# Start the web application
echo "🌐 Starting web application..."
cd packages/web && npm start