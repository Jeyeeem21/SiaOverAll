# GitHub Automated Deployment Setup

This guide will help you set up automated deployment to Railway via GitHub Actions.

## 🎯 Overview

When you push code to GitHub, the system will automatically:
1. ✅ Run tests on all backend services
2. ✅ Build all frontend applications
3. 🚀 Deploy all 10 services to Railway
4. 🗄️ Run database migrations
5. 🧹 Clear application caches

## 📋 Prerequisites

1. GitHub repository for your project
2. Railway account with project created
3. Railway CLI installed locally (optional for setup)

## 🔧 Setup Instructions

### Step 1: Get Your Railway Token

1. Go to [Railway Dashboard](https://railway.app/account/tokens)
2. Click **"Create Token"**
3. Give it a name like `GitHub Actions Deployment`
4. Copy the token (you'll need this in the next step)

### Step 2: Add Railway Token to GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Name: `RAILWAY_TOKEN`
5. Value: Paste your Railway token
6. Click **"Add secret"**

### Step 3: Create Railway Services (One-time setup)

You need to create services in Railway for each component. Run these commands locally:

```bash
# Login to Railway
railway login

# Link to your Railway project
railway link

# Create services
railway service create main-backend
railway service create main-frontend
railway service create staff-id-backend
railway service create staff-id-frontend
railway service create print-backend
railway service create print-frontend
railway service create sticker-backend
railway service create sticker-frontend
railway service create account-backend
railway service create account-frontend
```

### Step 4: Configure Service Settings in Railway

For each **backend** service in Railway Dashboard:

1. Go to service → **Settings**
2. **Root Directory**: Set to the appropriate path:
   - `main-backend` → `main-system/laravel-backend`
   - `staff-id-backend` → `staff_id_managament/backend`
   - `print-backend` → `Student_print_module/backend`
   - `sticker-backend` → `Staff_Sticker_module/backend`
   - `account-backend` → `student_account_module/backend`

3. **Dockerfile Path**: `Dockerfile.railway`

4. **Environment Variables**: Add these to each backend:
   ```
   APP_ENV=production
   APP_DEBUG=false
   APP_KEY=<generate using: php artisan key:generate --show>
   DB_CONNECTION=mysql
   DB_HOST=<your-railway-mysql-host>
   DB_PORT=3306
   DB_DATABASE=<your-database-name>
   DB_USERNAME=<your-db-username>
   DB_PASSWORD=<your-db-password>
   ```

For each **frontend** service in Railway Dashboard:

1. Go to service → **Settings**
2. **Root Directory**: Set to the appropriate path:
   - `main-frontend` → `main-system/react-frontend`
   - `staff-id-frontend` → `staff_id_managament/frontend`
   - `print-frontend` → `Student_print_module/frontend`
   - `sticker-frontend` → `Staff_Sticker_module/frontend`
   - `account-frontend` → `student_account_module/frontend`

3. **Dockerfile Path**: `Dockerfile.railway`

4. **Environment Variables**: Add appropriate VITE_ variables for each frontend

### Step 5: Setup MySQL Database in Railway

1. In Railway, click **"+ New"** → **"Database"** → **"MySQL"**
2. Railway will automatically provision a MySQL database
3. Copy the connection details and update your backend services' environment variables

### Step 6: Push to GitHub

```bash
# Add all files
git add .

# Commit changes
git commit -m "Add GitHub Actions deployment workflow"

# Push to main branch (triggers deployment)
git push origin main
```

## 🚀 How It Works

### Automatic Deployment Flow

1. **Push to `main` branch** → Triggers full test + deploy workflow
2. **Push to `develop` branch** → Only runs tests (no deployment)
3. **Pull Request** → Runs tests to verify code quality

### GitHub Actions Workflows

#### `test-and-deploy.yml` (Main Workflow)
- Runs on every push to `main` or `develop`
- Tests all backends and builds all frontends
- Deploys to Railway only on `main` branch pushes
- Runs migrations after deployment

#### `deploy-railway.yml` (Manual Deployment)
- Can be triggered manually from GitHub Actions tab
- Useful for emergency deployments
- Deploys all services without running tests

## 📊 Monitoring Deployment

### View Deployment Status

1. Go to your GitHub repository
2. Click **"Actions"** tab
3. See the status of your deployment workflow

### Check Railway Logs

1. Go to [Railway Dashboard](https://railway.app)
2. Select your project
3. Click on any service to view logs

## 🔍 Troubleshooting

### Deployment Failed

**Check GitHub Actions logs:**
1. Go to Actions tab
2. Click on the failed workflow
3. Review the error messages

**Common issues:**

| Issue | Solution |
|-------|----------|
| `RAILWAY_TOKEN` not found | Add token to GitHub Secrets (Step 2) |
| Service not found | Create services in Railway (Step 3) |
| Migration failed | Check database connection in Railway |
| Build failed | Check Dockerfile.railway exists in each service |

### Manual Deployment Trigger

If automatic deployment fails, you can manually trigger it:

1. Go to **Actions** tab in GitHub
2. Select **"Deploy to Railway"** workflow
3. Click **"Run workflow"**
4. Select branch and click **"Run workflow"**

## 🔐 Security Best Practices

✅ **DO:**
- Keep `RAILWAY_TOKEN` in GitHub Secrets only
- Use different tokens for production and staging
- Rotate tokens periodically (every 90 days)
- Use environment variables for all sensitive data

❌ **DON'T:**
- Never commit `.env` files with real credentials
- Don't share Railway tokens
- Don't use production tokens in development

## 🎛️ Environment-Specific Deployments

### Setup Staging Environment

Create a separate Railway project for staging:

```bash
# Create staging project in Railway
# Add RAILWAY_TOKEN_STAGING to GitHub Secrets

# Modify workflow to deploy to staging on develop branch
```

### Branch Strategy

- `main` → Production deployment
- `develop` → Staging deployment (optional)
- Feature branches → Run tests only

## 📝 Additional Configuration

### Customize Deployment

Edit `.github/workflows/test-and-deploy.yml` to:
- Add more tests
- Change deployment conditions
- Add notification integrations (Slack, Discord)
- Run additional post-deployment scripts

### Add Health Checks

Add health check endpoints to verify deployment:

```yaml
- name: Health Check
  run: |
    curl -f https://your-app.railway.app/health || exit 1
```

## 🆘 Support

If you encounter issues:

1. Check [Railway Documentation](https://docs.railway.app)
2. Review [GitHub Actions Documentation](https://docs.github.com/actions)
3. Check Railway service logs for detailed error messages
4. Verify all environment variables are set correctly

## ✅ Deployment Checklist

Before first deployment, ensure:

- [ ] Railway account created
- [ ] Railway token added to GitHub Secrets
- [ ] All 10 services created in Railway
- [ ] MySQL database provisioned in Railway
- [ ] Root directories configured for all services
- [ ] Environment variables set for all services
- [ ] Dockerfile.railway exists in each service folder
- [ ] `.env.railway.example` reviewed and variables added to Railway
- [ ] GitHub repository connected
- [ ] Initial push to `main` branch successful

---

**🎉 Once setup is complete, every push to `main` will automatically deploy your entire integrated system to Railway!**
