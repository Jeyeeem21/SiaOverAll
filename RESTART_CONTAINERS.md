# Restart Containers to Pick Up New Dependencies

The following containers need to be restarted to install the new `react-router-dom` dependency:

## Option 1: Restart Specific Containers (Recommended)

```bash
# Restart Student Print Module Frontend
docker compose restart print-frontend

# Restart Staff ID Module Frontend  
docker compose restart staff-id-frontend

# Restart Staff Sticker Module Frontend
docker compose restart sticker-frontend

# Restart Student Account Module Frontend
docker compose restart account-frontend
```

## Option 2: Rebuild Containers (If restart doesn't work)

```bash
# Stop and remove containers, then rebuild
docker compose down print-frontend staff-id-frontend sticker-frontend account-frontend
docker compose up -d print-frontend staff-id-frontend sticker-frontend account-frontend
```

## Option 3: Force Reinstall Dependencies

```bash
# Remove the node_modules volumes and restart
docker volume rm integrated-system_print_node_modules
docker volume rm integrated-system_staff_id_node_modules  
docker volume rm integrated-system_sticker_node_modules
docker volume rm integrated-system_account_node_modules

# Then restart the containers
docker compose up -d print-frontend staff-id-frontend sticker-frontend account-frontend
```

## Why is this needed?

When we run `npm install` locally, it updates `package.json` and `package-lock.json`, but Docker containers use named volumes for `node_modules`. The container needs to run `npm ci` to install the updated dependencies into its volume.

The container startup command includes:
```bash
if [ ! -x node_modules/.bin/vite ]; then npm ci; fi
```

This checks if vite is executable, and if not, runs `npm ci`. However, when dependencies are added, we need to force a reinstall.
