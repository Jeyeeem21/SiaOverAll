# Student Records Management System

A modern, full-featured student records management system with auto-generated student ID numbers, advanced search and filtering, and a beautiful responsive UI.

![Status](https://img.shields.io/badge/status-operational-brightgreen)
![Backend](https://img.shields.io/badge/backend-Laravel%2013-red)
![Frontend](https://img.shields.io/badge/frontend-React%2019-blue)
![Database](https://img.shields.io/badge/database-MySQL-orange)

---

## ✨ Features

### Core Functionality
- ✅ **Complete CRUD Operations** - Add, view, edit, delete students
- ✅ **Auto-Generated IDs** - Format: `STUD-2026-000001`
- ✅ **Real-time Search** - Search across student number and names
- ✅ **Advanced Filtering** - Filter by program, department, year level, status
- ✅ **Pagination** - 15 students per page
- ✅ **Soft Deletes** - Data preservation for integrity
- ✅ **Role-based Access** - Admin/Staff/Student permissions (UI ready)

### Modern UI Design
- 🎨 **Gradient Color Scheme** - Blue, Indigo, Cyan gradients
- 📊 **Dashboard Cards** - 4 summary statistics
- 🔍 **Smart Search Panel** - Icon-enhanced inputs
- 📱 **Responsive Design** - Mobile, tablet, desktop
- 🎯 **Status Badges** - Color-coded with icons
- ✨ **Animations** - Hover effects, transitions
- 🎭 **Modal Dialogs** - Full-screen with gradients

---

## 🚀 Quick Start

### Prerequisites
- PHP 8.2+
- Node.js 18+
- MySQL
- Composer

### Installation

**1. Backend Setup**
```bash
cd backend
composer install
cp .env.example .env
# Configure database in .env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve
```

**2. Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

**3. Access**
- Frontend: http://localhost:5173
- Backend: http://127.0.0.1:8000
- Test API: http://127.0.0.1:8000/api/test

---

## 📊 Sample Data

50 students automatically created with:
- Student Numbers: `2026-00001` to `2026-00050`
- Student IDs: `STUD-2026-000001` to `STUD-2026-000050`
- Mixed programs, departments, year levels
- Various verification statuses

---

## 🏗️ Tech Stack

### Backend
- **Framework**: Laravel 13
- **Authentication**: Laravel Sanctum
- **Database**: MySQL
- **API**: RESTful API
- **Validation**: Form Request classes
- **Pattern**: Observer (auto-generate IDs)

### Frontend
- **Library**: React 19.2.8
- **Build Tool**: Vite 8.3.0
- **Styling**: Tailwind CSS 4.3.3
- **State**: React Hooks
- **API Client**: Fetch with credentials

---

## 📁 Project Structure

```
staff/
├── backend/                 # Laravel backend
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/
│   │   │   │   └── StudentController.php
│   │   │   ├── Requests/
│   │   │   └── Resources/
│   │   ├── Models/
│   │   │   └── Student.php
│   │   └── Observers/
│   │       └── StudentObserver.php
│   ├── config/
│   │   ├── cors.php        # CORS configuration
│   │   └── sanctum.php     # Sanctum configuration
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/
│       └── api.php
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── student-id/
│   │   │       └── StudentRecords.jsx
│   │   ├── api/
│   │   │   └── client.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── Documentation/
    ├── STUDENT_RECORDS_FEATURE.md
    ├── USER_GUIDE.md
    ├── QUICK_START.md
    ├── CORS_FIX.md
    └── AUTHENTICATION_SETUP.md
```

---

## 🔌 API Endpoints

### Students
```
GET    /api/students              # List students (paginated, filtered)
POST   /api/students              # Create student
GET    /api/students/{id}         # View student details
PATCH  /api/students/{id}         # Update student
DELETE /api/students/{id}         # Delete student (soft)
```

### Query Parameters
- `search` - Search term (student number, name)
- `program` - Filter by program
- `department` - Filter by department
- `year_level` - Filter by year level
- `verification_status` - Filter by status
- `page` - Page number

### Test Endpoint
```
GET    /api/test                  # Verify API connectivity
```

---

## 🎨 UI Components

### Main Sections
1. **Header** - Gradient banner with title and actions
2. **Dashboard** - 4 summary cards with statistics
3. **Search & Filter** - 5 filter fields with icons
4. **Data Table** - Paginated student list
5. **Modals** - View, Add/Edit, Delete dialogs

### Status Badges
- 🟢 **Verified** - Green badge with checkmark
- 🟡 **Pending** - Amber badge with clock
- ⚪ **Unverified** - Gray badge with X

---

## 🔒 Security

### Current Status (Development)
- ⚠️ Authentication **disabled** for testing
- ⚠️ All endpoints temporarily **public**
- ✅ CORS properly configured
- ✅ Safe for local development

### Production Setup Required
- 🔒 Enable authentication middleware
- 🔒 Implement login/register
- 🔒 Enable role-based access control
- 🔒 Update CORS for production domains
- 🔒 Enable HTTPS

See: **AUTHENTICATION_SETUP.md** for complete guide

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| **STUDENT_RECORDS_FEATURE.md** | Complete technical implementation |
| **USER_GUIDE.md** | End-user instructions & workflows |
| **QUICK_START.md** | 5-minute setup guide |
| **CORS_FIX.md** | CORS configuration details |
| **AUTHENTICATION_SETUP.md** | Security & auth setup |

---

## 🧪 Testing

### Manual Testing
1. Start both servers (backend & frontend)
2. Open http://localhost:5173
3. Test features:
   - View student list ✓
   - Search by name/number ✓
   - Apply filters ✓
   - View details ✓
   - Add student ✓
   - Edit student ✓
   - Delete student ✓
   - Check auto-generated ID ✓

### Browser Console
Should be **clear of errors**:
- ✅ No CORS errors
- ✅ No failed requests
- ✅ Successful API calls

---

## 🐛 Troubleshooting

### CORS Errors
If you see CORS errors:
1. Check backend is on port 8000
2. Check frontend is on port 5173
3. Run: `php artisan config:clear`
4. Restart both servers
5. Hard refresh browser (Ctrl+Shift+R)

See: **CORS_FIX.md** for detailed solution

### No Data Showing
```bash
cd backend
php artisan migrate:fresh --seed
```

### Port Already in Use
```bash
# Backend - use different port
php artisan serve --port=8001

# Frontend - Vite will prompt for alternative
```

---

## 🔄 Database

### Reset & Reseed
```bash
cd backend
php artisan migrate:fresh --seed
```

### Manual Seeding
```bash
php artisan db:seed --class=StudentSeeder
```

### Check Data
```bash
php artisan tinker
Student::count();
Student::first();
exit
```

---

## 🎯 Key Features Highlights

### Auto-Generated Student IDs
```
Format: STUD-YYYY-XXXXXX
Example: STUD-2026-000001

✓ Automatic on creation
✓ Year-based sequencing
✓ Unique constraint
✓ Cannot be edited
✓ Survives soft deletes
```

### Search Capabilities
```
✓ Multi-field search
✓ Real-time filtering (250ms debounce)
✓ Multi-word support
✓ Case-insensitive
✓ Combines with filters
```

### Filter Options
```
✓ Program/Course
✓ Department (NEW)
✓ Year Level
✓ Verification Status
✓ Clear all filters
```

---

## 🚀 Production Deployment

### Backend
```bash
cd backend
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Frontend
```bash
cd frontend
npm run build
# Deploy /dist folder to web server
```

### Environment
```env
APP_ENV=production
APP_DEBUG=false
SESSION_SECURE_COOKIE=true
# Update CORS origins to production domains
```

---

## 📝 License

This project is proprietary software for staff management.

---

## 👥 Credits

**Built with:**
- Laravel 13 - Backend framework
- React 19 - Frontend library
- Tailwind CSS 4 - Styling framework
- Vite 8 - Build tool
- MySQL - Database

---

## 📞 Support

For technical issues or questions:
- Check documentation in root directory
- Review code comments
- Test with sample data first

---

## ✅ Status

- **Development**: ✅ Complete
- **Features**: ✅ All implemented
- **Design**: ✅ Modern UI
- **CORS**: ✅ Configured
- **Data**: ✅ Seeded
- **Authentication**: 🟡 Disabled (testing)
- **Production Ready**: ⚠️ Requires auth setup

---

**Version**: 1.0  
**Last Updated**: October 2026  
**Status**: Operational 🚀
