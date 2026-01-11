# Vouchers API Reference

## Base URL
```
http://localhost:3000/api/vouchers
```

## Authentication
All vouchers endpoints require JWT authentication. Include the token in the Authorization header:
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

### 2. Create Your First Voucher
```bash
curl -X POST http://localhost:3000/api/vouchers/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "COMP001",
    "voucherType": "Payment",
    "voucherNumber": "PAY/2025/001",
    "date": "2025-01-25",
    "narration": "Payment to supplier",
    "debitEntries": [
      { "ledgerName": "Purchase", "amount": 50000, "narration": "Raw materials" }
    ],
    "creditEntries": [
      { "ledgerName": "HDFC Bank - Current Account", "amount": 50000, "narration": "Bank payment" }
    ],
    "approvedBy": "Admin"
  }'
```

### 3. Get All Vouchers
```bash
curl -X GET "http://localhost:3000/api/vouchers?companyId=COMP001&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/vouchers/create` | Create new voucher |
| GET | `/api/vouchers` | Get all vouchers (with pagination & search) |
| GET | `/api/vouchers/:id` | Get specific voucher |
| POST | `/api/vouchers/:id` | Update voucher |
| POST | `/api/vouchers/:id/status` | Update voucher status |
| POST | `/api/vouchers/:id/delete` | Delete voucher |
| GET | `/api/vouchers/type/:voucherType` | Get vouchers by type |
| GET | `/api/vouchers/date-range` | Get vouchers by date range |
| GET | `/api/vouchers/search` | Search vouchers |

---

## Endpoints

### 1. Create Voucher

**Endpoint:** `POST /create`

**Description:** Creates a new voucher in the system.

**Authentication:** Required (JWT token)

**Request Body:**
```json
{
  "companyId": "COMP001",
  "voucherType": "Payment",
  "voucherNumber": "PAY/2025/001",
  "date": "2025-01-25",
  "narration": "Payment to supplier for raw materials",
  "debitEntries": [
    {
      "ledgerName": "Purchase",
      "amount": 50000,
      "narration": "Raw materials purchase"
    }
  ],
  "creditEntries": [
    {
      "ledgerName": "HDFC Bank - Current Account",
      "amount": 50000,
      "narration": "Bank payment"
    }
  ],
  "approvedBy": "Admin"
}
```

**Validation Rules:**
- `companyId`: Required, string
- `voucherType`: Required, must be one of: Payment, Receipt, Journal, Sales, Purchase, Contra, Stock Journal
- `voucherNumber`: Required, string, unique
- `date`: Required, valid date
- `narration`: Required, max 500 characters
- `debitEntries`: Required, array with at least one entry
- `creditEntries`: Required, array with at least one entry
- `approvedBy`: Required, string
- **Debit and Credit totals must be equal**

**Success Response (201):**
```json
{
  "success": true,
  "message": "Voucher created successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "companyId": "COMP001",
    "voucherType": "Payment",
    "voucherNumber": "PAY/2025/001",
    "date": "2025-01-25T00:00:00.000Z",
    "narration": "Payment to supplier for raw materials",
    "debitEntries": [
      {
        "ledgerName": "Purchase",
        "amount": 50000,
        "narration": "Raw materials purchase"
      }
    ],
    "creditEntries": [
      {
        "ledgerName": "HDFC Bank - Current Account",
        "amount": 50000,
        "narration": "Bank payment"
      }
    ],
    "approvedBy": "Admin",
    "status": "Draft",
    "totalAmount": 50000,
    "createdAt": "2025-01-25T10:00:00.000Z",
    "updatedAt": "2025-01-25T10:00:00.000Z"
  }
}
```

### 2. Get All Vouchers

**Endpoint:** `GET /`

**Description:** Retrieves all vouchers with optional filtering, pagination, and search.

**Authentication:** Required (JWT token)

**Query Parameters:**
- `companyId` (optional): Filter by company ID
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search by voucher number, narration, or ledger names
- `voucherType` (optional): Filter by voucher type
- `status` (optional): Filter by status (Draft, Approved, Rejected)
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date

**Example:**
```
GET /api/vouchers?companyId=COMP001&page=1&limit=10&voucherType=Payment&status=Approved
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Vouchers retrieved successfully",
  "data": {
    "vouchers": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "companyId": "COMP001",
        "voucherType": "Payment",
        "voucherNumber": "PAY/2025/001",
        "date": "2025-01-25T00:00:00.000Z",
        "narration": "Payment to supplier for raw materials",
        "totalAmount": 50000,
        "status": "Approved",
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

### 3. Get Voucher by ID

**Endpoint:** `GET /:id`

**Description:** Retrieves a specific voucher by its ID.

**Authentication:** Required (JWT token)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Voucher retrieved successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "companyId": "COMP001",
    "voucherType": "Payment",
    "voucherNumber": "PAY/2025/001",
    "date": "2025-01-25T00:00:00.000Z",
    "narration": "Payment to supplier for raw materials",
    "debitEntries": [
      {
        "ledgerName": "Purchase",
        "amount": 50000,
        "narration": "Raw materials purchase"
      }
    ],
    "creditEntries": [
      {
        "ledgerName": "HDFC Bank - Current Account",
        "amount": 50000,
        "narration": "Bank payment"
      }
    ],
    "approvedBy": "Admin",
    "status": "Approved",
    "totalAmount": 50000,
    "createdAt": "2025-01-25T10:00:00.000Z"
  }
}
```

### 4. Update Voucher

**Endpoint:** `POST /:id`

**Description:** Updates an existing voucher.

**Authentication:** Required (JWT token)

**Request Body:**
```json
{
  "narration": "Updated payment to supplier",
  "debitEntries": [
    {
      "ledgerName": "Purchase",
      "amount": 60000,
      "narration": "Updated raw materials purchase"
    }
  ],
  "creditEntries": [
    {
      "ledgerName": "HDFC Bank - Current Account",
      "amount": 60000,
      "narration": "Updated bank payment"
    }
  ]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Voucher updated successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "companyId": "COMP001",
    "voucherType": "Payment",
    "voucherNumber": "PAY/2025/001",
    "date": "2025-01-25T00:00:00.000Z",
    "narration": "Updated payment to supplier",
    "debitEntries": [
      {
        "ledgerName": "Purchase",
        "amount": 60000,
        "narration": "Updated raw materials purchase"
      }
    ],
    "creditEntries": [
      {
        "ledgerName": "HDFC Bank - Current Account",
        "amount": 60000,
        "narration": "Updated bank payment"
      }
    ],
    "approvedBy": "Admin",
    "status": "Approved",
    "totalAmount": 60000,
    "createdAt": "2025-01-25T10:00:00.000Z",
    "updatedAt": "2025-01-25T10:00:00.000Z"
  }
}
```

### 5. Update Voucher Status

**Endpoint:** `POST /:id/status`

**Description:** Approve or reject a voucher.

**Authentication:** Required (JWT token)

**Request Body:**
```json
{
  "status": "Approved",
  "approvedBy": "Manager"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Voucher approved successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "status": "Approved",
    "approvedBy": "Manager"
  }
}
```

### 6. Delete Voucher

**Endpoint:** `POST /:id/delete`

**Description:** Deletes a voucher.

**Authentication:** Required (JWT token)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Voucher deleted successfully"
}
```

### 7. Get Vouchers by Type

**Endpoint:** `GET /type/:voucherType`

**Description:** Retrieves all vouchers of a specific type.

**Authentication:** Required (JWT token)

**Query Parameters:**
- `companyId` (required): Company ID
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example:**
```
GET /api/vouchers/type/Payment?companyId=COMP001
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Vouchers with type 'Payment' retrieved successfully",
  "data": {
    "vouchers": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "voucherNumber": "PAY/2025/001",
        "voucherType": "Payment",
        "date": "2025-01-25T00:00:00.000Z",
        "totalAmount": 50000,
        "status": "Approved"
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

### 8. Get Vouchers by Date Range

**Endpoint:** `GET /date-range`

**Description:** Retrieves vouchers within a date range.

**Authentication:** Required (JWT token)

**Query Parameters:**
- `companyId` (required): Company ID
- `startDate` (required): Start date (YYYY-MM-DD)
- `endDate` (required): End date (YYYY-MM-DD)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example:**
```
GET /api/vouchers/date-range?companyId=COMP001&startDate=2025-01-01&endDate=2025-01-31
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Vouchers from 2025-01-01 to 2025-01-31 retrieved successfully",
  "data": {
    "vouchers": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "voucherNumber": "PAY/2025/001",
        "voucherType": "Payment",
        "date": "2025-01-25T00:00:00.000Z",
        "totalAmount": 50000,
        "status": "Approved"
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

### 9. Search Vouchers

**Endpoint:** `GET /search`

**Description:** Search vouchers by voucher number, narration, or ledger names.

**Authentication:** Required (JWT token)

**Query Parameters:**
- `companyId` (required): Company ID
- `search` (required): Search term
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example:**
```
GET /api/vouchers/search?companyId=COMP001&search=PAY&page=1&limit=10
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Vouchers search completed successfully",
  "data": {
    "vouchers": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "voucherNumber": "PAY/2025/001",
        "voucherType": "Payment",
        "date": "2025-01-25T00:00:00.000Z",
        "totalAmount": 50000,
        "status": "Approved"
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
    "Debit and credit totals must be equal",
    "At least one debit entry is required"
  ]
}
```

### Duplicate Voucher (409)
```json
{
  "success": false,
  "message": "Voucher number 'PAY/2025/001' already exists"
}
```

### Ledger Not Found (400)
```json
{
  "success": false,
  "message": "Ledgers not found: Purchase, HDFC Bank"
}
```

### Voucher Not Found (404)
```json
{
  "success": false,
  "message": "Voucher not found"
}
```

### Invalid Voucher Type (400)
```json
{
  "success": false,
  "message": "Invalid voucher type. Must be one of: Payment, Receipt, Journal, Sales, Purchase, Contra, Stock Journal"
}
```

---

## Business Rules

1. **Double Entry**: Debit and credit totals must be equal
2. **Ledger Validation**: All ledger names must exist in the Ledgers collection
3. **Voucher Type Rules**:
   - **Payment**: Only one credit entry (usually cash or bank)
   - **Receipt**: Only one debit entry (usually cash or bank)
   - **Contra**: Only cash and bank accounts allowed
   - **Sales**: Must have income ledger in credit
   - **Purchase**: Must have expense ledger in debit
4. **Unique Voucher Numbers**: Voucher numbers must be unique
5. **Status Management**: Vouchers can be Draft, Approved, or Rejected

---

## Voucher Types

| Type | Description | Rules |
|------|-------------|-------|
| Payment | Cash/Bank payments | One credit entry only |
| Receipt | Cash/Bank receipts | One debit entry only |
| Journal | General journal entries | Multiple entries allowed |
| Sales | Sales transactions | Income ledger in credit |
| Purchase | Purchase transactions | Expense ledger in debit |
| Contra | Cash-Bank transfers | Only cash/bank ledgers |
| Stock Journal | Stock adjustments | Stock-related entries |

---

## Sample Data Structure

### Payment Voucher
```json
{
  "companyId": "COMP001",
  "voucherType": "Payment",
  "voucherNumber": "PAY/2025/001",
  "date": "2025-01-25",
  "narration": "Payment to supplier",
  "debitEntries": [
    { "ledgerName": "Purchase", "amount": 50000 }
  ],
  "creditEntries": [
    { "ledgerName": "HDFC Bank", "amount": 50000 }
  ],
  "approvedBy": "Admin"
}
```

### Receipt Voucher
```json
{
  "companyId": "COMP001",
  "voucherType": "Receipt",
  "voucherNumber": "REC/2025/001",
  "date": "2025-01-25",
  "narration": "Payment received from customer",
  "debitEntries": [
    { "ledgerName": "HDFC Bank", "amount": 75000 }
  ],
  "creditEntries": [
    { "ledgerName": "ABC Company Ltd", "amount": 75000 }
  ],
  "approvedBy": "Admin"
}
```

### Journal Voucher
```json
{
  "companyId": "COMP001",
  "voucherType": "Journal",
  "voucherNumber": "JRN/2025/001",
  "date": "2025-01-25",
  "narration": "Depreciation entry",
  "debitEntries": [
    { "ledgerName": "Indirect Expenses", "amount": 5000 }
  ],
  "creditEntries": [
    { "ledgerName": "Computer Equipment", "amount": 5000 }
  ],
  "approvedBy": "Admin"
}
```

---

**Last Updated:** 2025-01-25  
**Version:** 1.0.0  
**Maintainer:** SD_Taxation Development Team
