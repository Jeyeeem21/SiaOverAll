# Authentication Setup Guide

## Current Status

⚠️ **Authentication is currently disabled for testing purposes**

The Student Records API is temporarily **publicly accessible** without authentication to allow you to test all features immediately.

## What Was Changed

### 1. Routes Made Public (Temporary)

In `backend/routes/api.php`:
```php
// Students API - temporarily public for testing
Route::apiResource('students', StudentController::class)
    ->only(['index', 'store', 'show', 'update', 'destroy']);
```

### 2. Controller Access Check Modified

In `StudentController.php`:
```php
private function ensureStudentRecordsAccess(Request $request): ?JsonResponse
{
    // Temporarily allow access without authentication
    if (!$request->user()) {
        return null; // Allow access
    }
    // ... rest of code
}
```

## Testing Now

You can now:
- ✅ View all students
- ✅ Search and filter
- ✅ Add new students
- ✅ Edit student records
- ✅ Delete student records

**No login required for testing!**

---

## 🔒 Production Authentication Setup

When you're ready to enable authentication, follow these steps:

### Option 1: Laravel Breeze (Recommended for Simple SPAs)

```bash
cd backend

# Install Breeze
composer require laravel/breeze --dev

# Install API stack
php artisan breeze:install api

# Run migrations
php artisan migrate
```

### Option 2: Laravel Fortify (More Flexible)

```bash
cd backend

# Install Fortify
composer require laravel/fortify

# Publish Fortify resources
php artisan vendor:publish --provider="Laravel\Fortify\FortifyServiceProvider"

# Run migrations
php artisan migrate
```

### Option 3: Custom Authentication

Create your own login/register endpoints using Sanctum.

---

## Re-enabling Authentication

### Step 1: Move Routes Back to Auth Middleware

In `backend/routes/api.php`:

**Change from:**
```php
// Public routes
Route::apiResource('students', StudentController::class)
    ->only(['index', 'store', 'show', 'update', 'destroy']);
```

**Change to:**
```php
// Protected routes
Route::middleware('auth:sanctum')->group(function (): void {
    Route::apiResource('students', StudentController::class)
        ->only(['index', 'store', 'show', 'update', 'destroy']);
    // ... other routes
});
```

### Step 2: Update StudentController

In `StudentController.php`:

**Change from:**
```php
private function ensureStudentRecordsAccess(Request $request): ?JsonResponse
{
    // Temporarily allow access without authentication
    if (!$request->user()) {
        return null;
    }
    // ...
}
```

**Change to:**
```php
private function ensureStudentRecordsAccess(Request $request): ?JsonResponse
{
    // Require authentication
    if (!$request->user()) {
        return response()->json([
            'message' => 'Unauthenticated.',
        ], 401);
    }

    if (in_array($request->user()->role, ['Admin', 'Staff'], true)) {
        return null;
    }

    return response()->json([
        'message' => 'You are not authorized to access student records.',
    ], 403);
}
```

### Step 3: Add Authentication Endpoints

Create login/register routes:

```php
// In routes/api.php

use App\Http\Controllers\Auth\AuthController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
```

### Step 4: Create AuthController

```php
<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'in:Admin,Staff,Student',
        ]);

        $user = User::create([
            'full_name' => $request->full_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role ?? 'Student',
            'status' => 'active',
        ]);

        Auth::login($user);

        return response()->json([
            'message' => 'Registration successful',
            'user' => $user,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $request->session()->regenerate();

        return response()->json([
            'message' => 'Login successful',
            'user' => Auth::user(),
        ]);
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logout successful',
        ]);
    }
}
```

### Step 5: Update Frontend

Add login/register pages in your React app:

```jsx
// Example: Login Component
async function handleLogin(email, password) {
  // Get CSRF token first
  await apiRequest('/sanctum/csrf-cookie', {
    method: 'GET',
  });

  // Then login
  const response = await apiRequest('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  // User is now authenticated
  window.location.href = '/';
}
```

---

## User Roles & Permissions

### Admin Role
- Full access to all features
- Can add, edit, delete students
- Can manage staff
- Can manage system settings

### Staff Role
- Can view all students
- Can add, edit students
- Can verify students
- Limited delete permissions

### Student Role
- Can view their own profile
- Can update contact information
- Cannot access other students' data

### Guest (Unauthenticated)
- **Currently**: Full access (temporary)
- **Production**: No access, redirect to login

---

## Testing with Authentication

### Create Test Users

```bash
cd backend
php artisan tinker
```

```php
// Create Admin
User::create([
    'full_name' => 'Admin User',
    'email' => 'admin@test.com',
    'password' => bcrypt('password'),
    'role' => 'Admin',
    'status' => 'active'
]);

// Create Staff
User::create([
    'full_name' => 'Staff User',
    'email' => 'staff@test.com',
    'password' => bcrypt('password'),
    'role' => 'Staff',
    'status' => 'active'
]);

// Create Student
User::create([
    'full_name' => 'Student User',
    'email' => 'student@test.com',
    'password' => bcrypt('password'),
    'role' => 'Student',
    'status' => 'active'
]);

exit
```

### Test Login

1. Use API client (Postman/Insomnia) or frontend
2. POST to `/api/login` with:
   ```json
   {
     "email": "admin@test.com",
     "password": "password"
   }
   ```
3. Session cookie is set
4. Subsequent requests are authenticated

---

## Security Best Practices

### For Production:

1. **Environment Variables**
   ```env
   APP_ENV=production
   APP_DEBUG=false
   ```

2. **Strong Session Security**
   ```env
   SESSION_SECURE_COOKIE=true
   SESSION_SAME_SITE=strict
   ```

3. **HTTPS Only**
   - Force HTTPS in production
   - Update CORS allowed origins to https://

4. **Rate Limiting**
   ```php
   Route::middleware(['throttle:api'])->group(function () {
       // Your routes
   });
   ```

5. **Password Requirements**
   - Minimum 8 characters
   - Must include numbers, letters, special chars
   - Implement password strength meter

---

## Summary

### Current State (Development)
- ⚠️ **No authentication required**
- ✅ Full API access for testing
- ✅ CORS configured
- ✅ All features functional

### Production State (After Setup)
- 🔒 **Authentication required**
- 🔒 **Role-based access control**
- 🔒 **Secure session management**
- 🔒 **HTTPS enforced**

---

## Quick Toggle Commands

### Disable Auth (Testing)
```bash
# Already done - currently in this state
```

### Enable Auth (Production)
```bash
# 1. Uncomment auth middleware in routes/api.php
# 2. Update StudentController access check
# 3. Test with authenticated requests
```

---

**Current Status**: 🟡 Authentication Disabled (Testing Mode)  
**Production Ready**: ❌ Requires authentication setup  
**Next Steps**: Implement authentication when ready for production

---

**Last Updated**: October 2026  
**Security Level**: Development (Public Access)  
**TODO**: Enable authentication before deployment
