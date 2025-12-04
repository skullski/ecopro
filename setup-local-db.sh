#!/bin/bash
# Quick setup script for local PostgreSQL using Docker

echo "🐘 Setting up local PostgreSQL database..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first:"
    echo "   Ubuntu: sudo apt install docker.io"
    echo "   Or visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if container already exists
if docker ps -a | grep -q ecopro-postgres; then
    echo "📦 Existing container found. Starting..."
    docker start ecopro-postgres
else
    echo "📦 Creating new PostgreSQL container..."
    docker run --name ecopro-postgres \
      -e POSTGRES_PASSWORD=postgres \
      -e POSTGRES_DB=ecopro_dev \
      -p 5432:5432 \
      -d postgres:15
fi

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 3

# Check if it's running
if docker ps | grep -q ecopro-postgres; then
    echo "✅ PostgreSQL is running!"
    echo ""
    echo "📝 Update your .env file:"
    echo "   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ecopro_dev"
    echo ""
    echo "🚀 You can now run: pnpm dev"
    echo ""
    echo "💡 Useful commands:"
    echo "   Stop:    docker stop ecopro-postgres"
    echo "   Start:   docker start ecopro-postgres"
    echo "   Logs:    docker logs ecopro-postgres"
    echo "   Shell:   docker exec -it ecopro-postgres psql -U postgres -d ecopro_dev"
else
    echo "❌ Failed to start PostgreSQL container"
    docker logs ecopro-postgres
    exit 1
fi
