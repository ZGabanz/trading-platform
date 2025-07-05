#!/bin/bash

# Exchange Rate System - Quick Start Script
# This script starts all services in the correct order

echo "🚀 Starting Exchange Rate System..."
echo "======================================"

# Check if Docker is running
if ! sudo docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from example..."
    cp config/env.example .env.local
    echo "✅ .env.local created. Please edit it with your configuration if needed."
fi

# Start the backend services
echo "🔧 Starting backend services..."
cd exchange-rate-system

# Start database and cache services first
echo "📊 Starting database and cache services..."
sudo docker-compose up -d postgres redis

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Initialize database
echo "🗄️ Initializing database..."
sudo docker-compose exec -T postgres psql -U postgres -d exchange_rate_db -f /docker-entrypoint-initdb.d/01_create_tables.sql || echo "Database already initialized"

# Start all other services
echo "🚀 Starting all microservices..."
sudo docker-compose up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 15

# Check service health
echo "🔍 Checking service health..."
services=("pricing-core:4001" "p2p-parser:4002" "rapira-parser:4003" "deal-automation:4004" "api-gateway:3002")

for service in "${services[@]}"; do
    name=$(echo $service | cut -d':' -f1)
    port=$(echo $service | cut -d':' -f2)
    
    if curl -f -s http://localhost:$port/health > /dev/null; then
        echo "✅ $name is running on port $port"
    else
        echo "⚠️ $name may not be ready yet on port $port"
    fi
done

# Go back to root directory
cd ..

# Install frontend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Start the frontend
echo "🎨 Starting frontend dashboard..."
npm run dev &

# Wait a moment for frontend to start
sleep 5

echo ""
echo "🎉 Exchange Rate System is starting up!"
echo "======================================"
echo ""
echo "📊 Services Status:"
echo "  - Frontend Dashboard: http://localhost:3000"
echo "  - API Gateway: http://localhost:3002"
echo "  - API Documentation: http://localhost:3002/api-docs"
echo "  - Pricing Core: http://localhost:4001"
echo "  - P2P Parser: http://localhost:4002"
echo "  - Rapira Parser: http://localhost:4003"
echo "  - Deal Automation: http://localhost:4004"
echo "  - Grafana Monitoring: http://localhost:3003"
echo "  - Prometheus: http://localhost:9090"
echo ""
echo "🔧 Database & Cache:"
echo "  - PostgreSQL: localhost:5433"
echo "  - Redis: localhost:6379"
echo ""
echo "📚 Documentation:"
echo "  - System Health: http://localhost:3000 (Dashboard)"
echo "  - API Docs: http://localhost:3002/api-docs"
echo ""
echo "🛑 To stop all services, run: ./scripts/stop-system.sh"
echo ""
echo "✨ System is ready! Open http://localhost:3000 to access the dashboard." 