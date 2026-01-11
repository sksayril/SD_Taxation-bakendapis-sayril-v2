# Ledgers API Reference

## Base URL
```
http://localhost:3000/api/ledgers
```

## Authentication
All ledgers endpoints require JWT authentication. Include the token in the Authorization header:
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

### 2. Create Your First Ledger
```bash
curl -X POST http://localhost:3000/api/ledgers/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "COMP001",
    "ledgerName": "Cash in Hand",
    "underGroup": "Cash in Hand",
    "openingBalance": 10000,
    "ledgerType": "Cash"
  }'
```

### 3. Get All Ledgers
```bash
curl -X GET "http://localhost:3000/api/ledgers?companyId=COMP001&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ledgers/create` | Create new ledger |
| GET | `/api/ledgers` | Get all ledgers (with pagination & search) |
| GET | `/api/ledgers/:id` | Get specific ledger |
| POST | `/api/ledgers/:id` | Update ledger |
| POST | `/api/ledgers/:id/delete` | Delete ledger |
| GET | `/api/ledgers/group/:groupName` | Get ledgers by group |
| GET | `/api/ledgers/type/:ledgerType` | Get ledgers by type |
| GET | `/api/ledgers/search` | Search ledgers by name |

---

## Endpoints

### 1. Create Ledger

**Endpoint:** `POST /create`

**Description:** Creates a new ledger in the system.

**Authentication:** Required (JWT token)

**Request Body:**
```json
{
  "companyId": "COMP001",
  "ledgerName": "HDFC Bank Account",
  "underGroup": "Bank Accounts",
  "openingBalance": 50000,
  "ledgerType": "Bank",
  "bankDetails": {
    "accountNumber": "1234567890",
    "ifsc": "HDFC0001234"
  }
}
```

**Validation Rules:**
- `companyId`: Required, string
- `ledgerName`: Required, 2-100 characters, unique per company
- `underGroup`: Required, must reference existing group
- `openingBalance`: Optional, number, default 0
- `ledgerType`: Optional, enum, default "Cash"
- `bankDetails`: Required if ledgerType is "Bank"

**Success Response (201):**
```json
{
  "success": true,
  "message": "Ledger created successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "companyId": "COMP001",
    "ledgerName": "HDFC Bank Account",
    "underGroup": "Bank Accounts",
    "openingBalance": 50000,
    "ledgerType": "Bank",
    "bankDetails": {
      "accountNumber": "1234567890",
      "ifsc": "HDFC0001234"
    },
    "createdAt": "2025-01-25T10:00:00.000Z",
    "updatedAt": "2025-01-25T10:00:00.000Z"
  }
}
```

### 2. Get All Ledgers

**Endpoint:** `GET /`

**Description:** Retrieves all ledgers with optional filtering, pagination, and search.

**Authentication:** Required (JWT token)

**Query Parameters:**
- `companyId` (optional): Filter by company ID
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search by ledger name
- `underGroup` (optional): Filter by group name
- `ledgerType` (optional): Filter by ledger type

**Example:**
```
GET /api/ledgers?companyId=COMP001&page=1&limit=10&search=bank&ledgerType=Bank
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Ledgers retrieved successfully",
  "data": {
    "ledgers": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "companyId": "COMP001",
        "ledgerName": "HDFC Bank Account",
        "underGroup": "Bank Accounts",
        "openingBalance": 50000,
        "ledgerType": "Bank",
        "bankDetails": {
          "accountNumber": "1234567890",
          "ifsc": "HDFC0001234"
        },
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

### 3. Get Ledger by ID

**Endpoint:** `GET /:id`

**Description:** Retrieves a specific ledger by its ID.

**Authentication:** Required (JWT token)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Ledger retrieved successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "companyId": "COMP001",
    "ledgerName": "HDFC Bank Account",
    "underGroup": "Bank Accounts",
    "openingBalance": 50000,
    "ledgerType": "Bank",
    "bankDetails": {
      "accountNumber": "1234567890",
      "ifsc": "HDFC0001234"
    },
    "createdAt": "2025-01-25T10:00:00.000Z"
  }
}
```

### 4. Update Ledger

**Endpoint:** `POST /:id`

**Description:** Updates an existing ledger.

**Authentication:** Required (JWT token)

**Request Body:**
```json
{
  "ledgerName": "Updated Ledger Name",
  "openingBalance": 75000,
  "ledgerType": "Bank"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Ledger updated successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "companyId": "COMP001",
    "ledgerName": "Updated Ledger Name",
    "underGroup": "Bank Accounts",
    "openingBalance": 75000,
    "ledgerType": "Bank",
    "bankDetails": {
      "accountNumber": "1234567890",
      "ifsc": "HDFC0001234"
    },
    "createdAt": "2025-01-25T10:00:00.000Z",
    "updatedAt": "2025-01-25T10:00:00.000Z"
  }
}
```

### 5. Delete Ledger

**Endpoint:** `POST /:id/delete`

**Description:** Deletes a ledger.

**Authentication:** Required (JWT token)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Ledger deleted successfully"
}
```

### 6. Get Ledgers by Group

**Endpoint:** `GET /group/:groupName`

**Description:** Retrieves all ledgers under a specific group.

**Authentication:** Required (JWT token)

**Query Parameters:**
- `companyId` (required): Company ID

**Example:**
```
GET /api/ledgers/group/Bank%20Accounts?companyId=COMP001
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Ledgers under group 'Bank Accounts' retrieved successfully",
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "ledgerName": "HDFC Bank Account",
      "underGroup": "Bank Accounts",
      "openingBalance": 50000,
      "ledgerType": "Bank"
    }
  ]
}
```

### 7. Get Ledgers by Type

**Endpoint:** `GET /type/:ledgerType`

**Description:** Retrieves all ledgers of a specific type.

**Authentication:** Required (JWT token)

**Query Parameters:**
- `companyId` (required): Company ID

**Example:**
```
GET /api/ledgers/type/Bank?companyId=COMP001
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Ledgers with type 'Bank' retrieved successfully",
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "ledgerName": "HDFC Bank Account",
      "underGroup": "Bank Accounts",
      "openingBalance": 50000,
      "ledgerType": "Bank"
    }
  ]
}
```

### 8. Search Ledgers

**Endpoint:** `GET /search`

**Description:** Search ledgers by name with pagination.

**Authentication:** Required (JWT token)

**Query Parameters:**
- `companyId` (required): Company ID
- `search` (required): Search term
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example:**
```
GET /api/ledgers/search?companyId=COMP001&search=bank&page=1&limit=10
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Ledgers search completed successfully",
  "data": {
    "ledgers": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "ledgerName": "HDFC Bank Account",
        "underGroup": "Bank Accounts",
        "openingBalance": 50000,
        "ledgerType": "Bank"
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
    "Ledger name must be at least 2 characters",
    "Bank details (accountNumber and ifsc) are required for Bank ledger type"
  ]
}
```

### Duplicate Ledger (409)
```json
{
  "success": false,
  "message": "Ledger 'HDFC Bank Account' already exists for company COMP001"
}
```

### Group Not Found (400)
```json
{
  "success": false,
  "message": "Group 'Bank Accounts' does not exist for company COMP001"
}
```

### Ledger Not Found (404)
```json
{
  "success": false,
  "message": "Ledger not found"
}
```

### Invalid Ledger Type (400)
```json
{
  "success": false,
  "message": "Invalid ledger type. Must be one of: Cash, Bank, Expense, Income, Asset, Liability, Customer, Supplier"
}
```

---

## Business Rules

1. **Unique Ledger Names**: Ledger names must be unique within a company
2. **Group Validation**: Under group must exist in the Groups collection
3. **Bank Details Validation**: Bank details are required for Bank ledger type
4. **IFSC Validation**: IFSC code must follow the format: AAAA0XXXXXX
5. **Ledger Type Validation**: Must be one of the predefined types

---

## Ledger Types

| Type | Description | Bank Details Required |
|------|-------------|----------------------|
| Cash | Cash transactions | No |
| Bank | Bank account transactions | Yes |
| Expense | Business expenses | No |
| Income | Business income | No |
| Asset | Company assets | No |
| Liability | Company liabilities | No |
| Customer | Customer accounts | No |
| Supplier | Supplier accounts | No |

---

## Sample Data Structure

### Cash Ledger
```json
{
  "companyId": "COMP001",
  "ledgerName": "Cash in Hand",
  "underGroup": "Cash in Hand",
  "openingBalance": 10000,
  "ledgerType": "Cash"
}
```

### Bank Ledger
```json
{
  "companyId": "COMP001",
  "ledgerName": "HDFC Bank Account",
  "underGroup": "Bank Accounts",
  "openingBalance": 50000,
  "ledgerType": "Bank",
  "bankDetails": {
    "accountNumber": "1234567890",
    "ifsc": "HDFC0001234"
  }
}
```

### Customer Ledger
```json
{
  "companyId": "COMP001",
  "ledgerName": "ABC Company Ltd",
  "underGroup": "Sundry Debtors",
  "openingBalance": 15000,
  "ledgerType": "Customer"
}
```

---

**Last Updated:** 2025-01-25  
**Version:** 1.0.0  
**Maintainer:** SD_Taxation Development Team
