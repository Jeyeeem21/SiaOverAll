# Module 1: Student Account & Verification

A standalone Laravel + React system for student account management and document verification, part of a larger Service Management System.

## Features

- **Student Registration**: Students can register with personal information
- **Document Upload**: Upload verification documents (School ID or Registration Form)
- **Document Review**: Staff/Admin can approve or reject verification documents
- **Account Status Tracking**: Pending, Verified, Rejected, Suspended statuses
- **Notifications**: System notifications for verification results
- **Role-based Access Control**: Student, Staff, and Admin roles with appropriate permissions
- **Audit Logging**: Comprehensive audit trail for all actions
- **Secure File Storage**: Private storage for verification documents
- **API Integration**: Flexible API client for core system integration

## Tech Stack

### Backend
- Laravel 11/12 (PHP 8.2+)
- Laravel Sanctum for token authentication
- MySQL (SQLite for local development)
- Laravel HTTP Client for external API integration

### Frontend
- React (Vite)
- React Router DOM
- Axios for HTTP requests

## Prerequisites

- PHP 8.2+
- Composer
- Node.js 16+ & npm
- MySQL or SQLite

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install PHP dependencies:
```bash
composer install
```

3. Copy environment file:
```bash
cp .env.example .env
```

4. Generate application key:
```bash
php artisan key:generate
```

5. Configure your `.env` file:
```env
# Database settings (using SQLite for simplicity)
DB_CONNECTION=sqlite
# For MySQL, uncomment and configure:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=student_account
# DB_USERNAME=root
# DB_PASSWORD=

# Sanctum
SESSION_DRIVER=cookie
SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173
SEDOMAIN=localhost:5173

# Core API Integration (for core system)
CORE_API_URL=http://localhost:8000/api
CORE_API_KEY=your_core_api_key_here
CORE_API_KEY_HEADER=X-API-KEY
CORE_API_KEY_SCHEME=Bearer
CORE_API_TIMEOUT=30
```

6. Run migrations and seeders:
```bash
php artisan migrate
php artisan db:seed --class=StaffSeeder
```

7. Start the development server:
```bash
php artisan serve
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Environment Variables

### Backend (.env)
```env
APP_NAME=Laravel
APP_ENV=local
APP_KEY=base64:your_generated_key_here
APP_DEBUG=true
APP_URL=http://localhost:8000

LOG_CHANNEL=stack
LOG_LEVEL=debug

DB_CONNECTION=sqlite
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=student_account
# DB_USERNAME=root
# DB_PASSWORD=

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DRIVER=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

MEMCACHED_HOST=127.0.0.1
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=mailhog
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS=null
MAIL_FROM_NAME="${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_CLUSTER=mt1

VITE_APP_NAME="${APP_NAME}"

# Sanctum
SESSION_DRIVER=cookie
SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173
SEDOMAIN=localhost:5173

# Core API Integration
CORE_API_URL=http://localhost:8000/api
CORE_API_KEY=your_core_api_key_here
CORE_API_KEY_HEADER=X-API-KEY
CORE_API_KEY_SCHEME=Bearer
CORE_API_TIMEOUT=30
```

### Frontend (uses backend API)
No additional environment variables needed for frontend as it connects to the backend API.

## API Endpoints

### Public Routes (Throttled)
- `POST /api/register` - Register new student
- `POST /api/login` - Login and receive token

### Authenticated Routes (`auth:sanctum`)
- `POST /api/logout` - Logout (revoke token)
- `GET /api/me` - Get current user profile
- `PUT /api/me/profile` - Update profile information
- `POST /api/verifications` - Upload verification document
- `GET /api/verifications/{id}/file` - Download/view verification file
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/read` - Mark notifications as read
- `GET /api/me/orders` - Get orders from core system

### Staff/Admin Routes (`auth:sanctum` + role check)
- `GET /api/staff/verifications` - Get verifications for review (with status filter)
- `POST /api/staff/verifications/{id}/approve` - Approve verification
- `POST /api/staff/verifications/{id}/reject` - Reject verification

### Admin Only Routes (`auth:sanctum` + admin role check)
- `POST /api/admin/students/{id}/suspend` - Suspend student account
- `POST /api/admin/students/{id}/reinstate` - Reinstate student account

## File Storage

Verification documents are stored privately using Laravel's local disk:
- Path: `storage/app/verifications/{student_id}/`
- Filenames are randomly generated for security
- Original filenames, MIME types, and sizes are stored in the database
- Files are never accessible via direct URL - must be downloaded through authenticated endpoints

## Roles & Permissions

### Student
- Can register and login
- Can view and edit own profile
- Can upload verification documents (when status is pending or rejected)
- Can view own verification documents
- Can receive notifications
- Cannot access staff/admin endpoints

### Staff
- Can login
- Can view verification queues (pending, approved, rejected, all)
- Can approve or reject pending verification documents
- Can view verification documents
- Cannot suspend/reinstate students
- Cannot access admin-only endpoints

### Admin
- Has all staff permissions
- Can suspend student accounts (revokes all tokens)
- Can reinstate student accounts
- Has access to all endpoints

## How Teammates Can Check Student Status

Other modules in the Service Management System can check a student's verification status by:

1. **Through the User model**: 
   ```php
   $user->student->status // Returns: pending, verified, rejected, or suspended
   ```

2. **Through the API** (if building a separate service):
   - Authenticate as the student or use an API key with appropriate permissions
   - Call `GET /api/me` to get user data including student status
   - Or call `GET /api/staff/verifications` with appropriate filters to check verification status

3. **Database Direct Access** (if sharing database):
   - Check the `status` column in the `students` table
   - Join with `users` table to get user information

## Testing

Run the test suite:
```bash
php artisan test
```

## Core API Integration

The system includes a flexible `CoreApiClient` service for integrating with the core service management system:

### Configuration
Set these in your `.env` file:
```env
CORE_API_URL=http://localhost:8000/api
CORE_API_KEY=your_api_key_here
CORE_API_KEY_HEADER=X-API-KEY
CORE_API_KEY_SCHEME=Bearer
CORE_API_TIMEOUT=30
```

### Usage
```php
use App\Services\CoreApiClient;

$coreApi = new CoreApiClient();

// Get orders for a student
$response = $coreApi->get('/orders', ['student_id' => $studentId]);

// Ping the core system
$isAvailable = $coreApi->ping();
```

### API Key Management (for core system to access this service)
```bash
# Create a new API key
php artisan apikey:create

# Follow the prompts to set:
# - Name
# - Abilities (comma-separated)
# - Allowed IPs (comma-separated, empty for any)
# - Expiration date (Y-m-d H:i:s, empty for none)
```

The system will generate and display the full API key only once - store it securely!

## Security Features

- **Token-based Authentication**: Laravel Sanctum for secure API authentication
- **Role-based Access Control**: Middleware checks for role permissions
- **File Storage Security**: Files stored privately with random names, no direct URL access
- **Input Validation**: Form requests and inline validation for all inputs
- **SQL Injection Protection**: Eloquent ORM and query builder protection
- **CSRF Protection**: Laravel's built-in CSRF protection for web routes
- **CORS Configuration**: Configured for frontend development origins
- **Audit Logging**: All significant actions logged with user, action, entity, and metadata
- **Password Hashing**: Bcrypt hashing for stored passwords
- **Session Security**: Secure session configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is proprietary and part of the Service Management System.

--- 

**Note**: This is Module 1 of the Service Management System. Other modules (printing orders, staff IDs, stickers) will be developed by teammates and will integrate with this system through the database and API interfaces provided.