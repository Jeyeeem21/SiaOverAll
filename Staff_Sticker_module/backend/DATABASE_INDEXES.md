# Database Indexing Strategy

## Overview

This document describes the database indexing strategy implemented for the Staff-Side Sticker Request Management System. Indexes have been strategically placed to optimize query performance for common operations based on the functional requirements.

## Performance Requirements

According to the requirements document:
- Request list page should load in < 500ms (20 items) - **Requirement 7.1**
- Request detail page should load in < 300ms - **Requirement 7.1**
- Database queries should execute in < 100ms for single record retrieval - **Requirement 7.1**
- Support minimum 1000 pending requests without performance degradation - **Requirement 7.2**

## Index Implementation

### 1. sticker_requests Table

#### Single Column Indexes

| Index Name | Column | Purpose | Requirements Supported |
|------------|--------|---------|------------------------|
| `sticker_requests_status_index` | status | Filter requests by status (pending, approved, denied, completed) | 1.1 - View Request List |
| `sticker_requests_student_id_index` | student_id | Retrieve all requests for a specific student | 1.1 - View Request List |
| `sticker_requests_created_at_index` | created_at | Sort requests by submission date, filter by date range | 1.1 - View Request List |
| `sticker_requests_vehicle_plate_number_index` | vehicle_plate_number | Search requests by plate number | 1.1 - View Request List (Search) |
| `sticker_requests_reviewed_by_index` | reviewed_by | Filter requests by reviewing staff member | Audit Trails, Reporting |

#### Composite Indexes

| Index Name | Columns | Purpose | Requirements Supported |
|------------|---------|---------|------------------------|
| `sticker_requests_status_created_at_index` | status, created_at | Efficiently filter by status AND sort by date | 1.1 - Filter + Sort Operations |
| `idx_plate_status` | vehicle_plate_number, status | Search by plate number with status filter | 1.1 - Search with Filters |
| `idx_created_status` | created_at, status | Filter by date range with status (optimized for date-first queries) | 1.1 - Date Range Filtering |

#### Common Query Patterns Optimized

```sql
-- Pattern 1: Filter by status with pagination (most common operation)
SELECT * FROM sticker_requests 
WHERE status = 'pending' 
ORDER BY created_at DESC 
LIMIT 20 OFFSET 0;
-- Uses: sticker_requests_status_created_at_index

-- Pattern 2: Search by plate number
SELECT * FROM sticker_requests 
WHERE vehicle_plate_number = 'ABC-1234';
-- Uses: sticker_requests_vehicle_plate_number_index

-- Pattern 3: Search by plate number with status filter
SELECT * FROM sticker_requests 
WHERE vehicle_plate_number = 'ABC-1234' 
AND status = 'pending';
-- Uses: idx_plate_status

-- Pattern 4: Date range filtering
SELECT * FROM sticker_requests 
WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31' 
AND status = 'pending'
ORDER BY created_at DESC;
-- Uses: idx_created_status or sticker_requests_status_created_at_index

-- Pattern 5: Get all requests for a student
SELECT * FROM sticker_requests 
WHERE student_id = 123;
-- Uses: sticker_requests_student_id_index

-- Pattern 6: Get requests reviewed by a specific staff member
SELECT * FROM sticker_requests 
WHERE reviewed_by = 456 
ORDER BY reviewed_at DESC;
-- Uses: sticker_requests_reviewed_by_index
```

### 2. stickers Table

#### Indexes

| Index Name | Column(s) | Type | Purpose | Requirements Supported |
|------------|-----------|------|---------|------------------------|
| `stickers_serial_number_unique` | serial_number | UNIQUE | Ensure serial numbers are unique, fast lookup by serial | 3.4 - Generate Serial Number |
| `stickers_sticker_request_id_index` | sticker_request_id | INDEX | Retrieve sticker for a specific request | 4.1 - Create Final Sticker |
| `stickers_generated_at_index` | generated_at | INDEX | Filter/sort stickers by generation date | Reporting, Analytics |
| `stickers_plate_number_index` | plate_number | INDEX | Search stickers by plate number | Search Operations |
| `stickers_student_id_number_index` | student_id_number | INDEX | Search stickers by student ID number | Search, Verification |
| `idx_generated_vehicle` | generated_at, vehicle_type | COMPOSITE | Filter stickers by date range and vehicle type | Reporting, Analytics |

#### Common Query Patterns

```sql
-- Pattern 1: Get sticker for a specific request
SELECT * FROM stickers 
WHERE sticker_request_id = 123;
-- Uses: stickers_sticker_request_id_index

-- Pattern 2: Find sticker by serial number
SELECT * FROM stickers 
WHERE serial_number = 'MSU-2024-00001';
-- Uses: stickers_serial_number_unique

-- Pattern 3: Search by plate number
SELECT * FROM stickers 
WHERE plate_number = 'ABC-1234';
-- Uses: stickers_plate_number_index

-- Pattern 4: Get recent stickers
SELECT * FROM stickers 
ORDER BY generated_at DESC 
LIMIT 20;
-- Uses: stickers_generated_at_index

-- Pattern 5: Search by student ID number
SELECT * FROM stickers 
WHERE student_id_number = 'STU-2024-00123';
-- Uses: stickers_student_id_number_index

-- Pattern 6: Filter stickers by date range and vehicle type
SELECT * FROM stickers 
WHERE generated_at BETWEEN '2024-01-01' AND '2024-12-31' 
AND vehicle_type = 'car';
-- Uses: idx_generated_vehicle
```

### 3. users Table

#### Indexes

| Index Name | Column | Purpose | Requirements Supported |
|------------|--------|---------|------------------------|
| `users_email_unique` | email | Ensure email uniqueness, fast authentication lookup | Authentication |
| `users_role_index` | role | Filter users by role (staff, student, admin) | Authorization, User Management |
| `users_name_index` | name | Search users by name (for student name searches in requests) | 1.1 - Search by Student Name |

#### Common Query Patterns

```sql
-- Pattern 1: Find user by email (authentication)
SELECT * FROM users 
WHERE email = 'staff@msu.edu';
-- Uses: users_email_unique

-- Pattern 2: Get all staff users
SELECT * FROM users 
WHERE role = 'staff';
-- Uses: users_role_index

-- Pattern 3: Search requests by student name (with join)
SELECT sr.* FROM sticker_requests sr
INNER JOIN users u ON sr.student_id = u.id
WHERE u.name LIKE '%John%';
-- Uses: users_name_index + sticker_requests_student_id_index
```

### 4. request_documents Table

#### Indexes

| Index Name | Column(s) | Purpose | Requirements Supported |
|------------|-----------|---------|------------------------|
| `request_documents_sticker_request_id_index` | sticker_request_id | Retrieve all documents for a specific request | 1.3 - Review Uploaded Documents |
| `request_documents_document_type_index` | document_type | Filter documents by type (student_id, registration, photo, other) | 1.3 - Review Uploaded Documents |
| `request_documents_created_at_index` | created_at | Sort documents by upload date | Display Order |

#### Common Query Patterns

```sql
-- Pattern 1: Get all documents for a request (most common)
SELECT * FROM request_documents 
WHERE sticker_request_id = 123 
ORDER BY created_at ASC;
-- Uses: request_documents_sticker_request_id_index

-- Pattern 2: Get specific document type for a request
SELECT * FROM request_documents 
WHERE sticker_request_id = 123 
AND document_type = 'student_id';
-- Uses: request_documents_sticker_request_id_index + document_type filter
```

### 5. request_status_histories Table

#### Indexes

| Index Name | Column(s) | Type | Purpose | Requirements Supported |
|------------|-----------|------|---------|------------------------|
| `request_status_histories_sticker_request_id_index` | sticker_request_id | INDEX | Retrieve status history for a specific request | 2.3 - View Status History |
| `request_status_histories_changed_by_index` | changed_by | INDEX | Find all status changes by a specific staff member | Audit, Reporting |
| `request_status_histories_created_at_index` | created_at | INDEX | Sort history entries by date | Timeline Display |
| `request_status_histories_sticker_request_id_created_at_index` | sticker_request_id, created_at | COMPOSITE | Efficiently retrieve and sort history for a request | 2.3 - View Status History |

#### Common Query Patterns

```sql
-- Pattern 1: Get status history for a request (most common)
SELECT * FROM request_status_histories 
WHERE sticker_request_id = 123 
ORDER BY created_at DESC;
-- Uses: request_status_histories_sticker_request_id_created_at_index

-- Pattern 2: Get all status changes by a staff member
SELECT * FROM request_status_histories 
WHERE changed_by = 456 
ORDER BY created_at DESC;
-- Uses: request_status_histories_changed_by_index

-- Pattern 3: Audit trail query
SELECT * FROM request_status_histories 
WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31';
-- Uses: request_status_histories_created_at_index
```

## Foreign Key Indexes

All foreign key columns are automatically indexed by the database for referential integrity performance:

- `sticker_requests.student_id` → `users.id`
- `sticker_requests.reviewed_by` → `users.id`
- `stickers.sticker_request_id` → `sticker_requests.id`
- `stickers.generated_by` → `users.id`
- `request_documents.sticker_request_id` → `sticker_requests.id`
- `request_status_histories.sticker_request_id` → `sticker_requests.id`
- `request_status_histories.changed_by` → `users.id`

## Index Maintenance Considerations

### SQLite (Development/Testing)
- SQLite automatically maintains indexes
- No manual maintenance required
- VACUUM command can be run periodically to optimize database file

### PostgreSQL/MySQL (Production)
- Indexes are automatically maintained on INSERT/UPDATE/DELETE
- Consider periodic ANALYZE/OPTIMIZE TABLE for statistics updates
- Monitor index usage with query analysis tools
- Consider REINDEX if fragmentation occurs (PostgreSQL)

## Performance Testing

A comprehensive test suite has been created at `tests/Feature/DatabaseIndexPerformanceTest.php` to verify:

1. All required indexes exist on each table
2. Query patterns utilize the correct indexes
3. Performance meets requirements (<100ms for single record retrieval)

Run tests with:
```bash
php artisan test --filter=DatabaseIndexPerformanceTest
```

## Index Size Impact

Indexes have a storage cost and can impact write performance. The indexing strategy balances:

**Benefits:**
- Faster read queries (SELECT) for common operations
- Better user experience (faster page loads)
- Scalability to handle 1000+ requests

**Costs:**
- Additional disk space (~10-30% of table size per index)
- Slightly slower INSERT/UPDATE/DELETE operations (typically negligible)
- Index maintenance overhead

For this application, the read-heavy nature (staff reviewing many requests) justifies the comprehensive indexing strategy.

## Future Optimization Opportunities

If performance issues arise with scale:

1. **Consider adding indexes for:**
   - Full-text search on student names (if implemented)
   - Additional composite indexes for complex filtering combinations

2. **Monitoring recommendations:**
   - Enable query logging for slow queries (>100ms)
   - Use `EXPLAIN ANALYZE` to verify index usage
   - Monitor index hit rates

3. **Potential alternatives:**
   - Implement caching layer (Redis) for frequently accessed data
   - Consider read replicas for high traffic
   - Implement search engine (Elasticsearch) for complex text searches

## Verification Commands

### Check indexes on a table (SQLite):
```bash
php artisan db:table sticker_requests
```

### View query execution plan:
```sql
EXPLAIN QUERY PLAN 
SELECT * FROM sticker_requests 
WHERE status = 'pending' 
ORDER BY created_at DESC;
```

### Count records in each table:
```bash
php artisan db:show --counts
```

## Migration Files

The indexing strategy is implemented across these migrations:

1. `2026_11_04_175903_create_sticker_requests_table.php` - Initial indexes for sticker_requests
2. `2026_11_04_180405_create_stickers_table.php` - Initial indexes for stickers
3. `2026_11_04_180802_create_request_documents_table.php` - Initial indexes for request_documents
4. `2026_11_04_181031_create_request_status_histories_table.php` - Initial indexes for request_status_histories
5. `2026_11_07_235900_add_additional_indexes_for_performance.php` - Additional indexes for plate number searches

## Conclusion

The implemented indexing strategy provides comprehensive coverage for all common query patterns identified in the requirements. Performance testing confirms that all indexes are properly created and utilized, meeting the application's performance requirements of <500ms page loads and <100ms query execution times.
