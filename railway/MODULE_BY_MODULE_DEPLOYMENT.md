# Module-by-module Railway deployment runbook

Use this order in a Railway **staging** environment first, then repeat it in production.

For a backend-only, click-by-click checklist, see
[`BACKEND_DEPLOYMENT_STEP_BY_STEP.txt`](BACKEND_DEPLOYMENT_STEP_BY_STEP.txt).

## Architecture to deploy

Deploy nine application services plus one shared Railway MySQL service:

```text
Browser
  ├─ Main frontend ───────────► Main API
  ├─ Staff ID frontend ───────► Staff ID API, Main API
  ├─ Student Print frontend ──► Print API
  ├─ Staff Sticker frontend ──► Student Account API
  └─ Student Account frontend ► Account API, Main API, Print API, Staff ID API

All Laravel APIs ─────────────► one shared MySQL database
Account API ─ private network ► Main API (server-to-server only)
```

Do **not** deploy `Staff_Sticker_module/backend` for the current integration.
It has no API routes. The Sticker frontend is already wired to the Student
Account API, so deploying that backend would only add cost.

## 0. Pre-deployment

1. Sign in to Railway, click **New Project**, choose an empty project, and name
   it something recognizable, such as `integrated-system-staging`.
2. Use Railway’s default environment as staging, or create a separate
   environment named `staging` in Project Settings. Do not begin with your
   live production data.
3. Connect your GitHub account when Railway asks for repository access.
4. Commit and push the current changes to the Git branch Railway will deploy.
5. Keep all real `.env` files and keys out of Git.
6. Create a distinct Laravel `APP_KEY` for each backend:

   ```powershell
   php artisan key:generate --show
   ```

7. Use these exact Railway service names: `main-backend`, `account-backend`,
   `staff-id-backend`, `print-backend`, `main-frontend`, `staff-id-frontend`,
   `print-frontend`, `sticker-frontend`, and `account-frontend`.

### What “service name” means in Railway

A Railway **service** is one running application. This project needs nine
services, but they all come from the **same GitHub repository**. Do not create
nine GitHub repositories and do not create nine Railway projects.

When Railway creates a service, it may give it a random name. Rename it before
adding integration variables. The name must be exact because the Account API
uses the internal address of `main-backend`.

### Click-by-click: create one application service

Repeat these exact clicks for each row in the service table below:

1. Open your Railway project canvas.
2. Click **+ New**.
3. Click **GitHub Repo**.
4. Select the `integrated-system` repository and the branch you pushed.
5. Railway creates one new service. Click that service card.
6. Open the service **Settings** tab.
7. In **General**, change **Service Name** to the required exact name.
8. In **Build**, set **Root Directory** to the directory shown in the table.
9. Go to the **Variables** tab and add:

   ```env
   RAILWAY_DOCKERFILE_PATH=Dockerfile.railway
   ```

10. Return to **Settings**. In **Healthcheck**, set the path to `/health`.
11. Add the service-specific variables described later in this guide.
12. Click **Deploy** / **Redeploy** after all settings and variables are saved.
13. When deployment succeeds, go to **Settings** → **Networking** →
    **Generate Domain**. Copy the resulting domain into a temporary note. You
    will use it in the frontend and CORS variables.

An initial automatic deployment may fail before you finish Steps 7–11. That is
normal; use **Redeploy** only after the configuration is complete.

### Service creation table

| Create this exact service | Select this same GitHub repo | Root Directory | Deploy it? |
| --- | --- | --- | --- |
| `main-backend` | `integrated-system` | `/main-system/laravel-backend` | Yes |
| `account-backend` | `integrated-system` | `/student_account_module/backend` | Yes |
| `staff-id-backend` | `integrated-system` | `/staff_id_managament/backend` | Yes |
| `print-backend` | `integrated-system` | `/Student_print_module/backend` | Yes |
| `main-frontend` | `integrated-system` | `/main-system/react-frontend` | Yes |
| `staff-id-frontend` | `integrated-system` | `/staff_id_managament/frontend` | Yes |
| `print-frontend` | `integrated-system` | `/Student_print_module/frontend` | Yes |
| `sticker-frontend` | `integrated-system` | `/Staff_Sticker_module/frontend` | Yes |
| `account-frontend` | `integrated-system` | `/student_account_module/frontend` | Yes |
| `sticker-backend` | `integrated-system` | `/Staff_Sticker_module/backend` | **No** |

Do not create the last row. It is shown only so it is clear why the Sticker
folder has a backend but the current production architecture does not use it.

## 1. Shared database — create it first

1. In the same Railway project canvas, click **+ New** → **Database** →
   **MySQL**.
2. Wait for it to finish deployment. Do not change its generated database
   password.
3. Rename this service to `MySQL` if you want to use the variable examples in
   this document exactly. Otherwise keep its name and use Railway’s variable
   reference picker whenever this guide says `MySQL`.
4. Keep MySQL private. Do not enable a public TCP proxy for normal application
   use.
5. Do not manually type database host, port, user, or password. The Railway
   variable picker supplies the correct values to each backend.

## 2. Common backend setup

Create the four backend services below from the same Git repository. For each:

- Set the listed **Root Directory**.
- Add `RAILWAY_DOCKERFILE_PATH=Dockerfile.railway`.
- Set healthcheck path to `/health`.
- Generate a public domain, because browser-based React apps call these APIs.
- Add this baseline variable set, replacing each placeholder:

```env
APP_ENV=production
APP_DEBUG=false
APP_KEY=<unique-key-for-this-backend>
APP_URL=https://<this-backend-public-domain>
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

| Service | Root Directory | Railway Volume |
| --- | --- | --- |
| `main-backend` | `/main-system/laravel-backend` | Add if this module accepts uploads |
| `account-backend` | `/student_account_module/backend` | Required at `/var/www/html/storage` |
| `staff-id-backend` | `/staff_id_managament/backend` | Required at `/var/www/html/storage` |
| `print-backend` | `/Student_print_module/backend` | Required at `/var/www/html/storage` |

### Exact backend setup procedure

For `main-backend`, then repeat for `account-backend`, `staff-id-backend`, and
`print-backend`:

1. Create the service using the click-by-click procedure above.
2. Confirm the Root Directory is correct. A typo, wrong capitalization, or
   selecting the repository root will make Railway build the wrong module.
3. In **Variables**, add `RAILWAY_DOCKERFILE_PATH=Dockerfile.railway`.
4. Add the baseline variable block. For `APP_KEY`, paste only that backend’s
   own key. For database fields, click the Railway reference picker and select
   the matching variable from the `MySQL` service.
5. In **Networking**, generate a domain and copy it. Return to Variables and
   set `APP_URL` to `https://` plus that domain.
6. For `account-backend`, `staff-id-backend`, and `print-backend`, open the
   **Volumes** section and create/attach a Volume at exactly:

   ```text
   /var/www/html/storage
   ```

7. Set Healthcheck Path to `/health`.
8. Redeploy, open the **Deployments** logs, and wait for a successful state.
9. Open `https://<generated-domain>/health` in a browser. Continue only when
   it displays `healthy`.

Do not add frontend `VITE_*` variables to backend services. They belong only
to their matching frontend services.

For `account-backend`, also add these private server-to-server URLs:

```env
CORE_API_URL=http://${{main-backend.RAILWAY_PRIVATE_DOMAIN}}:${{main-backend.PORT}}/api
MAIN_SYSTEM_API_URL=http://${{main-backend.RAILWAY_PRIVATE_DOMAIN}}:${{main-backend.PORT}}/api
```

Deploy all four APIs and test `https://<api-domain>/health`. It must return
`healthy` before proceeding.

## 3. Migrate the shared database

For each item below, click that service card, open **Shell**, wait for the
terminal prompt, then run this command once:

```bash
php artisan migrate --force
```

1. `main-backend`
2. `staff-id-backend`
3. `account-backend`
4. `print-backend`

Do not run migrations automatically at service startup, and do not use
`railway/scripts/migrate-all.sh` within a deployed service.

## 4. Deploy the frontends

For **every** frontend: add `RAILWAY_DOCKERFILE_PATH=Dockerfile.railway`, set
healthcheck path to `/health`, generate a public domain, then set its Vite
variables before deployment. Vite embeds these values at build time, so redeploy
the frontend after any URL change.

### Exact frontend setup procedure

For every frontend module:

1. Create it from the same `integrated-system` GitHub repository.
2. Rename it exactly as specified in its heading below.
3. Set the specified Root Directory.
4. Add `RAILWAY_DOCKERFILE_PATH=Dockerfile.railway`.
5. Set Healthcheck Path to `/health`.
6. Generate its public domain under Networking and write it down.
7. Add its `VITE_*` variables shown below, using the actual public domains of
   the APIs and other frontends. Every URL starts with `https://`.
8. Redeploy after saving variables. Do not use `railway.internal` in any Vite
   variable—Vite variables are used in a visitor’s browser.
9. Verify `https://<frontend-domain>/health` responds with `healthy`.

You may create all five frontend services first, generate all their domains,
then paste values and deploy them. This avoids having to redeploy repeatedly
while waiting for another frontend domain.

### Main System — `main-frontend`

Root Directory: `/main-system/react-frontend`

```env
VITE_API_URL=https://<main-backend-domain>/api
VITE_PRINT_API_URL=https://<print-backend-domain>/api/v1
VITE_STAFF_ID_API_URL=https://<staff-id-backend-domain>/api
VITE_STICKER_API_URL=https://<account-backend-domain>/api
VITE_STICKER_URL=https://<sticker-frontend-domain>
VITE_STAFF_ID_URL=https://<staff-id-frontend-domain>
VITE_STUDENT_ACCOUNT_URL=https://<account-frontend-domain>
VITE_STUDENT_REGISTER_URL=https://<account-frontend-domain>/register
```

### Staff ID Management — `staff-id-frontend`

Root Directory: `/staff_id_managament/frontend`

```env
VITE_API_URL=https://<staff-id-backend-domain>/api
VITE_MAIN_SYSTEM_API_URL=https://<main-backend-domain>/api
VITE_MAIN_SYSTEM_URL=https://<main-frontend-domain>
```

### Student Print — `print-frontend`

Root Directory: `/Student_print_module/frontend`

```env
VITE_API_URL=https://<print-backend-domain>/api/v1
VITE_MAIN_SYSTEM_URL=https://<main-frontend-domain>
VITE_STUDENT_PORTAL_URL=https://<account-frontend-domain>
```

### Staff Sticker — `sticker-frontend`

Root Directory: `/Staff_Sticker_module/frontend`

```env
VITE_API_URL=https://<account-backend-domain>/api
VITE_MAIN_SYSTEM_URL=https://<main-frontend-domain>
```

### Student Account — `account-frontend`

Root Directory: `/student_account_module/frontend`

```env
VITE_API_URL=https://<account-backend-domain>/api
VITE_MAIN_SYSTEM_URL=https://<main-frontend-domain>
VITE_MAIN_SYSTEM_API_URL=https://<main-backend-domain>/api
VITE_PRINT_API_URL=https://<print-backend-domain>/api/v1
VITE_PRINT_FRONTEND_URL=https://<print-frontend-domain>
VITE_ID_MANAGEMENT_API_URL=https://<staff-id-backend-domain>/api
```

## 5. Configure CORS after all frontend domains exist

Set this variable on **each of the four APIs**, replacing each placeholder with
the generated public HTTPS domain. Do not include a trailing slash.

```env
CORS_ALLOWED_ORIGINS=https://<main-frontend-domain>,https://<staff-id-frontend-domain>,https://<print-frontend-domain>,https://<sticker-frontend-domain>,https://<account-frontend-domain>
```

Redeploy the APIs after changing CORS. Never put `localhost` or
`*.railway.internal` in browser-facing `VITE_*` variables; those addresses do
not work for a visitor’s browser.

### What to do if the browser reports a CORS error

1. Copy the **Origin** shown in the browser console error.
2. Confirm it exactly appears in `CORS_ALLOWED_ORIGINS` on the API that failed.
3. Ensure it begins with `https://` and has no path or ending slash.
4. Save the variable and redeploy that API.
5. Hard-refresh the browser page and test again.

## 6. Staging integration test

1. Confirm all nine public services return `healthy` at `/health`.
2. Open the Main frontend and verify data loads from the Main API.
3. Follow Main navigation links to Staff ID, Sticker, and Student Account.
4. Register or log in to Student Account; test profile changes and a small file upload.
5. Submit a print request and confirm it appears in the Print workflow.
6. Submit a sticker request and confirm it appears in the Sticker workflow.
7. Test a Staff ID creation/upload flow.
8. In browser developer tools, confirm no requests go to `localhost` or
   `railway.internal`, and no CORS errors are reported.
9. Redeploy an upload-capable backend and confirm files remain available.
10. Replace every demo/default administrator credential before production.

## 7. Production promotion

Repeat the same configuration in production with new secrets, database, public
domains, and volumes. Deploy in this order:

1. MySQL
2. Main, Account, Staff ID, and Print APIs
3. Migrations
4. Frontends
5. CORS update and final browser tests

Do not copy a staging `APP_KEY`, database password, or Volume into production
without intentionally planning that transfer.
