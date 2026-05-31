#!/bin/bash

# BuildFlow PostgreSQL Database Setup Script
# This script helps you set up the PostgreSQL database for BuildFlow

set -e

echo "🚀 BuildFlow PostgreSQL Database Setup"
echo "======================================"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    echo "   macOS: brew install postgresql"
    echo "   Ubuntu: sudo apt-get install postgresql"
    exit 1
fi

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 &> /dev/null; then
    echo "❌ PostgreSQL is not running on localhost:5432"
    echo "   Please start PostgreSQL and try again."
    exit 1
fi

echo "✅ PostgreSQL is running"

# Get database credentials
echo ""
echo "Please enter your PostgreSQL credentials:"
read -p "PostgreSQL User [postgres]: " DB_USER
DB_USER=${DB_USER:-postgres}

read -s -p "PostgreSQL Password: " DB_PASSWORD
echo ""

read -p "Database Host [localhost]: " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Database Port [5432]: " DB_PORT
DB_PORT=${DB_PORT:-5432}

# Create database
echo ""
echo "📦 Creating database 'poc_workflow'..."
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -p "$DB_PORT" -c "CREATE DATABASE poc_workflow;" 2>/dev/null || echo "   Database may already exist"

# Run schema script
echo "📋 Creating schema and tables..."
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -p "$DB_PORT" -d poc_workflow -f "$(dirname "$0")/01-schema.sql"

# Run data insertion script
echo "📊 Inserting sample data..."
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -p "$DB_PORT" -d poc_workflow -f "$(dirname "$0")/02-data.sql"

# Run utility functions
echo "🔧 Creating utility functions..."
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -p "$DB_PORT" -d buildflow -f "$(dirname "$0")/03-queries.sql" 2>/dev/null || echo "   Some functions may have already been created"

# Display connection info
echo ""
echo "✅ Database setup completed successfully!"
echo ""
echo "📌 Connection Details:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: buildflow"
echo "   User: $DB_USER"
echo ""
echo "🔗 Connection String:"
echo "   postgresql://$DB_USER:****@$DB_HOST:$DB_PORT/buildflow"
echo ""
echo "📝 Environment Variables (.env):"
echo "   DB_USER=$DB_USER"
echo "   DB_PASSWORD=<your_password>"
echo "   DB_HOST=$DB_HOST"
echo "   DB_PORT=$DB_PORT"
echo "   DB_NAME=buildflow"
echo ""
echo "📚 Next Steps:"
echo "   1. Check README.md for detailed documentation"
echo "   2. Review MIGRATION_GUIDE.md for integration steps"
echo "   3. Test connection: psql -h $DB_HOST -U $DB_USER -d buildflow"
echo "   4. View tables: \\dt (in psql)"
echo "   5. Check data: SELECT COUNT(*) FROM projects;"
echo ""
echo "✨ Setup complete! Your database is ready to use."
