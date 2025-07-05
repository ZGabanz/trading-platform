#!/bin/bash

# Exchange Rate System - Stop Script
# This script stops all services cleanly

echo "🛑 Stopping Exchange Rate System..."
echo "===================================="

# Stop frontend process
echo "🎨 Stopping frontend dashboard..."
pkill -f "npm run dev" || echo "Frontend not running"

# Stop backend services
echo "🔧 Stopping backend services..."
cd exchange-rate-system

# Stop all Docker containers
echo "📦 Stopping Docker containers..."
sudo docker-compose down

# Optional: Remove volumes (uncomment if you want to reset data)
# echo "🗑️ Removing volumes..."
# sudo docker-compose down -v

echo ""
echo "✅ All services stopped successfully!"
echo ""
echo "🔄 To start the system again, run: ./scripts/start-system.sh" 