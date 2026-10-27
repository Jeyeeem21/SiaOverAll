# CORS Configuration Fix

## Problem

The frontend was getting CORS errors when trying to access the backend API:
```
Access-Control-Allow-Origin header must not be the wildcard '*' 
when the request's credentials mode is 'include'
```

## Root Cause

When using `credentials: 'include'` in fetch requests (required for Sanctum session authentication), browsers enforce stricter CORS rules:
- The `Access-Control-Allow-Origin` header **cannot** be `*` (wildcard)
- It must specify exact allowed origins
- The `Access-Control-Allow-Credentials` header must be `true`

## Solution Applied

### 1. Published CORS Configuration
```bash
php artisan config:publish cors
```

### 2. Updated `config/cors.php`

**Changed from:**
```php
'allowed_origins' => ['*'],
'supports_credentials' => false,
```

**Changed to:**
```php
'allowed_origins' => [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
],
'supports_credentials' => true,
```

### 3. Updated `config/sanctum.php`

**Added port 5173 (Vite's default):**
```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
    '%s%s',
    'localhost,localhost:3000,localhost:5173,127.0.0.1,127.0.0.1:8000,127.0.0.1:3000,127.0.0.1:5173,::1',
    Sanctum::currentApplicationUrlWithPort(),
))),
```

### 4. Updated `.env`

**Added:**
```env
SESSION_DOMAIN=localhost
SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost:5173,127.0.0.1:3000,127.0.0.1:5173
```

### 5. Cleared Cache
```bash
php artisan config:clear
php artisan cache:clear
```

## Why Port 5173?

Vite (the frontend build tool) uses port **5173** by default, not 3000. The error logs showed:
```
from origin 'http://localhost:5173'
```

## Testing the Fix

### 1. Restart Backend Server
```bash
cd backend
php artisan serve
```

### 2. Restart Frontend Server
```bash
cd frontend
npm run dev
```

### 3. Check Browser Console
- Open http://localhost:5173
- Open browser DevTools (F12)
- Console tab should be clear of CORS errors
- Network tab should show successful API requests

### 4. Test API Calls
- Search for students → Should work
- Click filters → Should work
- View student details → Should work
- Add/Edit/Delete (if Admin/Staff) → Should work

## If Still Not Working

### Additional Debugging Steps

1. **Check Session Driver**
   - Make sure `SESSION_DRIVER=database` in .env
   - Run migration to create sessions table: `php artisan migrate`

2. **Verify Frontend API URL**
   - Check `frontend/.env` or `frontend/.env.local`
   - Should have: `VITE_API_URL=http://127.0.0.1:8000/api`

3. **Clear Browser Cache**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or clear all cookies and cache

4. **Check Network Tab**
   - Look for OPTIONS requests (CORS preflight)
   - Should return 200 OK
   - Check response headers:
     - `Access-Control-Allow-Origin: http://localhost:5173`
     - `Access-Control-Allow-Credentials: true`

5. **Alternative: Disable CSRF for API Routes** (Development Only)
   
   In `bootstrap/app.php`:
   ```php
   ->withMiddleware(function (Middleware $middleware): void {
       $middleware->validateCsrfTokens(except: [
           'api/*',
       ]);
   })
   ```

## Production Deployment

For production, update `config/cors.php`:

```php
'allowed_origins' => [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
],
```

And `.env`:
```env
SESSION_DOMAIN=.yourdomain.com
SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com
```

## Common Ports Reference

| Tool | Default Port |
|------|-------------|
| Vite | 5173 |
| Create React App | 3000 |
| Next.js | 3000 |
| Vue CLI | 8080 |
| Angular CLI | 4200 |

## Summary

✅ CORS configuration now allows specific origins  
✅ Credentials support enabled  
✅ Sanctum stateful domains include port 5173  
✅ Session domain configured  
✅ Cache cleared  

**Result**: Frontend can now make authenticated requests to the backend API with `credentials: 'include'`.

---

**Last Updated**: October 2026  
**Issue**: CORS wildcard with credentials  
**Status**: ✅ RESOLVED
