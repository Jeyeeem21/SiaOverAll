# Requirements Document: Staff-Side Sticker Request Management System

## Functional Requirements

### 1. Request Management

#### 1.1 View Request List
**Description**: Staff must be able to view a list of all sticker requests with filtering and pagination capabilities.

**Acceptance Criteria**:
- Display paginated list of sticker requests (15-20 items per page)
- Show key request information: student name, status, vehicle plate number, submission date
- Filter requests by status (pending, approved, denied, completed)
- Filter requests by date range (from date, to date)
- Search requests by student name or plate number
- Sort requests by submission date (newest first by default)
- Display request count for each status category
- List loads within 500ms under normal conditions

#### 1.2 View Request Details
**Description**: Staff must be able to view comprehensive details of a single sticker request.

**Acceptance Criteria**:
- Display all student information (name, ID number, email)
- Display vehicle information (type, plate number)
- Display current request status
- Show submission timestamp
- Display all uploaded documents with preview capability
- Show status history timeline with timestamps and staff names
- Show any remarks added during review
- Detail view loads within 300ms under normal conditions

#### 1.3 Review Uploaded Documents
**Description**: Staff must be able to review all documents uploaded by students as part of their sticker request.

**Acceptance Criteria**:
- Display list of all uploaded documents with document type labels
- Support viewing of image files (JPEG, PNG)
- Support viewing of PDF files
- Provide zoom functionality for document inspection
- Allow download of individual documents
- Display document upload date and file size
- Show document thumbnail previews in list view
- Support multiple document types: student ID, vehicle registration, photo, other

### 2. Request Status Management

#### 2.1 Approve Request
**Description**: Staff must be able to approve a sticker request after reviewing documents.

**Acceptance Criteria**:
- Provide "Approve" button on pending requests
- Show confirmation dialog before approval
- Allow staff to add optional remarks during approval
- Update request status to "approved" upon confirmation
- Record approval timestamp and staff member ID
- Create status history entry for the transition
- Only allow approval from "pending" status
- Send confirmation feedback to staff after successful approval
- Prevent approval if documents are missing or invalid

#### 2.2 Deny Request
**Description**: Staff must be able to deny a sticker request with reasons.

**Acceptance Criteria**:
- Provide "Deny" button on pending or approved requests
- Show confirmation dialog before denial
- Require remarks explaining reason for denial
- Update request status to "denied" upon confirmation
- Record denial timestamp and staff member ID
- Create status history entry for the transition
- Prevent any further status changes after denial (terminal state)
- Send confirmation feedback to staff after successful denial

#### 2.3 View Status History
**Description**: Staff must be able to view complete status change history for any request.

**Acceptance Criteria**:
- Display chronological timeline of all status changes
- Show previous status and new status for each transition
- Display timestamp for each status change
- Show which staff member made each change
- Display remarks associated with each status change
- Status history is immutable (cannot be edited or deleted)
- History is ordered from newest to oldest

### 3. Sticker Customization

#### 3.1 Access Customization Form
**Description**: Staff must be able to access sticker customization form for approved requests.

**Acceptance Criteria**:
- Provide "Customize Sticker" button/link for approved requests
- Navigate to customization form page
- Pre-fill form with data from the original request
- Only allow customization for requests with "approved" status
- Prevent customization if sticker already exists (completed status)

#### 3.2 Enter Sticker Details
**Description**: Staff must be able to enter and edit all details that will appear on the sticker.

**Acceptance Criteria**:
- Provide input field for vehicle plate number (pre-filled, editable)
- Provide input field for student name (pre-filled, editable)
- Provide input field for student ID number (pre-filled, editable)
- Provide dropdown for vehicle type (motorcycle, car, SUV, van)
- Provide input field for price (default: ₱100.00)
- Provide textarea for optional remarks
- Validate all fields according to rules:
  - Plate number: required, max 20 characters, alphanumeric with hyphens
  - Student name: required, max 255 characters
  - Student ID: required, max 50 characters
  - Price: required, positive number, max 10,000
- Display validation errors inline with field
- Disable submit button while validation errors exist

#### 3.3 Preview Sticker
**Description**: Staff must be able to preview how the sticker will look before finalizing.

**Acceptance Criteria**:
- Display live preview of sticker as form fields are edited
- Preview updates automatically within 500ms after field changes (debounced)
- Preview shows:
  - University name: "Mindoro State University"
  - Vehicle plate number (large, prominent)
  - University logo/seal
  - "GATE PASS" text
  - Vehicle type icon (motorcycle, car, SUV, van)
  - Price (₱100 or custom amount)
  - Serial number (generated automatically)
- Preview matches actual print dimensions and layout
- Show loading indicator while preview is generating
- Display error message if preview generation fails
- Provide manual "Refresh Preview" button

#### 3.4 Generate Serial Number
**Description**: System must automatically generate unique serial numbers for each sticker.

**Acceptance Criteria**:
- Serial number format: MSU-YYYY-XXXXX (e.g., MSU-2024-00001)
- YYYY represents current year
- XXXXX is zero-padded sequential number (00001, 00002, etc.)
- Serial numbers are unique across all stickers
- Serial number sequence resets each calendar year
- Serial number is generated at time of sticker creation
- If duplicate detected, retry up to 10 times before failing

### 4. Sticker Generation and Output

#### 4.1 Create Final Sticker
**Description**: Staff must be able to finalize and create the printable sticker after customization.

**Acceptance Criteria**:
- Provide "Create Sticker" or "Finalize" button on customization form
- Show confirmation dialog before creating
- Generate print-ready file in PDF format
- Alternative: Generate PNG format option
- Store sticker record in database with all details
- Store generated file in secure storage
- Update request status to "completed" after successful creation
- Create status history entry for completion
- Generate confirmation message with serial number
- Creation completes within 5 seconds under normal conditions

#### 4.2 Download Sticker
**Description**: Staff must be able to download the generated sticker for printing.

**Acceptance Criteria**:
- Provide "Download" button on completed requests
- Serve file with appropriate content type (application/pdf or image/png)
- File name format: MSU_GatePass_{SerialNumber}.{ext}
- File opens in new browser tab for PDF
- File downloads directly for PNG
- Support re-downloading same sticker multiple times
- Generate secure signed URL with expiration for downloads

#### 4.3 Print Sticker
**Description**: Staff must be able to print the sticker directly from the application.

**Acceptance Criteria**:
- Provide "Print" button on completed requests
- Open browser print dialog with sticker file
- Default to correct paper size for sticker dimensions
- Preserve print quality and colors
- Support standard office printers
- Optionally support specialized sticker printers

### 5. User Interface and Navigation

#### 5.1 Dashboard Navigation
**Description**: Staff must be able to navigate efficiently between different sections of the application.

**Acceptance Criteria**:
- Provide main navigation menu with sections: Dashboard, Requests, Completed, Profile
- Highlight active section in navigation
- Provide breadcrumb navigation on detail pages
- Support browser back/forward buttons
- Show request count badges on navigation items (e.g., "Pending (5)")

#### 5.2 Responsive Design
**Description**: Application must be usable on different screen sizes.

**Acceptance Criteria**:
- Support desktop displays (1920x1080 and above)
- Support laptop displays (1366x768 and above)
- Support tablet displays (768x1024)
- Mobile support optional but should gracefully degrade
- Layout adjusts automatically based on screen size
- All interactive elements are easily clickable (minimum 44x44px touch targets)

#### 5.3 Feedback and Notifications
**Description**: Staff must receive clear feedback for all actions performed.

**Acceptance Criteria**:
- Display success notification after successful operations (approve, deny, create sticker)
- Display error notification if operations fail
- Show loading indicators during async operations
- Notifications are dismissible
- Notifications auto-dismiss after 5 seconds
- Error messages are descriptive and actionable
- Provide visual confirmation for form submissions

### 6. Authentication and Authorization

#### 6.1 Staff Authentication
**Description**: Only authenticated staff members can access the application.

**Acceptance Criteria**:
- Require login with username and password
- Support JWT token-based authentication
- Tokens expire after configurable period (default: 8 hours)
- Support token refresh mechanism
- Redirect unauthenticated users to login page
- Store authentication token securely (httpOnly cookie)

#### 6.2 Role-Based Access Control
**Description**: Only users with staff role can access staff functions.

**Acceptance Criteria**:
- Verify user has "staff" role before allowing access
- Return 403 Forbidden for non-staff users
- Hide staff-only features from non-staff users in UI
- Log unauthorized access attempts
- Support multiple staff members working concurrently

## Non-Functional Requirements

### 7. Performance

#### 7.1 Response Time
**Description**: Application must respond to user actions within acceptable time limits.

**Acceptance Criteria**:
- Request list page loads in < 500ms (20 items)
- Request detail page loads in < 300ms (including documents)
- Sticker preview generates in < 2 seconds
- Final sticker generation completes in < 5 seconds
- API response time (95th percentile) < 200ms
- Database queries execute in < 100ms for single record retrieval

#### 7.2 Scalability
**Description**: Application must handle expected load and be scalable for growth.

**Acceptance Criteria**:
- Support at least 50 concurrent staff users
- Support at least 1000 pending requests without performance degradation
- Database can store minimum 100,000 historical requests
- File storage can handle minimum 1TB of documents and stickers
- Stateless API design allows horizontal scaling
- Support for load balancing across multiple application servers

#### 7.3 Throughput
**Description**: Application must handle expected transaction volumes.

**Acceptance Criteria**:
- Process minimum 100 request approvals per hour
- Generate minimum 50 stickers per hour
- Support 500 API requests per minute per server instance
- Queue system can handle peak loads during high-volume periods

### 8. Security

#### 8.1 Data Protection
**Description**: Sensitive student and staff data must be protected.

**Acceptance Criteria**:
- All communication over HTTPS only
- Enforce HSTS headers
- Personal information encrypted at rest in database
- Uploaded documents stored outside public web root
- Secure signed URLs for document access with expiration
- No sensitive data in logs or error messages
- SQL injection prevention via ORM
- XSS prevention via output escaping

#### 8.2 File Upload Security
**Description**: Uploaded files must be validated and secured.

**Acceptance Criteria**:
- Maximum file size: 10MB per document
- Allowed file types: JPEG, PNG, PDF only
- File type validation based on content, not just extension
- File name sanitization to prevent path traversal
- Optional: Virus scanning integration for uploaded files
- Files stored with generated unique names, not original names

#### 8.3 Authentication Security
**Description**: Authentication mechanism must be secure.

**Acceptance Criteria**:
- Passwords hashed using bcrypt (minimum 12 rounds)
- JWT tokens signed with secure secret key
- Tokens stored in httpOnly, secure, sameSite cookies
- Support for token expiration and refresh
- Rate limiting on authentication endpoints (max 5 failed attempts per 15 minutes)
- Account lockout after repeated failed login attempts

#### 8.4 Authorization Security
**Description**: Access control must prevent unauthorized actions.

**Acceptance Criteria**:
- All API endpoints protected with authentication middleware
- Role verification on every staff-only endpoint
- Resource-level authorization (staff can only access their institution's data)
- Security event logging for failed authorization attempts
- CORS configuration allows only trusted origins

#### 8.5 Audit Trail
**Description**: All significant actions must be logged for accountability.

**Acceptance Criteria**:
- Log all status changes with timestamp and user ID
- Status history is immutable (no updates or deletes)
- Log all sticker creations with staff member ID
- Log authentication events (login, logout, failed attempts)
- Log file access events for sensitive documents
- Audit logs retained for minimum 2 years
- Support for audit log review and export

### 9. Reliability

#### 9.1 Data Integrity
**Description**: Data must remain consistent and accurate.

**Acceptance Criteria**:
- Database transactions ensure atomicity (all-or-nothing)
- Foreign key constraints enforce referential integrity
- Unique constraints prevent duplicate serial numbers and plate numbers
- Validation rules enforced at database and application layers
- Automatic rollback on any error during multi-step operations
- Data backup performed daily

#### 9.2 Error Handling
**Description**: Application must handle errors gracefully.

**Acceptance Criteria**:
- All exceptions caught and logged
- User-friendly error messages displayed (no technical details)
- Application remains stable after errors (no crashes)
- Failed operations can be retried
- Detailed error information logged for debugging
- Support for error notification to administrators

#### 9.3 Availability
**Description**: Application must be available during business hours.

**Acceptance Criteria**:
- Target uptime: 99% during business hours (8 AM - 6 PM)
- Planned maintenance during off-peak hours only
- Graceful degradation if non-critical services fail
- Health check endpoint for monitoring
- Automatic restart on application crash

### 10. Usability

#### 10.1 User Interface Design
**Description**: Interface must be intuitive and easy to use.

**Acceptance Criteria**:
- Consistent visual design across all pages
- Clear labeling of all form fields and buttons
- Logical workflow from request review to sticker generation
- Minimal clicks required to complete common tasks
- Helpful tooltips on complex fields
- Keyboard navigation support for form fields

#### 10.2 Accessibility
**Description**: Application should be accessible to users with disabilities.

**Acceptance Criteria**:
- Semantic HTML elements used throughout
- Sufficient color contrast ratios (WCAG AA minimum)
- All interactive elements keyboard accessible
- Alt text provided for images
- Form fields have associated labels
- Error messages announced to screen readers

#### 10.3 Error Prevention
**Description**: Design should help prevent user errors.

**Acceptance Criteria**:
- Confirmation dialogs for destructive actions (deny request, delete)
- Validation feedback before form submission
- Auto-save for long forms (optional)
- Disabled buttons during processing to prevent double-submission
- Clear indication of required vs optional fields

### 11. Maintainability

#### 11.1 Code Quality
**Description**: Codebase must be maintainable and well-documented.

**Acceptance Criteria**:
- Code follows Laravel and React best practices
- Consistent code style enforced by linters (Laravel Pint, ESLint)
- Minimum 80% test coverage
- API endpoints documented with OpenAPI/Swagger
- Inline code comments for complex logic
- README with setup and deployment instructions

#### 11.2 Logging and Monitoring
**Description**: Application must provide visibility into operation and issues.

**Acceptance Criteria**:
- Application logs structured with severity levels (debug, info, warning, error)
- Logs include request ID for tracing
- Performance metrics collected (response times, throughput)
- Error tracking integration (Sentry or similar)
- Database query performance monitoring
- Support for log aggregation and search

#### 11.3 Configuration Management
**Description**: Application configuration must be flexible and environment-specific.

**Acceptance Criteria**:
- Environment variables for all configuration
- Separate configuration for development, staging, production
- Sensitive configuration (secrets) not committed to version control
- Configuration validation on application startup
- Support for feature flags to enable/disable features

### 12. Compatibility

#### 12.1 Browser Support
**Description**: Application must work on modern web browsers.

**Acceptance Criteria**:
- Google Chrome (latest 2 versions)
- Mozilla Firefox (latest 2 versions)
- Microsoft Edge (latest 2 versions)
- Safari (latest 2 versions)
- No Internet Explorer support required

#### 12.2 Database Compatibility
**Description**: Application must support common database systems.

**Acceptance Criteria**:
- SQLite for development and testing
- PostgreSQL 13+ for production
- MySQL 8+ for production (alternative)
- Database migrations for version control
- Seeder scripts for test data

#### 12.3 PHP and Node Version Support
**Description**: Application must specify and support specific runtime versions.

**Acceptance Criteria**:
- PHP 8.3 or higher required for backend
- Node.js 18 or higher required for frontend build
- Laravel 13.17 framework
- React 19.3.1 framework
- Dependency versions locked in composer.lock and package-lock.json

### 13. Data Management

#### 13.1 Data Retention
**Description**: Define how long data is retained in the system.

**Acceptance Criteria**:
- Active requests retained indefinitely
- Completed requests retained for minimum 5 years
- Denied requests retained for minimum 2 years
- Audit logs retained for minimum 2 years
- Generated sticker files retained for minimum 3 years
- Support for data archival after retention period

#### 13.2 Data Export
**Description**: Support exporting data for reporting and backup.

**Acceptance Criteria**:
- Export request list to CSV format
- Export includes all request fields and current status
- Export filtered results (not just all data)
- Export sticker generation report (serial numbers, dates, staff)
- Support for date range filtering on exports

### 14. Deployment

#### 14.1 Deployment Environment
**Description**: Define target deployment environment and requirements.

**Acceptance Criteria**:
- Backend deployable on Linux servers (Ubuntu 22.04 LTS or similar)
- Frontend served as static files (build output)
- Support for Docker containerization
- Environment-specific configuration files
- Zero-downtime deployment capability (optional)

#### 14.2 Database Migration
**Description**: Support for database schema versioning and migration.

**Acceptance Criteria**:
- All schema changes managed via Laravel migrations
- Migrations can be run forward (up) and backward (down)
- Seeder scripts for initial data and test data
- Migration rollback capability for error recovery
- Documentation of manual migration steps (if any)

## Constraints

### Technical Constraints
- Backend must use Laravel 13.17 (PHP 8.3+)
- Frontend must use React 19.3.1
- Database: SQLite (dev), PostgreSQL or MySQL (production)
- Must work with existing project structure (backend/ and frontend/ directories)

### Business Constraints
- Sticker template must match university official design
- Serial number format is fixed: MSU-YYYY-XXXXX
- Price field default is ₱100 but should be configurable per sticker

### Regulatory Constraints
- Comply with data privacy regulations (Data Privacy Act of 2012 - Philippines)
- Retain student data only as long as necessary
- Provide data access and deletion upon request
- Secure handling of personal information

## Assumptions

1. Students submit requests through a separate student-facing application (not part of this spec)
2. Staff members are already registered in the system with appropriate roles
3. University logo and sticker template assets will be provided
4. Printer configuration is handled by staff locally (not in application)
5. Payment processing happens offline (not part of this application)
6. One university instance (not multi-tenant)
7. Internet connectivity is available (no offline mode required)
8. Email notification system exists for notifying students (not part of this spec)

## Dependencies

### External Dependencies
- Laravel Framework 13.17
- React 19.3.1
- PDF generation library (e.g., dompdf, laravel-pdf)
- Image manipulation library (e.g., Intervention Image)
- Authentication library (Laravel Sanctum)
- UI component library (Material-UI or Ant Design)

### Integration Points
- Student-facing application (source of requests)
- Email notification system (for student notifications)
- Institutional authentication system (optional SSO)
- File storage system (local filesystem or cloud storage)

### Infrastructure Requirements
- Web server (Apache or Nginx)
- PHP 8.3+ runtime
- Database server (PostgreSQL or MySQL)
- File storage (minimum 1TB capacity)
- SSL certificate for HTTPS
