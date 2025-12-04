# Local Development Setup

## Database Setup

For local development, it's **highly recommended** to use a local PostgreSQL database instead of the remote production database to avoid connection timeouts and slow queries.

### Option 1: Docker (Easiest)

```bash
# Start PostgreSQL in Docker
docker run --name ecopro-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ecopro_dev \
  -p 5432:5432 \
  -d postgres:15

# Verify it's running
docker ps | grep ecopro-postgres
```

### Option 2: Install PostgreSQL Locally

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres psql -c "CREATE DATABASE ecopro_dev;"
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
```

#### macOS
```bash
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb ecopro_dev
```

### Configure Database URL

Update your `.env` file:

```env
# Comment out the remote database
# DATABASE_URL=postgresql://eco_db_drrv_user:...

# Use local database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ecopro_dev
```

### Start Development Server

```bash
pnpm dev
```

The migrations will run automatically and create all necessary tables.

## Troubleshooting

### Port 5432 already in use
```bash
# Check what's using the port
sudo lsof -i :5432

# Stop existing PostgreSQL
sudo systemctl stop postgresql
# or for Docker
docker stop ecopro-postgres
```

### Connection refused
- Make sure PostgreSQL is running: `docker ps` or `sudo systemctl status postgresql`
- Check the DATABASE_URL has the correct credentials
- Ensure port 5432 is not blocked by firewall

### Migration errors
- Drop and recreate the database if needed:
```bash
# For Docker
docker exec -it ecopro-postgres psql -U postgres -c "DROP DATABASE ecopro_dev;"
docker exec -it ecopro-postgres psql -U postgres -c "CREATE DATABASE ecopro_dev;"

# For local PostgreSQL
sudo -u postgres psql -c "DROP DATABASE ecopro_dev;"
sudo -u postgres psql -c "CREATE DATABASE ecopro_dev;"
```

## Production Database

The production database on Render should **only** be used:
- In production deployments
- For testing production-like scenarios
- When absolutely necessary

Using the production database from local development causes:
- Slow queries (network latency)
- Connection timeouts
- Potential data corruption
- Interference with production users
