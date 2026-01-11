# Payroll Voucher API Reference

## Base URL
```
http://localhost:3000/api/payroll-vouchers
```

## Authentication
All Payroll Voucher endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <jwt-token>
```

---

## Endpoints

### 1. Create Payroll Voucher

**Endpoint:** `POST /api/payroll-vouchers`

**Description:** Creates a new payroll voucher for an employee.

**Authentication:** Required (Admin or SuperAdmin)

**Request Body:**
```json
{
  "companyId": "string (required, MongoDB ObjectId)",
  "empCode": "string (required, 3-20 characters, uppercase letters and numbers only)",
  "month": "string (required, 01-12)",
  "year": "string (required, 4-digit year)",
  "grossSalary": "number (required, 0-99999999)",
  "deductions": {
    "pf": "number (optional, 0-9999999, default: 0)",
    "esi": "number (optional, 0-9999999, default: 0)",
    "tax": "number (optional, 0-9999999, default: 0)",
    "other": "number (optional, 0-9999999, default: 0)",
    "loan": "number (optional, 0-9999999, default: 0)",
    "advance": "number (optional, 0-9999999, default: 0)",
    "bonus": "number (optional, 0-9999999, default: 0)"
  },
  "netPay": "number (required, 0-99999999)",
  "paymentVoucherNo": "string (optional, format: SAL/YYYY/XXX)",
  "status": "string (optional, enum: Draft|Approved|Paid|Cancelled, default: Draft)",
  "remarks": "string (optional, max 500 characters)"
}
```

**Example Request:**
```json
{
  "companyId": "COMP001",
  "empCode": "EMP1001",
  "month": "10",
  "year": "2025",
  "grossSalary": 45000,
  "deductions": {
    "pf": 1800,
    "esi": 500,
    "tax": 1500,
    "loan": 1000
  },
  "netPay": 41200,
  "remarks": "Monthly salary for October 2025",
  "status": "Paid"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Payroll voucher created successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "companyId": "COMP001",
    "empCode": "EMP1001",
    "month": "10",
    "year": "2025",
    "grossSalary": 45000,
    "deductions": {
      "pf": 1800,
      "esi": 500,
      "tax": 1500,
      "other": 0
    },
    "netPay": 41200,
    "paymentVoucherNo": "SAL/2025/001",
    "status": "Draft",
    "remarks": "Monthly salary for October 2025",
    "createdBy": "64f8a1b2c3d4e5f6a7b8c9d0",
    "createdAt": "2025-01-17T15:50:21.342Z",
    "updatedAt": "2025-01-17T15:50:21.342Z"
  }
}
```

---

### 2. Get All Payroll Vouchers

**Endpoint:** `GET /api/payroll-vouchers`

**Description:** Retrieves all payroll vouchers with pagination, search, and filtering.

**Authentication:** Required (Admin or SuperAdmin)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `search` (optional): Search in empCode, paymentVoucherNo, remarks
- `empCode` (optional): Filter by employee code
- `year` (optional): Filter by year
- `month` (optional): Filter by month
- `status` (optional): Filter by status
- `companyId` (optional): Filter by company ID

**Example Request:**
```
GET /api/payroll-vouchers?page=1&limit=10&search=EMP1001&year=2025&status=Draft
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payroll vouchers retrieved successfully",
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "companyId": "COMP001",
      "empCode": "EMP1001",
      "month": "10",
      "year": "2025",
      "grossSalary": 45000,
      "deductions": {
        "pf": 1800,
        "esi": 500,
        "tax": 1500,
        "other": 0
      },
      "netPay": 41200,
      "paymentVoucherNo": "SAL/2025/001",
      "status": "Draft",
      "remarks": "Monthly salary for October 2025",
      "createdBy": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "fullname": "Admin User",
        "email": "admin@example.com"
      },
      "createdAt": "2025-01-17T15:50:21.342Z",
      "updatedAt": "2025-01-17T15:50:21.342Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

---

### 3. Get Payroll Voucher by ID

**Endpoint:** `GET /api/payroll-vouchers/:id`

**Description:** Retrieves a specific payroll voucher by ID.

**Authentication:** Required (Admin or SuperAdmin)

**Parameters:**
- `id`: Payroll Voucher ID (MongoDB ObjectId)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payroll voucher retrieved successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "companyId": "COMP001",
    "empCode": "EMP1001",
    "month": "10",
    "year": "2025",
    "grossSalary": 45000,
    "deductions": {
      "pf": 1800,
      "esi": 500,
      "tax": 1500,
      "other": 0
    },
    "netPay": 41200,
    "paymentVoucherNo": "SAL/2025/001",
    "status": "Draft",
    "remarks": "Monthly salary for October 2025",
    "createdBy": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "fullname": "Admin User",
      "email": "admin@example.com"
    },
    "createdAt": "2025-01-17T15:50:21.342Z",
    "updatedAt": "2025-01-17T15:50:21.342Z"
  }
}
```

---

### 4. Update Payroll Voucher

**Endpoint:** `POST /api/payroll-vouchers/:id/update`

**Description:** Updates an existing payroll voucher.

**Authentication:** Required (Admin or SuperAdmin)

**Parameters:**
- `id`: Payroll Voucher ID (MongoDB ObjectId)

**Request Body:**
```json
{
  "grossSalary": "number (optional, 0-99999999)",
  "deductions": {
    "pf": "number (optional, 0-9999999)",
    "esi": "number (optional, 0-9999999)",
    "tax": "number (optional, 0-9999999)",
    "other": "number (optional, 0-9999999)"
  },
  "status": "string (optional, enum: Draft|Approved|Paid|Cancelled)",
  "remarks": "string (optional, max 500 characters)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payroll voucher updated successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "companyId": "COMP001",
    "empCode": "EMP1001",
    "month": "10",
    "year": "2025",
    "grossSalary": 45000,
    "deductions": {
      "pf": 1800,
      "esi": 500,
      "tax": 1500,
      "other": 0
    },
    "netPay": 41200,
    "paymentVoucherNo": "SAL/2025/001",
    "status": "Approved",
    "remarks": "Updated remarks",
    "createdBy": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "fullname": "Admin User",
      "email": "admin@example.com"
    },
    "createdAt": "2025-01-17T15:50:21.342Z",
    "updatedAt": "2025-01-17T16:30:15.123Z"
  }
}
```

---

### 5. Delete Payroll Voucher

**Endpoint:** `POST /api/payroll-vouchers/:id/delete`

**Description:** Deletes a payroll voucher permanently.

**Authentication:** Required (Admin or SuperAdmin)

**Parameters:**
- `id`: Payroll Voucher ID (MongoDB ObjectId)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payroll voucher deleted successfully"
}
```

---

### 6. Get Payroll by Employee and Period

**Endpoint:** `GET /api/payroll-vouchers/employee/payroll`

**Description:** Retrieves payroll for a specific employee and period.

**Authentication:** Required (Admin or SuperAdmin)

**Query Parameters:**
- `companyId` (required): Company ID
- `empCode` (required): Employee code
- `year` (required): Year
- `month` (required): Month

**Example Request:**
```
GET /api/payroll-vouchers/employee/payroll?companyId=COMP001&empCode=EMP1001&year=2025&month=10
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payroll retrieved successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "companyId": "COMP001",
    "empCode": "EMP1001",
    "month": "10",
    "year": "2025",
    "grossSalary": 45000,
    "deductions": {
      "pf": 1800,
      "esi": 500,
      "tax": 1500,
      "other": 0
    },
    "netPay": 41200,
    "paymentVoucherNo": "SAL/2025/001",
    "status": "Draft"
  }
}
```

---

### 7. Get Payroll by Period

**Endpoint:** `GET /api/payroll-vouchers/period/payroll`

**Description:** Retrieves all payroll vouchers for a specific period.

**Authentication:** Required (Admin or SuperAdmin)

**Query Parameters:**
- `companyId` (required): Company ID
- `year` (optional): Year
- `month` (optional): Month
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Example Request:**
```
GET /api/payroll-vouchers/period/payroll?companyId=COMP001&year=2025&month=10&page=1&limit=10
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payroll by period retrieved successfully",
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "companyId": "COMP001",
      "empCode": "EMP1001",
      "month": "10",
      "year": "2025",
      "grossSalary": 45000,
      "netPay": 41200,
      "status": "Draft"
    }
  ],
  "meta": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1,
    "itemsPerPage": 10,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

### 8. Bulk Create Payroll Vouchers

**Endpoint:** `POST /api/payroll-vouchers/bulk`

**Description:** Creates multiple payroll vouchers in a single request.

**Authentication:** Required (Admin or SuperAdmin)

**Request Body:**
```json
{
  "companyId": "string (required, MongoDB ObjectId)",
  "year": "string (required, 4-digit year)",
  "month": "string (required, 01-12)",
  "payrolls": [
    {
      "empCode": "string (required, 3-20 characters)",
      "grossSalary": "number (required, 0-99999999)",
      "deductions": {
        "pf": "number (optional, 0-9999999)",
        "esi": "number (optional, 0-9999999)",
        "tax": "number (optional, 0-9999999)",
        "other": "number (optional, 0-9999999)"
      },
      "remarks": "string (optional, max 500 characters)"
    }
  ]
}
```

**Example Request:**
```json
{
  "companyId": "COMP001",
  "year": "2025",
  "month": "10",
  "payrolls": [
    {
      "empCode": "EMP1001",
      "grossSalary": 45000,
      "deductions": {
        "pf": 1800,
        "esi": 500,
        "tax": 1500
      },
      "remarks": "October 2025 salary"
    },
    {
      "empCode": "EMP1002",
      "grossSalary": 55000,
      "deductions": {
        "pf": 2200,
        "esi": 600,
        "tax": 2000
      },
      "remarks": "October 2025 salary"
    }
  ]
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Bulk payroll creation completed. 2 created, 0 errors",
  "data": {
    "created": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "empCode": "EMP1001",
        "paymentVoucherNo": "SAL/2025/001",
        "status": "Draft"
      },
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "empCode": "EMP1002",
        "paymentVoucherNo": "SAL/2025/002",
        "status": "Draft"
      }
    ],
    "errors": []
  }
}
```

---

### 9. Generate Payment Voucher Number

**Endpoint:** `GET /api/payroll-vouchers/generate-voucher-number`

**Description:** Generates the next available payment voucher number for a given year.

**Authentication:** Required (Admin or SuperAdmin)

**Query Parameters:**
- `year` (required): Year for which to generate voucher number

**Example Request:**
```
GET /api/payroll-vouchers/generate-voucher-number?year=2025
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payment voucher number generated successfully",
  "data": {
    "paymentVoucherNo": "SAL/2025/001"
  }
}
```

---

### 10. Get Payroll Summary

**Endpoint:** `GET /api/payroll-vouchers/summary`

**Description:** Retrieves summary statistics for payroll vouchers.

**Authentication:** Required (Admin or SuperAdmin)

**Query Parameters:**
- `companyId` (required): Company ID
- `year` (optional): Year
- `month` (optional): Month

**Example Request:**
```
GET /api/payroll-vouchers/summary?companyId=COMP001&year=2025&month=10
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payroll summary retrieved successfully",
  "data": {
    "totalEmployees": 2,
    "totalGrossSalary": 100000,
    "totalDeductions": 8600,
    "totalNetPay": 91400,
    "statusBreakdown": {
      "Draft": 1,
      "Approved": 1,
      "Paid": 0,
      "Cancelled": 0
    },
    "deductionBreakdown": {
      "pf": 4000,
      "esi": 1100,
      "tax": 3500,
      "other": 0
    }
  }
}
```

---

## Error Responses

### 400 - Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Employee code is required",
    "Month must be between 01 and 12"
  ]
}
```

### 400 - Business Logic Error
```json
{
  "success": false,
  "message": "Payroll already exists for employee EMP1001 for 10/2025"
}
```

### 400 - Cannot Update Paid Voucher
```json
{
  "success": false,
  "message": "Cannot update payroll voucher with status 'Paid'"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Payroll voucher not found"
}
```

### 500 - Server Error
```json
{
  "success": false,
  "message": "Server error"
}
```

---

## Data Models

### PayrollVoucher Model
```javascript
{
  "_id": "ObjectId",
  "companyId": "String (required, MongoDB ObjectId)",
  "empCode": "String (required, 3-20 characters, uppercase letters and numbers only)",
  "month": "String (required, 01-12)",
  "year": "String (required, 4-digit year)",
  "grossSalary": "Number (required, 0-99999999)",
  "deductions": {
    "pf": "Number (optional, 0-9999999, default: 0)",
    "esi": "Number (optional, 0-9999999, default: 0)",
    "tax": "Number (optional, 0-9999999, default: 0)",
    "other": "Number (optional, 0-9999999, default: 0)",
    "loan": "Number (optional, 0-9999999, default: 0)",
    "advance": "Number (optional, 0-9999999, default: 0)",
    "bonus": "Number (optional, 0-9999999, default: 0)"
  },
  "netPay": "Number (required, 0-99999999)",
  "paymentVoucherNo": "String (required, unique, format: SAL/YYYY/XXX)",
  "status": "String (enum: Draft|Approved|Paid|Cancelled, default: Draft)",
  "remarks": "String (optional, max 500 characters)",
  "createdBy": "ObjectId (required, ref: 'Admin')",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## Business Rules

1. **Unique Payroll per Employee per Period**: Only one payroll voucher can exist per employee per month/year combination.

2. **Net Pay Calculation**: Net pay must equal gross salary minus total deductions.

3. **Payment Voucher Number**: Auto-generated in format `SAL/YYYY/XXX` if not provided.

4. **Status Workflow**: 
   - Draft → Approved → Paid
   - Can be Cancelled from any status except Paid

5. **Update Restrictions**: 
   - Cannot update vouchers with 'Paid' or 'Cancelled' status
   - Cannot delete vouchers with 'Paid' status

6. **Employee Validation**: Employee must exist in the specified company.

7. **Payment Date**: Automatically set when status changes to 'Paid' (internal field, not returned in API responses).

---

## Security Notes

- All endpoints require JWT authentication
- Company data isolation enforced
- Input validation using Joi schemas
- Request bodies are sanitized
- Only Admin or SuperAdmin roles can access payroll endpoints
- Employee existence validation before creating payroll

---

**Last Updated:** January 2025  
**API Version:** 1.0.0
