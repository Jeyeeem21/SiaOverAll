# Sticker Module

A full-stack application for managing sticker requests with a React frontend and Laravel backend.

## Architecture

- **Frontend**: React 18 with React Router
- **Backend**: Laravel (PHP 8.2)
- **Database**: MySQL 8.0
- **Containerization**: Docker & Docker Compose

## Prerequisites

- Docker Desktop (for Windows)
- Docker Compose
- Git

## Quick Start with Docker

### 1. Clone the repository

```bash
git clone <repository-url>
cd STICKER-MODULE
```

### 2. Build and start all services

```bash
docker-compose up --build
```

This will:
- Start MySQL database on port 3306
- Start Laravel backend on port 8000
- Start React frontend on port 3000

### 3. Access the application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Database**: localhost:3306

### 4. Stop all services

```bash
docker-compose down
```

### 5. Stop and remove volumes (clean slate)

```bash
docker-compose down -v
```

## Docker Commands

### Build specific service

```bash
docker-compose build frontend
docker-compose build backend
```

### View logs

```bash
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Run migrations manually

```bash
docker-compose exec backend php artisan migrate
```

### Access backend container shell

```bash
docker-compose exec backend bash
```

### Rebuild and restart

```bash
docker-compose down
docker-compose up --build
```

## Development without Docker

### Backend Setup

```bash
cd laravel-backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

### Frontend Setup

```bash
cd react-frontend
npm install
cp .env.example .env
npm start
```

## Project Structure

```
STICKER-MODULE/
├── laravel-backend/          # Laravel API
│   ├── app/
│   ├── database/
│   ├── routes/
│   ├── Dockerfile
│   └── .dockerignore
├── react-frontend/           # React UI
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .dockerignore
├── docker-compose.yml        # Docker orchestration
└── .env.docker              # Docker environment variables
```

## Environment Variables

### Backend (.env)
- `DB_HOST`: Database host (default: `db` for Docker)
- `DB_DATABASE`: Database name
- `DB_USERNAME`: Database user
- `DB_PASSWORD`: Database password

### Frontend (.env)
- `REACT_APP_API_URL`: Backend API URL

## Features

- Sticker request management
- Request status tracking
- File attachments
- Admin and staff roles
- RESTful API
- Responsive UI

## API Endpoints

- `GET /api/stickers` - List all stickers
- `POST /api/stickers` - Create sticker
- `GET /api/sticker-requests` - List requests
- `POST /api/sticker-requests` - Create request
- `PUT /api/sticker-requests/{id}` - Update request
- `DELETE /api/sticker-requests/{id}` - Delete request

## Troubleshooting

### Port already in use

If ports 3000, 8000, or 3306 are already in use, modify the port mappings in `docker-compose.yml`:

```yaml
ports:
  - "3001:80"  # Frontend (change 3001 to any available port)
  - "8001:8000"  # Backend (change 8001 to any available port)
  - "3307:3306"  # Database (change 3307 to any available port)
```

### Database connection issues

Ensure the database service is healthy before the backend starts. The `docker-compose.yml` includes health checks.

### Permission issues (Linux/Mac)

```bash
sudo chown -R $USER:$USER laravel-backend/storage
sudo chown -R $USER:$USER laravel-backend/bootstrap/cache
```

## License

Proprietary
