# 🎯 FINAL Railway Configuration - All URLs Complete

**Copy these EXACT configurations to your Railway services.**

---

## 📋 Your Complete Railway URLs

### Frontends (All Deployed ✅):
- **Main Frontend**: `https://minsu-businesscenter.up.railway.app`
- **Staff ID Frontend**: `https://staff-id-frontend-production.up.railway.app`
- **Print Frontend**: `https://print-frontend-production-60cfdb67.up.railway.app`
- **Sticker Frontend**: `https://sticker-frontend-production.up.railway.app`
- **Account Frontend**: `https://account-frontend-production.up.railway.app` ✅

### Backends:
- **Main Backend**: `https://main-backend.up.railway.app`
- **Staff ID Backend**: `https://staff-id-backend-production.up.railway.app`
- **Print Backend**: `https://student-print-backend-production.up.railway.app`
- **Account Backend**: `https://student-account-backend-production.up.railway.app`

---

## 🎨 FRONTEND CONFIGURATIONS

### 1️⃣ Main Frontend (UPDATE THIS NOW!)

**Service:** `main-frontend`  
**URL:** `https://minsu-businesscenter.up.railway.app`

**✅ COMPLETE Variables:**

```env
VITE_API_URL=https://main-backend.up.railway.app/api
VITE_PRINT_API_URL=https://student-print-backend-production.up.railway.app/api/v1
VITE_STAFF_ID_API_URL=https://staff-id-backend-production.up.railway.app/api
VITE_STICKER_API_URL=https://student-account-backend-production.up.railway.app/api
VITE_STAFF_ID_URL=https://staff-id-frontend-production.up.railway.app
VITE_STICKER_URL=https://sticker-frontend-production.up.railway.app
VITE_STUDENT_ACCOUNT_URL=https://account-frontend-production.up.railway.app
VITE_STUDENT_REGISTER_URL=https://account-frontend-production.up.railway.app/register
```

**⚠️ ACTION:** Update the last 2 variables and **REDEPLOY** main-frontend!

---

### 2️⃣ Staff ID Frontend

**Service:** `staff-id-frontend`  
**URL:** `https://staff-id-frontend-production.up.railway.app`

**✅ COMPLETE Variables:**

```env
VITE_API_URL=https://staff-id-backend-production.up.railway.app/api
VITE_MAIN_SYSTEM_API_URL=https://main-backend.up.railway.app/api
VITE_MAIN_SYSTEM_URL=https://minsu-businesscenter.up.railway.app
```

**✅ No changes needed** - Already complete!

---

### 3️⃣ Print Frontend (UPDATE THIS NOW!)

**Service:** `print-frontend`  
**URL:** `https://print-frontend-production-60cfdb67.up.railway.app`

**✅ COMPLETE Variables:**

```env
VITE_API_URL=https://student-print-backend-production.up.railway.app/api/v1
VITE_MAIN_SYSTEM_URL=https://minsu-businesscenter.up.railway.app
VITE_STUDENT_PORTAL_URL=https://account-frontend-production.up.railway.app
```

**⚠️ ACTION:** Update the last variable and **REDEPLOY** print-frontend!

---

### 4️⃣ Sticker Frontend

**Service:** `sticker-frontend`  
**URL:** `https://sticker-frontend-production.up.railway.app`

**✅ COMPLETE Variables:**

```env
VITE_API_URL=https://student-account-backend-production.up.railway.app/api
VITE_MAIN_SYSTEM_URL=https://minsu-businesscenter.up.railway.app
```

**✅ No changes needed** - Already complete!

---

### 5️⃣ Account Frontend

**Service:** `account-frontend`  
**URL:** `https://account-frontend-production.up.railway.app`

**✅ COMPLETE Variables:**

```env
VITE_API_URL=https://student-account-backend-production.up.railway.app/api
VITE_MAIN_SYSTEM_URL=https://minsu-businesscenter.up.railway.app
VITE_MAIN_SYSTEM_API_URL=https://main-backend.up.railway.app/api
VITE_PRINT_API_URL=https://student-print-backend-production.up.railway.app/api/v1
VITE_PRINT_FRONTEND_URL=https://print-frontend-production-60cfdb67.up.railway.app
VITE_ID_MANAGEMENT_API_URL=https://staff-id-backend-production.up.railway.app/api
```

**✅ Already deployed** - Variables should be set!

---

## 🔧 BACKEND CONFIGURATIONS (CORS)

### Complete CORS String (Same for ALL backends):

```env
CORS_ALLOWED_ORIGINS=https://minsu-businesscenter.up.railway.app,https://staff-id-frontend-production.up.railway.app,https://print-frontend-production-60cfdb67.up.railway.app,https://sticker-frontend-production.up.railway.app,https://account-frontend-production.up.railway.app
```

---

### 1️⃣ Main Backend

**Service:** `main-backend`

**Add/Update:**
```env
CORS_ALLOWED_ORIGINS=https://minsu-businesscenter.up.railway.app,https://staff-id-frontend-production.up.railway.app,https://print-frontend-production-60cfdb67.up.railway.app,https://sticker-frontend-production.up.railway.app,https://account-frontend-production.up.railway.app
```

**Then:** Click **"Redeploy"**

---

### 2️⃣ Staff ID Backend

**Service:** `staff-id-backend-production`

**Add/Update:**
```env
CORS_ALLOWED_ORIGINS=https://minsu-businesscenter.up.railway.app,https://staff-id-frontend-production.up.railway.app,https://print-frontend-production-60cfdb67.up.railway.app,https://sticker-frontend-production.up.railway.app,https://account-frontend-production.up.railway.app
```

**Then:** Click **"Redeploy"**

---

### 3️⃣ Print Backend

**Service:** `student-print-backend-production`

**Add/Update:**
```env
CORS_ALLOWED_ORIGINS=https://minsu-businesscenter.up.railway.app,https://staff-id-frontend-production.up.railway.app,https://print-frontend-production-60cfdb67.up.railway.app,https://sticker-frontend-production.up.railway.app,https://account-frontend-production.up.railway.app
```

**Then:** Click **"Redeploy"**

---

### 4️⃣ Sticker Backend (if you have one)

**Service:** `sticker-backend` (if exists)

**Add/Update:**
```env
CORS_ALLOWED_ORIGINS=https://minsu-businesscenter.up.railway.app,https://staff-id-frontend-production.up.railway.app,https://print-frontend-production-60cfdb67.up.railway.app,https://sticker-frontend-production.up.railway.app,https://account-frontend-production.up.railway.app
```

**Then:** Click **"Redeploy"**

---

### 5️⃣ Account Backend

**Service:** `student-account-backend-production`

**Add/Update:**
```env
# CORS for frontend access
CORS_ALLOWED_ORIGINS=https://minsu-businesscenter.up.railway.app,https://staff-id-frontend-production.up.railway.app,https://print-frontend-production-60cfdb67.up.railway.app,https://sticker-frontend-production.up.railway.app,https://account-frontend-production.up.railway.app

# Frontend URL for password reset emails, etc.
FRONTEND_URL=https://account-frontend-production.up.railway.app

# Internal backend-to-backend communication (optional but recommended)
CORE_API_URL=http://${{main-backend.RAILWAY_PRIVATE_DOMAIN}}:${{main-backend.PORT}}/api
MAIN_SYSTEM_API_URL=http://${{main-backend.RAILWAY_PRIVATE_DOMAIN}}:${{main-backend.PORT}}/api
```

**Then:** Click **"Redeploy"**

---

## ✅ ACTION CHECKLIST

### Phase 1: Update Frontend Variables (Do This Now!)

- [ ] **main-frontend** → Add account frontend URLs → **Redeploy**
  - Update `VITE_STUDENT_ACCOUNT_URL`
  - Update `VITE_STUDENT_REGISTER_URL`

- [ ] **print-frontend** → Add account frontend URL → **Redeploy**
  - Update `VITE_STUDENT_PORTAL_URL`

### Phase 2: Configure CORS on All Backends (Do This Now!)

- [ ] **main-backend** → Add CORS → **Redeploy**
- [ ] **staff-id-backend-production** → Add CORS → **Redeploy**
- [ ] **student-print-backend-production** → Add CORS → **Redeploy**
- [ ] **sticker-backend** (if exists) → Add CORS → **Redeploy**
- [ ] **student-account-backend-production** → Add CORS + FRONTEND_URL → **Redeploy**

### Phase 3: Test Everything

- [ ] Open `https://minsu-businesscenter.up.railway.app`
- [ ] Press **F12** (Open browser console)
- [ ] Check for CORS errors
- [ ] Test login
- [ ] Test navigation to all modules:
  - [ ] Staff ID Management
  - [ ] Print Orders
  - [ ] Sticker Requests
  - [ ] Student Account
- [ ] All features working without errors

---

## 📝 Copy-Paste Ready

### CORS String (Copy this to all 5 backends):

```
CORS_ALLOWED_ORIGINS=https://minsu-businesscenter.up.railway.app,https://staff-id-frontend-production.up.railway.app,https://print-frontend-production-60cfdb67.up.railway.app,https://sticker-frontend-production.up.railway.app,https://account-frontend-production.up.railway.app
```

### Account Backend Additional Variables:

```
FRONTEND_URL=https://account-frontend-production.up.railway.app
CORE_API_URL=http://${{main-backend.RAILWAY_PRIVATE_DOMAIN}}:${{main-backend.PORT}}/api
MAIN_SYSTEM_API_URL=http://${{main-backend.RAILWAY_PRIVATE_DOMAIN}}:${{main-backend.PORT}}/api
```

---

## 🎯 Quick Start

### Step 1: Update Main Frontend
1. Go to Railway → `main-frontend` → Variables
2. Update these 2 variables:
   ```
   VITE_STUDENT_ACCOUNT_URL=https://account-frontend-production.up.railway.app
   VITE_STUDENT_REGISTER_URL=https://account-frontend-production.up.railway.app/register
   ```
3. Click **"Redeploy"**

### Step 2: Update Print Frontend
1. Go to Railway → `print-frontend` → Variables
2. Update this variable:
   ```
   VITE_STUDENT_PORTAL_URL=https://account-frontend-production.up.railway.app
   ```
3. Click **"Redeploy"**

### Step 3: Add CORS to All 5 Backends
For each backend service:
1. Go to Variables tab
2. Add or update: `CORS_ALLOWED_ORIGINS` with the string above
3. For `student-account-backend-production`, also add `FRONTEND_URL`
4. Click **"Redeploy"**

### Step 4: Test
1. Open `https://minsu-businesscenter.up.railway.app`
2. Test all features
3. Check for CORS errors in console (F12)

---

## 🎉 You're Done!

After completing the checklist:
- ✅ All 5 frontends deployed
- ✅ All 5 backends configured with CORS
- ✅ All services can communicate
- ✅ Your integrated system is LIVE!

---

## 🔍 Verification

### Test These URLs:

| Service | URL | Expected |
|---------|-----|----------|
| Main System | https://minsu-businesscenter.up.railway.app | Main dashboard loads |
| Staff ID | https://staff-id-frontend-production.up.railway.app | Staff ID management loads |
| Print Orders | https://print-frontend-production-60cfdb67.up.railway.app | Print ordering loads |
| Sticker Requests | https://sticker-frontend-production.up.railway.app | Sticker requests loads |
| Student Account | https://account-frontend-production.up.railway.app | Student portal loads |

### Check Console (F12):
- ✅ No CORS errors
- ✅ API calls successful
- ✅ No 404 or 500 errors

---

**🚀 Your entire integrated system is now deployed on Railway!**

**Next:** Follow the action checklist above to complete the configuration!
