# 🚀 Automated Deployment Guide

Deploy your integrated system to the cloud automatically via GitHub push!

## 📚 Table of Contents

1. [Quick Start](#quick-start)
2. [How It Works](#how-it-works)
3. [Platform Guides](#platform-guides)
4. [Workflows Included](#workflows-included)
5. [Troubleshooting](#troubleshooting)

---

## ⚡ Quick Start

### Prerequisites
- ✅ GitHub account
- ✅ Cloud platform account (Railway, Render, AWS, etc.)
- ✅ Git installed locally

### 5-Minute Setup

1. **Run setup wizard**:
```cmd
setup-github-deploy.cmd
```

2. **Create Railway account** (or other platform):
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

3. **Get Railway token**:
   - Visit [railway.app/account/tokens](https://railway.app/account/tokens)
   - Create token → Copy it

4. **Add token to GitHub**:
   - Go to your repo: `Settings` → `Secrets and variables` → `Actions`
   - New secret: `RAILWAY_TOKEN` = `<your-token>`

5. **Push to GitHub**:
```bash
git add .
git commit -m "Enable automated deployment"
git push origin main
```

6. **Watch it deploy**:
   - GitHub Actions: `https://github.com/<user>/<repo>/actions`
   - Railway Dashboard: `https://railway.app`

---

## 🎯 How It Works

### Deployment Flow

```
┌─────────────────┐
│  You push code  │
│   to GitHub     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ GitHub Actions  │ ← Workflow triggered automatically
│  starts build   │
└────────┬────────┘
         │
         ├─► Run tests (all backends)
         ├─► Build apps (all frontends)
         │
         ▼
┌─────────────────┐
│  Tests passed?  │
└────────┬────────┘
         │ YES
         ▼
┌─────────────────┐
│ Deploy to cloud │ ← 10 services deployed
│   (Railway)     │
└────────┬────────┘
         │
         ├─► Run migrations
         ├─► Clear caches
         │
         ▼
┌─────────────────┐
│  ✅ LIVE!       │
└─────────────────┘
```

### What Gets Deployed

Your system consists of **10 services**:

**Backend Services (5):**
1. Main Business Center Backend
2. Staff ID Management Backend
3. Student Print Module Backend
4. Staff Sticker Module Backend
5. Student Account Module Backend

**Frontend Services (5):**
1. Main Business Center Frontend
2. Staff ID Management Frontend
3. Student Print Module Frontend
4. Staff Sticker Module Frontend
5. Student Account Module Frontend

**Database:**
- MySQL (shared by all backends)

---

## 📋 Platform Guides

### Option 1: Railway (Recommended) 🚂

**Best for**: Simplicity, speed, all-in-one solution

**Documentation**: [GITHUB_DEPLOY_SETUP.md](GITHUB_DEPLOY_SETUP.md)

**Pros**:
- ✅ Easiest setup
- ✅ Built-in MySQL
- ✅ Automatic SSL
- ✅ Free $5/month credit

**Setup Time**: ~15 minutes

---

### Option 2: Render 🎨

**Best for**: More generous free tier

**Documentation**: [ALTERNATIVE_DEPLOY_PLATFORMS.md](ALTERNATIVE_DEPLOY_PLATFORMS.md#2--render)

**Pros**:
- ✅ Free web services
- ✅ Auto-deploy from GitHub
- ✅ Simple dashboard

**Setup Time**: ~20 minutes

---

### Option 3: AWS ☁️

**Best for**: Enterprise, full control, scaling

**Documentation**: [ALTERNATIVE_DEPLOY_PLATFORMS.md](ALTERNATIVE_DEPLOY_PLATFORMS.md#3-️-aws-amazon-web-services)

**Pros**:
- ✅ Highly scalable
- ✅ Full infrastructure control
- ✅ Many services available

**Setup Time**: ~1-2 hours

---

### Option 4: Other Platforms

See [ALTERNATIVE_DEPLOY_PLATFORMS.md](ALTERNATIVE_DEPLOY_PLATFORMS.md) for:
- Azure
- Google Cloud Platform (GCP)
- DigitalOcean
- Fly.io

---

## 🤖 Workflows Included

### 1. `test-and-deploy.yml` (Main Workflow)

**Triggers**: Push to `main` or `develop` branch

**What it does**:
- ✅ Tests all PHP backends
- ✅ Builds all React frontends
- 🚀 Deploys to Railway (only on `main`)
- 🗄️ Runs database migrations
- 🧹 Clears application caches

**Usage**:
```bash
git push origin main  # Triggers full deployment
```

---

### 2. `deploy-railway.yml` (Manual Deployment)

**Triggers**: Manual trigger from GitHub Actions tab

**What it does**:
- 🚀 Deploys all services immediately
- 🗄️ Runs migrations
- ⚡ Skips tests (for emergency deploys)

**Usage**:
1. Go to GitHub repo → `Actions` tab
2. Select `Deploy to Railway`
3. Click `Run workflow`
4. Select branch → `Run workflow`

---

### 3. `build-and-push-docker.yml` (Docker Images)

**Triggers**: Push to `main` or `production` branch

**What it does**:
- 🐳 Builds Docker images for all services
- 📦 Pushes to GitHub Container Registry
- 💾 Caches layers for faster builds

**Usage**: Images available at:
```
ghcr.io/<your-username>/integrated-system-main-backend:latest
ghcr.io/<your-username>/integrated-system-main-frontend:latest
# ... and 8 more services
```

---

## 🔧 Configuration Files

### `.github/workflows/`
GitHub Actions workflow definitions

### `railway.config.json`
Railway-specific configuration

### `Dockerfile.railway`
Production Dockerfiles (one in each service folder)

### `.env.railway.example`
Example environment variables for production

---

## 🔐 Security Checklist

Before deploying to production:

- [ ] All `.env` files added to `.gitignore`
- [ ] Secrets stored in GitHub Secrets (not in code)
- [ ] `APP_DEBUG=false` in production
- [ ] Strong `APP_KEY` generated for Laravel
- [ ] Database credentials secure
- [ ] CORS configured correctly
- [ ] SSL certificates enabled
- [ ] Regular security updates scheduled

---

## 🐛 Troubleshooting

### Deployment Failed

**Problem**: GitHub Actions shows red ❌

**Solution**:
1. Click on failed workflow
2. Read error messages
3. Common fixes:
   - Missing `RAILWAY_TOKEN` secret
   - Service not created in Railway
   - Wrong Dockerfile path
   - Environment variables missing

---

### Services Not Starting

**Problem**: Services deployed but not responding

**Solution**:
1. Check Railway logs (click service → Logs)
2. Verify environment variables
3. Check database connection
4. Ensure migrations ran successfully

---

### Database Connection Failed

**Problem**: "SQLSTATE[HY000] [2002] Connection refused"

**Solution**:
1. Verify `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
2. Ensure MySQL service is running
3. Check if services can reach database (network settings)

---

### Build Timeout

**Problem**: GitHub Actions times out during build

**Solution**:
1. Use Docker layer caching (already configured)
2. Split large services into smaller ones
3. Use pre-built base images
4. Consider using self-hosted runners for faster builds

---

### Migration Errors

**Problem**: "Migration table not found" or "Column already exists"

**Solution**:
```bash
# SSH into Railway service or run command
php artisan migrate:fresh --force  # ⚠️ WARNING: Deletes all data!
# OR
php artisan migrate:rollback
php artisan migrate --force
```

---

## 📊 Monitoring Your Deployment

### GitHub Actions Dashboard
Monitor all deployments:
```
https://github.com/<username>/<repo>/actions
```

### Railway Dashboard
View service status, logs, metrics:
```
https://railway.app/project/<project-id>
```

### Health Checks
Add to your Laravel routes:
```php
// routes/api.php
Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'timestamp' => now()
    ]);
});
```

---

## 🎓 Best Practices

### Branch Strategy

```
main (production)      → Deploys automatically
├─ develop (staging)   → Tests only (optional staging deploy)
└─ feature/*          → Tests only
```

### Commit Messages

```bash
git commit -m "feat: Add user authentication"      # New feature
git commit -m "fix: Resolve login bug"             # Bug fix
git commit -m "deploy: Update production env vars" # Deployment
git commit -m "docs: Update README"                # Documentation
```

### Environment Variables

**Development** (`.env`):
```env
APP_ENV=local
APP_DEBUG=true
DB_HOST=mysql
```

**Production** (Railway environment variables):
```env
APP_ENV=production
APP_DEBUG=false
DB_HOST=<railway-mysql-host>
```

---

## 📞 Getting Help

### Documentation
- **Railway**: [GITHUB_DEPLOY_SETUP.md](GITHUB_DEPLOY_SETUP.md)
- **Other Platforms**: [ALTERNATIVE_DEPLOY_PLATFORMS.md](ALTERNATIVE_DEPLOY_PLATFORMS.md)
- **Security**: [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md)

### Support Resources
- [Railway Discord](https://discord.gg/railway)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Laravel Deployment](https://laravel.com/docs/deployment)
- [Vite Production Build](https://vitejs.dev/guide/build.html)

---

## ✅ Quick Reference

### Deploy to Production
```bash
git add .
git commit -m "deploy: Production update"
git push origin main
```

### Manual Deploy (Emergency)
1. Go to GitHub Actions
2. Run workflow: "Deploy to Railway"

### Check Deployment Status
1. GitHub: Check Actions tab
2. Railway: Check dashboard

### Rollback (if needed)
```bash
# In Railway dashboard
# Click service → Deployments → Click previous deployment → Rollback
```

---

## 🎉 You're Ready!

Your automated deployment pipeline is configured. Every push to `main` will:
1. ✅ Test your code
2. 🚀 Deploy all 10 services
3. 🗄️ Update databases
4. ✨ Make it live

**Now push your code and watch the magic happen!**

```bash
git push origin main
```

Then visit your GitHub Actions tab to watch the deployment! 🚀
