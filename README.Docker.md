# Docker Setup for Sticker Module

This project uses Docker and Docker Compose to containerize the Laravel backend, React frontend, and MySQL database.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

## Quick Start

### 1. Build and Start All Services

```bash
docker-compose up -d --build
```

This command will:
- Build the Docker images for frontend and backend
- Pull the MySQL image
- Start all containers in detached mode

### 2. Access the Application

- **Frontend (React)**: http://localhost:3000
- **Backend (Laravel API)**: http://localhost:8000
- **MySQL Database**: localhost:3306

### 3. Stop All Services

```bash
docker-compose down
```

To stop and remove volumes (database data):
```bash
docker-compose down -v
```

## Individual Service Commands

### Backend (Laravel)

```bash
# View logs
docker logs sticker_module_backend

# Access container shell
docker exec -it sticker_module_backend bash

# Run artisan commands
docker exec -it sticker_module_backend php artisan migrate
docker exec -it sticker_module_backend php artisan cache:clear

# Run composer commands
docker exec -it sticker_module_backend composer install
```

### Frontend (React)

```bash
# View logs
docker logs sticker_module_frontend

# Rebuild frontend only
docker-compose up -d --build frontend
```

### Database (MySQL)

```bash
# Access MySQL shell
docker exec -it sticker_module_db mysql -u sticker_user -psticker_password sticker_module

# View logs
docker logs sticker_module_db

# Backup database
docker exec sticker_module_db mysqldump -u sticker_user -psticker_password sticker_module > backup.sql

# Restore database
docker exec -i sticker_module_db mysql -u sticker_user -psticker_password sticker_module < backup.sql
```

## Environment Configuration

### Backend Environment

The backend environment is configured in `docker-compose.yml`. To customize:

1. Copy `.env.example` to `.env` in the `laravel-backend` folder
2. Modify the `.env` file with your settings
3. Update `docker-compose.yml` to use env_file instead of environment variables

```yaml
backend:
  env_file:
    - ./laravel-backend/.env
```

### Frontend Environment

Create a `.env` file in `react-frontend` folder:

```
REACT_APP_API_URL=http://localhost:8000/api
```

## Development Mode

For development with hot-reloading:

### Backend Development

Replace the backend service in `docker-compose.yml`:

```yaml
backend:
  build:
    context: ./laravel-backend
    dockerfile: Dockerfile
  volumes:
    - ./laravel-backend:/var/www/html
  command: php artisan serve --host=0.0.0.0 --port=8000
```

### Frontend Development

Create a `Dockerfile.dev` in `react-frontend`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

Update docker-compose:

```yaml
frontend:
  build:
    context: ./react-frontend
    dockerfile: Dockerfile.dev
  volumes:
    - ./react-frontend:/app
    - /app/node_modules
```

## Troubleshooting

### Database Connection Issues

If the backend can't connect to the database:

```bash
# Check if database is healthy
docker ps

# View backend logs
docker logs sticker_module_backend

# Restart services
docker-compose restart backend
```

### Permission Issues (Laravel)

```bash
# Fix storage permissions
docker exec -it sticker_module_backend chown -R www-data:www-data /var/www/html/storage
docker exec -it sticker_module_backend chmod -R 775 /var/www/html/storage
```

### Clear All Docker Cache

```bash
# Remove all containers and volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Rebuild from scratch
docker-compose up -d --build --force-recreate
```

## Production Deployment

For production deployment:

1. Update environment variables in `docker-compose.yml`
2. Set `APP_DEBUG=false` for Laravel
3. Use secrets management for sensitive data
4. Set up proper SSL/TLS certificates
5. Configure proper backup strategy for database volume
6. Use a reverse proxy (nginx/traefik) for SSL termination

## Network Details

All services run on the `sticker_network` bridge network and can communicate using service names:
- Backend can be accessed at `http://backend`
- Database can be accessed at `db:3306`
- Frontend can be accessed at `http://frontend`

## Volume Management

Two persistent volumes are created:
- `db_data`: MySQL database storage
- `backend_storage`: Laravel storage folder

To backup volumes:

```bash
# Backup database volume
docker run --rm -v sticker-module_db_data:/data -v $(pwd):/backup alpine tar czf /backup/db_backup.tar.gz /data

# Backup storage volume
docker run --rm -v sticker-module_backend_storage:/data -v $(pwd):/backup alpine tar czf /backup/storage_backup.tar.gz /data
```
