# 🎯 Your Actual Railway URLs and Variables

**Copy these EXACT variables to each frontend service in Railway.**

---

## 📋 Your Railway URLs

### Frontends:
- **Main Frontend**: `https://minsu-businesscenter.up.railway.app`
- **Staff ID Frontend**: `https://staff-id-frontend-production.up.railway.app`
- **Print Frontend**: `https://print-frontend-production-60cfdb67.up.railway.app`
- **Sticker Frontend**: `https://sticker-frontend-production.up.railway.app`
- **Account Frontend**: *(Deploy this to get the URL)*

### Backends:
- **Main Backend**: `https://main-backend.up.railway.app`
- **Staff ID Backend**: `https://staff-id-backend-production.up.railway.app`
- **Print Backend**: `https://student-print-backend-production.up.railway.app`
- **Sticker Backend**: *(Not used - sticker uses account backend)*
- **Account Backend**: `https://student-account-backend-production.up.railway.app`

---

## 1️⃣ Main Frontend Variables

**Service:** `main-frontend`  
**URL:** `https://minsu-businesscenter.up.railway.app`

### Variables to Add:

```env
VITE_API_URL=https://main-backend.up.railway.app/api
VITE_PRINT_API_URL=https://student-print-backend-production.up.railway.app/api/v1
VITE_STAFF_ID_API_URL=https://staff-id-backend-production.up.railway.app/api
VITE_STICKER_API_URL=https://student-account-backend-production.up.railway.app/api
VITE_STAFF_ID_URL=https://staff-id-frontend-production.up.railway.app
VITE_STICKER_URL=https://sticker-frontend-production.up.railway.app
VITE_STUDENT_ACCOUNT_URL=https://ACCOUNT-FRONTEND-URL-HERE
VITE_STUDENT_REGISTER_URL=https://ACCOUNT-FRONTEND-URL-HERE/register
```

**⚠️ Note:** Replace `ACCOUNT-FRONTEND-URL-HERE` with account frontend URL after deploying it.

---

## 2️⃣ Staff ID Frontend Variables

**Service:** `staff-id-frontend`  
**URL:** `https://staff-id-frontend-production.up.railway.app`

### Variables to Add:

```env
VITE_API_URL=https://staff-id-backend-production.up.railway.app/api
VITE_MAIN_SYSTEM_API_URL=https://main-backend.up.railway.app/api
VITE_MAIN_SYSTEM_URL=https://minsu-businesscenter.up.railway.app
```

---

## 3️⃣ Print Frontend Variables

**Service:** `print-frontend`  
**URL:** `https://print-frontend-production-60cfdb67.up.railway.app`

### Variables to Add:

```env
VITE_API_URL=https://student-print-backend-production.up.railway.app/api/v1
VITE_MAIN_SYSTEM_URL=https://minsu-businesscenter.up.railway.app
VITE_STUDENT_PORTAL_URL=https://ACCOUNT-FRONTEND-URL-HERE
```

**⚠️ Note:** Replace `ACCOUNT-FRONTEND-URL-HERE` with account frontend URL after deploying it.

---

## 4️⃣ Sticker Frontend Variables

**Service:** `sticker-frontend`  
**URL:** `https://sticker-frontend-production.up.railway.app`

### Variables to Add:

```env
VITE_API_URL=https://student-account-backend-production.up.railway.app/api
VITE_MAIN_SYSTEM_URL=https://minsu-businesscenter.up.railway.app
```

**⚠️ IMPORTANT:** Sticker frontend uses **ACCOUNT BACKEND** API, not a separate sticker backend!

---

## 5️⃣ Account Frontend Variables

**Service:** `account-frontend`  
**URL:** *(Get this after deploying)*

### Variables to Add:

```env
VITE_API_URL=https://student-account-backend-production.up.railway.app/api
VITE_MAIN_SYSTEM_URL=https://minsu-businesscenter.up.railway.app
VITE_MAIN_SYSTEM_API_URL=https://main-backend.up.railway.app/api
VITE_PRINT_API_URL=https://student-print-backend-production.up.railway.app/api/v1
VITE_PRINT_FRONTEND_URL=https://print-frontend-production-60cfdb67.up.railway.app
VITE_ID_MANAGEMENT_API_URL=https://staff-id-backend-production.up.railway.app/api
```

---

## 🔄 After Deploying Account Frontend

Once you deploy account-frontend and get its URL (e.g., `https://account-frontend-production-xxxxx.up.railway.app`):

### Go Back and Update These Services:

#### Update Main Frontend:
Replace:
```env
VITE_STUDENT_ACCOUNT_URL=https://ACCOUNT-FRONTEND-URL-HERE
VITE_STUDENT_REGISTER_URL=https://ACCOUNT-FRONTEND-URL-HERE/register
```
With:
```env
VITE_STUDENT_ACCOUNT_URL=https://your-actual-account-frontend.up.railway.app
VITE_STUDENT_REGISTER_URL=https://your-actual-account-frontend.up.railway.app/register
```
Then **Redeploy** main-frontend

#### Update Print Frontend:
Replace:
```env
VITE_STUDENT_PORTAL_URL=https://ACCOUNT-FRONTEND-URL-HERE
```
With:
```env
VITE_STUDENT_PORTAL_URL=https://your-actual-account-frontend.up.railway.app
```
Then **Redeploy** print-frontend

---

## 📝 CORS Configuration for Backends

After all frontends are deployed, add this to **ALL 5 BACKENDS**:

### CORS String (Same for All Backends):

```env
CORS_ALLOWED_ORIGINS=https://minsu-businesscenter.up.railway.app,https://staff-id-frontend-production.up.railway.app,https://print-frontend-production-60cfdb67.up.railway.app,https://sticker-frontend-production.up.railway.app,https://YOUR-ACCOUNT-FRONTEND-URL
```

### Add to These Backend Services:

1. **main-backend**
   - Variable: `CORS_ALLOWED_ORIGINS`
   - Value: *(CORS string above)*
   - Click "Redeploy"

2. **staff-id-backend-production**
   - Variable: `CORS_ALLOWED_ORIGINS`
   - Value: *(CORS string above)*
   - Click "Redeploy"

3. **student-print-backend-production**
   - Variable: `CORS_ALLOWED_ORIGINS`
   - Value: *(CORS string above)*
   - Click "Redeploy"

4. **sticker-backend** (if you have it, though sticker uses account backend)
   - Variable: `CORS_ALLOWED_ORIGINS`
   - Value: *(CORS string above)*
   - Click "Redeploy"

5. **student-account-backend-production**
   - Variable: `CORS_ALLOWED_ORIGINS`
   - Value: *(CORS string above)*
   - **ALSO ADD:**
   ```env
   FRONTEND_URL=https://YOUR-ACCOUNT-FRONTEND-URL
   ```
   - Click "Redeploy"

---

## ✅ Quick Checklist

### Phase 1: Deploy Remaining Frontends
- [x] Main Frontend - ✅ Already deployed
- [x] Staff ID Frontend - ✅ Already deployed
- [x] Print Frontend - ✅ Already deployed
- [x] Sticker Frontend - ✅ Already deployed
- [ ] Account Frontend - **Deploy this next!**

### Phase 2: Update Frontend URLs
After account-frontend is deployed:
- [ ] Update main-frontend with account URLs
- [ ] Update print-frontend with account URL
- [ ] Redeploy both services

### Phase 3: Configure CORS
- [ ] Add CORS to main-backend
- [ ] Add CORS to staff-id-backend
- [ ] Add CORS to print-backend
- [ ] Add CORS to sticker-backend (if exists)
- [ ] Add CORS + FRONTEND_URL to account-backend
- [ ] Redeploy all 5 backends

### Phase 4: Test
- [ ] Open main frontend in browser
- [ ] Check console for CORS errors (F12)
- [ ] Test login
- [ ] Test navigation between modules
- [ ] All features working

---

## 🎯 Next Steps

### 1. Deploy Account Frontend Now

**In Railway:**
1. Create new service: `account-frontend`
2. Root Directory: `student_account_module/frontend`
3. Dockerfile Path: `Dockerfile.railway`
4. Add the variables listed above for account-frontend
5. Click "Deploy"
6. Wait for deployment
7. Copy the generated Railway URL

### 2. Update Other Frontends

Go back to:
- **main-frontend** → Update variables → Redeploy
- **print-frontend** → Update variables → Redeploy

### 3. Configure CORS on All Backends

Add `CORS_ALLOWED_ORIGINS` to all 5 backends using the string above (with actual account-frontend URL).

---

## 📞 Copy-Paste Ready

### For Quick Copy:

**Main Frontend Variables:**
```
VITE_API_URL=https://main-backend.up.railway.app/api
VITE_PRINT_API_URL=https://student-print-backend-production.up.railway.app/api/v1
VITE_STAFF_ID_API_URL=https://staff-id-backend-production.up.railway.app/api
VITE_STICKER_API_URL=https://student-account-backend-production.up.railway.app/api
VITE_STAFF_ID_URL=https://staff-id-frontend-production.up.railway.app
VITE_STICKER_URL=https://sticker-frontend-production.up.railway.app
VITE_STUDENT_ACCOUNT_URL=[DEPLOY ACCOUNT FRONTEND FIRST]
VITE_STUDENT_REGISTER_URL=[DEPLOY ACCOUNT FRONTEND FIRST]/register
```

**Staff ID Frontend Variables:**
```
VITE_API_URL=https://staff-id-backend-production.up.railway.app/api
VITE_MAIN_SYSTEM_API_URL=https://main-backend.up.railway.app/api
VITE_MAIN_SYSTEM_URL=https://minsu-businesscenter.up.railway.app
```

**Print Frontend Variables:**
```
VITE_API_URL=https://student-print-backend-production.up.railway.app/api/v1
VITE_MAIN_SYSTEM_URL=https://minsu-businesscenter.up.railway.app
VITE_STUDENT_PORTAL_URL=[DEPLOY ACCOUNT FRONTEND FIRST]
```

**Sticker Frontend Variables:**
```
VITE_API_URL=https://student-account-backend-production.up.railway.app/api
VITE_MAIN_SYSTEM_URL=https://minsu-businesscenter.up.railway.app
```

**Account Frontend Variables:**
```
VITE_API_URL=https://student-account-backend-production.up.railway.app/api
VITE_MAIN_SYSTEM_URL=https://minsu-businesscenter.up.railway.app
VITE_MAIN_SYSTEM_API_URL=https://main-backend.up.railway.app/api
VITE_PRINT_API_URL=https://student-print-backend-production.up.railway.app/api/v1
VITE_PRINT_FRONTEND_URL=https://print-frontend-production-60cfdb67.up.railway.app
VITE_ID_MANAGEMENT_API_URL=https://staff-id-backend-production.up.railway.app/api
```

---

**🚀 Deploy account-frontend next, then come back and update the URLs!**
