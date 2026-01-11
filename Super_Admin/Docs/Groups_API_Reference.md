# Groups API Reference

## Base URL
```
http://localhost:3000/api/groups
```

## Authentication
All groups endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <jwt-token>
```

## Quick Start

### 1. Get Authentication Token
First, login to get your JWT token:
```bash
curl -X POST http://localhost:3000/api/superadmin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"your-password"}'
```

### 2. Create Your First Group
```bash
curl -X POST http://localhost:3000/api/groups/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "COMP001",
    "groupName": "Current Assets",
    "nature": "Assets",
    "isPrimary": true
  }'
```

### 3. Get All Groups
```bash
curl -X GET "http://localhost:3000/api/groups?companyId=COMP001&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Endpoints

### 1. Create Group

**Endpoint:** `POST /create`

**Description:** Creates a new group in the system.

**Authentication:** Required (JWT token)

**Request Body:**
```json
{
  "companyId": "COMP001",
  "groupName": "Sundry Debtors",
  "underGroupId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "nature": "Assets",
  "isPrimary": false
}
```

**Validation Rules:**
- `companyId`: Required, string
- `groupName`: Required, 2-100 characters, unique per company
- `underGroupId`: Optional, must be valid ObjectId of existing group if provided
- `nature`: Required, must be one of: Assets, Liabilities, Income, Expenses
- `isPrimary`: Boolean, default false. Can be used with or without underGroupId

**Success Response (201):**
```json
{
  "success": true,
  "message": "Group created successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "companyId": "COMP001",
    "groupName": "Sundry Debtors",
    "underGroupId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "nature": "Assets",
    "isPrimary": false,
    "createdAt": "2025-01-25T10:00:00.000Z",
    "updatedAt": "2025-01-25T10:00:00.000Z"
  }
}
```

### 2. Get All Groups

**Endpoint:** `GET /`

**Description:** Retrieves all groups with optional filtering, pagination, and search.

**Authentication:** Required (JWT token)

**Query Parameters:**
- `companyId` (optional): Filter by company ID
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search by group name
- `nature` (optional): Filter by nature (Assets, Liabilities, Income, Expenses)
- `isPrimary` (optional): Filter by primary status (true/false)

**Example:**
```
GET /api/groups?companyId=COMP001&page=1&limit=10&search=debtors&nature=Assets
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Groups retrieved successfully",
  "data": {
    "groups": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "companyId": "COMP001",
        "groupName": "Sundry Debtors",
        "underGroupId": "64f8a1b2c3d4e5f6a7b8c9d0",
        "nature": "Assets",
        "isPrimary": false,
        "createdAt": "2025-01-25T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "itemsPerPage": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### 3. Get Group by ID

**Endpoint:** `GET /:id`

**Description:** Retrieves a specific group by its ID.

**Authentication:** Required (JWT token)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Group retrieved successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "companyId": "COMP001",
    "groupName": "Sundry Debtors",
    "underGroupId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "nature": "Assets",
    "isPrimary": false,
    "createdAt": "2025-01-25T10:00:00.000Z"
  }
}
```

### 4. Update Group

**Endpoint:** `POST /:id`

**Description:** Updates an existing group.

**Authentication:** Required (JWT token)

**Request Body:**
```json
{
  "groupName": "Updated Group Name",
  "nature": "Assets",
  "isPrimary": false
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Group updated successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "companyId": "COMP001",
    "groupName": "Updated Group Name",
    "underGroupId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "nature": "Assets",
    "isPrimary": false,
    "createdAt": "2025-01-25T10:00:00.000Z",
    "updatedAt": "2025-01-25T10:00:00.000Z"
  }
}
```

### 5. Delete Group

**Endpoint:** `POST /:id/delete`

**Description:** Deletes a group (only if it has no subgroups).

**Authentication:** Required (JWT token)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Group deleted successfully"
}
```

### 6. Get Subgroups

**Endpoint:** `GET /:id/subgroups`

**Description:** Retrieves all subgroups under a specific group.

**Authentication:** Required (JWT token)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Subgroups of 'Current Assets' retrieved successfully",
  "data": {
    "parentGroup": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "groupName": "Current Assets",
      "companyId": "COMP001"
    },
    "subgroups": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "groupName": "Sundry Debtors",
        "underGroupId": "64f8a1b2c3d4e5f6a7b8c9d0",
        "nature": "Assets"
      }
    ]
  }
}
```

### 7. Get Groups by Nature

**Endpoint:** `GET /nature/:nature`

**Description:** Retrieves all groups of a specific nature.

**Authentication:** Required (JWT token)

**Query Parameters:**
- `companyId` (required): Company ID

**Example:**
```
GET /api/groups/nature/Assets?companyId=COMP001
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Groups with nature 'Assets' retrieved successfully",
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "groupName": "Current Assets",
      "nature": "Assets",
      "isPrimary": true
    }
  ]
}
```

### 8. Search Groups

**Endpoint:** `GET /search`

**Description:** Search groups by name with pagination.

**Authentication:** Required (JWT token)

**Query Parameters:**
- `companyId` (required): Company ID
- `search` (required): Search term
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example:**
```
GET /api/groups/search?companyId=COMP001&search=debtors&page=1&limit=10
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Groups search completed successfully",
  "data": {
    "groups": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "groupName": "Sundry Debtors",
        "underGroupId": "64f8a1b2c3d4e5f6a7b8c9d0",
        "nature": "Assets"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 10,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

---

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    "Group name must be at least 2 characters",
    "Nature must be one of: Assets, Liabilities, Income, Expenses"
  ]
}
```

### Duplicate Group (409)
```json
{
  "success": false,
  "message": "Group 'Sundry Debtors' already exists for company COMP001"
}
```

### Group Not Found (404)
```json
{
  "success": false,
  "message": "Group not found"
}
```

### Cannot Delete (400)
```json
{
  "success": false,
  "message": "Cannot delete group 'Current Assets' because it has 4 subgroup(s). Please delete subgroups first.",
  "data": {
    "subgroups": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "groupName": "Sundry Debtors"
      }
    ]
  }
}
```

---

## Business Rules

1. **Unique Group Names**: Group names must be unique within a company
2. **Parent Group Validation**: If underGroupId is provided, it must reference an existing group
3. **Company Validation**: Parent group must belong to the same company
4. **Deletion Rules**: Cannot delete groups that have subgroups
5. **Nature Validation**: Nature must be one of: Assets, Liabilities, Income, Expenses

---

## Sample Data Structure

### Primary Groups
```json
{
  "companyId": "COMP001",
  "groupName": "Current Assets",
  "nature": "Assets",
  "isPrimary": true
}
```

### Sub Groups
```json
{
  "companyId": "COMP001",
  "groupName": "Sundry Debtors",
  "underGroup": "Current Assets",
  "nature": "Assets",
  "isPrimary": false
}
```

---

**Last Updated:** 2025-01-25  
**Version:** 1.0.0  
**Maintainer:** SD_Taxation Development Team
