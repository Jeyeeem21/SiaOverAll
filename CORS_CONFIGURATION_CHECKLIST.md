# ✅ CORS Configuration Checklist

Quick reference for configuring CORS after deploying frontends to Railway.

---

## 🎯 When to Do This

**Only after ALL FIVE frontends are deployed and have Railway domains!**

---

## 📝 Step 1: Collect All Frontend Domains

Visit each frontend service in Railway and copy the public domain:

```
✅ Main Frontend:       https://______________________________.up.railway.app
✅ Staff ID Frontend:   https://______________________________.up.railway.app
✅ Print Frontend:      https://______________________________.up.railway.app
✅ Sticker Frontend:    https://______________________________.up.railway.app
✅ Account Frontend:    https://______________________________.up.railway.app
```

---

## 🔧 Step 2: Build Your CORS String

### Template:
```
CORS_ALLOWED_ORIGINS=https://DOMAIN1,https://DOMAIN2,https://DOMAIN3,https://DOMAIN4,https://DOMAIN5
```

### Example:
```
CORS_ALLOWED_ORIGINS=https://main-frontend-prod.up.railway.app,https://staff-id-frontend.up.railway.app,https://print-frontend.up.railway.app,https://sticker-frontend.up.railway.app,https://account-frontend.up.railway.app
```

### ⚠️ CRITICAL RULES:

| ✅ DO | ❌ DON'T |
|-------|----------|
| Use `https://` | Use `http://` |
| Use exact Railway domain | Use `localhost` |
| No ending slash | Add trailing `/` |
| Commas only (no spaces) | Add spaces |
| Use production domains | Use `.railway.internal` |

---

## 🔧 Step 3: Add to ALL FIVE Backends

For **EACH** backend service in Railway:

### Backend 1: Main Backend

**Service:** `main-backend`

1. Click service → **Settings** → **Variables**
2. Find or create: `CORS_ALLOWED_ORIGINS`
3. Paste your CORS string (all 5 frontend domains)
4. Click **"Save"**
5. Click **"Redeploy"** or **"Deploy"**
6. ✅ Wait for deployment to complete

---

### Backend 2: Staff ID Backend

**Service:** `staff-id-backend`

1. Click service → **Settings** → **Variables**
2. Find or create: `CORS_ALLOWED_ORIGINS`
3. Paste your CORS string (all 5 frontend domains)
4. Click **"Save"**
5. Click **"Redeploy"**
6. ✅ Wait for deployment to complete

---

### Backend 3: Print Backend

**Service:** `print-backend`

1. Click service → **Settings** → **Variables**
2. Find or create: `CORS_ALLOWED_ORIGINS`
3. Paste your CORS string (all 5 frontend domains)
4. Click **"Save"**
5. Click **"Redeploy"**
6. ✅ Wait for deployment to complete

---

### Backend 4: Sticker Backend

**Service:** `sticker-backend`

1. Click service → **Settings** → **Variables**
2. Find or create: `CORS_ALLOWED_ORIGINS`
3. Paste your CORS string (all 5 frontend domains)
4. Click **"Save"**
5. Click **"Redeploy"**
6. ✅ Wait for deployment to complete

---

### Backend 5: Account Backend

**Service:** `account-backend`

1. Click service → **Settings** → **Variables**
2. Find or create: `CORS_ALLOWED_ORIGINS`
3. Paste your CORS string (all 5 frontend domains)
4. **Also update:** `FRONTEND_URL=https://YOUR-ACCOUNT-FRONTEND.up.railway.app`
5. Click **"Save"**
6. Click **"Redeploy"**
7. ✅ Wait for deployment to complete

**⚠️ Note:** Account backend needs both `CORS_ALLOWED_ORIGINS` and `FRONTEND_URL`!

---

## ✅ Step 4: Verify CORS is Working

### Test 1: Open Main Frontend
```
Visit: https://your-main-frontend.up.railway.app
```

### Test 2: Open Browser Console
```
Press F12 → Go to "Console" tab
```

### Test 3: Look for CORS Errors

**❌ If you see:**
```
Access to fetch at 'https://...' has been blocked by CORS policy
```
→ CORS not configured correctly! Check steps below.

**✅ If you see:**
- No CORS errors
- API calls working
→ CORS configured correctly! 🎉

---

## 🐛 Troubleshooting

### Issue: Still Getting CORS Errors

**Checklist:**

1. **Check CORS string format:**
   - [ ] Starts with `https://` (not `http://`)
   - [ ] No spaces after commas
   - [ ] No trailing slashes
   - [ ] Contains all 5 frontend domains

2. **Check backend redeployed:**
   - [ ] Click backend service in Railway
   - [ ] Check "Deployments" tab
   - [ ] Latest deployment is after adding CORS variable
   - [ ] Status is "Active"

3. **Check domain is exact:**
   - [ ] Copy domain directly from Railway
   - [ ] Don't manually type it
   - [ ] Include any prefixes/suffixes Railway added

4. **Wait for propagation:**
   - [ ] Backend fully restarted (check logs)
   - [ ] Clear browser cache (Ctrl+Shift+Delete)
   - [ ] Try in incognito window

---

### Issue: CORS Works for Some Calls, Not Others

**Cause:** One backend missing CORS configuration

**Solution:**
1. Open browser console (F12)
2. Find which API URL is being blocked
3. Identify which backend that URL belongs to
4. Go to that backend's Variables
5. Add/update `CORS_ALLOWED_ORIGINS`
6. Redeploy that backend

---

### Issue: Getting 403 or 401 Instead of CORS Error

**This is good!** CORS is working if you see actual HTTP errors instead of CORS errors.

**Solution:** Fix the authentication/authorization issue, not CORS.

---

## 📋 Quick Copy-Paste Template

```env
# Copy this template and fill in your actual domains

CORS_ALLOWED_ORIGINS=https://MAIN-FRONTEND.up.railway.app,https://STAFF-ID-FRONTEND.up.railway.app,https://PRINT-FRONTEND.up.railway.app,https://STICKER-FRONTEND.up.railway.app,https://ACCOUNT-FRONTEND.up.railway.app
```

**Replace:**
- `MAIN-FRONTEND.up.railway.app` → Your actual main frontend domain
- `STAFF-ID-FRONTEND.up.railway.app` → Your actual staff ID frontend domain
- `PRINT-FRONTEND.up.railway.app` → Your actual print frontend domain
- `STICKER-FRONTEND.up.railway.app` → Your actual sticker frontend domain
- `ACCOUNT-FRONTEND.up.railway.app` → Your actual account frontend domain

---

## 🎯 Final Verification Checklist

After configuring CORS on all backends:

- [ ] All 5 backends have `CORS_ALLOWED_ORIGINS` variable set
- [ ] Account backend also has `FRONTEND_URL` variable set
- [ ] All 5 backends redeployed after adding variable
- [ ] All 5 backends show "Active" status
- [ ] Can open main frontend without errors
- [ ] No CORS errors in browser console (F12)
- [ ] Can login successfully
- [ ] Can navigate between modules
- [ ] All API calls working

---

## 🎉 Success!

If all checks pass:
- ✅ CORS is properly configured
- ✅ All frontends can communicate with all backends
- ✅ Your system is fully functional
- ✅ Ready for production use!

---

## 📞 Still Having Issues?

1. **Check Railway logs** for each backend service
2. **Check browser console** for specific error messages
3. **Verify environment variables** are saved in Railway
4. **Try clearing browser cache** and testing in incognito
5. **Ensure all services are fully deployed** (not building/starting)

---

**Good luck! 🚀**
