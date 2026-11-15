# Railway deployment configuration

This repository is a monorepo. Create one Railway project containing MySQL and
the ten web services listed below. The optional `student_account_module/api-server`
is not part of this deployment; the Laravel account backend is the supported API.

## Service build settings

For each service, set the Railway **Root Directory** and the variable
`RAILWAY_DOCKERFILE_PATH=Dockerfile.railway`. Railway otherwise chooses the
development `Dockerfile` in that directory.

| Service | Root Directory | Public domain |
| --- | --- | --- |
| main-backend | `/main-system/laravel-backend` | Yes |
| main-frontend | `/main-system/react-frontend` | Yes |
| staff-id-backend | `/staff_id_managament/backend` | Yes |
| staff-id-frontend | `/staff_id_managament/frontend` | Yes |
| print-backend | `/Student_print_module/backend` | Yes |
| print-frontend | `/Student_print_module/frontend` | Yes |
| sticker-backend | `/Staff_Sticker_module/backend` | Yes if used by a browser |
| sticker-frontend | `/Staff_Sticker_module/frontend` | Yes |
| account-backend | `/student_account_module/backend` | Yes |
| account-frontend | `/student_account_module/frontend` | Yes |

Set the healthcheck path to `/health` for every service. The production images
listen on Railway's injected `PORT`; do not set a fixed `PORT` yourself.

## Backend variables

Add the following to every Laravel backend, using Railway's Variables reference
picker for the actual MySQL service name (shown as `MySQL` below):

```env
APP_ENV=production
APP_DEBUG=false
APP_KEY=<a different result of php artisan key:generate --show for each backend>
APP_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
DB_CONNECTION=mysql
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_DATABASE=${{MySQL.MYSQLDATABASE}}
DB_USERNAME=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
LOG_CHANNEL=stderr
LOG_LEVEL=error
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
SESSION_SECURE_COOKIE=true
```

Assign a Railway Volume to every backend that accepts uploads. Mount it at
`/var/www/html/storage`. The container creates the required Laravel storage
directories and symbolic link on each startup.

Set `CORS_ALLOWED_ORIGINS` on each API to the comma-separated HTTPS public
domains of the frontends that call it. Do not use `*.railway.internal` in any
`VITE_*` variable: those domains only work server-to-server, not in a visitor's
browser.

## Frontend build variables

Vite embeds `VITE_*` variables during the Docker build. Add the appropriate
variables before deploying or redeploy after changing one. Every API value below
must be a public HTTPS backend domain.

| Frontend | Required variables |
| --- | --- |
| main-frontend | `VITE_API_URL`, `VITE_PRINT_API_URL`, `VITE_STAFF_ID_API_URL`, `VITE_STICKER_API_URL`, `VITE_STICKER_URL`, `VITE_STAFF_ID_URL`, `VITE_STUDENT_ACCOUNT_URL`, `VITE_STUDENT_REGISTER_URL` |
| staff-id-frontend | `VITE_API_URL`, `VITE_MAIN_SYSTEM_API_URL`, `VITE_MAIN_SYSTEM_URL` |
| print-frontend | `VITE_API_URL`, `VITE_MAIN_SYSTEM_URL`, `VITE_STUDENT_PORTAL_URL` |
| sticker-frontend | `VITE_API_URL`, `VITE_MAIN_SYSTEM_URL` |
| account-frontend | `VITE_API_URL`, `VITE_MAIN_SYSTEM_URL`, `VITE_MAIN_SYSTEM_API_URL`, `VITE_PRINT_API_URL`, `VITE_PRINT_FRONTEND_URL`, `VITE_ID_MANAGEMENT_API_URL` |

Use Railway reference variables where possible, for example:

```env
VITE_API_URL=https://${{account-backend.RAILWAY_PUBLIC_DOMAIN}}/api
VITE_MAIN_SYSTEM_URL=https://${{main-frontend.RAILWAY_PUBLIC_DOMAIN}}
```

## Database migration order

After MySQL and the five backend services have deployed, open each backend's
Railway shell and run the following exactly once, in order:

1. `php artisan migrate --force` in `main-backend`
2. `php artisan migrate --force` in `staff-id-backend`
3. `php artisan migrate --force` in `account-backend`
4. `php artisan migrate --force` in `print-backend`
5. `php artisan migrate --force` in `sticker-backend`

Do not use `railway/scripts/migrate-all.sh` from a deployed service: service
images contain only their own module, not the entire monorepo.

## Security release checks

- The old committed `main-system/laravel-backend/.env.railway` was removed.
  Generate and set a new `APP_KEY`; treat the old key as compromised.
- Keep all real `.env.railway` files out of Git.
- Generate public domains for all browser-called APIs and all frontends.
- Seed or create a strong production admin account; do not use documented demo
  credentials.
