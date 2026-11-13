# 🚂 Railway Deployment Guide
## Business Center Integrated System

**Last Updated:** November 13, 2026

---

## 📋 Overview

This directory contains Railway production deployment configuration for the Business Center Integrated System - a multi-module Laravel + React application.

**Architecture:** 11 services in ONE Railway project
- 1 MySQL Database (Railway Managed Addon)
- 5 Backend APIs (Laravel - Private networking)
- 5 Frontend Apps (React - Public access)

---

## 🚀 Quick Start

### Prerequisites
```bash
# 1. Railway CLI installed
npm i -g @railway/cli

# 2. Railway account created
# Visit: https://railway.app

# 3. Git repository ready
git remote -v  # Should show your repo
```

### One-Command Deploy
```bash
# From project root
cd c:\DockerProjects\integrated-system

# Login to Railway
railway login

# Create project and deploy
railway init

# Add MySQL
railway add mysql

# Deploy all services (see DEPLOYMENT_GUIDE.md for details)
```

---

## 📁 Directory Structure

```
railway/
├── README.md                      # This file
├── env-templates/                 # Environment variable templates
│   ├── main-backend.env
│   ├── staff-id-backend.env
│   ├── print-backend.env
│   ├── sticker-backend.env
│   ├── account-backend.env
│   ├── main-frontend.env
│   ├── staff-id-frontend.env
│   ├── print-frontend.env
│   ├── sticker-frontend.env
│   └── account-frontend.env
├── scripts/                       # Deployment scripts
│   ├── migrate-all.sh             # Run all migrations
│   ├── seed-admin.sh              # Seed admin accounts
│   └── healthcheck.sh             # Health check all services
└── docs/                          # Documentation
    ├── DEPLOYMENT_GUIDE.md        # Full deployment guide
    ├── POST_DEPLOYMENT.md         # Post-deployment tasks
    └── TROUBLESHOOTING.md         # Common issues & fixes
```

---

## 📦 Services Overview

### Backend Services (Private)
| Service | Port | Root Directory | Volume |
|---------|------|----------------|--------|
| main-backend | 8000 | /main-system/laravel-backend | No |
| staff-id-backend | 8000 | /staff_id_managament/backend | Yes (3GB) |
| print-backend | 8000 | /Student_print_module/backend | Yes (10GB) |
| sticker-backend | 8000 | /Staff_Sticker_module/backend | No |
| account-backend | 8000 | /student_account_module/backend | Yes (5GB) |

**Note:** All backends expose port 8000 internally, Railway assigns external ports.

### Frontend Services (Public)
| Service | Port | Root Directory |
|---------|------|----------------|
| main-frontend | 8080 | /main-system/react-frontend |
| staff-id-frontend | 8080 | /staff_id_managament/frontend |
| print-frontend | 8080 | /Student_print_module/frontend |
| sticker-frontend | 8080 | /Staff_Sticker_module/frontend |
| account-frontend | 8080 | /student_account_module/frontend |

**Note:** All frontends expose port 8080, Railway assigns public URLs.

---

## 🔧 Configuration Files

### Production Dockerfiles
Each service has its own `Dockerfile.railway`:
```
**/backend/Dockerfile.railway     # Laravel production build
**/frontend/Dockerfile.railway    # React production build
```

### Docker Configurations
Each backend has supporting configs:
```
**/backend/docker/
  ├── nginx.conf                   # Nginx configuration
  ├── php.ini                      # PHP production settings
  └── supervisord.conf             # Process manager
```

Each frontend has:
```
**/frontend/docker/
  └── nginx.conf                   # Nginx for static serving
```

---

## 🗄️ Database Configuration

### MySQL Database
- **Provider:** Railway Managed MySQL 8.0
- **Database Name:** business_center
- **Shared:** All 5 backends use the same database

### Connection Details (Auto-injected by Railway)
```env
DB_CONNECTION=mysql
DB_HOST=${MYSQL_HOST}
DB_PORT=${MYSQL_PORT}
DB_DATABASE=${MYSQL_DATABASE}
DB_USERNAME=${MYSQL_USER}
DB_PASSWORD=${MYSQL_PASSWORD}
```

### Migrations
Migrations must be run in order:
1. main-backend (creates base tables)
2. staff-id-backend
3. account-backend (sticker dependencies)
4. print-backend
5. sticker-backend

Use: `bash railway/scripts/migrate-all.sh`

---

## 📝 Environment Variables

### Backend Environment Variables
See `railway/env-templates/*-backend.env` for complete list.

**Key variables:**
```env
APP_ENV=production
APP_DEBUG=false
APP_KEY=            # Generate with: php artisan key:generate
APP_URL=            # Railway internal URL
CORS_ALLOWED_ORIGINS= # All frontend URLs
LOG_CHANNEL=stderr
```

### Frontend Environment Variables
See `railway/env-templates/*-frontend.env` for complete list.

**Key variables:**
```env
VITE_API_URL=       # Backend Railway internal URL
VITE_*_URL=         # Other frontend public URLs
```

---

## 🔐 Security

### Secrets Management
- ✅ Never commit .env files
- ✅ Use Railway environment variables
- ✅ Generate unique APP_KEY per backend
- ✅ Use strong database passwords

### Network Security
- ✅ Backends are private (not publicly accessible)
- ✅ Frontends are public (user-facing)
- ✅ CORS properly configured
- ✅ SSL/TLS automatic (Railway)

---

## 💾 File Storage (Railway Volumes)

### Services with File Uploads
| Service | Mount Point | Size | Purpose |
|---------|-------------|------|---------|
| account-backend | /var/www/html/storage | 5GB | Avatars, verifications, sticker docs |
| print-backend | /var/www/html/storage | 10GB | Print files, payment proofs |
| staff-id-backend | /var/www/html/storage | 3GB | Student photos, signatures |

**Railway automatically persists these volumes.**

---

## 🚦 Health Checks

All services have health check endpoints:

### Backend Health
```bash
curl https://main-backend.railway.internal/api/health
# Response: {"status":"healthy","service":"Business Center","timestamp":"..."}
```

### Frontend Health
```bash
curl https://main-frontend.up.railway.app/health
# Response: healthy
```

---

## 📊 Monitoring

### Railway Dashboard
Monitor in Railway dashboard:
- Service status
- Logs (real-time)
- Metrics (CPU, Memory)
- Deployments history

### Log Access
```bash
# Via Railway CLI
railway logs --service main-backend
railway logs --service main-frontend --follow
```

---

## 💰 Cost Estimation

### Monthly Cost (Railway Pro Plan)
```
MySQL Database:              $3-5
Backends without volumes (2): $6-10
Backends with volumes (3):    $12-18
Frontend services (5):        $10-15
---
Total Estimated:             $31-48/month
```

**Actual costs depend on usage.**

---

## 🔗 Useful Links

- [Railway Documentation](https://docs.railway.app)
- [Railway CLI Reference](https://docs.railway.app/develop/cli)
- [Laravel Deployment](https://laravel.com/docs/deployment)
- [Vite Production Build](https://vitejs.dev/guide/build.html)

---

## 📞 Support

For deployment issues:
1. Check `railway/docs/TROUBLESHOOTING.md`
2. Review Railway logs: `railway logs --service <name>`
3. Check health endpoints
4. Review environment variables

---

## 🎯 Next Steps

1. ✅ Review this README
2. 📖 Read `docs/DEPLOYMENT_GUIDE.md`
3. 🚀 Follow deployment steps
4. ✔️ Run post-deployment checklist
5. 🎉 Go live!

---

**Good luck with your deployment!** 🚂✨
