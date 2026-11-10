# Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: phpMyAdmin "Access denied for user 'root'" Error

**Error Message:**
```
Cannot connect: invalid settings.
mysqli::real_connect(): (HY000/1045): Access denied for user 'root'@'172.21.0.9' (using password: YES)
```

**Root Cause:**
The MySQL password in the existing Docker volume doesn't match the default password (`RootPass123`).

**Solution A: Fresh Start (Recommended for Development)**

Delete all data and start fresh:

```cmd
# Stop all containers
docker compose down

# Remove MySQL data volume
docker volume rm integrated-system_mysql_data

# Start fresh
docker compose up -d

# Wait 2 minutes, then run migrations
migrate-all.cmd
```

**Solution B: Use Existing Password**

If you have important data and know the MySQL password:

1. Create `.env` file:
   ```cmd
   copy .env.example .env
   ```

2. Edit `.env` and set your actual password:
   ```env
   DB_ROOT_PASSWORD=YourActualPassword
   ```

3. Restart:
   ```cmd
   docker compose down
   docker compose up -d
   ```

**Solution C: Reset MySQL Password**

If you don't remember the password:

```cmd
# Stop containers
docker compose down

# Remove only MySQL data
docker volume rm integrated-system_mysql_data

# Start again
docker compose up -d
```

---

### Issue 2: "Container is unhealthy" Error

**Error Message:**
```
dependency failed to start: container integrated-system-mysql is unhealthy
```

**Solution:**

MySQL takes 1-2 minutes to initialize. Just wait:

```cmd
# Check MySQL logs
docker compose logs mysql

# Wait until you see:
# "MySQL init process done"
# "Server running on [http://0.0.0.0:8000]"

# Then start other services
docker compose up -d
```

---

### Issue 3: Sticker Backend Crashes

**Error Message:**
```
The /var/www/html/bootstrap/cache directory must be present and writable.
```

**Solution:**

Already fixed in latest code. Just pull and rebuild:

```cmd
git pull
docker compose down
docker compose up -d --build sticker-backend
```

---

### Issue 4: Port Already in Use

**Error Message:**
```
Error starting userland proxy: listen tcp 0.0.0.0:8000: bind: address already in use
```

**Solution A: Stop conflicting service**

```cmd
# Find what's using the port
netstat -ano | findstr :8000

# Kill the process (replace PID with actual number)
taskkill /PID 1234 /F
```

**Solution B: Use different ports**

Create `.env` file and change ports:

```env
MAIN_BACKEND_PORT=9000
MAIN_FRONTEND_PORT=6173
# etc...
```

---

### Issue 5: Frontend Shows Blank Page

**Symptoms:**
- Browser shows blank white page
- No errors in browser console
- Container is running

**Solution:**

Wait for npm dependencies to install (first run only):

```cmd
# Check frontend logs
docker compose logs main-frontend

# Wait until you see:
# "VITE ready in XXXms"
# "Local: http://localhost:5173"

# Then refresh browser
```

---

### Issue 6: Database Connection Refused

**Error in Laravel logs:**
```
SQLSTATE[HY000] [2002] Connection refused
```

**Solution:**

Wait for MySQL to be fully ready:

```cmd
# Check if MySQL is healthy
docker compose ps

# Should show:
# mysql ... Up (healthy)

# If showing "starting" or "unhealthy", wait 1-2 minutes
```

---

### Issue 7: Migration Fails

**Error:**
```
SQLSTATE[42S01]: Base table or view already exists
```

**Solution:**

Tables already exist. This is normal if you ran migrations before:

```cmd
# To start fresh:
docker compose down
docker volume rm integrated-system_mysql_data
docker compose up -d
# Wait 2 minutes
migrate-all.cmd
```

---

## Quick Reference Commands

**View all container status:**
```cmd
docker compose ps
```

**View logs for specific service:**
```cmd
docker compose logs [service-name]
docker compose logs -f [service-name]  # Follow logs
```

**Restart specific service:**
```cmd
docker compose restart [service-name]
```

**Rebuild specific service:**
```cmd
docker compose up -d --build [service-name]
```

**Stop everything:**
```cmd
docker compose down
```

**Stop and remove all data:**
```cmd
docker compose down -v
```

**Service Names:**
- `mysql` - Database
- `phpmyadmin` - Database management
- `main-backend` / `main-frontend`
- `staff-id-backend` / `staff-id-frontend`
- `print-backend` / `print-frontend`
- `sticker-backend` / `sticker-frontend`
- `account-backend` / `account-frontend`

---

## Getting Help

1. **Check logs first:**
   ```cmd
   docker compose logs
   ```

2. **Check container status:**
   ```cmd
   docker compose ps
   ```

3. **Check if ports are available:**
   ```cmd
   netstat -ano | findstr :8000
   netstat -ano | findstr :5173
   ```

4. **Nuclear option (start completely fresh):**
   ```cmd
   docker compose down -v
   docker compose up -d --build
   # Wait 2 minutes
   migrate-all.cmd
   ```

---

## Default Credentials

**Database:**
- Host: `localhost:3306`
- User: `root`
- Password: `RootPass123` (default)
- Database: `business_center`

**phpMyAdmin:**
- URL: http://localhost:8080
- Server: `mysql`
- User: `root`
- Password: `RootPass123` (default)

---

## Important Notes

1. **First run takes 5-10 minutes** - Docker needs to download images and install dependencies
2. **MySQL needs 1-2 minutes** to initialize on first run
3. **No .env file needed** - system works with defaults
4. **Data persists** in Docker volumes even after `docker compose down`
5. **Use `docker compose down -v`** to delete all data and start fresh
