# Student Portal — API Endpoints

Base URL: `http://localhost:3002`

All protected endpoints require:
```
Authorization: Bearer <token>
```

---

## Authentication

| Endpoint Name | Method | URL | Auth | Description |
|---|---|---|---|---|
| Login | `POST` | `/api/login` | ❌ | Login with email & password. Returns JWT token. |
| Register | `POST` | `/api/register` | ❌ | Register a new student account. |

### Login
```
POST /api/login
Body: { email, password }
Returns: { token, user: { id, name, email, role } }
```

### Register
```
POST /api/register
Body: { name, email, password, student_number, college, department, phone }
Returns: { token, user: { id, name, email, role } }
```

---

## Student Profile

| Endpoint Name | Method | URL | Auth | Description |
|---|---|---|---|---|
| Get Profile | `GET` | `/api/student/profile` | ✅ | Get the authenticated student's full profile. |
| Update Profile | `PUT` | `/api/student/profile` | ✅ | Update student profile information. |
| Upload Avatar | `POST` | `/api/student/avatar` | ✅ | Upload or replace profile picture. |
| Change Password | `PUT` | `/api/student/change-password` | ✅ | Change account password. |
| Login Activity | `GET` | `/api/student/login-activity` | ✅ | Get recent login activity. |

### Get Profile
```
GET /api/student/profile
Returns: { id, name, email, phone, avatar, role, status, student_number, 
           college, department, contact_number, student_status, verified_at, ... }
```

### Update Profile
```
PUT /api/student/profile
Body: { full_name, phone, college, department, contact_number }
Returns: { message: "Profile updated successfully" }
```

### Upload Avatar
```
POST /api/student/avatar
Body: multipart/form-data — field: "avatar" (image file, max 5MB)
Returns: { message, avatar_url }
```

### Change Password
```
PUT /api/student/change-password
Body: { current_password, new_password }
Returns: { message: "Password changed successfully" }
```

### Login Activity
```
GET /api/student/login-activity
Returns: [ { id, action, timestamp, ip_address, device, location } ]
```

---

## Verification Documents

| Endpoint Name | Method | URL | Auth | Description |
|---|---|---|---|---|
| Get Documents | `GET` | `/api/student/documents` | ✅ | Get all uploaded verification documents. |
| Upload Document | `POST` | `/api/student/upload-document` | ✅ | Upload a verification document. |

### Get Documents
```
GET /api/student/documents
Returns: [ { id, document_type, file_path, original_name, mime, size, status, 
             reviewer_note, created_at } ]
```

### Upload Document
```
POST /api/student/upload-document
Body: multipart/form-data
  - document_type: string (e.g. "student_id", "school_id", "registration_form")
  - document: file (image/*, .pdf, .doc, .docx — max 10MB)
Returns: { id, message, document: { ... } }
```

---

## Notifications

| Endpoint Name | Method | URL | Auth | Description |
|---|---|---|---|---|
| Get Notifications | `GET` | `/api/student/notifications` | ✅ | Get all notifications for the student. |
| Mark Notification Read | `PUT` | `/api/student/notifications/:id/read` | ✅ | Mark a single notification as read. |

### Get Notifications
```
GET /api/student/notifications
Returns: [ { id, type, title, message, data, is_read, is_important, time_ago, created_at } ]

Notification types:
  - verification_update
  - document_approved
  - document_rejected
  - order_update
  - payment_reminder
  - system_announcement
```

### Mark Notification Read
```
PUT /api/student/notifications/:id/read
Returns: { success: true }
```

---

## Dashboard

| Endpoint Name | Method | URL | Auth | Description |
|---|---|---|---|---|
| Get Stats | `GET` | `/api/student/stats` | ✅ | Get dashboard statistics (orders, documents, status). |

### Get Stats
```
GET /api/student/stats
Returns: { documents_count, student_status, user_status, email_verified,
           orders_count, total_spent, pending_payments, notifications_count,
           account_completion, last_activity }
```

---

## Products

| Endpoint Name | Method | URL | Auth | Description |
|---|---|---|---|---|
| Get Products | `GET` | `/api/products` | ❌ | Get paginated product list with optional filters. |
| Get Categories | `GET` | `/api/products/categories` | ❌ | Get all product categories with counts. |
| Get Product | `GET` | `/api/products/:id` | ❌ | Get a single product by ID. |

### Get Products
```
GET /api/products?category=&search=&page=1&limit=20
Returns: { products: [...], pagination: { page, limit, total, totalPages } }
```

### Get Categories
```
GET /api/products/categories
Returns: [ { id, name, description, product_count } ]
```

### Get Product
```
GET /api/products/:id
Returns: { id, name, description, price, unit, status, barcode, 
           product_image, image_url, category_name, ... }
```

---

## Orders

| Endpoint Name | Method | URL | Auth | Description |
|---|---|---|---|---|
| Create Order | `POST` | `/api/orders` | ✅ | Place a new product order. |
| Get Orders | `GET` | `/api/orders` | ✅ | Get all orders for the authenticated student. |
| Get Order | `GET` | `/api/orders/:id` | ✅ | Get a single order by ID. |
| Update Order | `PUT` | `/api/orders/:id` | ✅ | Update a pending order. |
| Cancel Order | `POST` | `/api/orders/:id/cancel` | ✅ | Cancel a pending or processing order. |

### Create Order
```
POST /api/orders
Body: {
  items: [ { product_id, quantity } ],
  notes: string (optional),
  payment_method: string (optional)
}
Returns: { message, orders: [...], total_orders }
```

### Get Orders
```
GET /api/orders
Returns: [ { id, order_number, status, payment_status, total_amount,
             payment_method, notes, item, unit_price, total_quantity,
             items: [...], created_at, updated_at, ... } ]
```

### Get Order
```
GET /api/orders/:id
Returns: { id, order_number, status, payment_status, total_amount, 
           items: [...], order_date, ... }
```

### Update Order
```
PUT /api/orders/:id
Body: { quantity, priority, payment_method, pickup_method, 
        pickup_date, delivery_address, notes }
Note: Only works on orders with status = "pending"
Returns: { message: "Order updated successfully" }
```

### Cancel Order
```
POST /api/orders/:id/cancel
Body: { reason }
Note: Only works on orders with status = "pending" or "processing"
Returns: { message: "Order cancelled successfully" }
```

---

## Health Check

| Endpoint Name | Method | URL | Auth | Description |
|---|---|---|---|---|
| Health Check | `GET` | `/api/health` | ❌ | Check if API server is running. |

### Health Check
```
GET /api/health
Returns: { status: "OK", message, database, database_name }
```

---

## Error Responses

All endpoints return errors in this format:
```json
{ "error": "Error message here" }
```

| Status Code | Meaning |
|---|---|
| `400` | Bad Request — missing or invalid fields |
| `401` | Unauthorized — no token or token missing |
| `403` | Forbidden — invalid or expired token |
| `404` | Not Found — resource not found |
| `500` | Internal Server Error — database or server error |
