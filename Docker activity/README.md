# Docker Activity

This Compose project runs the Student Account application as a local development
stack connected to the source folders in the parent project.

## Services

| Service | Container | URL |
| --- | --- | --- |
| React/Vite | `docker-activity-react` | http://localhost:3000 |
| Node.js API | `docker-activity-nodejs` | http://localhost:3002 |
| Laravel/PHP | `docker-activity-laravel` | http://localhost:8080 |
| phpMyAdmin | `docker-activity-phpmyadmin` | http://localhost:8081 |
| MySQL | `docker-activity-mysql` | localhost:3306 |

## Start

From this directory:

```powershell
docker compose up -d --build
```

Check service health:

```powershell
docker compose ps
docker compose logs -f nodejs laravel
```

Stop the stack without deleting database data:

```powershell
docker compose down
```

The source directories are mounted into the containers, so code changes remain
in the main project:

- `../frontend`
- `../api-server`
- `../backend`
