# ⚡ Quick Start: Deploy in 5 Minutes

The fastest way to get your integrated system deployed to the cloud!

---

## 🎯 Goal

Go from local development to live production with automated deployments via GitHub.

---

## ⏱️ Time Required

- **Setup**: 5-10 minutes (one-time)
- **Each Deploy**: Automatic (10-15 minutes)

---

## 📋 Prerequisites

✅ Git installed  
✅ GitHub account  
✅ Code ready to deploy  

---

## 🚀 Step-by-Step

### 1️⃣ Create Railway Account (2 minutes)

Go to: **https://railway.app**

- Click "Start a New Project"
- Sign up with GitHub
- Create a new empty project
- Name it: "integrated-system"

---

### 2️⃣ Get Your Railway Token (1 minute)

Go to: **https://railway.app/account/tokens**

- Click "Create Token"
- Name: "GitHub Actions Deploy"
- **Copy the token** (save it temporarily)

---

### 3️⃣ Add Token to GitHub (2 minutes)

Go to your GitHub repository:

```
https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions
```

- Click **"New repository secret"**
- Name: `RAILWAY_TOKEN`
- Value: *[Paste your Railway token]*
- Click **"Add secret"**

✅ Done!

---

### 4️⃣ Push to GitHub (1 minute)

In your project folder:

```bash
# Verify files are ready
git status

# Add all files
git add .

# Commit
git commit -m "Add automated deployment via GitHub Actions"

# Push to trigger deployment
git push origin main
```

---

### 5️⃣ Watch It Deploy! (10-15 minutes)

**View Progress:**

1. Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/actions`
2. Click on the running workflow
3. Watch each step execute live:
   - ✅ Testing backends
   - ✅ Building frontends
   - ✅ Deploying services
   - ✅ Running migrations

**Meanwhile, check Railway:**

1. Go to: `https://railway.app`
2. Open your project
3. Watch services appear automatically!

---

## ✅ Verification

### Check Deployment Success

**In GitHub Actions:**
- ✅ All steps show green checkmarks
- ✅ "Deployment completed successfully!" message

**In Railway Dashboard:**
- ✅ 10 services appear
- ✅ All show "Active" status
- ✅ Each has a URL assigned

---

## 🎉 You're Live!

Your application is now deployed! Every future push to `main` will automatically deploy.

---

## 🔧 What Was Created?

### GitHub Actions Workflows
```
.github/
└── workflows/
    ├── test-and-deploy.yml         (Main workflow)
    ├── deploy-railway.yml          (Manual/emergency)
    └── build-and-push-docker.yml   (Docker images)
```

### Configuration Files
```
railway.config.json                 (Railway settings)
```

### Documentation
```
GITHUB_DEPLOY_SETUP.md              (Detailed Railway guide)
ALTERNATIVE_DEPLOY_PLATFORMS.md     (Other platforms)
README_DEPLOYMENT.md                (Quick reference)
PRE_DEPLOY_CHECKLIST.md            (Pre-deploy checklist)
GITHUB_AUTODEPLOY_SUMMARY.md        (Complete overview)
```

---

## 🎮 Usage After Setup

### Deploy Changes

```bash
# Make your changes
git add .
git commit -m "Your changes"
git push origin main

# ✨ Automatically deploys!
```

### Manual Deploy (Emergency)

1. Go to GitHub → Actions tab
2. Select "Deploy to Railway"
3. Click "Run workflow"
4. Select branch → Run

---

## 📊 What Gets Deployed?

### Your 10 Services

**Backends (5):**
1. Main Business Center API
2. Staff ID Management API
3. Student Print Module API
4. Staff Sticker Module API
5. Student Account Module API

**Frontends (5):**
1. Main Business Center UI
2. Staff ID Management UI
3. Student Print Module UI
4. Staff Sticker Module UI
5. Student Account Module UI

**Database:**
- MySQL (shared by all backends)

---

## ⚙️ Next Steps (Optional)

### 1. Configure Environment Variables

In Railway Dashboard, for each backend service:

**Required:**
```env
APP_ENV=production
APP_DEBUG=false
APP_KEY=[Generate: php artisan key:generate --show]
DB_HOST=[Railway MySQL host]
DB_DATABASE=[Your database name]
DB_USERNAME=[Database user]
DB_PASSWORD=[Database password]
```

### 2. Configure Frontend URLs

In Railway Dashboard, for each frontend service:

**Example for main-frontend:**
```env
VITE_API_URL=https://main-backend.railway.app/api
VITE_PRINT_API_URL=https://print-backend.railway.app/api/v1
VITE_STAFF_ID_API_URL=https://staff-id-backend.railway.app/api
# ... etc
```

### 3. Setup Custom Domains (Optional)

1. In Railway, click service → Settings
2. Add your custom domain
3. Update DNS records (Railway shows you what to add)
4. SSL certificate auto-generated!

---

## 🐛 Troubleshooting

### Deployment Failed?

**Check GitHub Actions logs:**
```
GitHub → Actions tab → Click failed workflow → Read error
```

**Common Issues:**

| Problem | Solution |
|---------|----------|
| "RAILWAY_TOKEN not found" | Add token to GitHub Secrets (Step 3) |
| "Service not found" | Railway will auto-create on first deploy |
| "Build failed" | Check Dockerfile.railway exists |
| "Tests failed" | Fix failing tests, then push again |

### Services Not Starting?

**Check Railway logs:**
```
Railway Dashboard → Click service → View logs
```

**Common Fixes:**
- Add missing environment variables
- Check database connection settings
- Verify CORS configuration

---

## 📚 Learn More

- **Detailed Setup**: [GITHUB_DEPLOY_SETUP.md](GITHUB_DEPLOY_SETUP.md)
- **Other Platforms**: [ALTERNATIVE_DEPLOY_PLATFORMS.md](ALTERNATIVE_DEPLOY_PLATFORMS.md)
- **Full Overview**: [README_DEPLOYMENT.md](README_DEPLOYMENT.md)
- **Pre-Deploy Check**: [PRE_DEPLOY_CHECKLIST.md](PRE_DEPLOY_CHECKLIST.md)

---

## 🎊 Success!

You now have:

✅ **Automated deployments** - Push to deploy  
✅ **Continuous testing** - No broken code in production  
✅ **All services live** - 10 services + database  
✅ **Professional setup** - Production-grade CI/CD  
✅ **Easy rollback** - One-click if needed  

---

## 💡 Pro Tips

### Development Workflow
```bash
# Work on feature branch
git checkout -b feature/my-feature
git commit -m "Add feature"
git push origin feature/my-feature

# Create Pull Request → Tests run automatically
# Merge to main → Auto-deploys to production
```

### Monitor Deployments
```
Bookmark these:
- GitHub Actions: github.com/USER/REPO/actions
- Railway Dashboard: railway.app
```

### Keep Documentation Handy
```bash
# Quick deployment reference
cat README_DEPLOYMENT.md

# Check before deploying
cat PRE_DEPLOY_CHECKLIST.md

# Setup verification
setup-github-deploy.cmd
```

---

## 🔥 That's It!

You're now set up for professional automated deployments!

**Next push to `main` = automatic production deployment** 🚀

---

**Questions?** Check the detailed guides in the documentation files!

**Ready to deploy?** Just push your code! 🎉
