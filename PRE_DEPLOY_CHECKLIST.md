# ✅ Pre-Deployment Checklist

Use this checklist before pushing to production.

## 📋 Repository Setup

- [ ] Git repository initialized
- [ ] GitHub repository created
- [ ] Local repo connected to GitHub: `git remote add origin <url>`
- [ ] `.gitignore` properly configured
- [ ] No sensitive files (`.env`, credentials) in git history

## 🔐 Security

- [ ] All `.env` files contain no real credentials
- [ ] `.env.example` files created as templates
- [ ] `APP_DEBUG=false` will be set in production
- [ ] Strong passwords generated for production database
- [ ] Laravel `APP_KEY` will be generated for production
- [ ] CORS origins configured for production URLs
- [ ] No API keys or secrets in code

## 🐳 Docker Configuration

- [ ] All services have `Dockerfile.railway`
- [ ] Dockerfiles tested locally
- [ ] Environment variables documented in `.env.example`
- [ ] Docker builds complete without errors

**Verify Dockerfiles exist:**
```
✓ main-system/laravel-backend/Dockerfile.railway
✓ main-system/react-frontend/Dockerfile.railway
✓ staff_id_managament/backend/Dockerfile.railway
✓ staff_id_managament/frontend/Dockerfile.railway
✓ Student_print_module/backend/Dockerfile.railway
✓ Student_print_module/frontend/Dockerfile.railway
✓ Staff_Sticker_module/backend/Dockerfile.railway
✓ Staff_Sticker_module/frontend/Dockerfile.railway
✓ student_account_module/backend/Dockerfile.railway
✓ student_account_module/frontend/Dockerfile.railway
```

## 🤖 GitHub Actions

- [ ] `.github/workflows/` directory exists
- [ ] Workflow files are present:
  - [ ] `test-and-deploy.yml`
  - [ ] `deploy-railway.yml`
  - [ ] `build-and-push-docker.yml`
- [ ] Workflow syntax is valid (no YAML errors)

## ☁️ Railway Setup (or other platform)

- [ ] Cloud platform account created
- [ ] Deployment token obtained
- [ ] Token added to GitHub Secrets as `RAILWAY_TOKEN`
- [ ] MySQL database created (or will be auto-created)
- [ ] Services will be created on first deploy

## 🗄️ Database

- [ ] Migrations are up to date
- [ ] Migrations tested locally
- [ ] Seeders prepared (if needed)
- [ ] Database backup strategy planned

## 🔧 Environment Variables

### Required for ALL Backend Services:
- [ ] `APP_ENV=production`
- [ ] `APP_DEBUG=false`
- [ ] `APP_KEY=<generate-with-artisan>`
- [ ] `DB_CONNECTION=mysql`
- [ ] `DB_HOST=<railway-or-cloud-host>`
- [ ] `DB_PORT=3306`
- [ ] `DB_DATABASE=<your-database-name>`
- [ ] `DB_USERNAME=<your-db-username>`
- [ ] `DB_PASSWORD=<your-db-password>`

### Required for ALL Frontend Services:
- [ ] `VITE_API_URL=<backend-url>`
- [ ] Other service-specific VITE_ variables

### Main Backend Additional:
- [ ] `CORS_ALLOWED_ORIGINS=<frontend-urls>`

### Student Account Backend Additional:
- [ ] `FRONTEND_URL=<account-frontend-url>`
- [ ] `CORE_API_URL=<main-backend-internal-url>`
- [ ] `MAIN_SYSTEM_API_URL=<main-backend-url>`

## 🧪 Testing

- [ ] All services start locally with `docker compose up`
- [ ] Can access all frontends locally
- [ ] Can access all backend APIs locally
- [ ] Database connections work locally
- [ ] Cross-service communication works (e.g., account → main API)

## 📝 Documentation

- [ ] README.md updated
- [ ] GITHUB_DEPLOY_SETUP.md reviewed
- [ ] Environment variable documentation complete
- [ ] Deployment URLs documented

## 🚀 Pre-Push

- [ ] Run `setup-github-deploy.cmd` to verify setup
- [ ] All changes committed locally
- [ ] Commit messages are clear
- [ ] No debugging code left in (console.log, dd(), var_dump())

## 📤 First Deployment

### Step-by-Step:

1. **Verify everything above is checked** ✅

2. **Commit final changes**:
```bash
git add .
git commit -m "deploy: Prepare for production deployment"
```

3. **Push to GitHub**:
```bash
git push origin main
```

4. **Monitor deployment**:
   - GitHub: `https://github.com/<username>/<repo>/actions`
   - Railway: `https://railway.app`

5. **After deployment, verify**:
   - [ ] All services are running
   - [ ] Frontends are accessible
   - [ ] APIs return responses
   - [ ] Database migrations completed
   - [ ] CORS is working (no console errors)

6. **Configure domains** (optional):
   - [ ] Custom domains added in Railway
   - [ ] DNS configured
   - [ ] SSL certificates active

7. **Test production**:
   - [ ] Can access all frontend applications
   - [ ] Can login to all systems
   - [ ] Database operations work
   - [ ] Cross-module navigation works

## 🔥 Emergency Rollback Plan

If something goes wrong:

### Option 1: Rollback in Railway
1. Go to Railway Dashboard
2. Click affected service
3. Go to "Deployments" tab
4. Click previous working deployment
5. Click "Rollback"

### Option 2: Revert Git Commit
```bash
git revert HEAD
git push origin main
```

### Option 3: Manual Redeploy
1. Go to GitHub Actions
2. Select "Deploy to Railway" workflow
3. Run workflow with last known good commit

## 📞 Emergency Contacts

- **Railway Support**: https://railway.app/help
- **GitHub Support**: https://support.github.com
- **Your Team Lead**: [Add contact]

## ⚠️ Common Issues & Quick Fixes

### Issue: Services won't start
**Fix**: Check environment variables in Railway dashboard

### Issue: Database connection failed
**Fix**: Verify DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD

### Issue: CORS errors
**Fix**: Update CORS_ALLOWED_ORIGINS with actual frontend URLs

### Issue: Build timeout
**Fix**: Check Dockerfile.railway, may need to optimize

### Issue: Migration errors
**Fix**: SSH into service: `railway run php artisan migrate:fresh --force` (⚠️ deletes data)

## 🎯 Success Criteria

Your deployment is successful when:

- ✅ All 10 services show "Active" status
- ✅ All frontends load without errors
- ✅ All backend APIs respond to health checks
- ✅ Database migrations completed
- ✅ Can login to all systems
- ✅ Cross-module links work
- ✅ No CORS errors in browser console
- ✅ SSL certificates active (if using custom domains)

## 📊 Post-Deployment

- [ ] Monitor logs for errors (first 30 minutes)
- [ ] Test all critical user flows
- [ ] Verify email functionality (if applicable)
- [ ] Check performance metrics
- [ ] Document any issues encountered
- [ ] Update team on deployment status

---

## 🎉 Ready to Deploy?

If all items are checked:

```bash
git add .
git commit -m "deploy: Production ready"
git push origin main
```

**Then watch it deploy at**: `https://github.com/<username>/<repo>/actions`

Good luck! 🚀
