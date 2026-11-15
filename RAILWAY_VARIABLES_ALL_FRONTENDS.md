# 🔧 Railway Variables for ALL Frontends - Quick Reference

Variables needed for each of the 5 frontend services in Railway.

---

## 📝 How to Use This Guide

For each frontend service:
1. Go to Railway → Service → **Variables** tab
2. Click **"+ New Variable"**
3. Copy variable name and value from below
4. Replace `YOUR-*-BACKEND` with actual Railway URLs

---

## 1️⃣ Main Frontend Variables

**Service:** `main-frontend`  
**Root Directory:** `main-system/react-frontend`

```env
VITE_API_URL=https://YOUR-MAIN-BACKEND.up.railway.app/api
VITE_PRINT_API_URL=https://YOUR-PRINT-BACKEND.up.railway.app/api/v1
VITE_STAFF_ID_API_URL=https://YOUR-STAFF-ID-BACKEND.up.railway.app/api
VITE_STICKER_API_URL=https://YOUR-STICKER-BACKEND.up.railway.app/api
VITE_STAFF_ID_URL=https://staff-id-frontend.up.railway.app
VITE_STICKER_URL=https://sticker-frontend.up.railway.app
VITE_STUDENT_ACCOUNT_URL=https://account-frontend.up.railway.app
VITE_STUDENT_REGISTER_URL=https://account-frontend.up.railway.app/register
```

**⚠️ Note:** Frontend URLs will be available after deploying other frontends

---

## 2️⃣ Staff ID Frontend Variables

**Service:** `staff-id-frontend`  
**Root Directory:** `staff_id_managament/frontend`

```env
VITE_API_URL=https://YOUR-STAFF-ID-BACKEND.up.railway.app/api
VITE_MAIN_SYSTEM_API_URL=https://YOUR-MAIN-BACKEND.up.railway.app/api
VITE_MAIN_SYSTEM_URL=https://main-frontend.up.railway.app
```

**⚠️ Note:** `VITE_MAIN_SYSTEM_URL` will be available after deploying main-frontend

---

## 3️⃣ Print Frontend Variables

**Service:** `print-frontend`  
**Root Directory:** `Student_print_module/frontend`

```env
VITE_API_URL=https://YOUR-PRINT-BACKEND.up.railway.app/api/v1
VITE_MAIN_SYSTEM_URL=https://main-frontend.up.railway.app
VITE_STUDENT_PORTAL_URL=https://account-frontend.up.railway.app
```

**⚠️ Note:** Frontend URLs will be available after deploying main-frontend and account-frontend

---

## 4️⃣ Sticker Frontend Variables

**Service:** `sticker-frontend`  
**Root Directory:** `Staff_Sticker_module/frontend`

```env
VITE_API_URL=https://YOUR-ACCOUNT-BACKEND.up.railway.app/api
VITE_MAIN_SYSTEM_URL=https://main-frontend.up.railway.app
```

**⚠️ IMPORTANT:** Sticker frontend uses **ACCOUNT BACKEND**, not sticker backend!

**⚠️ Note:** `VITE_MAIN_SYSTEM_URL` will be available after deploying main-frontend

---

## 5️⃣ Account Frontend Variables

**Service:** `account-frontend`  
**Root Directory:** `student_account_module/frontend`

```env
VITE_API_URL=https://YOUR-ACCOUNT-BACKEND.up.railway.app/api
VITE_MAIN_SYSTEM_URL=https://main-frontend.up.railway.app
VITE_MAIN_SYSTEM_API_URL=https://YOUR-MAIN-BACKEND.up.railway.app/api
VITE_PRINT_API_URL=https://YOUR-PRINT-BACKEND.up.railway.app/api/v1
VITE_PRINT_FRONTEND_URL=https://print-frontend.up.railway.app
VITE_ID_MANAGEMENT_API_URL=https://YOUR-STAFF-ID-BACKEND.up.railway.app/api
```

**⚠️ Note:** `VITE_MAIN_SYSTEM_URL` and `VITE_PRINT_FRONTEND_URL` will be available after deploying those frontends

---

## 🎯 Quick Summary Table

| Frontend Service | Backend APIs Needed | Other Frontend URLs |
|------------------|---------------------|---------------------|
| **main-frontend** | Main, Print, Staff-ID, Sticker | Staff-ID, Sticker, Account frontends |
| **staff-id-frontend** | Staff-ID, Main | Main frontend |
| **print-frontend** | Print | Main, Account frontends |
| **sticker-frontend** | **Account** (not sticker!) | Main frontend |
| **account-frontend** | Account, Main, Print, Staff-ID | Main, Print frontends |

---

## 📋 Deployment Order Strategy

To minimize back-and-forth, deploy in this order:

### Phase 1: Deploy with Backend URLs Only

1. **Main Frontend** - Add 4 backend URLs (leave frontend URLs empty)
2. **Staff ID Frontend** - Add 2 backend URLs (leave MAIN_SYSTEM_URL empty)
3. **Print Frontend** - Add 1 backend URL (leave frontend URLs empty)
4. **Sticker Frontend** - Add 1 backend URL (leave MAIN_SYSTEM_URL empty)
5. **Account Frontend** - Add 4 backend URLs (leave frontend URLs empty)

### Phase 2: Update with Frontend URLs

After all are deployed and you have all Railway domains:

1. Update **main-frontend** - Add all 4 frontend URLs → Redeploy
2. Update **staff-id-frontend** - Add MAIN_SYSTEM_URL → Redeploy
3. Update **print-frontend** - Add 2 frontend URLs → Redeploy
4. Update **sticker-frontend** - Add MAIN_SYSTEM_URL → Redeploy
5. Update **account-frontend** - Add 2 frontend URLs → Redeploy

---

## 🔑 Where to Get URLs

### Backend URLs (You Already Have These)

In Railway, go to each backend service:
```
Service → Settings → Networking → Public Domain
```

Copy the domain and add the API path:

| Backend Service | API Path | Example |
|----------------|----------|---------|
| main-backend | `/api` | `https://main-backend.up.railway.app/api` |
| staff-id-backend | `/api` | `https://staff-id-backend.up.railway.app/api` |
| print-backend | `/api/v1` | `https://print-backend.up.railway.app/api/v1` |
| sticker-backend | `/api` | `https://sticker-backend.up.railway.app/api` |
| account-backend | `/api` | `https://account-backend.up.railway.app/api` |

### Frontend URLs (After Deployment)

After deploying each frontend, go to:
```
Service → Settings → Networking → Public Domain
```

Copy the **full domain** (no suffix needed):
```
https://main-frontend.up.railway.app
```

---

## ⚠️ CRITICAL RULES

✅ **DO:**
- Use `https://` (Railway uses HTTPS)
- Use exact Railway domains
- Backend URLs need API suffix (`/api` or `/api/v1`)
- Frontend URLs need NO suffix (just the domain)
- No trailing slash on any URL

❌ **DON'T:**
- Use `localhost` (local development only)
- Use `http://` (must be HTTPS)
- Forget API suffix for backends
- Add trailing slashes

---

## 📝 Example with Real URLs

Here's what it looks like when filled out:

### Main Frontend (Example)
```env
VITE_API_URL=https://main-backend-prod-abc123.up.railway.app/api
VITE_PRINT_API_URL=https://print-backend-prod-def456.up.railway.app/api/v1
VITE_STAFF_ID_API_URL=https://staff-id-backend-prod-ghi789.up.railway.app/api
VITE_STICKER_API_URL=https://sticker-backend-prod-jkl012.up.railway.app/api
VITE_STAFF_ID_URL=https://staff-id-frontend-prod-mno345.up.railway.app
VITE_STICKER_URL=https://sticker-frontend-prod-pqr678.up.railway.app
VITE_STUDENT_ACCOUNT_URL=https://account-frontend-prod-stu901.up.railway.app
VITE_STUDENT_REGISTER_URL=https://account-frontend-prod-stu901.up.railway.app/register
```

### Staff ID Frontend (Example)
```env
VITE_API_URL=https://staff-id-backend-prod-ghi789.up.railway.app/api
VITE_MAIN_SYSTEM_API_URL=https://main-backend-prod-abc123.up.railway.app/api
VITE_MAIN_SYSTEM_URL=https://main-frontend-prod-vwx234.up.railway.app
```

---

## ✅ Verification Checklist

For each frontend service:

- [ ] All required variables added
- [ ] Backend URLs use `https://`
- [ ] Backend URLs include correct API path (`/api` or `/api/v1`)
- [ ] Frontend URLs use `https://` (when added)
- [ ] Frontend URLs have NO API suffix
- [ ] No typos in variable names
- [ ] No extra spaces or trailing slashes
- [ ] Service deployed/redeployed

---

## 🆘 Troubleshooting

### Issue: "Cannot connect to backend"
**Check:**
- Backend URL is correct
- Backend service is running in Railway
- API path suffix is correct (`/api` or `/api/v1`)
- Using `https://` not `http://`

### Issue: "Navigation to other modules fails"
**Check:**
- Frontend URLs are added
- Frontend URLs don't have `/api` suffix
- Other frontend services are deployed and running
- Service was redeployed after adding frontend URLs

### Issue: "Environment variable not defined"
**Check:**
- Variable name is spelled exactly right (case-sensitive)
- Variable was saved in Railway
- Service was redeployed after adding variables

---

## 🎯 Quick Start: First Deployment

**Start with main-frontend:**

1. Add only these 4 variables (backend URLs):
```env
VITE_API_URL=https://YOUR-MAIN-BACKEND.up.railway.app/api
VITE_PRINT_API_URL=https://YOUR-PRINT-BACKEND.up.railway.app/api/v1
VITE_STAFF_ID_API_URL=https://YOUR-STAFF-ID-BACKEND.up.railway.app/api
VITE_STICKER_API_URL=https://YOUR-STICKER-BACKEND.up.railway.app/api
```

2. Deploy main-frontend

3. Get its Railway URL

4. Continue with other frontends

5. Come back and add frontend URLs later

---

**You're ready to configure all your frontends!** 🚀

**Start with:** [RAILWAY_VARIABLES_MAIN_FRONTEND.md](RAILWAY_VARIABLES_MAIN_FRONTEND.md) for detailed main-frontend setup.
