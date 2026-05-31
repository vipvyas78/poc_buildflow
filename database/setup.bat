@echo off
REM BuildFlow PostgreSQL Database Setup Script - Windows Version
REM This script helps you set up the PostgreSQL database for BuildFlow

setlocal enabledelayedexpansion

cls
echo.
echo 🚀 BuildFlow PostgreSQL Database Setup (Windows)
echo ======================================================
echo.

REM Check if PostgreSQL is installed
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ PostgreSQL is not installed or not in PATH.
    echo    Please install PostgreSQL and ensure it's added to your system PATH.
    echo    Download from: https://www.postgresql.org/download/windows/
    pause
    exit /b 1
)

echo ✅ PostgreSQL found in PATH

REM Get database credentials
echo.
echo Please enter your PostgreSQL credentials:
set /p DB_USER="PostgreSQL User [postgres]: "
if "!DB_USER!"=="" set DB_USER=postgres

set /p DB_PASSWORD="PostgreSQL Password: "

set /p DB_HOST="Database Host [localhost]: "
if "!DB_HOST!"=="" set DB_HOST=localhost

set /p DB_PORT="Database Port [5432]: "
if "!DB_PORT!"=="" set DB_PORT=5432

REM Create database
echo.
echo 📦 Creating database 'poc_workflow'...
set PGPASSWORD=!DB_PASSWORD!
psql -h !DB_HOST! -U !DB_USER! -p !DB_PORT! -c "CREATE DATABASE poc_workflow;" 2>nul
if %ERRORLEVEL% EQU 0 (
    echo    Database created
) else (
    echo    Database may already exist
)

REM Run schema script
echo 📋 Creating schema and tables...
psql -h !DB_HOST! -U !DB_USER! -p !DB_PORT! -d poc_workflow -f "%~dp001-schema.sql"
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error creating schema
    pause
    exit /b 1
)

REM Run data insertion script
echo 📊 Inserting sample data...
psql -h !DB_HOST! -U !DB_USER! -p !DB_PORT! -d poc_workflow -f "%~dp002-data.sql"
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error inserting data
    pause
    exit /b 1
)

REM Run utility functions
echo 🔧 Creating utility functions...
psql -h !DB_HOST! -U !DB_USER! -p !DB_PORT! -d buildflow -f "%~dp003-queries.sql" 2>nul

REM Display connection info
echo.
echo ✅ Database setup completed successfully!
echo.
echo 📌 Connection Details:
echo    Host: !DB_HOST!
echo    Port: !DB_PORT!
echo    Database: poc_workflow
echo    User: !DB_USER!
echo.
echo 🔗 Connection String:
echo    postgresql://!DB_USER!:^^^^<password^^^^>@!DB_HOST!:!DB_PORT!/poc_workflow
echo.
echo 📝 Environment Variables (.env):
echo    DB_USER=!DB_USER!
echo    DB_PASSWORD=^<your_password^>
echo    DB_HOST=!DB_HOST!
echo    DB_PORT=!DB_PORT!
echo    DB_NAME=poc_workflow
echo.
echo 📚 Next Steps:
echo    1. Check README.md for detailed documentation
echo    2. Review MIGRATION_GUIDE.md for integration steps
echo    3. Test connection: psql -h !DB_HOST! -U !DB_USER! -d buildflow
echo    4. View tables: \dt (in psql)
echo    5. Check data: SELECT COUNT(*) FROM projects;
echo.
echo ✨ Setup complete! Your database is ready to use.
echo.
pause
