# Sticker Request API Documentation

Base URL: `http://localhost:8000/api`

## Endpoints

### 1. Submit Sticker Request (Public)
**POST** `/sticker-requests`

Submit a new sticker request with required documents.

**Request (multipart/form-data):**
```
plate_number: string (required)
vehicle_type: string (required, one of: car, motorcycle, other)
vehicle_model: string (optional)
vehicle_color: string (optional)
license: file (required, max 5MB, pdf/jpg/jpeg/png)
official_receipt: file (required, max 5MB, pdf/jpg/jpeg/png)
certificate_of_registration: file (required, max 5MB, pdf/jpg/jpeg/png)
```

**Response (201):**
```json
{
  "message": "Sticker request submitted successfully",
  "data": {
    "id": 1,
    "plate_number": "ABC-1234",
    "vehicle_type": "car",
    "vehicle_model": "Honda Civic",
    "vehicle_color": "Blue",
    "license_path": "sticker-requests/licenses/xxx.pdf",
    "official_receipt_path": "sticker-requests/receipts/xxx.pdf",
    "certificate_of_registration_path": "sticker-requests/certificates/xxx.pdf",
    "status": "pending",
    "created_at": "2024-01-01T00:00:00.000000Z"
  }
}
```

---

### 2. Get All Sticker Requests (Staff)
**GET** `/sticker-requests`

Retrieve all sticker requests with optional filtering and sorting.

**Query Parameters:**
- `status` (optional): Filter by status (pending, approved, rejected)
- `sort_by` (optional): Sort field (default: created_at)
- `sort_order` (optional): Sort order (asc, desc, default: desc)
- `page` (optional): Page number for pagination

**Response (200):**
```json
{
  "current_page": 1,
  "data": [
    {
      "id": 1,
      "plate_number": "ABC-1234",
      "vehicle_type": "car",
      "vehicle_model": "Honda Civic",
      "vehicle_color": "Blue",
      "status": "pending",
      "created_at": "2024-01-01T00:00:00.000000Z"
    }
  ],
  "total": 100,
  "per_page": 20
}
```

---

### 3. Get Single Sticker Request (Staff)
**GET** `/sticker-requests/{id}`

Retrieve details of a specific sticker request.

**Response (200):**
```json
{
  "id": 1,
  "plate_number": "ABC-1234",
  "vehicle_type": "car",
  "vehicle_model": "Honda Civic",
  "vehicle_color": "Blue",
  "license_path": "sticker-requests/licenses/xxx.pdf",
  "official_receipt_path": "sticker-requests/receipts/xxx.pdf",
  "certificate_of_registration_path": "sticker-requests/certificates/xxx.pdf",
  "status": "pending",
  "created_at": "2024-01-01T00:00:00.000000Z"
}
```

---

### 4. Update Sticker Request Status (Staff)
**PUT** `/sticker-requests/{id}`

Approve or reject a sticker request.

**Request:**
```json
{
  "status": "approved",  // or "rejected"
  "rejection_reason": "Incomplete documents"  // required if status is rejected
}
```

**Response (200):**
```json
{
  "message": "Sticker request updated successfully",
  "data": {
    "id": 1,
    "status": "approved",
    "approved_at": "2024-01-01T00:00:00.000000Z"
  }
}
```

---

### 5. Delete Sticker Request (Staff)
**DELETE** `/sticker-requests/{id}`

Delete a sticker request and its associated files.

**Response (200):**
```json
{
  "message": "Sticker request deleted successfully"
}
```

---

### 6. Get Pending Requests Count (Staff)
**GET** `/sticker-requests/pending-count`

Get the count of pending sticker requests.

**Response (200):**
```json
{
  "count": 15
}
```

---

### 7. Health Check
**GET** `/health`

Check if the API is running.

**Response (200):**
```json
{
  "status": "ok",
  "message": "API is running"
}
```

---

## Error Responses

**Validation Error (422):**
```json
{
  "message": "Validation failed",
  "errors": {
    "plate_number": ["The plate number field is required."]
  }
}
```

**Not Found (404):**
```json
{
  "message": "Resource not found"
}
```

**Server Error (500):**
```json
{
  "message": "Failed to submit sticker request",
  "error": "Error details..."
}
```
