# Tasks: Staff-Side Sticker Request Management System

## 1. Backend Setup and Configuration

### 1.1 Database Schema Setup
- [x] Create migration for `sticker_requests` table
- [x] Create migration for `stickers` table
- [x] Create migration for `request_documents` table
- [x] Create migration for `request_status_histories` table
- [~] Create migration to add `role` field to `users` table
- [~] Create database indexes for performance optimization
- [~] Run migrations and verify schema

### 1.2 Eloquent Models
- [~] Create `StickerRequest` model with relationships and casts
- [~] Create `Sticker` model with relationships and casts
- [~] Create `RequestDocument` model with relationships
- [~] Create `RequestStatusHistory` model with relationships
- [~] Update `User` model with staff role relationship

### 1.3 Enums and DTOs
- [~] Create `RequestStatus` enum (pending, approved, denied, completed)
- [~] Create `VehicleType` enum (motorcycle, car, suv, van)
- [~] Create `DocumentType` enum (student_id, registration, photo, other)
- [~] Create `StickerCustomizationData` DTO class

### 1.4 Install Dependencies
- [~] Install Laravel Sanctum for API authentication (`composer require laravel/sanctum`)
- [~] Install PDF generation package (`composer require barryvdh/laravel-dompdf` or `spatie/laravel-pdf`)
- [~] Install image manipulation package (`composer require intervention/image`)
- [~] Install Laravel Permission package (`composer require spatie/laravel-permission`)
- [~] Configure installed packages

## 2. Backend API - Request Management

### 2.1 Request Service Layer
- [~] Create `StickerRequestService` class
- [~] Implement `getRequests()` method with filtering and pagination
- [~] Implement `getRequestById()` method with eager loading
- [~] Implement `updateStatus()` method with validation
- [~] Implement `validateStatusTransition()` method
- [~] Implement `getRequestDocuments()` method
- [~] Add unit tests for service methods

### 2.2 Request Controller
- [~] Create `StickerRequestController` API controller
- [~] Implement `index()` action for listing requests
- [~] Implement `show()` action for request details
- [~] Implement `updateStatus()` action for status changes
- [~] Add request validation classes
- [~] Add API resource transformers for JSON responses
- [~] Add controller tests

### 2.3 Document Management
- [~] Create `DocumentService` for file operations
- [~] Implement document upload handling
- [~] Implement signed URL generation for secure access
- [~] Configure file storage disk in `config/filesystems.php`
- [~] Add document validation (type, size, content)
- [~] Add tests for document operations

### 2.4 API Routes
- [~] Define API routes in `routes/api.php`
- [~] Apply authentication middleware (`auth:sanctum`)
- [~] Apply role middleware (`role:staff`)
- [~] Add rate limiting to routes
- [~] Document routes with comments

## 3. Backend API - Sticker Generation

### 3.1 Sticker Service Layer
- [~] Create `StickerService` class
- [~] Implement `generatePreview()` method
- [~] Implement `createSticker()` method with transaction handling
- [~] Implement `getStickerById()` method
- [~] Implement `regenerateSticker()` method
- [~] Implement `getStickerFilePath()` method
- [~] Add unit tests for sticker service

### 3.2 Sticker Generator Service
- [~] Create `StickerGeneratorService` class
- [~] Implement `renderPreview()` for base64 image generation
- [~] Implement `renderPrintable()` for PDF/PNG generation
- [~] Implement `getNextSerialNumber()` with uniqueness check
- [~] Create HTML/CSS sticker template file
- [~] Implement template placeholder replacement
- [~] Add tests for generator service

### 3.3 Sticker Controller
- [~] Create `StickerController` API controller
- [~] Implement `preview()` action for preview generation
- [~] Implement `store()` action for sticker creation
- [~] Implement `show()` action for sticker details
- [~] Implement `download()` action for file serving
- [~] Add validation classes for sticker requests
- [ ] Add controller tests

### 3.4 Template Assets
- [~] Create sticker template HTML file in `resources/templates/`
- [~] Style template with CSS matching university design
- [~] Add placeholder variables for dynamic content
- [~] Include university logo image asset
- [~] Create vehicle type icon assets (motorcycle, car, SUV, van)
- [~] Test template rendering with sample data

## 4. Backend - Authentication and Authorization

### 4.1 Authentication Setup
- [~] Configure Laravel Sanctum in `config/sanctum.php`
- [~] Run Sanctum migrations (`vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"`)
- [~] Create authentication controller for staff login
- [~] Implement login endpoint with JWT token generation
- [~] Implement logout endpoint with token revocation
- [~] Implement token refresh endpoint
- [~] Add authentication tests

### 4.2 Role-Based Access Control
- [~] Configure Spatie Permission package
- [~] Create `staff` role in database seeder
- [~] Create middleware for role verification
- [~] Apply middleware to protected routes
- [~] Implement authorization checks in controllers
- [~] Add authorization tests

### 4.3 Security Hardening
- [~] Configure CORS in `config/cors.php`
- [~] Add HTTPS enforcement middleware
- [~] Configure rate limiting for API endpoints
- [~] Add input sanitization
- [~] Configure secure session settings
- [~] Add security tests

## 5. Backend - Testing and Documentation

### 5.1 Unit Tests
- [~] Write tests for `StickerRequestService`
- [~] Write tests for `StickerService`
- [~] Write tests for `StickerGeneratorService`
- [~] Write tests for status transition validation
- [~] Write tests for serial number generation
- [~] Achieve minimum 80% code coverage

### 5.2 Integration Tests
- [~] Write API integration tests for request endpoints
- [~] Write API integration tests for sticker endpoints
- [~] Write tests for authentication flow
- [~] Write tests for file upload/download
- [~] Write tests for concurrent request handling
- [~] Write tests for error scenarios

### 5.3 Database Seeding
- [~] Create seeder for test staff users
- [~] Create seeder for sample sticker requests
- [~] Create seeder for sample documents
- [~] Create seeder for roles and permissions
- [~] Create factory classes for model generation

### 5.4 API Documentation
- [~] Install API documentation tool (e.g., Scramble, L5 Swagger)
- [~] Document all API endpoints with annotations
- [~] Add request/response examples
- [~] Document authentication requirements
- [~] Document error responses

## 6. Frontend - Project Setup

### 6.1 Install Dependencies
- [~] Install React Router (`npm install react-router-dom`)
- [~] Install HTTP client (`npm install axios`)
- [~] Install UI component library (`npm install @mui/material @emotion/react @emotion/styled`)
- [~] Install form library (`npm install react-hook-form yup`)
- [~] Install state management (`npm install @tanstack/react-query zustand`)
- [~] Install utilities (`npm install date-fns classnames react-toastify`)
- [~] Install file handling (`npm install react-dropzone react-pdf`)

### 6.2 Project Structure
- [~] Create folder structure: `src/components/`, `src/pages/`, `src/services/`, `src/hooks/`, `src/types/`, `src/utils/`
- [~] Set up routing configuration in `App.tsx`
- [~] Create layout components (Header, Sidebar, Footer)
- [~] Set up React Query provider
- [~] Set up Toast notification provider
- [~] Create global styles and theme

### 6.3 TypeScript Types
- [~] Create type definitions for `StickerRequest`
- [~] Create type definitions for `Sticker`
- [~] Create type definitions for `RequestDocument`
- [~] Create type definitions for `StatusHistoryEntry`
- [~] Create enum definitions (RequestStatus, VehicleType, DocumentType)
- [~] Create API response types

## 7. Frontend - API Integration Layer

### 7.1 API Client Setup
- [~] Create axios instance with base URL configuration
- [~] Implement request interceptor for authentication token
- [~] Implement response interceptor for error handling
- [~] Create API error handling utility
- [~] Implement token storage and retrieval
- [~] Add retry logic for failed requests

### 7.2 API Service Functions
- [~] Create `fetchStickerRequests()` function
- [~] Create `fetchStickerRequest()` function for single request
- [~] Create `updateRequestStatus()` function
- [~] Create `fetchRequestDocuments()` function
- [~] Create `generateStickerPreview()` function
- [~] Create `createSticker()` function
- [~] Create `downloadSticker()` function
- [~] Add TypeScript types for all function parameters and returns

### 7.3 React Query Hooks
- [~] Create `useRequests()` hook for fetching request list
- [~] Create `useRequest()` hook for single request
- [~] Create `useUpdateStatus()` mutation hook
- [~] Create `useCreateSticker()` mutation hook
- [~] Create `useStickerPreview()` hook
- [~] Configure cache invalidation strategies

## 8. Frontend - Request Management Pages

### 8.1 Request List Page
- [~] Create `RequestListPage` component
- [~] Implement request table/grid with columns
- [~] Add pagination controls
- [~] Add status filter dropdown
- [~] Add date range filter inputs
- [~] Add search input with debouncing
- [~] Add loading and error states
- [~] Add "View Details" action button
- [~] Style page with responsive layout

### 8.2 Request Detail Page
- [~] Create `RequestDetailPage` component
- [~] Display student information section
- [~] Display vehicle information section
- [~] Display current status with badge
- [~] Implement breadcrumb navigation
- [~] Add "Approve" and "Deny" action buttons
- [~] Add "Customize Sticker" button for approved requests
- [~] Display status history timeline
- [ ] Add loading and error states

### 8.3 Document Viewer Component
- [~] Create `DocumentViewer` component
- [~] Display document list with thumbnails
- [~] Implement lightbox/modal for full document view
- [~] Add zoom controls for images
- [~] Add PDF viewer integration
- [~] Add download button for each document
- [~] Handle different document types appropriately
- [~] Add loading states for document fetching

### 8.4 Status Update Components
- [~] Create `ApprovalDialog` component
- [~] Add confirmation message
- [~] Add optional remarks textarea
- [~] Add form validation
- [~] Implement submit handler
- [~] Add loading state during submission
- [~] Add success/error feedback
- [~] Create similar `DenyDialog` component with required remarks

## 9. Frontend - Sticker Customization

### 9.1 Customization Form Component
- [~] Create `StickerCustomizationForm` component
- [~] Add input field for plate number with validation
- [~] Add input field for student name with validation
- [~] Add input field for student ID with validation
- [~] Add dropdown for vehicle type
- [~] Add input field for price with number validation
- [~] Add textarea for remarks (optional)
- [~] Implement form validation with error display
- [~] Add submit button with loading state
- [~] Pre-fill form with request data

### 9.2 Sticker Preview Component
- [~] Create `StickerPreview` component
- [~] Display sticker layout matching template
- [~] Show all dynamic fields from form
- [~] Add loading indicator during preview generation
- [~] Implement debounced preview updates (500ms)
- [~] Add manual refresh button
- [~] Handle preview generation errors
- [~] Match print dimensions in display

### 9.3 Customization Page
- [~] Create `StickerCustomizationPage` component
- [~] Integrate customization form and preview
- [~] Implement two-column layout (form left, preview right)
- [~] Add page title and breadcrumbs
- [~] Connect form changes to preview updates
- [~] Implement sticker creation submission
- [~] Handle success with navigation to completed request
- [~] Handle errors with user feedback

## 10. Frontend - Completed Stickers

### 10.1 Sticker Display Component
- [~] Create `StickerDisplay` component for completed stickers
- [~] Show final sticker details (serial number, plate, etc.)
- [~] Display generation timestamp and staff member
- [~] Add download button
- [~] Add print button opening print dialog
- [~] Show sticker preview image
- [~] Handle download errors

### 10.2 Completed Requests List
- [~] Create filter/tab for completed requests in RequestListPage
- [~] Add "Download Sticker" action in list view
- [~] Add visual indicator for completed status
- [~] Display serial number in list
- [~] Add quick print action

## 11. Frontend - Navigation and Layout

### 11.1 Main Navigation
- [~] Create `Navigation` component with menu items
- [~] Add "Dashboard" link
- [~] Add "Pending Requests" link with count badge
- [~] Add "Completed" link
- [~] Add "Profile" link
- [~] Highlight active route
- [~] Make navigation responsive

### 11.2 Dashboard Page
- [~] Create `DashboardPage` component
- [~] Show summary statistics (total pending, approved today, completed today)
- [~] Show recent requests list
- [~] Add quick action buttons
- [~] Create stat cards with icons
- [~] Make dashboard responsive

### 11.3 Layout Components
- [~] Create `MainLayout` wrapper component
- [~] Create `Header` component with logo and user menu
- [~] Create `Sidebar` component with navigation
- [~] Create `Footer` component (optional)
- [~] Implement responsive layout (collapsible sidebar on mobile)
- [~] Add logout functionality in header

## 12. Frontend - Authentication

### 12.1 Login Page
- [~] Create `LoginPage` component
- [~] Add username input field
- [~] Add password input field
- [~] Add "Login" button
- [~] Implement form validation
- [~] Handle login API call
- [~] Store authentication token
- [~] Redirect to dashboard on success
- [~] Display error messages on failure

### 12.2 Authentication Context
- [~] Create authentication context provider
- [~] Implement login function
- [~] Implement logout function
- [~] Implement token refresh logic
- [~] Store user information in context
- [~] Provide authentication status

### 12.3 Protected Routes
- [~] Create `ProtectedRoute` component
- [~] Check authentication status
- [~] Redirect to login if not authenticated
- [~] Wrap all protected pages with ProtectedRoute
- [~] Handle token expiration

## 13. Frontend - User Experience

### 13.1 Loading States
- [~] Create reusable `LoadingSpinner` component
- [~] Create skeleton loaders for list items
- [~] Add loading states to all async operations
- [~] Add page-level loading indicator
- [~] Ensure smooth transitions

### 13.2 Error Handling
- [~] Create error boundary component
- [~] Create `ErrorMessage` display component
- [~] Implement global error handling
- [~] Add retry functionality for failed operations
- [~] Display user-friendly error messages
- [~] Log errors for debugging

### 13.3 Notifications and Feedback
- [~] Configure toast notification system
- [~] Create success notification helper
- [~] Create error notification helper
- [~] Add notifications after status updates
- [~] Add notifications after sticker creation
- [~] Make notifications dismissible
- [~] Set auto-dismiss timeout (5 seconds)

### 13.4 Form Validation
- [~] Create reusable validation schemas with Yup
- [~] Implement inline error messages for form fields
- [~] Add validation for plate number format
- [~] Add validation for required fields
- [~] Add validation for field length limits
- [~] Disable submit buttons while validation fails

## 14. Frontend - Styling and Responsiveness

### 14.1 Global Styles
- [~] Set up theme configuration (colors, typography, spacing)
- [~] Create global CSS reset/normalize
- [~] Define CSS variables for consistency
- [~] Set up Material-UI theme customization
- [~] Apply university branding colors

### 14.2 Component Styling
- [~] Style RequestListPage with responsive grid/table
- [~] Style RequestDetailPage with card layouts
- [~] Style StickerCustomizationForm with proper spacing
- [~] Style navigation and header
- [~] Style buttons consistently across app
- [~] Add hover and focus states

### 14.3 Responsive Design
- [~] Test and adjust layout for desktop (1920x1080)
- [~] Test and adjust layout for laptop (1366x768)
- [~] Test and adjust layout for tablet (768x1024)
- [~] Ensure mobile graceful degradation
- [~] Test navigation on small screens
- [~] Ensure touch targets are minimum 44x44px

## 15. Testing

### 15.1 Frontend Unit Tests
- [~] Write tests for API service functions
- [~] Write tests for validation functions
- [~] Write tests for utility functions
- [~] Write tests for custom hooks
- [~] Achieve minimum 80% coverage for utilities

### 15.2 Frontend Component Tests
- [~] Write tests for RequestListPage component
- [~] Write tests for RequestDetailPage component
- [~] Write tests for StickerCustomizationForm component
- [~] Write tests for ApprovalDialog component
- [~] Write tests for DocumentViewer component
- [~] Test user interactions (clicks, form submissions)
- [~] Test conditional rendering

### 15.3 Integration Tests
- [~] Test complete approval workflow
- [~] Test complete sticker creation workflow
- [~] Test authentication flow
- [~] Test navigation between pages
- [~] Test error recovery scenarios

### 15.4 End-to-End Testing (Optional)
- [~] Set up E2E testing framework (Cypress or Playwright)
- [~] Write E2E test for login and dashboard access
- [~] Write E2E test for approving a request
- [~] Write E2E test for creating a sticker
- [~] Write E2E test for downloading sticker

## 16. Deployment and DevOps

### 16.1 Backend Deployment Preparation
- [~] Create production environment configuration
- [~] Set up database for production (PostgreSQL/MySQL)
- [~] Configure file storage (local or cloud)
- [~] Set up environment variables for production
- [~] Configure web server (Nginx/Apache)
- [~] Set up SSL certificate for HTTPS
- [~] Create deployment script

### 16.2 Frontend Build and Deployment
- [~] Configure production build settings
- [~] Optimize bundle size (code splitting, lazy loading)
- [~] Build production assets (`npm run build`)
- [~] Configure web server to serve static files
- [~] Set up environment-specific API URLs
- [~] Configure routing for SPA (rewrite rules)

### 16.3 Docker Setup (Optional)
- [~] Create Dockerfile for Laravel backend
- [~] Create Dockerfile for React frontend (or use nginx for built files)
- [~] Create docker-compose.yml for full stack
- [~] Configure volumes for persistent storage
- [~] Document Docker setup instructions

### 16.4 Monitoring and Logging
- [~] Set up application logging in production
- [~] Configure log rotation
- [~] Set up error tracking (Sentry integration)
- [~] Create health check endpoint
- [~] Set up uptime monitoring
- [~] Configure performance monitoring

## 17. Documentation

### 17.1 Developer Documentation
- [~] Write README.md with project overview
- [~] Document installation steps for backend
- [~] Document installation steps for frontend
- [~] Document environment variable configuration
- [~] Document database setup and migrations
- [~] Create architecture diagram
- [~] Document API endpoints

### 17.2 User Documentation
- [~] Create user guide for staff members
- [~] Document request review workflow
- [~] Document sticker customization process
- [~] Create troubleshooting guide
- [~] Add screenshots for key features
- [~] Document common error scenarios

### 17.3 Deployment Documentation
- [~] Document server requirements
- [~] Document deployment steps
- [~] Document backup and restore procedures
- [~] Document update/upgrade process
- [~] Create maintenance checklist

## 18. Final Testing and QA

### 18.1 Functional Testing
- [~] Test all requirement acceptance criteria
- [~] Test all user workflows end-to-end
- [~] Test edge cases and error scenarios
- [~] Test with various data volumes
- [~] Verify all validation rules

### 18.2 Performance Testing
- [~] Load test API endpoints
- [~] Test with 50 concurrent users
- [~] Test with 1000 pending requests
- [~] Measure page load times
- [~] Measure sticker generation time
- [~] Optimize slow operations

### 18.3 Security Testing
- [~] Test authentication and authorization
- [~] Test file upload security
- [~] Test SQL injection prevention
- [~] Test XSS prevention
- [~] Test CSRF protection
- [~] Verify HTTPS enforcement
- [~] Review audit logs

### 18.4 Browser and Device Testing
- [~] Test on Chrome (latest)
- [~] Test on Firefox (latest)
- [~] Test on Edge (latest)
- [~] Test on Safari (latest)
- [~] Test on desktop resolutions
- [~] Test on tablet resolutions
- [~] Test printing functionality

## 19. Launch Preparation

### 19.1 Pre-Launch Checklist
- [~] Complete all critical features
- [~] Fix all critical bugs
- [~] Complete security review
- [~] Perform final QA testing
- [~] Prepare production database
- [~] Back up all data
- [~] Verify monitoring is active

### 19.2 Launch
- [~] Deploy backend to production
- [~] Deploy frontend to production
- [~] Run database migrations
- [~] Verify application is accessible
- [~] Test key workflows in production
- [~] Monitor for errors
- [~] Announce to staff users

### 19.3 Post-Launch
- [~] Monitor application performance
- [~] Monitor error logs
- [~] Gather user feedback
- [~] Address urgent issues
- [~] Plan next iteration improvements
- [~] Update documentation based on feedback
