# Business Center System

An integrated multi-module system for managing business center operations at Mindoro State University – Bongabong Campus.

## 🚀 Quick Start

**New Installation? Three simple steps:**

```bash
# 1. Clone the repository
git clone [your-repo-url]
cd integrated-system

# 2. Start all services (wait 2-3 minutes for first-time dependency installation)
docker compose up -d

# 3. Run database migrations
migrate-all.cmd         # Windows
# OR
./migrate-all.sh        # Linux/Mac

# 4. Access the system
# Main System: http://localhost:5173
```

**That's it!** No `.env` file needed - system uses sensible defaults.

**Want to customize?** Copy `.env.example` to `.env` and change ports/passwords.

**📖 Full setup instructions:** See [SETUP_GUIDE.md](SETUP_GUIDE.md)

## 📦 Modules

This system consists of 5 integrated modules:

### 1. **Main System** (Port 5173)
- Student order management
- Product catalog
- Shopping cart and checkout
- Order tracking
- Integration hub for all modules

### 2. **Staff ID Management** (Port 5174)
- Staff ID generation
- Student records management
- ID card printing
- Data export

### 3. **Print Service Module** (Port 5175)
- Print job submission
- Document upload
- Print queue management
- Payment processing

### 4. **Sticker Module** (Port 5176) ⭐ NEW
- Custom sticker request submission
- Staff sticker workflow management
- Request tracking and status updates
- Size and quantity management

### 5. **Student Account Module** (Port 5177)
- Student registration and authentication
- Order history and tracking
- Profile management
- Digital wallet
- Sticker request data storage

## 🛠️ Technology Stack

- **Frontend:** React 18 + Vite + TailwindCSS
- **Backend:** Laravel 11 (PHP 8.3)
- **Database:** MySQL 8.0
- **Containerization:** Docker & Docker Compose
- **Database Management:** phpMyAdmin

## 📋 Requirements

- Docker Desktop (Windows/Mac/Linux)
- Git
- 8GB RAM minimum
- 10GB free disk space

## 🌐 Access Points

After running `docker compose up -d`:

| Service | URL | Description |
|---------|-----|-------------|
| Main System | http://localhost:5173 | Primary student interface |
| Student Account | http://localhost:5177 | Account management |
| Print Service | http://localhost:5175 | Print job submission |
| Sticker Module | http://localhost:5176 | Custom stickers |
| Staff ID Management | http://localhost:5174 | Staff administration |
| phpMyAdmin | http://localhost:8080 | Database management |

## 🔧 Development Commands

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs -f [service-name]

# Rebuild specific service
docker compose up -d --build [service-name]

# Run migrations
migrate-all.cmd  # Windows
./migrate-all.sh # Linux/Mac

# Restart specific service
docker compose restart [service-name]
```

## 📝 Configuration

The system works out-of-the-box with sensible defaults! No `.env` file needed.

**Default Configuration:**
- Database password: `RootPass123`
- Database name: `business_center`
- Frontend ports: 5173-5177
- Backend ports: 8000-8004
- All services run on `localhost`

**Want to customize?** Create a `.env` file from `.env.example` and override any values:

**Important environment variables:**

- `DB_ROOT_PASSWORD` - MySQL root password (default: RootPass123)
- `DB_DATABASE` - Database name (default: business_center)
- `LOCAL_HOST` - Hostname (default: localhost)
- Port configurations for each service

See `.env.example` for all available options.

## 🗄️ Database Structure

Single MySQL database (`business_center`) shared across all modules:

- **orders** - Main order records
- **products** - Product catalog
- **categories** - Product categories
- **users** - User accounts
- **print_orders** - Print service jobs
- **sticker_orders** - Sticker orders
- **staff_ids** - Staff ID records

## 🔒 Security

- Environment files (`.env`) are gitignored
- Database passwords must be changed from defaults
- CORS configured for local development
- Production deployment requires additional security measures

## 🤝 Contributing

This is an academic project for Mindoro State University. For contributions or issues, please contact the development team.

## 📄 License

© 2026 Mindoro State University – Bongabong Campus | Business Center System

## 🆘 Troubleshooting

**Problem: "Variable is not set" warnings**
- Solution: This is normal without a `.env` file. System uses defaults automatically. Warnings can be ignored.

**Problem: phpMyAdmin "Access denied for user 'root'"**
- Solution: Delete MySQL data and start fresh: `docker compose down && docker volume rm integrated-system_mysql_data && docker compose up -d`

**Problem: Want custom ports or passwords**
- Solution: Create `.env` file from `.env.example` and customize values

**Problem: Containers won't start**
- Solution: Check if ports are available, run `docker compose down` then `docker compose up -d`

**Problem: Database connection errors**
- Solution: Wait 30-60 seconds for MySQL to fully initialize on first run

**Problem: Frontend shows blank page**
- Solution: Wait 2-3 minutes for npm dependencies to install on first run (check logs: `docker compose logs [service-name]`)

**Problem: First run is slow**
- Expected: First run takes 2-3 minutes to install Composer and npm dependencies for all 5 modules

**📘 Full troubleshooting guide:** See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed solutions to all common issues.

**📋 Before pushing to Git:** See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

## 📞 Support

For issues or questions:
- Check logs: `docker compose logs [service-name]`
- Review setup guide: [SETUP_GUIDE.md](SETUP_GUIDE.md)
- Contact system administrators

---

**Note:** This system is designed for development using Docker. For production deployment, additional configuration and security measures are required.
