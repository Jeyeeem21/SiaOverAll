You are a senior Laravel + React developer. Build "Module 1: Student Account & Verification" as a standalone system. It is part of a larger Service Management System (printing orders, staff IDs, stickers), and other modules built by teammates will depend on it.

## Stack
- Backend: Laravel 11/12 (PHP 8.2+), Laravel Sanctum token auth, MySQL (SQLite is fine for local dev)
- Frontend: React (Vite), react-router-dom, axios
- Separate repos/folders: `backend/` and `frontend/`

## Roles
- student: registers, uploads verification documents, tracks status
- staff: reviews documents and approves or rejects them
- admin: everything staff can do, plus suspending and reinstating students
- Staff and admin accounts are created by a seeder only, never through public registration.
- Never set `role` from request input.

## Database
- users: default Laravel table plus `role` (string, default 'student', indexed)
- students: user_id (unique FK), reference_no (unique, format STU-YYYY-XXXXXX), student_number (unique), college, department, contact_number, status (pending|verified|rejected|suspended, default pending), verified_at, verified_by
- student_verifications: student_id, document_type (school_id|registration_form), file_path, original_name, mime, size, status (pending|approved|rejected), rejection_reason, reviewer_note, reviewed_by, reviewed_at. `file_path` must be hidden from JSON.
- audit_logs: user_id, action, entity_type, entity_id, meta (json), ip, created_at
- Laravel's notifications table (database channel)

## API (all under /api, JSON)
Public (throttled):
- POST /register: creates the user (role student) and student (status pending) in one transaction, returns the user and a token
- POST /login: returns the user and a token. Suspended students get 403. Pending and rejected students may log in.

Authenticated (auth:sanctum):
- POST /logout, GET /me (user + student + verifications)
- PUT /me/profile: name, college, department, contact_number. `student_number` is NOT editable.
- POST /verifications: multipart upload with document_type and file
  - Allowed types: pdf, jpg, jpeg, png. Max 10 MB.
  - Store on the PRIVATE `local` disk under verifications/{student_id}/ with a random file name.
  - Reject if the student is suspended, already verified, or already has a pending document.
  - Resubmitting after a rejection sets the student back to pending.
- GET /verifications/{id}/file: only the owning student or staff/admin may download it, and every access writes a `document.viewed` audit log.
- GET /notifications and POST /notifications/read
- GET /me/orders: calls an external "core system" through an API-key HTTP client (see below). Return 503 if it fails.

Staff/admin (role:staff,admin):
- GET /staff/verifications?status=pending|approved|rejected|all (paginated)
- POST /staff/verifications/{id}/approve: sets the verification to approved and the student to verified. Only pending documents can be reviewed.
- POST /staff/verifications/{id}/reject: `reason` is required and must be one of corrupted_file, unsupported_format, unclear_scan, incomplete_requirements, inappropriate_content, other. `note` is optional (max 500). The student becomes rejected.
- Approve and reject send a database notification to the student and write an audit log.

Admin only:
- POST /admin/students/{id}/suspend: revokes all of that user's tokens
- POST /admin/students/{id}/reinstate: back to verified if verified_at is set, otherwise pending

## Security rules
- A student's own data always comes from `$request->user()`, never from an ID in the URL. A student must never be able to read another student's data or files.
- Do not use the public disk and do not run `storage:link`.
- Use Form Requests or inline validation. Wrap multi-table writes in transactions. Add a `role` middleware alias.
- Configure CORS for the React dev origin.

## Flexible API-key integration (outbound)
Create a `CoreApiClient` service that is the only place that knows the external system's URL and key. Everything comes from `.env` through `config/services.php`:
CORE_API_URL, CORE_API_KEY, CORE_API_KEY_HEADER (default X-API-KEY), CORE_API_KEY_SCHEME (optional, e.g. Bearer), CORE_API_TIMEOUT, and the endpoint paths.
Use Laravel's Http client with a timeout, a small retry, JSON accept, and get/post/ping helpers. The API key must never be sent to or exposed in the React app.

Also create the inbound counterpart for the core side:
- an `api_keys` table: name, key_prefix, key_hash (sha256, unique), abilities (json), allowed_ips (json), expires_at, revoked_at, last_used_at
- an `ApiKey` model that generates a key once ("sia_" + 40 random chars) and stores only the hash
- an `api.key:{ability}` middleware that checks the header, expiry, revocation, IP, and ability, and updates last_used_at at most every 5 minutes
- an `apikey:create` artisan command

## Frontend pages
- Login and Register (register fields: name, student_number, college, department, contact_number, email, password, password_confirmation)
- StudentDashboard: profile summary, status badge, rejection reason shown when rejected, upload form (only when status is pending or rejected and no pending document exists), list of own documents with a "View" button, notifications with "mark all read"
- StaffQueue (staff/admin): status filter, table with student info, "View file", Approve, and Reject with a reason dropdown and optional note
- AuthContext (login, register, logout, refresh), ProtectedRoute with role checks, and an axios instance that adds the Bearer token and redirects to /login on 401
- Documents are private: fetch the file with the auth header as a blob and open it, never link directly to a URL
- Show Laravel validation errors in readable text

## Deliverables
1. All migrations, models, controllers, middleware, routes, notification class, StaffSeeder, and the API-key files
2. The full React source
3. A README with exact setup commands (composer, install:api, make:notifications-table, migrate, seed, serve, npm install, dev), the .env variables, and a short note on how teammates' modules can check a student's status
4. PHPUnit feature tests for: registration, a student being unable to download another student's file, role restrictions on staff/admin routes, the approve/reject flow, and the suspended-login block
