# 🚀 Complete Deployment Guide - Railway

**Your integrated system deployment from start to finish.**

---

## 📚 Table of Contents

1. [Overview](#overview)
2. [Deployment Order](#deployment-order)
3. [Quick Reference](#quick-reference)
4. [Detailed Guides](#detailed-guides)
5. [CORS Configuration](#cors-configuration)
6. [Verification](#verification)

---

## 🎯 Overview

You're deploying a complete integrated system with:
- **5 Backend APIs** (Laravel/PHP)
- **5 Frontend Apps** (React/Vite)
- **1 MySQL Database** (shared)

**Total: 11 services on Railway**

---

## 📋 Deployment Order

Follow this exact order:

### Phase 1: Database
1. ✅ Create MySQL database in Railway
2. ✅ Note down connection details

### Phase 2: Backends (DONE ✅)
You mentioned you've completed:
- ✅ Main Backend
- ✅ Staff ID Backend
- ✅ Print Backend
- ✅ Sticker Backend
- ✅ Account Backend

### Phase 3: Frontends (DO NOW 👈)
**Read:** [FRONTEND_DEPLOYMENT_RAILWAY.md](FRONTEND_DEPLOYMENT_RAILWAY.md)

Deploy these 5 services:
1. Main Frontend
2. Staff ID Frontend
3. Print Frontend
4. Sticker Frontend
5. Account Frontend

### Phase 4: CORS Configuration (AFTER FRONTENDS 👈)
**Read:** [CORS_CONFIGURATION_CHECKLIST.md](CORS_CONFIGURATION_CHECKLIST.md)

After all frontends have Railway domains:
1. Collect all 5 frontend domains
2. Add `CORS_ALLOWED_ORIGINS` to all 5 backends
3. Redeploy all 5 backends

---

## ⚡ Quick Reference

### Frontend Deployment Steps

For **EACH** of the 5 frontends:

1. **Create Service in Railway**
   - Click "+ New" → "Empty Service"
   - Name it (e.g., `main-frontend`)

2. **Configure Settings**
   - Root Directory: (see table below)
   - Dockerfile Path: `Dockerfile.railway`

3. **Add Environment Variables**
   - Add all required `VITE_*` variables
   - Use backend Railway URLs

4. **Deploy**
   - Click "Deploy"
   - Wait for completion
   - Note the public domain

### Root Directories

| Service | Root Directory |
|---------|----------------|
| main-frontend | `main-system/react-frontend` |
| staff-id-frontend | `staff_id_managament/frontend` |
| print-frontend | `Student_print_module/frontend` |
| sticker-frontend | `Staff_Sticker_module/frontend` |
| account-frontend | `student_account_module/frontend` |

---

## 🔗 Detailed Guides

### For Frontend Deployment
📖 **[FRONTEND_DEPLOYMENT_RAILWAY.md](FRONTEND_DEPLOYMENT_RAILWAY.md)**

Complete step-by-step guide including:
- How to create each frontend service
- Required environment variables for each
- Root directory paths
- Troubleshooting tips

### For CORS Configuration
✅ **[CORS_CONFIGURATION_CHECKLIST.md](CORS_CONFIGURATION_CHECKLIST.md)**

Quick checklist for:
- Collecting frontend domains
- Building CORS string correctly
- Adding to all backends
- Verification steps

### For GitHub Auto-Deploy (Future)
🤖 **[START_HERE.md](START_HERE.md)** → Points to all GitHub deployment docs

After manual Railway deployment works, you can set up automated deployment via GitHub push.

---

## 🔧 CORS Configuration

### After All Frontends Are Deployed

**Step 1:** Collect domains from Railway:
```
Main Frontend:       https://_____.up.railway.app
Staff ID Frontend:   https://_____.up.railway.app
Print Frontend:      https://_____.up.railway.app
Sticker Frontend:    https://_____.up.railway.app
Account Frontend:    https://_____.up.railway.app
```

**Step 2:** Build CORS string:
```env
CORS_ALLOWED_ORIGINS=https://main.up.railway.app,https://staff-id.up.railway.app,https://print.up.railway.app,https://sticker.up.railway.app,https://account.up.railway.app
```

**⚠️ Rules:**
- ✅ Use `https://`
- ✅ No trailing slash `/`
- ✅ Commas only (no spaces)
- ❌ Never use `localhost`

**Step 3:** Add to ALL 5 backends:

| Backend | Variable | Also Add |
|---------|----------|----------|
| main-backend | `CORS_ALLOWED_ORIGINS=...` | - |
| staff-id-backend | `CORS_ALLOWED_ORIGINS=...` | - |
| print-backend | `CORS_ALLOWED_ORIGINS=...` | - |
| sticker-backend | `CORS_ALLOWED_ORIGINS=...` | - |
| account-backend | `CORS_ALLOWED_ORIGINS=...` | `FRONTEND_URL=<account-frontend-url>` |

**Step 4:** Redeploy all 5 backends

---

## ✅ Verification Checklist

### After Frontend Deployment

- [ ] All 5 frontends show "Active" in Railway
- [ ] Each frontend has a public domain
- [ ] Can open each frontend URL in browser
- [ ] Frontends load (even if API calls fail)

### After CORS Configuration

- [ ] All 5 backends have `CORS_ALLOWED_ORIGINS` set
- [ ] All 5 backends redeployed
- [ ] All 5 backends show "Active"
- [ ] Open main frontend in browser
- [ ] Press F12 (browser console)
- [ ] No CORS errors visible
- [ ] Can login successfully
- [ ] Can navigate between modules
- [ ] All features working

---

## 📊 Your Complete Architecture

```
┌─────────────────────────────────────────────────┐
│               USER BROWSER                      │
└─────────────┬───────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────┐
│         5 FRONTEND APPS (React/Vite)            │
├─────────────────────────────────────────────────┤
│ • Main Frontend      (Nginx + Static Files)     │
│ • Staff ID Frontend  (Nginx + Static Files)     │
│ • Print Frontend     (Nginx + Static Files)     │
│ • Sticker Frontend   (Nginx + Static Files)     │
│ • Account Frontend   (Nginx + Static Files)     │
└─────────────┬───────────────────────────────────┘
              │ HTTPS API Calls (CORS Protected)
              ▼
┌─────────────────────────────────────────────────┐
│         5 BACKEND APIs (Laravel/PHP)            │
├─────────────────────────────────────────────────┤
│ • Main Backend       (Port 8000)                │
│ • Staff ID Backend   (Port 8000)                │
│ • Print Backend      (Port 8000)                │
│ • Sticker Backend    (Port 8000)                │
│ • Account Backend    (Port 8000)                │
└─────────────┬───────────────────────────────────┘
              │ Database Connections
              ▼
┌─────────────────────────────────────────────────┐
│         1 MYSQL DATABASE                        │
│         (Shared by all backends)                │
└─────────────────────────────────────────────────┘
```

---

## 🎯 Current Status

Based on your message, you have:

✅ **Phase 1: Database** - Complete  
✅ **Phase 2: Backends** - Complete (all 5)  
📋 **Phase 3: Frontends** - **DO NOW**  
⏳ **Phase 4: CORS** - After Phase 3  

---

## 📝 What You Need to Do Now

### 1. Deploy Frontends (30-60 minutes)

**Follow:** [FRONTEND_DEPLOYMENT_RAILWAY.md](FRONTEND_DEPLOYMENT_RAILWAY.md)

For each of the 5 frontends:
- Create service in Railway
- Configure root directory
- Add environment variables
- Deploy and wait
- Copy the Railway domain

### 2. Configure CORS (10 minutes)

**Follow:** [CORS_CONFIGURATION_CHECKLIST.md](CORS_CONFIGURATION_CHECKLIST.md)

- Collect all 5 frontend domains
- Build CORS string
- Add to all 5 backends
- Redeploy all backends

### 3. Test Everything (15 minutes)

- Open main frontend
- Check browser console (F12)
- Test login
- Test navigation
- Test all features

---

## 🐛 Common Issues

### Issue: Frontend Build Fails

**Check:**
- Does `Dockerfile.railway` exist in frontend folder?
- Is Root Directory path correct?
- Check Railway logs for specific error

**Fix:** Review [FRONTEND_DEPLOYMENT_RAILWAY.md](FRONTEND_DEPLOYMENT_RAILWAY.md) troubleshooting section

---

### Issue: Frontend Shows Blank Page

**Check:**
- Are environment variables set correctly?
- Is `VITE_API_URL` pointing to correct backend?
- Check browser console for errors

**Fix:** Verify all `VITE_*` variables in Railway settings

---

### Issue: CORS Errors in Console

**Error:** `Access to fetch at '...' has been blocked by CORS policy`

**Check:**
- Is `CORS_ALLOWED_ORIGINS` set on backend?
- Does it include exact frontend domain?
- Was backend redeployed after adding variable?

**Fix:** Follow [CORS_CONFIGURATION_CHECKLIST.md](CORS_CONFIGURATION_CHECKLIST.md) exactly

---

### Issue: API Returns 404 or 500

**Check:**
- Is backend actually running? (Check Railway)
- Is database connected? (Check backend logs)
- Are migrations run? (Check backend logs)

**Fix:** Check backend service logs in Railway for details

---

## 📞 Support Resources

### Documentation Files
- **Frontend Deploy:** [FRONTEND_DEPLOYMENT_RAILWAY.md](FRONTEND_DEPLOYMENT_RAILWAY.md)
- **CORS Setup:** [CORS_CONFIGURATION_CHECKLIST.md](CORS_CONFIGURATION_CHECKLIST.md)
- **GitHub Auto-Deploy:** [START_HERE.md](START_HERE.md)

### External Resources
- **Railway Docs:** https://docs.railway.app
- **Laravel Deployment:** https://laravel.com/docs/deployment
- **Vite Production Build:** https://vitejs.dev/guide/build.html

---

## 🎉 Success Criteria

Your deployment is successful when:

✅ All 10 services show "Active" in Railway  
✅ All services have public domains  
✅ Can access all frontends via browser  
✅ No CORS errors in browser console  
✅ Can login to main system  
✅ Can navigate between modules  
✅ All API calls working correctly  
✅ Database operations functioning  

---

## 🚀 Next Steps After Deployment

1. **Document URLs** - Save all service URLs
2. **Test Thoroughly** - Test all user workflows
3. **Monitor Logs** - Check Railway logs regularly
4. **Setup GitHub Deploy** (Optional) - Automate future deployments
5. **Share with Users** - Your system is live!

---

## 📋 Quick Checklist

### Now (Frontend Deployment)
- [ ] Read [FRONTEND_DEPLOYMENT_RAILWAY.md](FRONTEND_DEPLOYMENT_RAILWAY.md)
- [ ] Deploy main-frontend
- [ ] Deploy staff-id-frontend
- [ ] Deploy print-frontend
- [ ] Deploy sticker-frontend
- [ ] Deploy account-frontend
- [ ] Collect all 5 Railway domains

### After (CORS Configuration)
- [ ] Read [CORS_CONFIGURATION_CHECKLIST.md](CORS_CONFIGURATION_CHECKLIST.md)
- [ ] Build CORS string with all domains
- [ ] Add CORS to main-backend
- [ ] Add CORS to staff-id-backend
- [ ] Add CORS to print-backend
- [ ] Add CORS to sticker-backend
- [ ] Add CORS to account-backend (+ FRONTEND_URL)
- [ ] Redeploy all 5 backends
- [ ] Test in browser (no CORS errors)

### Finally (Verification)
- [ ] All services active in Railway
- [ ] Can access main frontend
- [ ] Can login successfully
- [ ] Can navigate modules
- [ ] All features working
- [ ] 🎉 Deployment complete!

---

**You're almost there! Follow the frontend deployment guide next.** 🚀

**Start here:** [FRONTEND_DEPLOYMENT_RAILWAY.md](FRONTEND_DEPLOYMENT_RAILWAY.md)
