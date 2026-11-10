# Business Center System

An integrated multi-module system for managing business center operations at Mindoro State University – Bongabong Campus.

## 🚀 Quick Start

**New Installation? Start Here:**

1. Clone the repository
2. Copy `.env.example` to `.env` and configure database password
3. Run `docker compose up -d`
4. Run `migrate-all.cmd` to set up databases
5. Access http://localhost:5173

**📖 Full setup instructions:** See [SETUP_GUIDE.md](SETUP_GUIDE.md)

## 📦 Modules

This system consists of 5 integrated modules:

### 1. **Main System** (Port 5173)
- Student order management
- Product catalog
- Shopping cart and checkout
- Order tracking

### 2. **Student Account Module** (Port 5177)
- Student registration and authentication
- Order history
- Profile management
- Digital wallet

### 3. **Print Service Module** (Port 5175)
- Print job submission
- Document upload
- Print queue management
- Payment processing

### 4. **Sticker Module** (Port 5176)
- Custom sticker orders
- Design upload
- Size and quantity selection
- Order tracking

### 5. **Staff ID Management** (Port 5174)
- Staff ID generation
- Student records management
- ID card printing
- Data export

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

The system uses environment variables for configuration. Main configuration file is `.env` at the root level.

**Important environment variables:**

- `DB_ROOT_PASSWORD` - MySQL root password
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
- Solution: Create `.env` file from `.env.example`

**Problem: Containers won't start**
- Solution: Check if ports are available, run `docker compose down` then `docker compose up -d`

**Problem: Database connection errors**
- Solution: Ensure `.env` passwords match module `.env` files

**Problem: Frontend shows blank page**
- Solution: Wait 30-60 seconds for npm dependencies to install on first run

For more troubleshooting, see [SETUP_GUIDE.md](SETUP_GUIDE.md)

## 📞 Support

For issues or questions:
- Check logs: `docker compose logs [service-name]`
- Review setup guide: [SETUP_GUIDE.md](SETUP_GUIDE.md)
- Contact system administrators

---

**Note:** This system is designed for development using Docker. For production deployment, additional configuration and security measures are required.
