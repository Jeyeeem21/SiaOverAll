# Setup Guide - Business Center System

This guide will help you set up the integrated system on a new computer after cloning from GitHub.

## Prerequisites

- **Docker Desktop** installed and running
- **Git** installed
- **Windows OS** (for the provided batch scripts)

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Jeyeeem21/SiaOverAll.git
cd SiaOverAll
```

### 2. Create Environment Configuration

Copy the example environment file and configure it:

```bash
copy .env.example .env
```

**IMPORTANT:** Edit the `.env` file and set your database password:

```env
# Change these values!
DB_ROOT_PASSWORD=YourSecurePasswordHere123
DB_DATABASE=business_center

# phpMyAdmin credentials
PHPMYADMIN_PASSWORD=YourSecurePasswordHere123
```

You can keep the default ports or customize them if needed.

### 3. Create Module .env Files

Each module needs its own `.env` file. You can find `.env.example` files in each module directory.

**Quick setup - Copy all .env.example files:**

```cmd
copy main-system\laravel-backend\.env.example main-system\laravel-backend\.env
copy student_account_module\backend\.env.example student_account_module\backend\.env
copy Student_print_module\backend\.env.example Student_print_module\backend\.env
copy Staff_Sticker_module\laravel-backend\.env.example Staff_Sticker_module\laravel-backend\.env
copy staff_id_managament\backend\.env.example staff_id_managament\backend\.env
```

**IMPORTANT:** Edit each module's `.env` file and ensure the database credentials match your root `.env` file:

```env
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=business_center
DB_USERNAME=root
DB_PASSWORD=YourSecurePasswordHere123  # Must match DB_ROOT_PASSWORD in root .env
```

### 4. Start Docker Containers

```bash
docker compose up -d
```

This will:
- Build all Docker images
- Start all services
- Create the MySQL database

**Note:** First run will take 5-10 minutes to download images and install dependencies.

### 5. Run Database Migrations

After containers are running, execute the migration script:

```cmd
migrate-all.cmd
```

This will:
- Run migrations for all 5 modules
- Create all necessary database tables
- Set up initial database structure

### 6. Verify Installation

Check that all containers are running:

```bash
docker ps
```

You should see 13 containers running:
- `mysql` (database)
- `phpmyadmin` (database management)
- `main-backend`, `main-frontend` (Main System)
- `staff-id-backend`, `staff-id-frontend` (Staff ID Module)
- `print-backend`, `print-frontend` (Print Service Module)
- `sticker-backend`, `sticker-frontend` (Sticker Module)
- `account-backend`, `account-frontend` (Student Account Module)

### 7. Access the Applications

Open your browser and navigate to:

- **Main System:** http://localhost:5173
- **Student Account:** http://localhost:5177
- **Print Service:** http://localhost:5175
- **Sticker Module:** http://localhost:5176
- **Staff ID Management:** http://localhost:5174
- **phpMyAdmin:** http://localhost:8080

**Default phpMyAdmin Login:**
- Server: `mysql`
- Username: `root`
- Password: (your DB_ROOT_PASSWORD from .env)

## Troubleshooting

### Problem: "Variable is not set" warnings

**Solution:** You didn't create the `.env` file in the root directory. Copy `.env.example` to `.env` and configure it.

### Problem: Containers fail to start

**Solution:**
1. Check if ports are already in use
2. Stop Docker containers: `docker compose down`
3. Start again: `docker compose up -d`

### Problem: "Connection refused" errors

**Solution:**
1. Wait 30-60 seconds for all services to initialize
2. Check container logs: `docker compose logs [service-name]`
3. Ensure module `.env` files have correct database credentials

### Problem: Database tables don't exist

**Solution:** Run the migration script:
```cmd
migrate-all.cmd
```

### Problem: "npm install" or "composer install" errors

**Solution:** The first startup automatically installs dependencies. If it fails:
1. Stop containers: `docker compose down`
2. Remove volumes: `docker volume prune -f`
3. Start again: `docker compose up -d --build`

## Project Structure

```
SiaOverAll/
├── main-system/              # Main Business Center System
│   ├── laravel-backend/      # Laravel API
│   └── react-frontend/       # React UI
├── student_account_module/   # Student Account Management
│   ├── backend/              # Laravel API
│   └── frontend/             # React UI
├── Student_print_module/     # Print Service System
│   ├── backend/              # Laravel API
│   └── frontend/             # React UI
├── Staff_Sticker_module/     # Sticker Management
│   ├── laravel-backend/      # Laravel API
│   └── react-frontend/       # React UI
├── staff_id_managament/      # Staff ID Generation
│   ├── backend/              # Laravel API
│   └── frontend/             # React UI
├── compose.yaml              # Docker Compose configuration
├── .env                      # Environment configuration (create from .env.example)
└── migrate-all.cmd           # Database migration script
```

## Default Credentials

After running migrations, you may need to seed default users. Check each module's documentation for seeder commands.

## Stopping the System

To stop all containers:
```bash
docker compose down
```

To stop and remove all data (including database):
```bash
docker compose down -v
```

## Updating the System

To pull latest changes and rebuild:
```bash
git pull
docker compose down
docker compose up -d --build
migrate-all.cmd
```

## Need Help?

- Check container logs: `docker compose logs [service-name]`
- View all logs: `docker compose logs -f`
- Restart a specific service: `docker compose restart [service-name]`
- Rebuild a service: `docker compose up -d --build [service-name]`

## Security Notes

- **Never commit `.env` files** to git (they're in `.gitignore`)
- **Change default passwords** in production
- **Use strong passwords** for database and phpMyAdmin
- The `.env.example` file shows the required format but uses placeholder values
