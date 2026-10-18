# Database Integration Guide

## Laravel Database Field Names Used

This document shows the exact database field names used in the Student Account System, matching your Laravel project structure.

**Note:** All development navigation components have been removed. The system now uses only the mobile bottom navigation for a clean, production-ready interface.

### Users Table (`users`)
```sql
- id (Primary Key)
- name (String)
- email (String, Unique)
- email_verified_at (Timestamp, Nullable)
- password (String)
- role (String, Default: 'student', Indexed)
- remember_token (String, Nullable)
- created_at (Timestamp)
- updated_at (Timestamp)
```

### Students Table (`students`)
```sql
- id (Primary Key)
- user_id (Foreign Key → users.id, Cascade Delete)
- reference_no (String, Unique)
- student_number (String, Unique)
- college (String)
- department (String)  
- contact_number (String)
- status (ENUM: 'pending', 'verified', 'rejected', 'suspended', Default: 'pending')
- verified_at (Timestamp, Nullable)
- verified_by (Foreign Key → users.id, Set Null)
- created_at (Timestamp)
- updated_at (Timestamp)
```

### Student Verifications Table (`student_verifications`)
```sql
- id (Primary Key)
- student_id (Foreign Key → students.id, Cascade Delete)
- document_type (ENUM: 'school_id', 'registration_form')
- file_path (String)
- original_name (String)
- mime (String)
- size (Integer - bytes)
- status (ENUM: 'pending', 'approved', 'rejected', Default: 'pending')
- rejection_reason (String, Nullable)
- reviewer_note (Text, Nullable)
- reviewed_by (Foreign Key → users.id, Set Null)
- reviewed_at (Timestamp, Nullable)
- created_at (Timestamp)
- updated_at (Timestamp)
```

## API Endpoints

### Authentication
- `POST /api/register` - Student registration
- `POST /api/login` - User login

### Student Profile
- `GET /api/student/profile` - Get complete profile
- `GET /api/student/stats` - Dashboard statistics

### Document Management
- `GET /api/student/documents` - List all documents
- `POST /api/student/upload-document` - Upload verification document

### Orders (Mock Data)
- `GET /api/student/orders` - List student orders

## Frontend Field Mapping

### Registration Form Fields
```javascript
{
  name: string,                    // → users.name
  email: string,                   // → users.email
  password: string,                // → users.password (hashed)
  student_number: string,          // → students.student_number
  college: string,                 // → students.college
  department: string,              // → students.department
  contact_number: string           // → students.contact_number
}
```

### Document Upload Fields
```javascript
{
  document_type: 'school_id' | 'registration_form',  // → student_verifications.document_type
  file: File                       // → student_verifications.file_path, original_name, mime, size
}
```

### Profile Response Fields
```javascript
{
  // User fields
  id: number,                      // users.id
  name: string,                    // users.name
  email: string,                   // users.email
  role: string,                    // users.role
  created_at: string,              // users.created_at
  updated_at: string,              // users.updated_at
  
  // Student fields
  reference_no: string,            // students.reference_no
  student_number: string,          // students.student_number
  college: string,                 // students.college
  department: string,              // students.department
  contact_number: string,          // students.contact_number
  status: string,                  // students.status
  verified_at: string|null,        // students.verified_at
  verified_by: number|null,        // students.verified_by
}
```

### Document Response Fields
```javascript
{
  id: number,                      // student_verifications.id
  student_id: number,              // student_verifications.student_id
  document_type: string,           // student_verifications.document_type
  file_path: string,               // student_verifications.file_path
  original_name: string,           // student_verifications.original_name
  mime: string,                    // student_verifications.mime
  size: number,                    // student_verifications.size (in bytes)
  status: string,                  // student_verifications.status
  rejection_reason: string|null,   // student_verifications.rejection_reason
  reviewer_note: string|null,      // student_verifications.reviewer_note
  reviewed_by: number|null,        // student_verifications.reviewed_by
  reviewed_at: string|null,        // student_verifications.reviewed_at
  created_at: string,              // student_verifications.created_at
  updated_at: string               // student_verifications.updated_at
}
```

## Laravel Model Fillable Fields

### User Model
```php
protected $fillable = [
    'name', 'email', 'password', 'role'
];
```

### Student Model  
```php
protected $fillable = [
    'user_id', 'reference_no', 'student_number', 
    'college', 'department', 'contact_number', 
    'status', 'verified_at', 'verified_by'
];
```

### StudentVerification Model
```php
protected $fillable = [
    'student_id', 'document_type', 'file_path', 
    'original_name', 'mime', 'size', 'status', 
    'rejection_reason', 'reviewer_note', 
    'reviewed_by', 'reviewed_at'
];
```

## Integration Notes

1. **Field Names**: All API responses use exact Laravel database column names
2. **Relationships**: Proper foreign key relationships maintained
3. **Enums**: Status fields use exact enum values from migrations
4. **Timestamps**: Laravel's `created_at` and `updated_at` timestamps preserved
5. **File Handling**: Document uploads store file metadata using Laravel conventions

## Database Connection

The API server connects directly to your Laravel SQLite database:
- **Database Path**: `backend/database/database.sqlite`
- **API Server**: Node.js running on port 3002
- **Frontend**: React app on port 3001

This setup ensures seamless integration with your existing Laravel project structure.