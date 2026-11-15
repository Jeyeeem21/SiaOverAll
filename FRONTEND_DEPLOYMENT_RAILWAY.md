# 🎨 Frontend Deployment to Railway - Step by Step

Deploy all 5 React frontends to Railway and get their domains for CORS configuration.

---

## 📋 Overview

You'll deploy:
1. Main Business Center Frontend
2. Staff ID Management Frontend  
3. Student Print Module Frontend
4. Staff Sticker Module Frontend
5. Student Account Portal Frontend

Each will get a Railway domain like: `https://your-service-name.up.railway.app`

---

## ✅ Prerequisites

- [ ] Railway account created
- [ ] All 5 backends already deployed
- [ ] Backend URLs noted down
- [ ] Railway CLI installed (optional but helpful)

---

## 🚀 PART 1: Deploy Frontend Services

### Step 1: Create Frontend Services in Railway

For **EACH** of the 5 frontends, do this:

#### 1.1 Go to Railway Dashboard

Visit: `https://railway.app`
→ Open your project

#### 1.2 Create New Service

Click **"+ New"** → **"GitHub Repo"** (if connected) or **"Empty Service"**

#### 1.3 Name the Service

Create these 5 services with these exact names:
- `main-frontend`
- `staff-id-frontend`
- `print-frontend`
- `sticker-frontend`
- `account-frontend`

---

## 📦 PART 2: Configure Each Frontend Service

### For Each Frontend, Follow These Steps:

---

### 🟦 SERVICE 1: Main Frontend

#### Settings → General
- **Service Name**: `main-frontend`

#### Settings → Source
- **Root Directory**: `main-system/react-frontend`
- **Dockerfile Path**: `Dockerfile.railway`

#### Settings → Variables (Environment Variables)

Click **"+ New Variable"** and add these:

```env
# Backend API URLs (use your actual Railway backend URLs)
VITE_API_URL=https://YOUR-MAIN-BACKEND.up.railway.app/api
VITE_PRINT_API_URL=https://YOUR-PRINT-BACKEND.up.railway.app/api/v1
VITE_STAFF_ID_API_URL=https://YOUR-STAFF-ID-BACKEND.up.railway.app/api
VITE_STICKER_API_URL=https://YOUR-STICKER-BACKEND.up.railway.app/api

# Other frontend URLs (you'll fill these after deploying all frontends)
VITE_STICKER_URL=https://sticker-frontend.up.railway.app
VITE_STAFF_ID_URL=https://staff-id-frontend.up.railway.app
VITE_STUDENT_ACCOUNT_URL=https://account-frontend.up.railway.app
VITE_STUDENT_REGISTER_URL=https://account-frontend.up.railway.app/register
```

**⚠️ Important:** Replace `YOUR-MAIN-BACKEND.up.railway.app` with your actual backend Railway domains!

#### Deploy
Click **"Deploy"** button

---

### 🟦 SERVICE 2: Staff ID Frontend

#### Settings → General
- **Service Name**: `staff-id-frontend`

#### Settings → Source
- **Root Directory**: `staff_id_managament/frontend`
- **Dockerfile Path**: `Dockerfile.railway`

#### Settings → Variables

```env
# Backend API URLs
VITE_API_URL=https://YOUR-STAFF-ID-BACKEND.up.railway.app/api
VITE_MAIN_SYSTEM_API_URL=https://YOUR-MAIN-BACKEND.up.railway.app/api

# Main system URL
VITE_MAIN_SYSTEM_URL=https://main-frontend.up.railway.app
```

#### Deploy
Click **"Deploy"** button

---

### 🟦 SERVICE 3: Print Frontend

#### Settings → General
- **Service Name**: `print-frontend`

#### Settings → Source
- **Root Directory**: `Student_print_module/frontend`
- **Dockerfile Path**: `Dockerfile.railway`

#### Settings → Variables

```env
# Backend API URLs
VITE_API_URL=https://YOUR-PRINT-BACKEND.up.railway.app/api/v1

# Other frontend URLs
VITE_MAIN_SYSTEM_URL=https://main-frontend.up.railway.app
VITE_STUDENT_PORTAL_URL=https://account-frontend.up.railway.app
```

#### Deploy
Click **"Deploy"** button

---

### 🟦 SERVICE 4: Sticker Frontend

#### Settings → General
- **Service Name**: `sticker-frontend`

#### Settings → Source
- **Root Directory**: `Staff_Sticker_module/frontend`
- **Dockerfile Path**: `Dockerfile.railway`

#### Settings → Variables

```env
# Backend API URLs (Sticker uses Account API!)
VITE_API_URL=https://YOUR-ACCOUNT-BACKEND.up.railway.app/api

# Main system URL
VITE_MAIN_SYSTEM_URL=https://main-frontend.up.railway.app
```

**⚠️ Note:** Sticker frontend uses the Account backend API, not a separate sticker API!

#### Deploy
Click **"Deploy"** button

---

### 🟦 SERVICE 5: Account Frontend

#### Settings → General
- **Service Name**: `account-frontend`

#### Settings → Source
- **Root Directory**: `student_account_module/frontend`
- **Dockerfile Path**: `Dockerfile.railway`

#### Settings → Variables

```env
# Backend API URLs
VITE_API_URL=https://YOUR-ACCOUNT-BACKEND.up.railway.app/api
VITE_MAIN_SYSTEM_URL=https://main-frontend.up.railway.app
VITE_MAIN_SYSTEM_API_URL=https://YOUR-MAIN-BACKEND.up.railway.app/api
VITE_PRINT_API_URL=https://YOUR-PRINT-BACKEND.up.railway.app/api/v1
VITE_PRINT_FRONTEND_URL=https://print-frontend.up.railway.app
VITE_ID_MANAGEMENT_API_URL=https://YOUR-STAFF-ID-BACKEND.up.railway.app/api
```

#### Deploy
Click **"Deploy"** button

---

## 📝 PART 3: Collect Frontend Domains

After all 5 frontends are deployed, collect their Railway domains.

### How to Find Your Domain:

1. Click on the frontend service in Railway
2. Go to **"Settings"** → **"Networking"**
3. Copy the **Public Domain** (looks like: `https://service-name.up.railway.app`)

### Write Down These Domains:

```
Main Frontend:       https://_____________________.up.railway.app
Staff ID Frontend:   https://_____________________.up.railway.app
Print Frontend:      https://_____________________.up.railway.app
Sticker Frontend:    https://_____________________.up.railway.app
Account Frontend:    https://_____________________.up.railway.app
```

---

## 🔧 PART 4: Configure CORS on Backends

Now that you have all 5 frontend domains, configure CORS on **ALL FIVE BACKENDS**.

### ⚠️ CRITICAL CORS Rules:

✅ **DO:**
- Use `https://` (never `http://`)
- Use exact Railway domain (e.g., `https://main-frontend.up.railway.app`)
- No ending slash `/`
- Separate with commas only (no spaces)
- Never use `localhost` or `.railway.internal`

❌ **DON'T:**
- Don't add trailing slash: ~~`https://domain.com/`~~
- Don't add spaces: ~~`https://domain1.com, https://domain2.com`~~
- Don't use wildcards in production: ~~`https://*.railway.app`~~
- Don't use localhost: ~~`http://localhost:5173`~~

---

### Backend 1️⃣: Main Backend

**Service:** `main-backend`
**Location:** Settings → Variables

Add or update:
```env
CORS_ALLOWED_ORIGINS=https://YOUR-MAIN-FRONTEND.up.railway.app,https://YOUR-STAFF-ID-FRONTEND.up.railway.app,https://YOUR-PRINT-FRONTEND.up.railway.app,https://YOUR-STICKER-FRONTEND.up.railway.app,https://YOUR-ACCOUNT-FRONTEND.up.railway.app
```

**⚠️ Replace with your actual domains!**

Example:
```env
CORS_ALLOWED_ORIGINS=https://main-frontend-production.up.railway.app,https://staff-id-frontend-production.up.railway.app,https://print-frontend-production.up.railway.app,https://sticker-frontend-production.up.railway.app,https://account-frontend-production.up.railway.app
```

**After adding:** Click **"Redeploy"** or **"Deploy"**

---

### Backend 2️⃣: Staff ID Backend

**Service:** `staff-id-backend`
**Location:** Settings → Variables

Add or update:
```env
CORS_ALLOWED_ORIGINS=https://YOUR-MAIN-FRONTEND.up.railway.app,https://YOUR-STAFF-ID-FRONTEND.up.railway.app,https://YOUR-PRINT-FRONTEND.up.railway.app,https://YOUR-STICKER-FRONTEND.up.railway.app,https://YOUR-ACCOUNT-FRONTEND.up.railway.app
```

**After adding:** Click **"Redeploy"**

---

### Backend 3️⃣: Print Backend

**Service:** `print-backend`
**Location:** Settings → Variables

Add or update:
```env
CORS_ALLOWED_ORIGINS=https://YOUR-MAIN-FRONTEND.up.railway.app,https://YOUR-STAFF-ID-FRONTEND.up.railway.app,https://YOUR-PRINT-FRONTEND.up.railway.app,https://YOUR-STICKER-FRONTEND.up.railway.app,https://YOUR-ACCOUNT-FRONTEND.up.railway.app
```

**After adding:** Click **"Redeploy"**

---

### Backend 4️⃣: Sticker Backend

**Service:** `sticker-backend`
**Location:** Settings → Variables

Add or update:
```env
CORS_ALLOWED_ORIGINS=https://YOUR-MAIN-FRONTEND.up.railway.app,https://YOUR-STAFF-ID-FRONTEND.up.railway.app,https://YOUR-PRINT-FRONTEND.up.railway.app,https://YOUR-STICKER-FRONTEND.up.railway.app,https://YOUR-ACCOUNT-FRONTEND.up.railway.app
```

**After adding:** Click **"Redeploy"**

---

### Backend 5️⃣: Account Backend

**Service:** `account-backend`
**Location:** Settings → Variables

Add or update:
```env
CORS_ALLOWED_ORIGINS=https://YOUR-MAIN-FRONTEND.up.railway.app,https://YOUR-STAFF-ID-FRONTEND.up.railway.app,https://YOUR-PRINT-FRONTEND.up.railway.app,https://YOUR-STICKER-FRONTEND.up.railway.app,https://YOUR-ACCOUNT-FRONTEND.up.railway.app

# Also update FRONTEND_URL for this backend
FRONTEND_URL=https://YOUR-ACCOUNT-FRONTEND.up.railway.app
```

**⚠️ Note:** Account backend also needs `FRONTEND_URL` for password reset emails!

**After adding:** Click **"Redeploy"**

---

## ✅ PART 5: Verification

### Check All Services Are Running

In Railway Dashboard, verify:
- [ ] All 5 frontends show "Active" status
- [ ] All 5 backends show "Active" status (after CORS redeploy)
- [ ] Each service has a public domain

### Test CORS Configuration

1. **Open Main Frontend** in browser:
   ```
   https://your-main-frontend.up.railway.app
   ```

2. **Open Browser Console** (F12)

3. **Check for CORS errors:**
   - ❌ If you see: `CORS policy: No 'Access-Control-Allow-Origin'`
     → CORS not configured correctly
   
   - ✅ If you see: API calls working without errors
     → CORS configured correctly!

4. **Test Login:**
   - Try logging in
   - Should work without CORS errors

5. **Test Navigation:**
   - Navigate between modules
   - Click "Staff ID Management", "Print Orders", etc.
   - All should work without CORS errors

---

## 🐛 Troubleshooting

### Issue: Frontend Build Fails

**Error:** `npm ci failed` or `vite build failed`

**Solution:**
1. Check if `Dockerfile.railway` exists in frontend folder
2. Verify Root Directory is correct
3. Check Railway logs for specific error
4. Ensure `package.json` has all dependencies

---

### Issue: Frontend Shows Blank Page

**Possible causes:**

**1. Wrong API URL**
- Check `VITE_API_URL` in Variables
- Should be your backend Railway domain
- Must use `https://`

**2. CORS Error**
- Open browser console (F12)
- Look for CORS errors
- Add frontend domain to backend `CORS_ALLOWED_ORIGINS`
- Redeploy backend

**3. Build Error**
- Check Railway logs
- Look for build errors
- Fix and redeploy

---

### Issue: CORS Errors in Console

**Error:** `Access to fetch at 'https://backend...' from origin 'https://frontend...' has been blocked by CORS policy`

**Solution:**
1. Copy exact frontend domain from Railway (including https://)
2. Go to backend service → Variables
3. Add/update `CORS_ALLOWED_ORIGINS` with exact domain
4. **Important:** No trailing slash, no spaces
5. Click **"Redeploy"** backend
6. Wait for backend to restart
7. Refresh frontend page

---

### Issue: Some API Calls Work, Others Don't

**Possible cause:** Missing frontend domain in one backend

**Solution:**
- Check which API call is failing (in browser console)
- Go to that backend's CORS settings
- Add missing frontend domain
- Redeploy that backend

---

## 📋 Quick Reference

### Service Root Directories

| Service | Root Directory |
|---------|----------------|
| main-frontend | `main-system/react-frontend` |
| staff-id-frontend | `staff_id_managament/frontend` |
| print-frontend | `Student_print_module/frontend` |
| sticker-frontend | `Staff_Sticker_module/frontend` |
| account-frontend | `student_account_module/frontend` |

### CORS Format Template

```env
CORS_ALLOWED_ORIGINS=https://domain1.up.railway.app,https://domain2.up.railway.app,https://domain3.up.railway.app,https://domain4.up.railway.app,https://domain5.up.railway.app
```

**Rules:**
- ✅ `https://` prefix
- ✅ No trailing `/`
- ✅ Comma-separated
- ✅ No spaces
- ❌ Never `localhost`

---

## 🎉 Success Checklist

After deployment, verify:

- [ ] All 5 frontends deployed and active
- [ ] All 5 frontends have public domains
- [ ] All 5 backends have CORS configured
- [ ] All 5 backends redeployed after CORS update
- [ ] Can open main frontend in browser
- [ ] No CORS errors in console
- [ ] Can login successfully
- [ ] Can navigate between modules
- [ ] All API calls working

---

## 🔗 Next Steps

After frontends are deployed:

1. **Save All URLs**: Document all 10 service URLs (5 frontends + 5 backends)
2. **Test Thoroughly**: Test all user flows
3. **Monitor Logs**: Check Railway logs for any errors
4. **Setup Monitoring**: Consider uptime monitoring (optional)
5. **Share with Users**: Your system is now live!

---

## 📞 Need Help?

**Railway Docs:** https://docs.railway.app  
**CORS Issues:** Check browser console (F12) for specific error messages  
**Deployment Issues:** Check Railway service logs

---

**Good luck! 🚀**
